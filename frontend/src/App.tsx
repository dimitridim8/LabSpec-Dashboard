import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import beaker from './assets/images/beaker-image.png';
/*
DOCUMENT DETAILS (note for team):
This is a very very rough draft of the frontend. This serves as a base template of the original UI design.
More UI elements needed to be added along with functionality but this was made prior to the establishment
of the backend.
Also going to fix styling so it's all organized in css file
1st commit --> this version
next commit --> connecting to FastAPI 
from there we can work on this *hopefully lol* and continue to work on the frontend UI
-
*/

// speciement type and status
interface Specimen {
  id: string;
  sampleType: string;
  status: 'Pending' | 'Incubating' | 'Awaiting AST' | 'Completed' | 'Flagged';
  location: string;
}

// for specimen status columns ==> will/should move to separte file
interface DataMap {
  [key: string]: number;
}

  const data: DataMap = {
    "Pending": 8,
    "In Progress": 12,
    "Awaiting AST": 5,
    "Completed": 20
  };

const Dashboard: React.FC = () => {
  const [specimens, setSpecimens] = useState<Specimen[]>([]);

  // Fetch specimens from FastAPI backend will go here
  useEffect(() => {
    fetch('http://localhost:8000/specimens')
      .then(res => res.json())
      .then(data => setSpecimens(data));
  }, []);

  return (
  <div className="min-vh-100 d-flex flex-column">
    {/* 1. Top Navigation Bar */}
    <nav className="navbar navbar-dark shadow-sm p-3" style={{backgroundColor: '#2c5282'}}>
      {/* Beaker Icon Navigates Back To Main Dash Page */}
      {/* <div className = "beaker-icon-container">
        <img src={beaker} alt="lab beaker image" className="beaker-icon" style={{width: 100, height: 60}}/>
      </div> */}
      <span className="navbar-brand mb-0 h1"><b>LabSpec</b> Dashboard</span>
      <div className="text-white">Welcome, Dr. Smith</div>
    </nav>

    <div className="container-fluid flex-grow-1 p-4" style={{backgroundColor: '#c9d7e0'}}>
      <div className="main-page-border" style={{margin:20, justifyContent: 'center'}}>
        <h2 className="mb-4" style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#2c5282'}}>Specimen Overview</h2>
        <hr></hr>
        {/* 2. Metric Cards (Pending, In Progress, etc.) */}
        <div className="row mb-4">
          {Object.entries(data).map(([key, value]) => (
            <div className="col-md-3" key={key}>
              <div className="card border-0 shadow-sm text-center p-3">
                <span className="fw-bold text-primary">
                  {key}: <b>{value}</b>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          {/* 3. Specimen List */}
          <div className="col-lg-9">
            <div className="card shadow-sm border-0 p-3">
              <div className="d-flex gap-2 mb-3">
                <button className="btn btn-primary btn-sm">All</button>
                <button className="btn btn-outline-secondary btn-sm">Pending</button>
                {/* Add more filters here  */}
              </div>
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Specimen ID</th>
                    <th>Sample Type</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Table rows go here*/}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Details Sidebar */}
          <div className="col-lg-3">
            <div className="card shadow-sm border-0 h-100 p-3">
              <h6 className="text-muted border-bottom pb-2">Specimen Details</h6>
              <div className="mt-3">
                <p className="small mb-1 text-muted">ID: SPC10389</p>
                <p className="fw-bold">Sample Type: Wound Swab</p>
                <div className="badge bg-primary mb-3">Awaiting AST</div>
                <p className="small"><strong>Storage:</strong> Lab Bench 3</p>
              </div>
              <button className="btn btn-danger w-100 mt-auto">Mark as Completed</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 5. Floating LabBot*/}
    <div className="position-fixed bottom-0 end-0 m-4 shadow-lg card" style={{width: '250px', borderRadius: '15px 15px 0 0'}}>
      <div className="card-header bg-primary text-white d-flex justify-content-between">
        <span>🤖 LabBot</span>
      </div>
      <div className="p-3 bg-light small">How can I assist you today?</div>
      {/* Sample text box for bot for tests & giggles */}
      <div className="chat-bot-sample-text">
        <input type="text" id="chat-box-user-input" style={{backgroundColor: "white", color: "black", width: "auto"}}/>
        <label htmlFor="chat-box-user-input"></label>
        <p></p>
        <p></p>
      </div>
    </div>
  </div>
);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'secondary';
    case 'Incubating': return 'warning text-dark';
    case 'Awaiting AST': return 'primary';
    case 'Completed': return 'success';
    case 'Flagged': return 'danger';
    default: return 'info';
  }
};

export default Dashboard;