# from models.database import SessionLocal, engine, Base
# from models.specimen_model import Specimen

# # Create the tables if they don't exist yet
# Base.metadata.create_all(bind=engine)

# def seed_data():
#     db = SessionLocal()
    
#     # Check if we already have data to avoid duplicates
#     if db.query(Specimen).first():
#         print("Database already has data. Skipping seed.")
#         return

#     # Data based on your UI Prototype
#     samples = [
#         Specimen(id="SPC10232", sample_type="Urine Culture", status="Received", location="Refrigerator A1"),
#         Specimen(id="SPC10457", sample_type="Blood Sample", status="Incubating", location="Incubator 2"),
#         Specimen(id="SPC10389", sample_type="Wound Swab", status="Awaiting AST", location="Lab Bench 3"),
#         Specimen(id="SPC10176", sample_type="Sputum Sample", status="Completed", location="Archive"),
#     ]

#     try:
#         db.add_all(samples)
#         db.commit()
#         print("Successfully added sample specimens to LabSpec!")
#     except Exception as e:
#         print(f"Error seeding data: {e}")
#         db.rollback()
#     finally:
#         db.close()

# if __name__ == "__main__":
#     seed_data()