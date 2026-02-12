# from sqlalchemy import Column, String, DateTime, Text
# from datetime import datetime
# from .database import Base

# class Specimen(Base):
#     __tablename__ = "specimens"

#     # Unique ID for each specimen 
#     id = Column(String, primary_key=True, index=True)
    
#     # Type of sample (e.g., Urine, Blood, Wound Swab)
#     sample_type = Column(String)
    
#     # Current lifecycle state (Pending, Incubating, etc.)
#     status = Column(String, default="Pending")
    
#     # Storage condition (Refrigerated, Frozen, Room Temp)
#     storage_condition = Column(String)
    
#     # Physical location (e.g., "Incubator 2")
#     location = Column(String)
    
#     # Manual notes or explanation for flags
#     notes = Column(Text, nullable=True)
    
#     # Timestamp for the last update
#     last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)