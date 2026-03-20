import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import beaker from './assets/images/beaker-image.png';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { supabase } from "./supabaseClient";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import TopNav from "./components/TopNav";
import JsBarcode from 'jsbarcode';

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
}

function generateDummySpecimen(barcode: string): {
  specimen_code: string;
  sample_type: string;
  status: Specimen['status'];
  location: string;
} {
  const sampleTypes = ["Blood", "Urine", "Swab", "Saliva"];

  const statuses: Specimen['status'][] = [
    "Pending",
    "In Progress",
    "Incubating",
    "Awaiting AST",
    "Completed",
    "Flagged"
  ];

  const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return {
    specimen_code: barcode,
    sample_type: rand(sampleTypes),
    status: rand(statuses),
    location: `Rack ${Math.ceil(Math.random() * 5)}, Slot ${Math.ceil(Math.random() * 10)}`
  };
}

const SpecimenIntake: React.FC<SpecimenIntakeProps> = ({ onAddSpecimen }) => {
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
        status: dummy.status,
        location: dummy.location,
      });

    } catch (err) {
      console.error(err);
      setError('Failed to decode barcode from file.');
    }
  };

  return (
    <div className="d-flex flex-column gap-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        className="btn btn-sm btn-primary w-25"
        onClick={handleDecode}
        disabled={!file}
      >
        Decode Barcode
      </button>
      {barcode && (
        <div className="alert alert-success p-2">
          Decoded Barcode: {barcode}
        </div>
      )}
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

interface SpecimenLabelProps {
  specimen: {
    specimen_code: string;
    patient_name?: string;
    patient_dob?: string;
    patient_mrn?: string;
    collection_time?: string;
    sample_type?: string;
    location?: string;
    collector?: string;
    test_requested?: string;
  };
}

const SpecimenLabel: React.FC<SpecimenLabelProps> = ({ specimen }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, specimen.specimen_code, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true
      });
    }
  }, [specimen.specimen_code]);

  return (
    <div
      className="print-label"
      style={{
        border: '1px solid #000',
        padding: 8,
        width: 250,
        fontFamily: 'Arial, sans-serif',
        marginBottom: 10
      }}
    >
      <svg ref={svgRef} />
      <p style={{ margin: '4px 0', fontSize: '0.8rem' }}><strong>Patient:</strong> {specimen.patient_name}</p>
      <p style={{ margin: '4px 0', fontSize: '0.8rem' }}><strong>DOB:</strong> {specimen.patient_dob}</p>
      <p style={{ margin: '4px 0', fontSize: '0.8rem' }}><strong>MRN:</strong> {specimen.patient_mrn}</p>
      <p style={{ margin: '4px 0', fontSize: '0.8rem' }}><strong>Collected:</strong> {specimen.collection_time}</p>
      <p style={{ margin: '4px 0', fontSize: '0.8rem' }}><strong>Sample:</strong> {specimen.sample_type}</p>
      <p style={{ margin: '4px 0', fontSize: '0.8rem' }}><strong>Location:</strong> {specimen.location}</p>
      <p style={{ margin: '4px 0', fontSize: '0.8rem' }}><strong>Collector:</strong> {specimen.collector || '—'}</p>
      <p style={{ margin: '4px 0', fontSize: '0.8rem' }}><strong>Test:</strong> {specimen.test_requested || '—'}</p>
      <button
        className="btn btn-sm btn-outline-primary mt-2"
        onClick={() => {
          const label = document.querySelector('.print-label')?.cloneNode(true) as HTMLElement;

          // remove button before printing
          const btn = label?.querySelector('button');
          if (btn) btn.remove();

          const printContents = label?.innerHTML;

          const win = window.open('', '_blank');

          if (win && printContents) {
            win.document.write(`
              <html>
                <head>
                  <title>Print Label</title>
                  <style>
                    html, body {
                      margin: 0;
                      padding: 0;
                      height: 100%;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      font-family: Arial, sans-serif;
                    }

                    .label-container {
                      transform: scale(1.5);
                      transform-origin: center;
                    }

                    @media print {
                      .label-container {
                        transform: scale(1.2);
                      }
                    }
                  </style>
                </head>
                <body>
                  <div class="label-container">
                    ${printContents}
                  </div>
                </body>
              </html>
            `);

            win.document.close();

            win.moveTo(0, 0);
            win.resizeTo(screen.width, screen.height);

            win.focus();
            win.print();
            win.close();
          }
        }}
      >
        Print Label
      </button>
    </div>
  );
};


