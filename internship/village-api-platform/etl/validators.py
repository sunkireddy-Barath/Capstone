import pandas as pd
import logging
from config import EXPECTED_COLUMNS

logger = logging.getLogger("etl.validators")

REQUIRED_NORMALIZED = ["state_code", "state_name", "district_code", "district_name",
                        "subdistrict_code", "subdistrict_name", "village_code", "village_name"]


def detect_columns(df: pd.DataFrame) -> dict:
    """Map normalized column names to actual DataFrame columns via flexible matching."""
    col_map = {}
    df_cols_upper = {c.upper().strip(): c for c in df.columns}

    for norm_key, candidates in EXPECTED_COLUMNS.items():
        for candidate in candidates:
            if candidate.upper().strip() in df_cols_upper:
                col_map[norm_key] = df_cols_upper[candidate.upper().strip()]
                break
        if norm_key not in col_map:
            logger.warning(f"Column not found for '{norm_key}'. Candidates: {candidates}")

    missing = [k for k in REQUIRED_NORMALIZED if k not in col_map]
    if missing:
        raise ValueError(f"Required columns missing after detection: {missing}")

    logger.info(f"Column mapping resolved: {col_map}")
    return col_map


def validate_row(row: pd.Series, col_map: dict) -> tuple[bool, str]:
    """Return (is_valid, reason). Called per row for fast validation."""
    for key in REQUIRED_NORMALIZED:
        col = col_map.get(key)
        if col is None:
            return False, f"Missing column mapping for {key}"
        val = row.get(col, None)
        if pd.isna(val) or str(val).strip() == "":
            return False, f"Null/empty value in '{key}' (col: {col})"
    return True, ""


def validate_dataframe(df: pd.DataFrame, col_map: dict) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Split DataFrame into valid and invalid rows."""
    valid_rows = []
    invalid_rows = []

    for idx, row in df.iterrows():
        is_valid, reason = validate_row(row, col_map)
        if is_valid:
            valid_rows.append(idx)
        else:
            row_copy = row.copy()
            row_copy["_invalid_reason"] = reason
            invalid_rows.append(row_copy)

    valid_df = df.loc[valid_rows].copy()
    invalid_df = pd.DataFrame(invalid_rows) if invalid_rows else pd.DataFrame()

    logger.info(f"Validation complete: {len(valid_df)} valid, {len(invalid_df)} invalid rows")
    return valid_df, invalid_df
