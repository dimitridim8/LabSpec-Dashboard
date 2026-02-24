import React, { useEffect, useMemo, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import beaker from './assets/images/beaker-image.png';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface Specimen {
  id: number;
  specimen_code?: string;
  sample_type?: string;
  status: 'Pending' | 'In Progress' | 'Incubating' | 'Awaiting AST' | 'Completed' | 'Flagged';
  location?: string | null;

  // Patient fields
  patient_name?: string | null;
  patient_mrn?: string | null;
  patient_dob?: string | null;
  collection_time?: string | null;
  ordered_test?: string | null;
}

// Form shape used by both Add and Edit modals
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

// Reusable modal
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

  useEffect(() => {
    setForm(initialData);
    setErrors({});
  }, [initialData]);

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
                  <input
                    name="specimen_code"
                    type="text"
                    className={`form-control ${errors.specimen_code ? 'is-invalid' : ''}`}
                    placeholder="e.g. 7J9Q3V"
                    value={form.specimen_code}
                    onChange={handleChange}
                    disabled={mode === 'edit'}
                  />
                  {errors.specimen_code && <div className="invalid-feedback">{errors.specimen_code}</div>}
                  {mode === 'edit' && <div className="form-text text-muted">Specimen ID cannot be changed.</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Sample Type <span className="text-danger">*</span></label>
                  <input
                    name="sample_type"
                    type="text"
                    className={`form-control ${errors.sample_type ? 'is-invalid' : ''}`}
                    placeholder="e.g. Blood, Urine, Swab…"
                    value={form.sample_type}
                    onChange={handleChange}
                  />
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
                  <input
                    name="location"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rack A, Slot 3"
                    value={form.location}
                    onChange={handleChange}
                  />
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

// --- FILE BARCODE UPLOAD COMPONENT ---
interface SpecimenIntakeProps {
  onAddSpecimen: (data: SpecimenFormData) => Promise<void>;
  onSelectSpecimen: (specimen: Specimen & { patient_name: string; patient_mrn: string; patient_dob: string }) => void;
}

function generateDummySpecimen(barcode: string) {
  const sampleTypes = ["Blood", "Urine", "Swab", "Saliva"];
  const statuses: Specimen['status'][] = ["Pending", "In Progress", "Incubating", "Awaiting AST", "Completed", "Flagged"];
  const names = ["Alice Smith", "Bob Johnson", "Charlie Lee", "Dana Kim", "Evan Wright"];

  const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const randomDate = () =>
    new Date(+(new Date()) - Math.floor(Math.random() * 10000000000))
      .toISOString()
      .split('T')[0];

  return {
    specimen_code: barcode,
    sample_type: rand(sampleTypes),
    status: rand(statuses),
    location: `Rack ${Math.ceil(Math.random() * 5)}, Slot ${Math.ceil(Math.random() * 10)}`,
    patient_name: rand(names),
    patient_mrn: `${Math.floor(100000 + Math.random() * 900000)}`,
    patient_dob: randomDate(),
  };
}

const SpecimenIntake: React.FC<SpecimenIntakeProps> = ({ onAddSpecimen, onSelectSpecimen }) => {
  const [barcode, setBarcode] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setBarcode('');
    setError(null);
  };

  async function decodeBarcodeFromFile(file: File): Promise<string> {
    const img = await loadImage(file);

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const reader = new BrowserMultiFormatReader();
    const result = reader.decodeFromCanvas(canvas);
    return result.getText();
  }

  const handleDecode = async () => {
    if (!file) return setError('Please select an image file.');
    try {
      const decodedBarcode = await decodeBarcodeFromFile(file);
      setBarcode(decodedBarcode);

      const dummy = generateDummySpecimen(decodedBarcode);

      await onAddSpecimen({
        specimen_code: dummy.specimen_code,
        sample_type: dummy.sample_type,
        status: dummy.status as Specimen['status'],
        location: dummy.location,
      });

      onSelectSpecimen({
        id: Math.floor(Math.random() * 100000),
        specimen_code: dummy.specimen_code,
        sample_type: dummy.sample_type,
        status: dummy.status as Specimen['status'],
        location: dummy.location,
        patient_name: dummy.patient_name,
        patient_mrn: dummy.patient_mrn,
        patient_dob: dummy.patient_dob,
      });

    } catch (err) {
      console.error(err);
      setError('Failed to decode barcode from file.');
    }
  };

  return (
    <div className="d-flex flex-column gap-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button className="btn btn-sm btn-primary w-25" onClick={handleDecode} disabled={!file}>
        Decode Barcode
      </button>
      {barcode && <div className="alert alert-success p-2">Decoded Barcode: {barcode}</div>}
      {error && <div className="alert alert-danger p-2">{error}</div>}
    </div>
  );
};

// Helper to load file as HTMLImageElement
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// --- DASHBOARD ---
const Dashboard: React.FC = () => {
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [selected, setSelected] = useState<Specimen | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Load specimens from backend
  useEffect(() => {
    const fetchSpecimens = async () => {
      try {
        const res = await fetch(`${API_URL}/specimens/`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        const normalized: Specimen[] = data.map((s: any) => ({
          id: s.specimen_id,
          specimen_code: s.specimen_code,
          sample_type: s.specimen_type,
          status: s.current_status,
          location: s.storage_location
        }));
        setSpecimens(normalized);
      } catch (err: unknown) {
        console.error('Failed to load specimens:', err);
      }
    };
    fetchSpecimens();
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

  // Add new specimen (POST)
  const handleAdd = async (data: SpecimenFormData) => {
    setSaving(true); setSaveError(null);
    try {
      const res = await fetch(`${API_URL}/specimens/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specimen_code: data.specimen_code,
          specimen_type: data.sample_type || null,
          current_status: data.status,
          storage_location: data.location || null,
          storage_condition: null
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail ?? `Server error ${res.status}`);
      }
      const created = await res.json();
      const newSpecimen: Specimen = {
        id: created.specimen_id,
        specimen_code: created.specimen_code,
        sample_type: created.specimen_type,
        status: created.current_status,
        location: created.storage_location
      };
      setSpecimens(prev => [newSpecimen, ...prev]);
      setSelected(newSpecimen);
      setModalMode(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to add specimen.');
    } finally { setSaving(false); }
  };

  // Edit specimen (PATCH)
  const handleEdit = async (data: SpecimenFormData) => {
    if (!selected) return;
    setSaving(true); setSaveError(null);
    try {
      const res = await fetch(`${API_URL}/specimens/${selected.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specimen_type: data.sample_type || null,
          current_status: data.status,
          storage_location: data.location || null
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail ?? `Server error ${res.status}`);
      }
      const updated = await res.json();
      const normalized: Specimen = {
        id: updated.specimen_id,
        specimen_code: updated.specimen_code,
        sample_type: updated.specimen_type,
        status: updated.current_status,
        location: updated.storage_location
      };
      setSpecimens(prev => prev.map(s => s.id === normalized.id ? normalized : s));
      setSelected(normalized);
      setModalMode(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally { setSaving(false); }
  };

  // Mark as Completed
  const handleMarkCompleted = async () => {
    if (!selected) return;
    setSaving(true); setSaveError(null);
    try {
      const res = await fetch(`${API_URL}/specimens/${selected.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_status: 'Completed' }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail ?? `Server error ${res.status}`);
      }
      const updated = await res.json();
      const normalized: Specimen = {
        id: updated.specimen_id,
        specimen_code: updated.specimen_code,
        sample_type: updated.specimen_type,
        status: updated.current_status,
        location: updated.storage_location
      };
      setSpecimens(prev => prev.map(s => s.id === normalized.id ? normalized : s));
      setSelected(normalized);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to mark completed.');
    } finally { setSaving(false); }
  };

  const editInitialData: SpecimenFormData | undefined = selected
    ? { specimen_code: selected.specimen_code ?? String(selected.id), sample_type: selected.sample_type ?? '', status: selected.status, location: selected.location ?? '' }
    : undefined;

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Top Nav */}
      <nav className="navbar navbar-dark shadow-sm p-3" style={{ backgroundColor: '#2c5282' }}>
        <span className="navbar-brand mb-0 h1"><b>LabSpec</b> Dashboard</span>
        <div className="text-white">Welcome, Dr. Smith</div>
      </nav>

      <div className="container-fluid flex-grow-1 p-4" style={{ backgroundColor: '#c9d7e0' }}>
        {/* Specimen Intake Form (File Barcode Upload) */}
        <div className="card shadow-sm border-0 mb-4 p-3">
          <h4 className="fw-bold text-primary mb-3">➕ Quick Specimen Intake</h4>
          <SpecimenIntake
            onAddSpecimen={async (data) => {
              // create a new specimen object
              const newSpecimen: Specimen & { patient_name: string; patient_mrn: string; patient_dob: string } = {
                id: Math.floor(Math.random() * 100000),
                specimen_code: data.specimen_code,
                sample_type: data.sample_type,
                status: data.status,
                location: data.location,
                patient_name: "Dummy Name",
                patient_mrn: `${Math.floor(100000 + Math.random() * 900000)}`,
                patient_dob: "2000-01-01",
              };

              // update the specimens state
              setSpecimens(prev => [newSpecimen, ...prev]);

              // select it so details sidebar updates
              setSelected(newSpecimen);
            }}
            onSelectSpecimen={(specimen) => {
              setSelected(specimen);
            }}
          />
        </div>

        <div className="main-page-border" style={{ margin: 20, justifyContent: 'center' }}>
          <h2 className="mb-4" style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2c5282' }}>Specimen Overview</h2>
          <hr />

          {/* Metric Cards */}
          <div className="row mb-4">
            {Object.entries(metrics).map(([key, value]) => (
              <div className="col-md-3" key={key}>
                <div className="card border-0 shadow-sm text-center p-3">
                  <span className="fw-bold text-primary">{key}: <b>{value}</b></span>
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            {/* Specimen List */}
            <div className="col-lg-9">
              <div className="card shadow-sm border-0 p-3">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex gap-2">
                    {["All", "Pending", "In Progress", "Awaiting AST", "Completed"].map(f => (
                      <button
                        key={f}
                        className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setFilter(f)}
                      >{f}</button>
                    ))}
                  </div>
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
                    {filteredSpecimens.map(s => (
                      <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: "pointer" }}>
                        <td>{s.specimen_code ?? s.id}</td>
                        <td>{s.sample_type ?? "—"}</td>
                        <td><span className={`badge bg-${getStatusColor(s.status)}`}>{s.status}</span></td>
                        <td>{s.location ?? "—"}</td>
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={e => { e.stopPropagation(); setSelected(s); }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredSpecimens.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">No specimens found for this filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Details Sidebar */}
            <div className="col-lg-3">
              <div className="card shadow-sm border-0 h-100 p-3">
                <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                  <h6 className="text-muted mb-0">Specimen Details</h6>
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => { setSaveError(null); setModalMode('edit'); }}
                    disabled={!selected}
                    title="Edit specimen"
                    style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-3">
                  {!selected ? (
                    <p className="text-muted small">Click a specimen row to view details.</p>
                  ) : (
                    <>
                      <p className="small mb-1 text-muted">ID: {selected.specimen_code ?? selected.id}</p>
                      <p className="fw-bold">Sample Type: {selected.sample_type ?? "—"}</p>
                      <div className={`badge bg-${getStatusColor(selected.status)} mb-3`}>{selected.status}</div>
                      <p className="small"><strong>Storage:</strong> {selected.location ?? "—"}</p>

                    {/* --- Patient Details --- */}
                      {selected.patient_name && <p className="small"><strong>Patient:</strong> {selected.patient_name}</p>}
                      {selected.patient_mrn && <p className="small"><strong>MRN:</strong> {selected.patient_mrn}</p>}
                      {selected.patient_dob && <p className="small"><strong>DOB:</strong> {selected.patient_dob}</p>}
                      {selected.collection_time && <p className="small"><strong>Collection Time:</strong> {selected.collection_time}</p>}
                      {selected.ordered_test && <p className="small"><strong>Ordered Test:</strong> {selected.ordered_test}</p>}
                    </>
                  )}
                </div>
                <button className="btn btn-danger w-100 mt-auto" disabled={!selected || saving} onClick={handleMarkCompleted}>
                  {saving ? 'Saving…' : 'Mark as Completed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/*Floating LabBot */}
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

      {/* Modals */}
      {modalMode === 'add' && (
        <SpecimenModal mode="add" onClose={() => setModalMode(null)} onSubmit={handleAdd} saving={saving} />
      )}
      {modalMode === 'edit' && selected && (
        <SpecimenModal mode="edit" initialData={editInitialData} onClose={() => setModalMode(null)} onSubmit={handleEdit} saving={saving} />
      )}

      {saveError && <div className="alert alert-danger position-fixed bottom-0 end-0 m-3">{saveError}</div>}
    </div>
  );
};

export default Dashboard;

// Helper for badge colors
function getStatusColor(status: Specimen['status']) {
  switch (status) {
    case 'Pending': return 'secondary';
    case 'In Progress': return 'info';
    case 'Incubating': return 'warning';
    case 'Awaiting AST': return 'primary';
    case 'Completed': return 'success';
    case 'Flagged': return 'danger';
    default: return 'secondary';
  }
}
