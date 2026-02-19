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

// ── NEW: form shape used by both Add and Edit modals ──────────────────────────
type SpecimenFormData = {
  specimen_code: string;
  sample_type: string;
  status: Specimen['status'];
  location: string;
};

const EMPTY_FORM: SpecimenFormData = {
  specimen_code: '',
  sample_type: '',
  status: 'Pending',
  location: '',
};

const STATUS_OPTIONS: Specimen['status'][] = [
  'Pending', 'In Progress', 'Incubating', 'Awaiting AST', 'Completed', 'Flagged',
];

// ── NEW: reusable modal for Add and Edit ──────────────────────────────────────
interface SpecimenModalProps {
  mode: 'add' | 'edit';
  initialData?: SpecimenFormData;
  onClose: () => void;
  onSubmit: (data: SpecimenFormData) => Promise<void>;
  saving: boolean;
}

const SpecimenModal: React.FC<SpecimenModalProps> = ({ mode, initialData = EMPTY_FORM, onClose, onSubmit, saving }) => {
  const [form, setForm] = useState<SpecimenFormData>(initialData);
  const [errors, setErrors] = useState<Partial<SpecimenFormData>>({});

  useEffect(() => { setForm(initialData); setErrors({}); }, [initialData]);

  const validate = () => {
    const e: Partial<SpecimenFormData> = {};
    if (!form.specimen_code.trim()) e.specimen_code = 'Specimen ID is required.';
    if (!form.sample_type.trim()) e.sample_type = 'Sample type is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={onClose} />
      <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1050 }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 12 }}>
            <div className="modal-header border-0 pb-0" style={{ backgroundColor: '#2c5282', borderRadius: '12px 12px 0 0' }}>
              <h5 className="modal-title text-white fw-bold">
                {mode === 'add' ? '➕ Add New Specimen' : '✏️ Edit Specimen'}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close" />
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body pt-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Specimen ID <span className="text-danger">*</span></label>
                  <input name="specimen_code" type="text" className={`form-control ${errors.specimen_code ? 'is-invalid' : ''}`}
                    placeholder="e.g. 7J9Q3V" value={form.specimen_code} onChange={handleChange} disabled={mode === 'edit'} />
                  {errors.specimen_code && <div className="invalid-feedback">{errors.specimen_code}</div>}
                  {mode === 'edit' && <div className="form-text text-muted">Specimen ID cannot be changed.</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Sample Type <span className="text-danger">*</span></label>
                  <input name="sample_type" type="text" className={`form-control ${errors.sample_type ? 'is-invalid' : ''}`}
                    placeholder="e.g. Blood, Urine, Swab…" value={form.sample_type} onChange={handleChange} />
                  {errors.sample_type && <div className="invalid-feedback">{errors.sample_type}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Status</label>
                  <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="mb-1">
                  <label className="form-label fw-semibold small">Storage Location</label>
                  <input name="location" type="text" className="form-control"
                    placeholder="e.g. Rack A, Slot 3" value={form.location} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-footer border-0 pt-2">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4" disabled={saving}
                  style={{ backgroundColor: '#2c5282', borderColor: '#2c5282' }}>
                  {saving ? (mode === 'add' ? 'Adding…' : 'Saving…') : (mode === 'add' ? 'Add Specimen' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [selected, setSelected] = useState<Specimen | null>(null);
  const [filter, setFilter] = useState<string>('All');

  // ── NEW: modal state ──────────────────────────────────────────────────────
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // ─────────────────────────────────────────────────────────────────────────

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

  // ── NEW: add handler (POST) ───────────────────────────────────────────────
  const handleAdd = async (data: SpecimenFormData) => {
    setSaving(true); setSaveError(null);
    try {
      const res = await fetch(`${API_URL}/specimens/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specimen_code: data.specimen_code, sample_type: data.sample_type || null, status: data.status, location: data.location || null }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.detail ?? `Server error ${res.status}`); }
      const created: Specimen = await res.json();
      setSpecimens(prev => [created, ...prev]);
      setSelected(created);
      setModalMode(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to add specimen.');
    } finally { setSaving(false); }
  };

  // ── NEW: edit handler (PATCH) ─────────────────────────────────────────────
  const handleEdit = async (data: SpecimenFormData) => {
    if (!selected) return;
    setSaving(true); setSaveError(null);
    try {
      const res = await fetch(`${API_URL}/specimens/${selected.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample_type: data.sample_type || null, status: data.status, location: data.location || null }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.detail ?? `Server error ${res.status}`); }
      const updated: Specimen = await res.json();
      setSpecimens(prev => prev.map(s => s.id === updated.id ? updated : s));
      setSelected(updated);
      setModalMode(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally { setSaving(false); }
  };

  const editInitialData: SpecimenFormData | undefined = selected
    ? { specimen_code: selected.specimen_code ?? String(selected.id), sample_type: selected.sample_type ?? '', status: selected.status, location: selected.location ?? '' }
    : undefined;
  // ─────────────────────────────────────────────────────────────────────────

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

                {/* Filters — NEW: wrapped in flex row to add + button on the right */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex gap-2">
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

                  {/* NEW: Add specimen button */}
                  <button
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-semibold"
                    onClick={() => { setSaveError(null); setModalMode('add'); }}
                    title="Add new specimen"
                  >
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> New Specimen
                  </button>
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

                {/* NEW: header row with Edit button */}
                <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                  <h6 className="text-muted mb-0">Specimen Details</h6>
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => { setSaveError(null); setModalMode('edit'); }}
                    disabled={!selected}
                    title="Edit specimen"
                    style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                    </svg>
                    Edit
                  </button>
                </div>

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

      {/* NEW: Modals */}
      {modalMode === 'add' && (
        <SpecimenModal mode="add" onClose={() => setModalMode(null)} onSubmit={handleAdd} saving={saving} />
      )}
      {modalMode === 'edit' && selected && (
        <SpecimenModal mode="edit" initialData={editInitialData} onClose={() => setModalMode(null)} onSubmit={handleEdit} saving={saving} />
      )}

      {/* NEW: Error toast */}
      {saveError && (
        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 alert alert-danger shadow"
          style={{ zIndex: 1060, minWidth: 300 }} role="alert">
          <strong>Error:</strong> {saveError}
          <button type="button" className="btn-close float-end" onClick={() => setSaveError(null)} aria-label="Dismiss" />
        </div>
      )}
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
