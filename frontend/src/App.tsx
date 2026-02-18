import React, { useEffect, useMemo, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import beaker from './assets/images/beaker-image.png';

interface Specimen {
  id: number;
  specimen_code?: string;           // if your table has this
  sample_type?: string;             // if your table has this
  status: 'Pending' | 'Incubating' | 'Awaiting AST' | 'Completed' | 'Flagged' | 'In Progress';
  location?: string | null;
}

const Dashboard: React.FC = () => {
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [selected, setSelected] = useState<Specimen | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${API_URL}/specimens/`)
      .then(res => res.json())
      .then(data => setSpecimens(data))
      .catch(err => console.error('Failed to load specimens:', err));
  }, [API_URL]);

  const metrics = useMemo(() => ({
    "Pending": specimens.filter(s => s.status === "Pending").length,
    "In Progress": specimens.filter(s => s.status === "In Progress").length,
    "Awaiting AST": specimens.filter(s => s.status === "Awaiting AST").length,
    "Completed": specimens.filter(s => s.status === "Completed").length,
  }), [specimens]);

  const filteredSpecimens = useMemo(() => {
    if (filter === 'All') return specimens;
    return specimens.filter(s => s.status === filter);
  }, [specimens, filter]);

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* 1. Top Navigation Bar */}
      <nav className="navbar navbar-dark shadow-sm p-3" style={{ backgroundColor: '#2c5282' }}>
        <span className="navbar-brand mb-0 h1"><b>LabSpec</b> Dashboard</span>
        <div className="text-white">Welcome, Dr. Smith</div>
      </nav>

      <div className="container-fluid flex-grow-1 p-4" style={{ backgroundColor: '#c9d7e0' }}>
        <div className="main-page-border" style={{ margin: 20, justifyContent: 'center' }}>
          <h2 className="mb-4" style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2c5282' }}>
            Specimen Overview
          </h2>
          <hr />

          {/* 2. Metric Cards */}
          <div className="row mb-4">
            {Object.entries(metrics).map(([key, value]) => (
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

                {/* Filters */}
                <div className="d-flex gap-2 mb-3">
                  {["All", "Pending", "In Progress", "Awaiting AST", "Completed"].map((f) => (
                    <button
                      key={f}
                      className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
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
                    {filteredSpecimens.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setSelected(s)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{s.specimen_code ?? s.id}</td>
                        <td>{s.sample_type ?? "—"}</td>
                        <td>
                          <span className={`badge bg-${getStatusColor(s.status)}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>{s.location ?? "—"}</td>
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(s);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredSpecimens.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          No specimens found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Details Sidebar */}
            <div className="col-lg-3">
              <div className="card shadow-sm border-0 h-100 p-3">
                <h6 className="text-muted border-bottom pb-2">Specimen Details</h6>

                <div className="mt-3">
                  {!selected ? (
                    <p className="text-muted small">Click a specimen row to view details.</p>
                  ) : (
                    <>
                      <p className="small mb-1 text-muted">
                        ID: {selected.specimen_code ?? selected.id}
                      </p>
                      <p className="fw-bold">
                        Sample Type: {selected.sample_type ?? "—"}
                      </p>
                      <div className={`badge bg-${getStatusColor(selected.status)} mb-3`}>
                        {selected.status}
                      </div>
                      <p className="small">
                        <strong>Storage:</strong> {selected.location ?? "—"}
                      </p>
                    </>
                  )}
                </div>

                {/* This button will be wired to a PATCH endpoint next */}
                <button className="btn btn-danger w-100 mt-auto" disabled={!selected}>
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Floating LabBot */}
      <div className="position-fixed bottom-0 end-0 m-4 shadow-lg card" style={{ width: '250px', borderRadius: '15px 15px 0 0' }}>
        <div className="card-header bg-primary text-white d-flex justify-content-between">
          <span>🤖 LabBot</span>
        </div>
        <div className="p-3 bg-light small">How can I assist you today?</div>
        <div className="chat-bot-sample-text">
          <input type="text" id="chat-box-user-input" style={{ backgroundColor: "white", color: "black", width: "auto" }} />
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
    case 'In Progress': return 'info';
    case 'Completed': return 'success';
    case 'Flagged': return 'danger';
    default: return 'info';
  }
};

export default Dashboard;
