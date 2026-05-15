import pandas as pd
import re
import logging

logger = logging.getLogger("etl.transformers")


def normalize_text(val) -> str:
    """Strip, collapse whitespace, title-case."""
    if pd.isna(val):
        return ""
    s = str(val).strip()
    s = re.sub(r"\s+", " ", s)
    return s.title()


def normalize_code(val) -> str:
    """Strip and zero-pad or uppercase code values."""
    if pd.isna(val):
        return ""
    return str(val).strip().lstrip("0") or "0"


def transform_row(row: pd.Series, col_map: dict) -> dict:
    """Return a normalized dict for a single row."""
    return {
        "state_code": normalize_code(row[col_map["state_code"]]),
        "state_name": normalize_text(row[col_map["state_name"]]),
        "district_code": normalize_code(row[col_map["district_code"]]),
        "district_name": normalize_text(row[col_map["district_name"]]),
        "subdistrict_code": normalize_code(row[col_map["subdistrict_code"]]),
        "subdistrict_name": normalize_text(row[col_map["subdistrict_name"]]),
        "village_code": normalize_code(row[col_map["village_code"]]),
        "village_name": normalize_text(row[col_map["village_name"]]),
    }


def transform_dataframe(df: pd.DataFrame, col_map: dict) -> list[dict]:
    """Transform entire DataFrame to list of normalized dicts. Removes duplicates."""
    records = [transform_row(row, col_map) for _, row in df.iterrows()]

    # Deduplicate on village_code + subdistrict_code composite
    seen = set()
    unique = []
    dupes = 0
    for r in records:
        key = (r["state_code"], r["district_code"], r["subdistrict_code"], r["village_code"])
        if key not in seen:
            seen.add(key)
            unique.append(r)
        else:
            dupes += 1

    logger.info(f"Transformation complete: {len(unique)} unique records, {dupes} duplicates removed")
    return unique
