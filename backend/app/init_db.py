from app.models.database import Base, engine
from app.models import specimen  # import the model

# Create tables in the database
Base.metadata.create_all(bind=engine)

print("Database tables created!")
