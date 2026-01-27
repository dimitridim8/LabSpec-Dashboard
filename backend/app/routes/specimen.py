from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..models.database import SessionLocal
from ..models.specimen import Specimen

router = APIRouter(prefix="/specimens", tags=["Specimens"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# GET /specimens/
@router.get("/")
def list_specimens(db: Session = Depends(get_db)):
    return db.query(Specimen).all()
