import os
import psycopg2
import psycopg2.extras
import logging
import urllib.request
import json as _json
from config import DATABASE_URL, BATCH_SIZE, COUNTRY_NAME, COUNTRY_CODE

logger = logging.getLogger("etl.loaders")


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def ensure_pg_trgm(cur):
    cur.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    logger.info("pg_trgm extension ensured")


def upsert_country(cur) -> int:
    cur.execute(
        """
        INSERT INTO countries (name, code, "createdAt", "updatedAt")
        VALUES (%s, %s, NOW(), NOW())
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()
        RETURNING id
        """,
        (COUNTRY_NAME, COUNTRY_CODE),
    )
    row = cur.fetchone()
    logger.info(f"Country upserted: {COUNTRY_NAME} (id={row[0]})")
    return row[0]


def upsert_states(cur, records: list[dict], country_id: int) -> dict:
    """Returns {state_code: state_id}"""
    unique_states = {r["state_code"]: r["state_name"] for r in records}
    state_id_map = {}
    for code, name in unique_states.items():
        cur.execute(
            """
            INSERT INTO states (code, name, "countryId", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, NOW(), NOW())
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()
            RETURNING id
            """,
            (code, name, country_id),
        )
        state_id_map[code] = cur.fetchone()[0]
    logger.info(f"Upserted {len(state_id_map)} states")
    return state_id_map


def upsert_districts(cur, records: list[dict], state_id_map: dict) -> dict:
    """Returns {(state_code, district_code): district_id}"""
    unique = {(r["state_code"], r["district_code"]): r["district_name"] for r in records}
    district_id_map = {}
    for (sc, dc), name in unique.items():
        state_id = state_id_map.get(sc)
        if not state_id:
            continue
        cur.execute(
            """
            INSERT INTO districts (code, name, "stateId", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, NOW(), NOW())
            ON CONFLICT (code, "stateId") DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()
            RETURNING id
            """,
            (dc, name, state_id),
        )
        district_id_map[(sc, dc)] = cur.fetchone()[0]
    logger.info(f"Upserted {len(district_id_map)} districts")
    return district_id_map


def upsert_subdistricts(cur, records: list[dict], state_id_map: dict, district_id_map: dict) -> dict:
    """Returns {(state_code, district_code, subdistrict_code): subdistrict_id}"""
    unique = {
        (r["state_code"], r["district_code"], r["subdistrict_code"]): r["subdistrict_name"]
        for r in records
    }
    sd_id_map = {}
    for (sc, dc, sdc), name in unique.items():
        district_id = district_id_map.get((sc, dc))
        if not district_id:
            continue
        cur.execute(
            """
            INSERT INTO sub_districts (code, name, "districtId", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, NOW(), NOW())
            ON CONFLICT (code, "districtId") DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()
            RETURNING id
            """,
            (sdc, name, district_id),
        )
        sd_id_map[(sc, dc, sdc)] = cur.fetchone()[0]
    logger.info(f"Upserted {len(sd_id_map)} sub-districts")
    return sd_id_map


def batch_insert_villages(cur, records: list[dict], sd_id_map: dict) -> dict:
    """Batch insert villages. Returns {'inserted': n, 'skipped': n}"""
    rows = []
    skipped = 0

    for r in records:
        key = (r["state_code"], r["district_code"], r["subdistrict_code"])
        sd_id = sd_id_map.get(key)
        if not sd_id:
            skipped += 1
            continue
        rows.append((r["village_code"], r["village_name"], sd_id))

    inserted = 0
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        try:
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO villages (code, name, "subDistrictId", "createdAt", "updatedAt")
                VALUES %s
                ON CONFLICT (code, "subDistrictId") DO NOTHING
                """,
                [(code, name, sd_id, ) for code, name, sd_id in
                 [(r[0], r[1], r[2]) for r in batch]],
                template='(%s, %s, %s, NOW(), NOW())',
            )
            inserted += len(batch)
            logger.info(f"  Villages: inserted batch {i//BATCH_SIZE + 1}, total so far: {inserted}")
        except Exception as e:
            logger.error(f"Batch insert failed at offset {i}: {e}")
            raise

    return {"inserted": inserted, "skipped": skipped}


def create_trgm_indexes(cur):
    statements = [
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS villages_name_trgm_idx ON villages USING GIN (name gin_trgm_ops);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS sub_districts_name_trgm_idx ON sub_districts USING GIN (name gin_trgm_ops);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS districts_name_trgm_idx ON districts USING GIN (name gin_trgm_ops);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS states_name_trgm_idx ON states USING GIN (name gin_trgm_ops);",
    ]
    for stmt in statements:
        try:
            cur.execute(stmt)
            logger.info(f"Index created: {stmt[:60]}...")
        except Exception as e:
            logger.warning(f"Index creation skipped (may already exist): {e}")


def flush_geography_cache():
    """Flush Upstash Redis geography cache keys after import."""
    redis_url = os.getenv("UPSTASH_REDIS_REST_URL", "")
    redis_token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
    if not redis_url or not redis_token:
        logger.warning("Redis credentials not set — skipping cache flush")
        return

    prefixes = ["states:", "districts:", "subdistricts:", "villages:", "search:", "autocomplete:"]
    flushed = 0
    for prefix in prefixes:
        try:
            req = urllib.request.Request(
                f"{redis_url}/keys/{prefix}*",
                headers={"Authorization": f"Bearer {redis_token}"},
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = _json.loads(resp.read())
                keys = data.get("result", [])
                for key in keys:
                    del_req = urllib.request.Request(
                        f"{redis_url}/del/{key}",
                        headers={"Authorization": f"Bearer {redis_token}"},
                        method="GET",
                    )
                    urllib.request.urlopen(del_req, timeout=5)
                    flushed += 1
        except Exception as e:
            logger.warning(f"Cache flush failed for prefix '{prefix}': {e}")

    logger.info(f"Geography cache flushed: {flushed} keys deleted")
