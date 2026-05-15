"""
All India Villages ETL Pipeline
================================
Usage:
    python pipeline.py --file /path/to/mdds_villages.xlsx
    python pipeline.py --file /path/to/mdds_villages.csv --sheet "Sheet1"
    python pipeline.py --file /path/to/data.xlsx --skip-indexes

Supports Excel (.xlsx, .xls) and CSV (.csv) formats.
"""

import argparse
import logging
import sys
import time
from pathlib import Path

import pandas as pd

from config import LOG_FILE, ERRORS_FILE
from validators import detect_columns, validate_dataframe
from transformers import transform_dataframe
from loaders import (
    get_connection,
    ensure_pg_trgm,
    upsert_country,
    upsert_states,
    upsert_districts,
    upsert_subdistricts,
    batch_insert_villages,
    create_trgm_indexes,
    flush_geography_cache,
)

# ─── Logging Setup ────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE, mode="w", encoding="utf-8"),
    ],
)
logger = logging.getLogger("etl.pipeline")


def read_file(file_path: str, sheet: str = None) -> pd.DataFrame:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found: {file_path}")

    logger.info(f"Reading file: {path.name} ({path.stat().st_size / 1024 / 1024:.1f} MB)")

    if path.suffix.lower() in (".xlsx", ".xls"):
        df = pd.read_excel(file_path, sheet_name=sheet or 0, dtype=str, na_filter=True)
    elif path.suffix.lower() == ".csv":
        df = pd.read_csv(file_path, dtype=str, na_filter=True, encoding="utf-8-sig")
    else:
        raise ValueError(f"Unsupported file format: {path.suffix}")

    # Strip column names
    df.columns = [str(c).strip() for c in df.columns]
    logger.info(f"Loaded {len(df):,} rows × {len(df.columns)} columns")
    logger.info(f"Columns found: {list(df.columns)}")
    return df


def run_pipeline(file_path: str, sheet: str = None, skip_indexes: bool = False):
    start = time.time()
    logger.info("=" * 60)
    logger.info("ALL INDIA VILLAGES ETL PIPELINE — STARTED")
    logger.info("=" * 60)

    # ── Step 1: Read ───────────────────────────────────────────────
    df = read_file(file_path, sheet)

    # ── Step 2: Detect Columns ─────────────────────────────────────
    col_map = detect_columns(df)

    # ── Step 3: Validate ───────────────────────────────────────────
    valid_df, invalid_df = validate_dataframe(df, col_map)

    if not invalid_df.empty:
        invalid_df.to_csv(ERRORS_FILE, index=False)
        logger.warning(f"{len(invalid_df)} invalid rows saved to {ERRORS_FILE}")

    if valid_df.empty:
        logger.error("No valid rows to process. Aborting.")
        return

    # ── Step 4: Transform ──────────────────────────────────────────
    records = transform_dataframe(valid_df, col_map)

    # ── Step 5: Load ───────────────────────────────────────────────
    conn = get_connection()
    conn.autocommit = False
    cur = conn.cursor()

    try:
        ensure_pg_trgm(cur)
        conn.commit()

        logger.info("Upserting country...")
        country_id = upsert_country(cur)
        conn.commit()

        logger.info("Upserting states...")
        state_id_map = upsert_states(cur, records, country_id)
        conn.commit()

        logger.info("Upserting districts...")
        district_id_map = upsert_districts(cur, records, state_id_map)
        conn.commit()

        logger.info("Upserting sub-districts...")
        sd_id_map = upsert_subdistricts(cur, records, state_id_map, district_id_map)
        conn.commit()

        logger.info("Inserting villages (batch mode)...")
        result = batch_insert_villages(cur, records, sd_id_map)
        conn.commit()

        logger.info(f"Villages: {result['inserted']:,} inserted, {result['skipped']:,} skipped")

        # ── Step 6: Indexes ────────────────────────────────────────
        if not skip_indexes:
            logger.info("Creating trigram GIN indexes (this may take a while)...")
            conn.autocommit = True  # CONCURRENTLY requires autocommit
            create_trgm_indexes(cur)

    # ── Step 7: Cache Invalidation ─────────────────────────────────
    logger.info("Flushing stale geography cache in Redis...")
    flush_geography_cache()

    except Exception as e:
        conn.rollback()
        logger.exception(f"Pipeline failed: {e}")
        cur.close()
        conn.close()
        raise
    else:
        cur.close()
        conn.close()

    elapsed = time.time() - start
    logger.info("=" * 60)
    logger.info(f"ETL PIPELINE COMPLETE in {elapsed:.1f}s")
    logger.info(f"  States:        {len(state_id_map):,}")
    logger.info(f"  Districts:     {len(district_id_map):,}")
    logger.info(f"  Sub-Districts: {len(sd_id_map):,}")
    logger.info(f"  Villages:      {result['inserted']:,} inserted, {result['skipped']:,} skipped")
    logger.info("=" * 60)


def main():
    parser = argparse.ArgumentParser(description="All India Villages ETL Pipeline")
    parser.add_argument("--file", required=True, help="Path to Excel or CSV dataset file")
    parser.add_argument("--sheet", default=None, help="Sheet name or index for Excel files")
    parser.add_argument("--skip-indexes", action="store_true", help="Skip creating GIN trigram indexes")
    args = parser.parse_args()

    try:
        run_pipeline(args.file, args.sheet, args.skip_indexes)
    except Exception as e:
        logger.error(f"Pipeline aborted: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
