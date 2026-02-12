# LabSpec-Dashboard

Microbiology labs often rely on fragmented systems, spreadsheets, or manual logs to track specimens. This can lead to:
- Difficulty identifying a specimen’s current status
- Poor visibility into delays or bottlenecks
- Increased risk of misplacement or improper storage
- Time wasted answering routine status questions

LabSpec Dashboard addresses these issues by providing a centralized, easy-to-use dashboard that tracks specimen progress, storage conditions, and potential problems in real time.

## Setup
### Clone the repository:
```
git clone https://github.com/your-org/labspec-dashboard.git
cd labspec-dashboard/backend
```

### Create & activate local virtual environment:
```
python -m venv venv

#Windows:
venv\Scripts\activate

#Mac/Linux:
source venv/bin/activate
```
You should see ```(venv)```.

### Install dependencies:
```
pip install -r requirements.txt
```

This will install:
- FastAPI
- Uvicorn
- SQLAlchemy

### Create local database:
```
python app/init_db.py
```

### Run backend:
```
python -m uvicorn app.main:app --reload
```
You should be able to open ```http://127.0.0.1:8000```.
