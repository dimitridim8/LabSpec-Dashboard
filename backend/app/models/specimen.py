from sqlalchemy import Column, Integer, String, DateTime, func
from .database import Base

class Specimen(Base):
    __tablename__ = "specimens"

    specimen_id = Column(Integer, primary_key=True, index=True)
    current_status = Column(String)
    storage_condition = Column(String)
    storage_location = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