// --- DASHBOARD ---
  const Dashboard: React.FC<{
    userId: string;
    fallbackEmail?: string;
    onNavigate: (page: "dashboard" | "profile" | "help") => void;
  }> = ({ userId, fallbackEmail, onNavigate }) => {

  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [selected, setSelected] = useState<Specimen | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [showAll, setShowAll] = useState(false);

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: 'Hello. I am LabBot. Ask me about specimen status, location, or details.' }
  ]);
  const [chatMinimized, setChatMinimized] = useState(false);

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
          location: s.storage_location,

          patient_name: s.patient_name,
          patient_mrn: s.patient_mrn,
          patient_dob: s.patient_dob,
          collection_time: s.collection_time,
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

  const uniqueLocations = useMemo(() => {
    return [...new Set(specimens.map(s => s.location).filter(Boolean))] as string[];
  }, [specimens]);

  const filteredSpecimens = useMemo(() => {
  return specimens.filter(s => {

    // Status filter (your existing buttons)
    const matchesStatus =
      filter === 'All' || s.status === filter;

    // Search filter
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !search ||
      s.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.specimen_code ?? String(s.id)).toLowerCase().includes(search) ||
      (s.sample_type ?? '').toLowerCase().includes(search) ||
      (s.location ?? '').toLowerCase().includes(search);

    // Location filter
    const matchesLocation =
      locationFilter === 'All' || s.location === locationFilter;

    return matchesStatus && matchesSearch && matchesLocation;
  });
}, [specimens, filter, searchTerm, locationFilter]);

const displayedSpecimens = showAll
  ? filteredSpecimens
  : filteredSpecimens.slice(0, 8); // show first 8 by default

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

  // chatbot
  const handleChatSubmit = () => {
  if (!chatInput.trim()) return;

  const userMessage = chatInput.trim();
  const lower = userMessage.toLowerCase();

  setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);

  let response =
    "I'm sorry, I can only assist with specimen status, location, and basic workflow questions.";

  // 🔎 Find specimen by code OR by sample type
  const foundSpecimen = specimens.find(s =>
    lower.includes(s.specimen_code?.toLowerCase() ?? "") ||
    lower.includes(s.sample_type?.toLowerCase() ?? "")
  );

  // --- STATUS ---
  if (lower.includes('status') && foundSpecimen) {
    response = `Specimen ${foundSpecimen.specimen_code} is currently ${foundSpecimen.status}.`;
  }

  // --- LOCATION ---
  else if ((lower.includes('where') || lower.includes('location')) && foundSpecimen) {
    response = `Specimen ${foundSpecimen.specimen_code} is stored at ${foundSpecimen.location ?? "an unspecified location"}.`;
  }

  // --- FULL DETAILS ---
  else if (lower.includes('details') && foundSpecimen) {
    response =
      `Specimen ${foundSpecimen.specimen_code}:
      Status: ${foundSpecimen.status}
      Location: ${foundSpecimen.location ?? "N/A"}
      Sample Type: ${foundSpecimen.sample_type ?? "N/A"}`;
  }

  // --- SUPERVISOR SUMMARY ---
  else if (lower.includes('summary') && foundSpecimen) {
    response =
      `Specimen ${foundSpecimen.specimen_code} summary:
      Status: ${foundSpecimen.status}
      Location: ${foundSpecimen.location ?? "N/A"}
      MRN: ${foundSpecimen.patient_mrn ?? "N/A"}`;
  }

  // --- VOLUME LOOKUP ---
  else if (lower.includes('ml') || lower.includes('volume')) {
    if (lower.includes('blood')) response = "Required volume for Blood specimen: 5 mL.";
    else if (lower.includes('urine')) response = "Required volume for Urine specimen: 10 mL.";
    else if (lower.includes('swab')) response = "Swab specimens require proper collection medium.";
    else response = "Please specify specimen type for volume requirements.";
  }

  // --- Not Found ---
  else if (!foundSpecimen) {
    response = "No matching specimen was found in the system.";
  }

  setChatMessages(prev => [...prev, { sender: 'bot', text: response }]);
  setChatInput('');
};

