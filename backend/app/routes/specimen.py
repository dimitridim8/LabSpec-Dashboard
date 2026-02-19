import random
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.schemas.specimen import SpecimenCreate, Specimen, SpecimenUpdate
from app.supabase_client import supabase

router = APIRouter(prefix="/specimens", tags=["Specimens"])

# Generate random specimen code
def generate_code(length: int = 6) -> str:
    return ''.join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=length))

# GET /specimens/
@router.get("/", response_model=list[Specimen])
def list_specimens():
    result = supabase.table("specimens").select("*").execute()

    if result.data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch specimens")

    return result.data

# POST /specimens/
@router.post("/", response_model=Specimen)
def create_specimen(specimen: SpecimenCreate):
    code = generate_code()
    data = specimen.dict()

    # ensure code is generated server-side
    data["specimen_code"] = code

    # these are also defaulted by DB, but fine to set here
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = supabase.table("specimens").insert(data).execute()
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to create specimen")

    return result.data[0]

# PATCH /specimens/{specimen_id}
@router.patch("/{specimen_id}", response_model=Specimen)
def update_specimen(specimen_id: int, updates: SpecimenUpdate):
    update_data = updates.dict(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")

    # you already have a DB trigger for updated_at, but setting it here is fine too
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = (
        supabase
        .table("specimens")
        .update(update_data)
        .eq("specimen_id", specimen_id)
        .execute()
    )

    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Specimen not found")

    return result.data[0]
