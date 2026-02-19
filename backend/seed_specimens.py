# This file generates random data into the specimens table when run
import random
from datetime import datetime, timezone
from app.supabase_client import supabase

STATUSES = ["Pending", "In Progress", "Awaiting AST", "Completed", "Flagged"]
TYPES = ["Blood", "Urine", "Throat Swab", "Wound Swab", "Stool", "Sputum"]
CONDITIONS = ["Refrigerated", "Frozen", "Room Temp"]
LOCATIONS = ["Lab Bench 1", "Lab Bench 2", "Fridge A", "Freezer B", "Shelf 3"]

def generate_code(length: int = 6) -> str:
    return ''.join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=length))

def make_row():
    now = datetime.now(timezone.utc).isoformat()
    return {
        "specimen_code": generate_code(),
        "specimen_type": random.choice(TYPES),
        "current_status": random.choice(STATUSES),
        "storage_condition": random.choice(CONDITIONS),
        "storage_location": random.choice(LOCATIONS),
        "created_at": now,
        "updated_at": now,
    }

def seed(n: int = 30):
    rows = [make_row() for _ in range(n)]
    result = supabase.table("specimens").insert(rows).execute()
    print(f"Inserted {len(result.data) if result.data else 0} specimens")

if __name__ == "__main__":
    seed(30)
