from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import specimen  # import your specimen router

app = FastAPI(title="LabSpec Dashboard API")

# Allow frontend local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include specimen routes
app.include_router(specimen.router)

@app.get("/")
def root():
    return {"message": "Welcome to the LabSpec Dashboard API"}
