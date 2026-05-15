import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_VCIWNYGkt62L@ep-shy-firefly-aoczbfvh.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
)

# Expected column names in MDDS Excel file (case-insensitive matching applied)
EXPECTED_COLUMNS = {
    "state_code": ["MDDS STC", "STATE CODE", "ST_CD"],
    "state_name": ["STATE NAME", "STATE"],
    "district_code": ["MDDS DTC", "DISTRICT CODE", "DT_CD"],
    "district_name": ["DISTRICT NAME", "DISTRICT"],
    "subdistrict_code": ["MDDS Sub_DT", "SUB DISTRICT CODE", "SDT_CD", "MDDS Sub DT"],
    "subdistrict_name": ["SUB-DISTRICT NAME", "SUB DISTRICT NAME", "SUBDISTRICT"],
    "village_code": ["MDDS PLCN", "VILLAGE CODE", "VLG_CD", "PLACE CODE"],
    "village_name": ["Area Name", "VILLAGE NAME", "VILLAGE"],
}

# ETL settings
BATCH_SIZE = 5000
COUNTRY_NAME = "India"
COUNTRY_CODE = "IN"

# Logging
LOG_FILE = "etl/etl_run.log"
ERRORS_FILE = "etl/etl_errors.csv"
