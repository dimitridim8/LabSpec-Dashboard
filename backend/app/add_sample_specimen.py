from app.models.database import SessionLocal
from app.models.specimen import Specimen

# Create a database session
db = SessionLocal()

# Create a sample specimen
sample = Specimen(
    current_status="Received",
    storage_condition="Refrigerated",
    storage_location="Bench 1"
)

# Add to DB and commit
db.add(sample)
db.commit()
db.refresh(sample)
db.close()

print(f"Sample specimen added with ID {sample.specimen_id}")