const handleClearChat = () => {
  setChatMessages([
    {
      sender: 'bot',
      text: 'Hello. I am LabBot. Ask me about specimen status, location, or details.'
    }
  ]);
};

  return (
    <div className="min-vh-100 d-flex flex-column">
      <TopNav
        title="Dashboard"
        userId={userId}
        fallbackEmail={fallbackEmail}
        activePage="dashboard"
        onNavigate={onNavigate}
      />

      <div className="container-fluid flex-grow-1 p-4" style={{ backgroundColor: '#c9d7e0' }}>
        {/* Specimen Intake Form (File Barcode Upload) */}
        <div className="card shadow-sm border-0 mb-4 p-3">
          <h4 className="fw-bold text-primary mb-3">➕ Quick Specimen Intake</h4>
         <SpecimenIntake
            onAddSpecimen={async (data) => {
              // --- Generate random patient info ---
              const names = ["Alice Smith", "Bob Johnson", "Charlie Lee", "Dana Kim", "Evan Wright"];
              const randomDate = () =>
                new Date(+new Date() - Math.floor(Math.random() * 10000000000))
                  .toISOString()
                  .split("T")[0];

              const patient_name = names[Math.floor(Math.random() * names.length)];
              const patient_dob = randomDate();
              const patient_mrn = `${Date.now()}${Math.floor(Math.random() * 1000)}`; // unique MRN

              // --- Prepare payload for backend ---
              const payload = {
                specimen_code: data.specimen_code,      // barcode from scan
                specimen_type: data.sample_type || null,
                current_status: data.status,
                storage_location: data.location || null,
                storage_condition: null,
                patient_name,
                patient_dob,
                patient_mrn,
              };

              try {
                const res = await fetch(`${API_URL}/specimens/`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) {
                  const d = await res.json().catch(() => ({}));
                  throw new Error(d?.detail ?? `Server error ${res.status}`);
                }
                const created = await res.json();

                // --- Normalize and update frontend state ---
                const newSpecimen: Specimen & { patient_name?: string; patient_dob?: string; patient_mrn?: string } = {
                  id: created.specimen_id,
                  specimen_code: created.specimen_code,
                  sample_type: created.specimen_type,
                  status: created.current_status,
                  location: created.storage_location,
                  patient_name: created.patient_name,
                  patient_dob: created.patient_dob,
                  patient_mrn: created.patient_mrn,
                  collection_time: created.collection_time,
                };

                setSpecimens(prev => [newSpecimen, ...prev]);
                setSelected(newSpecimen);

              } catch (err: unknown) {
                console.error("Failed to add specimen:", err);
                alert(err instanceof Error ? err.message : "Failed to add specimen");
              }
            }}
          />
        </div>

        <div className="main-page-border" style={{ margin: 20, justifyContent: 'center' }}>
          <h2 className="mb-4" style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2c5282' }}>Specimen Overview</h2>
          <hr />

          {/* Filters (outside table) */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {/* Search Bar */}
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search ID, sample type, location..."
            style={{ width: '500px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Location Filter */}
          <select
            className="form-select form-select-sm"
            style={{ width: '160px' }}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="All">All Locations</option>
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setFilter('All');
              setSearchTerm('');
              setLocationFilter('All');
            }}
          >
            Clear
          </button>
          </div>

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

      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">

        <div className="d-flex flex-wrap gap-2 align-items-center">

          {/* Status Buttons */}
          {["All", "Pending", "In Progress", "Awaiting AST", "Completed"].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}

        </div>

        {/* New Specimen Button */}
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
                {displayedSpecimens.map(s => (
                  <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: "pointer" }}>
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
                        onClick={e => { e.stopPropagation(); setSelected(s); }}
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
            {filteredSpecimens.length > 8 && (
              <div className="text-center mt-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : "Show More"}
                </button>
              </div>
            )}

          </div>
        </div>

            {/* Details Sidebar */}
            <div className="col-lg-3">
              <div
                className="card shadow-sm border-0 p-3"
                style={{
                  alignSelf: 'flex-start',
                  borderLeft: `4px solid var(--bs-${selected ? getStatusColor(selected.status) : 'secondary'})`,
                  transition: 'border-color 0.3s ease',
                }}
              >
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
                    <div className="text-center text-muted py-4 d-flex flex-column align-items-center gap-2">
                      <img src={beaker} alt="No specimen selected" style={{ width: 48, opacity: 0.3 }} />
                      <p className="small mb-0">Select a specimen row<br />to view its details.</p>
                    </div>
                  ) : (
                    <>
                      <p className="small mb-1 text-muted">ID: {selected.specimen_code ?? selected.id}</p>
                      <p className="fw-bold mb-1">Sample Type: {selected.sample_type ?? "—"}</p>
                      <div className={`badge bg-${getStatusColor(selected.status)} mb-3`}>{selected.status}</div>
                      <p className="small"><strong>Storage:</strong> {selected.location ?? "—"}</p>

                      {/* --- Patient Details --- */}
                      {(selected.patient_name || selected.patient_mrn || selected.patient_dob || selected.collection_time) && (
                        <>
                          <div className="d-flex align-items-center gap-2 my-2">
                            <hr className="flex-grow-1 my-0" />
                            <span className="text-muted" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>PATIENT INFO</span>
                            <hr className="flex-grow-1 my-0" />
                          </div>
                          <div className="rounded p-2" style={{ backgroundColor: '#f0f4f8' }}>
                            {selected.patient_name && <p className="small mb-1"><strong>Patient:</strong> {selected.patient_name}</p>}
                            {selected.patient_mrn && <p className="small mb-1"><strong>MRN:</strong> {selected.patient_mrn}</p>}
                            {selected.patient_dob && <p className="small mb-1"><strong>DOB:</strong> {selected.patient_dob}</p>}
                            {selected.collection_time && (
                              <p className="small mb-0">
                                <strong>Collected:</strong>{' '}
                                {new Date(selected.collection_time).toLocaleString(undefined, {
                                  year: 'numeric', month: 'short', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {/* --- SPECIMEN LABEL --- */}
                      {selected && (
                        <div className="mt-4">
                          <h6 className="text-primary fw-bold">Specimen Label</h6>
                          <SpecimenLabel
                            specimen={{
                              specimen_code: selected.specimen_code ?? String(selected.id),
                              patient_name: selected.patient_name ?? undefined,
                              patient_dob: selected.patient_dob ?? undefined,
                              patient_mrn: selected.patient_mrn ?? undefined,
                              collection_time: selected.collection_time ?? undefined,
                              sample_type: selected.sample_type ?? undefined,
                              location: selected.location ?? undefined,
                              collector: 'AB',
                              test_requested: 'Culture',
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                   
                {/* Inline status change */}
                {selected && (
                  <div className="mt-3">
                    <label className="form-label fw-semibold small text-muted mb-1">Update Status</label>
                    <select
                      className="form-select form-select-sm"
                      value={selected.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value as Specimen['status'];
                        setSaving(true); setSaveError(null);
                        try {
                          const res = await fetch(`${API_URL}/specimens/${selected.id}/`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ current_status: newStatus }),
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
                            location: updated.storage_location,
                            patient_name: updated.patient_name,
                            patient_mrn: updated.patient_mrn,
                            patient_dob: updated.patient_dob,
                            collection_time: updated.collection_time,
                          };
                          setSpecimens(prev => prev.map(s => s.id === normalized.id ? normalized : s));
                          setSelected(normalized);
                        } catch (err: unknown) {
                          setSaveError(err instanceof Error ? err.message : 'Failed to update status.');
                        } finally { setSaving(false); }
                      }}
                      disabled={saving}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Mark as Completed with tooltip when already completed */}
                <div
                  className="mt-3"
                  title={selected?.status === 'Completed' ? 'This specimen is already marked as completed.' : ''}
                  style={{ cursor: selected?.status === 'Completed' ? 'not-allowed' : 'default' }}
                >
                  <button
                    className="btn btn-danger w-100"
                    disabled={!selected || saving || selected?.status === 'Completed'}
                    onClick={handleMarkCompleted}
                    style={{ pointerEvents: selected?.status === 'Completed' ? 'none' : 'auto' }}
                  >
                    {saving ? 'Saving…' : selected?.status === 'Completed' ? '✓ Already Completed' : 'Mark as Completed'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating LabBot */}
      <div
        className="position-fixed bottom-0 end-0 m-4 shadow-lg card"
        style={{ width: '320px', borderRadius: '15px 15px 0 0' }}
      >
        {/* Header */}
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <span>🤖 LabBot</span>

          <div className="d-flex gap-1 align-items-center">
            {/* Clear Chat button: only visible when not minimized */}
            {!chatMinimized && (
              <button
                className="btn btn-sm btn-light"
                title="Clear chat"
                onClick={handleClearChat}
              >
                Clear
              </button>
            )}

            {/* Minimize button: always visible */}
            <button
              className="btn btn-sm btn-light"
              style={{ padding: '2px 8px' }}
              onClick={() => setChatMinimized(!chatMinimized)}
            >
              {chatMinimized ? "▲" : "-"}
            </button>
          </div>
        </div>

        {/* Body (Hidden When Minimized) */}
        {!chatMinimized && (
          <>
            <div
              className="p-3 bg-light"
              style={{ height: '250px', overflowY: 'auto' }}
            >
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 ${msg.sender === 'user' ? 'text-end' : 'text-start'}`}
                >
                  <span
                    className={`badge text-wrap ${
                      msg.sender === 'user' ? 'bg-secondary' : 'bg-primary'
                    }`}
                    style={{
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      display: 'inline-block'
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2 border-top d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ask about specimen..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={handleChatSubmit}
              >
                Send
              </button>
            </div>
          </>
        )}
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

//export default Dashboard;

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<"dashboard" | "profile" | "help">("dashboard");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) setActivePage("dashboard");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  // Not logged in → show login/register
  if (!session) {
    return (
      <div>
        {showRegister ? (
          <Register onSuccess={() => setShowRegister(false)} />
        ) : (
          <Login />
        )}
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button
            onClick={() => setShowRegister((v) => !v)}
            style={{ border: "none", background: "transparent", color: "#2c5282" }}
          >
            {showRegister ? "Have an account? Login" : "No account? Register"}
          </button>
        </div>
      </div>
    );
  }

  const userId = session.user.id;
  const email = session.user.email;

  if (activePage === "profile") {
    return (
      <Profile
        userId={userId}
        fallbackEmail={email}
        activePage="profile"
        onNavigate={setActivePage}
      />
    );
  }

  if (activePage === "help") {
    return (
      <Help
        userId={userId}
        fallbackEmail={email}
        activePage="help"
        onNavigate={setActivePage}
      />
    );
  }

  return (
    <Dashboard
      userId={userId}
      fallbackEmail={email}
      onNavigate={setActivePage}
    />
  );
}

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
