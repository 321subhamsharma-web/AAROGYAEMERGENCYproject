import { useState, useEffect, useCallback } from 'react';
import { EmergencyCase, PageView } from './types';
import {
  isDemoMode, generateAccessToken, generateCaseId,
  getCases, saveCases, addCase, updateCase, deleteCase,
  getCaseById, getCaseByToken, seedDemoData, deterministicAIEngine
} from './utils';
import {
  Heart, Activity, FileText, Shield, QrCode, Smartphone, Map,
  Plus, Search, Filter, Trash2, Eye, Check, Copy, Download,
  Printer, ArrowLeft, ArrowRight, Mic, MicOff, Save, Send,
  AlertTriangle, Clock, User, MapPin, Stethoscope, Zap,
  ChevronRight, Menu, X, Home, ClipboardList, Radio
} from 'lucide-react';
import QRCode from 'qrcode';

// ==================== MAIN APP ====================
export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('landing');
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize
  useEffect(() => {
    seedDemoData();
    setCases(getCases());
    setDemoMode(isDemoMode());

    // Hash-based routing
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const [page, param] = hash.split('/');
        if (['landing', 'dashboard', 'create-case', 'scribe', 'verification', 'qr-display', 'doctor-view', 'roadmap'].includes(page)) {
          setCurrentPage(page as PageView);
          if (param) {
            if (page === 'doctor-view') {
              // param is access token for doctor view
              setAccessToken(param);
            } else {
              setSelectedCaseId(param);
            }
          }
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = useCallback((page: PageView, param?: string) => {
    if (param) {
      window.location.hash = `${page}/${param}`;
      if (page === 'doctor-view') {
        setAccessToken(param);
      } else {
        setSelectedCaseId(param);
      }
    } else {
      window.location.hash = page;
      if (page !== 'doctor-view') {
        setAccessToken(null);
      }
    }
    setCurrentPage(page);
    setMobileMenuOpen(false);
  }, []);

  const refreshCases = useCallback(() => {
    setCases(getCases());
  }, []);

  const selectedCase = selectedCaseId ? getCaseById(selectedCaseId) : null;
  const doctorCase = accessToken ? getCaseByToken(accessToken) : null;
  
  // For doctor-view without token, use first verified case
  const doctorViewCase = doctorCase || (currentPage === 'doctor-view' && !selectedCaseId ? cases.find(c => c.status === 'Verified') : null);

  const navItems: { page: PageView; label: string; icon: React.ReactNode }[] = [
    { page: 'landing', label: 'Home', icon: <Home size={18} /> },
    { page: 'dashboard', label: 'Dashboard', icon: <ClipboardList size={18} /> },
    { page: 'create-case', label: 'New Case', icon: <Plus size={18} /> },
    { page: 'roadmap', label: 'Roadmap', icon: <Map size={18} /> },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FCFBF8', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800 font-medium sticky top-0 z-50">
          ⚠️ DEMO STORAGE MODE ACTIVE — Fictional Data Only — No Real Clinical Validation
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40" style={{ top: demoMode ? '36px' : '0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('landing')}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#12365B' }}>
                <Heart size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-sm" style={{ color: '#0B2342' }}>AAROGYA</span>
                <span className="text-xs text-slate-500 block -mt-1">Emergency QR Scribe</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.page
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  style={currentPage === item.page ? { backgroundColor: '#12365B' } : {}}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentPage === item.page ? 'text-white' : 'text-slate-600'
                }`}
                style={currentPage === item.page ? { backgroundColor: '#12365B' } : {}}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPage === 'landing' && <LandingPage navigate={navigate} />}
        {currentPage === 'dashboard' && (
          <DashboardPage cases={cases} navigate={navigate} refreshCases={refreshCases} setSelectedCaseId={setSelectedCaseId} />
        )}
        {currentPage === 'create-case' && (
          <CreateCasePage navigate={navigate} setSelectedCaseId={setSelectedCaseId} refreshCases={refreshCases} />
        )}
        {currentPage === 'scribe' && selectedCase && (
          <ScribePage caseData={selectedCase} navigate={navigate} refreshCases={refreshCases} />
        )}
        {currentPage === 'verification' && selectedCase && (
          <VerificationPage caseData={selectedCase} navigate={navigate} refreshCases={refreshCases} />
        )}
        {currentPage === 'qr-display' && selectedCase && (
          <QRDisplayPage caseData={selectedCase} navigate={navigate} />
        )}
        {currentPage === 'doctor-view' && (
          <DoctorViewPage caseData={doctorViewCase || selectedCase} navigate={navigate} />
        )}
        {currentPage === 'roadmap' && <RoadmapPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            Developed by <strong>Team HealthNova</strong> | K.R. Mangalam University (KRMU), School of Medical and Allied Sciences (SMAS)
          </p>
          <p className="text-xs text-slate-400 mt-1">
            "Scan to Save — Voice-First Emergency Handover" | Hackathon Prototype 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

// ==================== LANDING PAGE ====================
function LandingPage({ navigate }: { navigate: (page: PageView) => void }) {
  const steps = [
    { icon: <Mic size={24} />, title: 'Capture Voice', desc: 'Paramedic dictates clinical notes' },
    { icon: <Zap size={24} />, title: 'AI Structuring', desc: 'Deterministic engine parses data' },
    { icon: <Shield size={24} />, title: 'Human Verification', desc: 'Clinical review & authorization' },
    { icon: <QrCode size={24} />, title: 'Generate QR Pass', desc: 'Unique encrypted QR passport' },
    { icon: <Smartphone size={24} />, title: 'Doctor Scan', desc: 'Instant mobile clinical view' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center py-12 px-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #12365B 0%, #0B2342 100%)' }}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
            <Heart size={32} className="text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">AAROGYA EMERGENCY QR SCRIBE</h1>
            <p className="text-sm text-teal-300 font-medium">HealthNova | KRMU SMAS</p>
          </div>
        </div>
        <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto mb-8">
          "Every Second Matters. Every Handover Counts."
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate('dashboard')} className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105" style={{ backgroundColor: '#20B6A0' }}>
            <Activity size={18} /> Paramedic Dashboard
          </button>
          <button onClick={() => navigate('doctor-view')} className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105" style={{ backgroundColor: '#45C98A' }}>
            <Smartphone size={18} /> Simulate QR Scan
          </button>
          <button onClick={() => navigate('roadmap')} className="px-6 py-3 rounded-xl font-semibold text-white/90 border border-white/30 flex items-center gap-2 transition-all hover:bg-white/10">
            <Map size={18} /> Innovation Roadmap
          </button>
        </div>
      </div>

      {/* Process Steps */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold" style={{ color: '#0B2342' }}>How It Works</h2>
        <p className="text-slate-500 mt-2">From ambulance to ER in seconds</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {steps.map((step, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm text-center relative">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: i === 0 ? '#12365B' : '#20B6A0' }}>
              <span className="text-white">{step.icon}</span>
            </div>
            <h3 className="font-semibold text-sm" style={{ color: '#0B2342' }}>{step.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
            {i < steps.length - 1 && (
              <ChevronRight size={16} className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300" />
            )}
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#12365B' }}>
            <Radio size={20} className="text-white" />
          </div>
          <h3 className="font-bold text-lg" style={{ color: '#0B2342' }}>Voice-First Input</h3>
          <p className="text-sm text-slate-500 mt-2">Web Speech API integration with deterministic fallback AI engine for offline operation.</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#20B6A0' }}>
            <Shield size={20} className="text-white" />
          </div>
          <h3 className="font-bold text-lg" style={{ color: '#0B2342' }}>Human Verification</h3>
          <p className="text-sm text-slate-500 mt-2">Safety-first design requiring paramedic authorization before QR generation. Auto-downgrade on edits.</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#45C98A' }}>
            <QrCode size={20} className="text-white" />
          </div>
          <h3 className="font-bold text-lg" style={{ color: '#0B2342' }}>QR Passport System</h3>
          <p className="text-sm text-slate-500 mt-2">Encrypted access tokens ensure only authorized receiving physicians can view clinical data.</p>
        </div>
      </div>
    </div>
  );
}

// ==================== DASHBOARD ====================
function DashboardPage({ cases, navigate, refreshCases, setSelectedCaseId }: {
  cases: EmergencyCase[];
  navigate: (page: PageView, id?: string) => void;
  refreshCases: () => void;
  setSelectedCaseId: (id: string | null) => void;
}) {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = cases.filter(c => {
    const matchFilter = filter === 'All' || c.status === filter;
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.patientLabel.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: cases.length,
    drafts: cases.filter(c => c.status === 'Draft').length,
    awaiting: cases.filter(c => c.status === 'Awaiting Verification').length,
    verified: cases.filter(c => c.status === 'Verified').length,
  };

  const handleDelete = (id: string) => {
    deleteCase(id);
    refreshCases();
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0B2342' }}>Paramedic Dashboard</h1>
          <p className="text-sm text-slate-500">Triage board & case history index</p>
        </div>
        <button onClick={() => navigate('create-case')} className="px-4 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105" style={{ backgroundColor: '#12365B' }}>
          <Plus size={18} /> New Emergency Case
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Cases</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#12365B' }}>{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Drafts</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{stats.drafts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Awaiting Verification</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{stats.awaiting}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">QR-Ready (Verified)</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#20B6A0' }}>{stats.verified}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Case ID or Patient Label..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Draft', 'Awaiting Verification', 'Verified'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f ? 'text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                style={filter === f ? { backgroundColor: '#12365B' } : {}}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Case ID</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Patient</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Created</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-xs" style={{ color: '#12365B' }}>{c.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{c.patientLabel}</p>
                    <p className="text-xs text-slate-400">{c.age}y / {c.sex}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">{c.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelectedCaseId(c.id); navigate('verification', c.id); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500" title="Open Case">
                        <Eye size={15} />
                      </button>
                      {c.status !== 'Verified' && (
                        <button onClick={() => { setSelectedCaseId(c.id); navigate('verification', c.id); }} className="p-1.5 rounded-md hover:bg-teal-50 text-teal-600" title="Verify">
                          <Check size={15} />
                        </button>
                      )}
                      {c.status === 'Verified' && (
                        <button onClick={() => { setSelectedCaseId(c.id); navigate('qr-display', c.id); }} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600" title="Get QR">
                          <QrCode size={15} />
                        </button>
                      )}
                      <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No cases found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="font-bold text-lg" style={{ color: '#0B2342' }}>Delete Case?</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The case <strong>{deleteConfirm}</strong> will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== CREATE CASE ====================
function CreateCasePage({ navigate, setSelectedCaseId, refreshCases }: {
  navigate: (page: PageView, id?: string) => void;
  setSelectedCaseId: (id: string | null) => void;
  refreshCases: () => void;
}) {
  const [formData, setFormData] = useState<Partial<EmergencyCase>>({
    id: generateCaseId(),
    patientLabel: '',
    age: '',
    sex: 'Unknown',
    category: 'Other',
    location: '',
    chiefComplaint: '',
    reportedSymptoms: '',
    symptomOnset: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    vitals: { bp: '', hr: '', rr: '', spo2: '', temp: '', gcs: '' },
    interventionsPerformed: '',
    interventionTime: '',
    additionalNotes: '',
    originalTranscript: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateVital = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, vitals: { ...prev.vitals!, [key]: value } }));
  };

  const handleSave = (asDraft: boolean) => {
    const now = new Date().toISOString();
    const newCase: EmergencyCase = {
      id: formData.id || generateCaseId(),
      accessToken: generateAccessToken(),
      createdAt: now,
      updatedAt: now,
      status: asDraft ? 'Draft' : 'Awaiting Verification',
      patientLabel: formData.patientLabel || 'Unknown',
      age: formData.age || 'Unknown',
      sex: formData.sex || 'Unknown',
      category: formData.category || 'Other',
      location: formData.location || '',
      chiefComplaint: formData.chiefComplaint || '',
      reportedSymptoms: formData.reportedSymptoms || '',
      symptomOnset: formData.symptomOnset || '',
      medicalHistory: formData.medicalHistory || '',
      allergies: formData.allergies || 'Unknown / Unconfirmed',
      currentMedications: formData.currentMedications || 'Unknown / Unconfirmed',
      vitals: formData.vitals || { bp: '', hr: '', rr: '', spo2: '', temp: '', gcs: '' },
      interventionsPerformed: formData.interventionsPerformed || '',
      interventionTime: formData.interventionTime || '',
      additionalNotes: formData.additionalNotes || '',
      originalTranscript: formData.originalTranscript || '',
    };

    addCase(newCase);
    refreshCases();
    setSelectedCaseId(newCase.id);

    if (asDraft) {
      navigate('dashboard');
    } else {
      navigate('scribe', newCase.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('dashboard')} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0B2342' }}>Create Emergency Case</h1>
          <p className="text-sm text-slate-500">Case ID: <span className="font-mono font-semibold" style={{ color: '#12365B' }}>{formData.id}</span></p>
        </div>
      </div>

      {/* Section 1: Demographics */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#0B2342' }}>
          <User size={18} style={{ color: '#20B6A0' }} /> Demographics & Triage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Patient Label" value={formData.patientLabel} onChange={v => updateField('patientLabel', v)} placeholder='e.g., "Unknown Male" or "John Doe"' />
          <InputField label="Age" value={formData.age} onChange={v => updateField('age', v)} placeholder="e.g., 45" />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Sex</label>
            <select value={formData.sex} onChange={e => updateField('sex', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
              <option value="Unknown">Unknown</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Triage Category</label>
            <select value={formData.category} onChange={e => updateField('category', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
              <option value="Trauma">Trauma</option>
              <option value="Cardiac">Cardiac</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Neurological">Neurological</option>
              <option value="Overdose">Overdose</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <InputField label="Location" value={formData.location || ''} onChange={v => updateField('location', v)} placeholder="e.g., NH-48, Near Cyber City" />
          </div>
        </div>
      </div>

      {/* Section 2: Clinical Profile */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#0B2342' }}>
          <Stethoscope size={18} style={{ color: '#20B6A0' }} /> Clinical Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <InputField label="Chief Complaint" value={formData.chiefComplaint} onChange={v => updateField('chiefComplaint', v)} placeholder="Primary presenting complaint..." />
          </div>
          <div className="sm:col-span-2">
            <InputField label="Reported Symptoms" value={formData.reportedSymptoms} onChange={v => updateField('reportedSymptoms', v)} placeholder="List all reported symptoms..." />
          </div>
          <InputField label="Symptom Onset" value={formData.symptomOnset} onChange={v => updateField('symptomOnset', v)} placeholder='e.g., "45 minutes ago"' />
          <InputField label="Medical History" value={formData.medicalHistory} onChange={v => updateField('medicalHistory', v)} placeholder="Known conditions..." />
          <InputField label="Allergies" value={formData.allergies} onChange={v => updateField('allergies', v)} placeholder="Blank = Unknown / Unconfirmed" />
          <InputField label="Current Medications" value={formData.currentMedications} onChange={v => updateField('currentMedications', v)} placeholder="Blank = Unknown / Unconfirmed" />
        </div>
      </div>

      {/* Section 3: Vital Signs */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#0B2342' }}>
          <Activity size={18} style={{ color: '#20B6A0' }} /> Vital Signs
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InputField label="BP (mmHg)" value={formData.vitals?.bp || ''} onChange={v => updateVital('bp', v)} placeholder="120/80" />
          <InputField label="HR (bpm)" value={formData.vitals?.hr || ''} onChange={v => updateVital('hr', v)} placeholder="72" />
          <InputField label="RR (bpm)" value={formData.vitals?.rr || ''} onChange={v => updateVital('rr', v)} placeholder="16" />
          <InputField label="SpO2 (%)" value={formData.vitals?.spo2 || ''} onChange={v => updateVital('spo2', v)} placeholder="98" />
          <InputField label="Temp (°F)" value={formData.vitals?.temp || ''} onChange={v => updateVital('temp', v)} placeholder="98.6°F" />
          <InputField label="GCS (3-15)" value={formData.vitals?.gcs || ''} onChange={v => updateVital('gcs', v)} placeholder="15" />
        </div>
      </div>

      {/* Section 4: Interventions */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#0B2342' }}>
          <Zap size={18} style={{ color: '#20B6A0' }} /> Interventions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <InputField label="Interventions Performed" value={formData.interventionsPerformed} onChange={v => updateField('interventionsPerformed', v)} placeholder="Procedures and medications administered..." />
          </div>
          <InputField label="Intervention Time" value={formData.interventionTime || ''} onChange={v => updateField('interventionTime', v)} placeholder="e.g., 14:35" />
          <InputField label="Additional Notes" value={formData.additionalNotes || ''} onChange={v => updateField('additionalNotes', v)} placeholder="Any additional observations..." />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button onClick={() => handleSave(true)} className="px-6 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
          <Save size={18} /> Save as Draft
        </button>
        <button onClick={() => handleSave(false)} className="px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-105" style={{ backgroundColor: '#20B6A0' }}>
          <Send size={18} /> Proceed to AI Scribe
        </button>
      </div>
    </div>
  );
}

// ==================== SCRIBE PAGE ====================
function ScribePage({ caseData, navigate, refreshCases }: {
  caseData: EmergencyCase;
  navigate: (page: PageView, id?: string) => void;
  refreshCases: () => void;
}) {
  const [transcript, setTranscript] = useState(caseData.originalTranscript || '');
  const [isRecording, setIsRecording] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(caseData.aiGeneratedDraft || '');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock dictation simulation
  const startMockDictation = () => {
    setIsRecording(true);
    const mockPhrases = [
      "Patient is a ",
      "middle-aged individual presenting with ",
      "acute symptoms. ",
      "Vital signs show blood pressure at ",
      "elevated levels. Heart rate is ",
      "tachycardic. Oxygen saturation is ",
      "within acceptable range. ",
      "Administered initial interventions. ",
      "Patient responsive to verbal stimuli. ",
      "Transporting to nearest facility."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < mockPhrases.length) {
        setTranscript(prev => prev + mockPhrases[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 600);
  };

  const handleGenerate = () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const result = deterministicAIEngine(transcript, caseData);
      setGeneratedDraft(result.aiGeneratedDraft || '');
      updateCase(caseData.id, {
        originalTranscript: transcript,
        aiGeneratedDraft: result.aiGeneratedDraft,
        status: 'Awaiting Verification'
      });
      refreshCases();
      setIsProcessing(false);
    }, 1500);
  };

  const handleProceed = () => {
    updateCase(caseData.id, {
      originalTranscript: transcript,
      aiGeneratedDraft: generatedDraft,
      status: 'Awaiting Verification'
    });
    refreshCases();
    navigate('verification', caseData.id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('dashboard')} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0B2342' }}>AI Scribe Engine</h1>
          <p className="text-sm text-slate-500">Case: <span className="font-mono font-semibold" style={{ color: '#12365B' }}>{caseData.id}</span></p>
        </div>
      </div>

      {/* Voice Input */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#0B2342' }}>
          <Mic size={18} style={{ color: '#20B6A0' }} /> Voice Capture / Manual Entry
        </h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={startMockDictation}
            disabled={isRecording}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              isRecording ? 'bg-red-100 text-red-700' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            {isRecording ? <><MicOff size={16} /> Recording...</> : <><Mic size={16} /> Start Dictation</>}
          </button>
          <span className="text-xs text-slate-400 self-center">Web Speech API (Mock in Demo Mode)</span>
        </div>

        <textarea
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder="Paste crude ambulance radio notes or use voice dictation above..."
          className="w-full h-48 px-4 py-3 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
        />

        <div className="mt-4">
          <button
            onClick={handleGenerate}
            disabled={isProcessing || !transcript.trim()}
            className="px-5 py-2.5 rounded-lg font-semibold text-white flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{ backgroundColor: '#12365B' }}
          >
            {isProcessing ? (
              <><Activity size={16} className="animate-spin" /> Processing...</>
            ) : (
              <><Zap size={16} /> Generate Structured Note</>
            )}
          </button>
        </div>
      </div>

      {/* Generated Draft */}
      {generatedDraft && (
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#0B2342' }}>
            <FileText size={18} style={{ color: '#20B6A0' }} /> AI-Generated Structured Note
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700 font-medium">⚠️ This is an AI-generated draft. Human verification is required before clinical use.</p>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-96 overflow-y-auto">
            {generatedDraft}
          </pre>
        </div>
      )}

      {/* Proceed Button */}
      {generatedDraft && (
        <div className="flex justify-end">
          <button onClick={handleProceed} className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105" style={{ backgroundColor: '#20B6A0' }}>
            Proceed to Verification <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== VERIFICATION PAGE ====================
function VerificationPage({ caseData, navigate, refreshCases }: {
  caseData: EmergencyCase;
  navigate: (page: PageView, id?: string) => void;
  refreshCases: () => void;
}) {
  const [editDraft, setEditDraft] = useState(caseData.aiGeneratedDraft || '');
  const [verifiedBy, setVerifiedBy] = useState(caseData.verifiedBy || '');
  const [checkVitals, setCheckVitals] = useState(false);
  const [checkAllergies, setCheckAllergies] = useState(false);
  const [checkInterventions, setCheckInterventions] = useState(false);
  const [isVerified, setIsVerified] = useState(caseData.status === 'Verified');
  const [hasEdited, setHasEdited] = useState(false);

  const handleEdit = (value: string) => {
    setEditDraft(value);
    if (caseData.status === 'Verified') {
      setHasEdited(true);
    }
  };

  const handleVerify = () => {
    if (!checkVitals || !checkAllergies || !checkInterventions) return;

    const now = new Date().toISOString();
    const handoverSummary = generateHandoverSummary(caseData);

    updateCase(caseData.id, {
      status: 'Verified',
      verificationTimestamp: now,
      verifiedBy: verifiedBy || 'Paramedic',
      aiGeneratedDraft: editDraft,
      verifiedHandoverSummary: handoverSummary,
    });
    refreshCases();
    setIsVerified(true);
    setHasEdited(false);
  };

  const handleDowngrade = () => {
    updateCase(caseData.id, {
      status: 'Draft',
      verificationTimestamp: undefined,
      verifiedBy: undefined,
    });
    refreshCases();
    setIsVerified(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('dashboard')} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: '#0B2342' }}>Clinical Verification</h1>
          <p className="text-sm text-slate-500">Case: <span className="font-mono font-semibold" style={{ color: '#12365B' }}>{caseData.id}</span></p>
        </div>
        <StatusBadge status={caseData.status} />
      </div>

      {hasEdited && caseData.status === 'Verified' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Safety Overturn Protection</p>
            <p className="text-xs text-red-600 mt-1">You have modified a verified case. The status will be downgraded to 'Draft' and the QR code invalidated.</p>
            <button onClick={handleDowngrade} className="mt-2 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700">
              Confirm Downgrade to Draft
            </button>
          </div>
        </div>
      )}

      {/* Dual Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane - Original */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-sm uppercase tracking-wide text-slate-500 mb-4">Original Transcript & Form Data</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-slate-700">Patient:</p>
              <p className="text-slate-600">{caseData.patientLabel}, {caseData.age}y, {caseData.sex}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Chief Complaint:</p>
              <p className="text-slate-600">{caseData.chiefComplaint || <em className="text-slate-400">Unknown / Unconfirmed</em>}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Vitals:</p>
              <p className="text-slate-600 font-mono text-xs">BP {caseData.vitals.bp || '---'} | HR {caseData.vitals.hr || '---'} | RR {caseData.vitals.rr || '---'} | SpO2 {caseData.vitals.spo2 || '---'}% | GCS {caseData.vitals.gcs || '---'}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Allergies:</p>
              <p className="text-slate-600">{caseData.allergies || <em className="text-slate-400">Unknown / Unconfirmed</em>}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Interventions:</p>
              <p className="text-slate-600">{caseData.interventionsPerformed || <em className="text-slate-400">Unknown / Unconfirmed</em>}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Transcript:</p>
              <p className="text-slate-600 bg-slate-50 rounded-lg p-3 font-mono text-xs">{caseData.originalTranscript || <em className="text-slate-400">No transcript available</em>}</p>
            </div>
          </div>
        </div>

        {/* Right Pane - Editable AI Draft */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-sm uppercase tracking-wide text-slate-500 mb-4">AI-Generated Note (Editable)</h2>
          <textarea
            value={editDraft}
            onChange={e => handleEdit(e.target.value)}
            disabled={isVerified && !hasEdited}
            className="w-full h-80 px-4 py-3 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>
      </div>

      {/* Verification Checkboxes */}
      {!isVerified && (
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-lg mb-4" style={{ color: '#0B2342' }}>Safety Verification Checklist</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={checkVitals} onChange={e => setCheckVitals(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-sm text-slate-700">I confirm vital signs are accurate</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={checkAllergies} onChange={e => setCheckAllergies(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-sm text-slate-700">I confirm allergy status has been assessed</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={checkInterventions} onChange={e => setCheckInterventions(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-sm text-slate-700">I confirm all interventions are documented</span>
            </label>
          </div>
          <div className="mt-4">
            <InputField label="Verified By (Name/ID)" value={verifiedBy} onChange={(v) => setVerifiedBy(v)} placeholder="e.g., Paramedic Singh" />
          </div>
          <button
            onClick={handleVerify}
            disabled={!checkVitals || !checkAllergies || !checkInterventions}
            className="mt-4 px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{ backgroundColor: '#20B6A0' }}
          >
            <Shield size={18} /> Verify and Authorize QR Generation
          </button>
        </div>
      )}

      {/* Post-Verification Actions */}
      {isVerified && !hasEdited && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Check size={24} className="text-green-600" />
            <div>
              <p className="font-bold text-green-800">Case Verified</p>
              <p className="text-xs text-green-600">Verified by {caseData.verifiedBy || 'Paramedic'} at {caseData.verificationTimestamp ? new Date(caseData.verificationTimestamp).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
          <button onClick={() => navigate('qr-display', caseData.id)} className="px-5 py-2.5 rounded-lg font-semibold text-white flex items-center gap-2 transition-all hover:scale-105" style={{ backgroundColor: '#12365B' }}>
            <QrCode size={16} /> Generate QR Passport
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== QR DISPLAY PAGE ====================
function QRDisplayPage({ caseData, navigate }: {
  caseData: EmergencyCase;
  navigate: (page: PageView, id?: string) => void;
}) {
  const [qrUrl, setQrUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}#doctor-view/${caseData.accessToken}`;
    setQrUrl(url);

    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#0B2342', light: '#FFFFFF' }
    }).then(setQrDataUrl).catch(console.error);
  }, [caseData.accessToken]);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `Aarogya-QR-${caseData.id}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>QR Passport - ${caseData.id}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <h2>AAROGYA EMERGENCY QR PASSPORT</h2>
          <p>Case: ${caseData.id} | Patient: ${caseData.patientLabel}</p>
          <img src="${qrDataUrl}" style="width:300px;height:300px;margin:20px;" />
          <p>Scan for clinical handover data</p>
          <p style="font-size:10px;color:#666;">Generated: ${new Date().toLocaleString()}</p>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('dashboard')} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0B2342' }}>QR Passport Hub</h1>
          <p className="text-sm text-slate-500">Case: <span className="font-mono font-semibold" style={{ color: '#12365B' }}>{caseData.id}</span></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
        <div className="mb-6">
          <h2 className="font-bold text-lg" style={{ color: '#0B2342' }}>{caseData.patientLabel}</h2>
          <p className="text-sm text-slate-500">{caseData.category} | {caseData.age}y / {caseData.sex}</p>
          <StatusBadge status={caseData.status} />
        </div>

        {qrDataUrl ? (
          <div className="inline-block p-4 bg-white rounded-xl border-2 border-slate-200 mb-6">
            <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 mx-auto" />
          </div>
        ) : (
          <div className="w-64 h-64 mx-auto bg-slate-100 rounded-xl flex items-center justify-center mb-6">
            <Activity size={32} className="animate-spin text-slate-400" />
          </div>
        )}

        <p className="text-xs text-slate-400 font-mono break-all mb-6 max-w-md mx-auto">{qrUrl}</p>

        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={handleCopy} className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
            <Copy size={16} /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={handleDownload} className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
            <Download size={16} /> Download PNG
          </button>
          <button onClick={handlePrint} className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
            <Printer size={16} /> Print Pass
          </button>
          <button onClick={() => navigate('doctor-view', caseData.accessToken)} className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 text-white transition-all hover:scale-105" style={{ backgroundColor: '#20B6A0' }}>
            <Smartphone size={16} /> Open Doctor View
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== DOCTOR VIEW ====================
function DoctorViewPage({ caseData, navigate }: {
  caseData: EmergencyCase | null | undefined;
  navigate: (page: PageView) => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!caseData) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#0B2342' }}>No Case Data Found</h2>
          <p className="text-sm text-slate-500 mb-6">This QR code may be invalid or the case data is not available.</p>
          <button onClick={() => navigate('landing')} className="px-5 py-2.5 rounded-lg text-white font-medium" style={{ backgroundColor: '#12365B' }}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const handleCopySummary = () => {
    const summary = caseData.verifiedHandoverSummary || `${caseData.patientLabel}, ${caseData.age}y ${caseData.sex}, ${caseData.category}: ${caseData.chiefComplaint}. BP ${caseData.vitals.bp}, HR ${caseData.vitals.hr}, SpO2 ${caseData.vitals.spo2}%. Allergies: ${caseData.allergies || 'Unknown'}. Interventions: ${caseData.interventionsPerformed || 'None documented'}.`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const displayValue = (val: string | undefined) => val && val.trim() ? val : null;

  return (
    <div className="max-w-lg mx-auto space-y-4 print:space-y-2">
      {/* Header */}
      <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #12365B 0%, #0B2342 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart size={20} />
            <span className="font-bold text-sm">AAROGYA SCRIBE</span>
          </div>
          <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30">
            ✓ VERIFIED
          </span>
        </div>
        <h1 className="text-xl font-bold">{caseData.id}</h1>
        <p className="text-sm text-white/70 mt-1">
          {caseData.verificationTimestamp ? new Date(caseData.verificationTimestamp).toLocaleString() : new Date(caseData.createdAt).toLocaleString()}
        </p>
        <p className="text-xs text-teal-300 mt-1">Verified by: {caseData.verifiedBy || 'Paramedic'}</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Patient Demographics</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-500 text-xs">Name:</span><p className="font-semibold">{caseData.patientLabel}</p></div>
          <div><span className="text-slate-500 text-xs">Age/Sex:</span><p className="font-semibold">{caseData.age}y / {caseData.sex}</p></div>
          <div><span className="text-slate-500 text-xs">Category:</span><p className="font-semibold">{caseData.category}</p></div>
          <div><span className="text-slate-500 text-xs">Location:</span><p className="font-semibold">{displayValue(caseData.location) || <em className="text-slate-400 italic">Unknown / Unconfirmed</em>}</p></div>
        </div>
      </div>

      {/* Clinical */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Clinical Profile</h3>
        <div className="space-y-3 text-sm">
          <div><span className="text-slate-500 text-xs">Chief Complaint:</span><p>{displayValue(caseData.chiefComplaint) || <em className="text-slate-400 italic">Unknown / Unconfirmed</em>}</p></div>
          <div><span className="text-slate-500 text-xs">Symptoms:</span><p>{displayValue(caseData.reportedSymptoms) || <em className="text-slate-400 italic">Unknown / Unconfirmed</em>}</p></div>
          <div><span className="text-slate-500 text-xs">Onset:</span><p>{displayValue(caseData.symptomOnset) || <em className="text-slate-400 italic">Unknown / Unconfirmed</em>}</p></div>
          <div><span className="text-slate-500 text-xs">Medical History:</span><p>{displayValue(caseData.medicalHistory) || <em className="text-slate-400 italic">Unknown / Unconfirmed</em>}</p></div>
          <div><span className="text-slate-500 text-xs">Medications:</span><p>{displayValue(caseData.currentMedications) || <em className="text-slate-400 italic">Unknown / Unconfirmed</em>}</p></div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <span className="text-red-700 text-xs font-bold">ALLERGIES:</span>
            <p className="text-red-800 font-semibold">{displayValue(caseData.allergies) || <em className="text-slate-400 italic">Unknown / Unconfirmed</em>}</p>
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Vital Signs</h3>
        <div className="grid grid-cols-3 gap-2">
          <VitalCard label="BP" value={caseData.vitals.bp} unit="mmHg" />
          <VitalCard label="HR" value={caseData.vitals.hr} unit="bpm" />
          <VitalCard label="RR" value={caseData.vitals.rr} unit="bpm" />
          <VitalCard label="SpO2" value={caseData.vitals.spo2} unit="%" />
          <VitalCard label="Temp" value={caseData.vitals.temp} unit="" />
          <VitalCard label="GCS" value={caseData.vitals.gcs} unit="/15" />
        </div>
      </div>

      {/* Interventions */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Interventions</h3>
        <p className="text-sm">{displayValue(caseData.interventionsPerformed) || <em className="text-slate-400 italic">Unknown / Unconfirmed</em>}</p>
        {caseData.interventionTime && <p className="text-xs text-slate-500 mt-1">Time: {caseData.interventionTime}</p>}
        {caseData.additionalNotes && <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-2">{caseData.additionalNotes}</p>}
      </div>

      {/* Handover Summary */}
      {caseData.verifiedHandoverSummary && (
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">One-Sentence Handover</h3>
          <p className="text-sm font-medium text-slate-800 bg-teal-50 border border-teal-200 rounded-lg p-3">{caseData.verifiedHandoverSummary}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <button onClick={handleCopySummary} className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200">
          <Copy size={16} /> {copied ? 'Copied!' : 'Copy Summary'}
        </button>
        <button onClick={handlePrintPDF} className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 text-white" style={{ backgroundColor: '#12365B' }}>
          <Printer size={16} /> Print / PDF
        </button>
      </div>
    </div>
  );
}

// ==================== ROADMAP PAGE ====================
function RoadmapPage() {
  const phases = [
    {
      title: 'Phase 1: Current Hackathon State',
      status: 'active',
      items: [
        'Client-side localStorage persistence with demo mode',
        'Deterministic keyword-based AI structuring engine',
        'QR code generation with access token security',
        'Mobile-first doctor emergency view',
        'Voice input simulation (Web Speech API ready)',
        'Human-in-the-loop verification workflow',
      ]
    },
    {
      title: 'Phase 2: Validation & Integration',
      status: 'upcoming',
      items: [
        'Supabase backend for multi-device sync',
        'OpenAI GPT-4 integration for clinical NLP',
        'Real Web Speech API with medical vocabulary model',
        'HIPAA-compliant data encryption at rest',
        'Multi-paramedic concurrent access',
        'Hospital ERP integration APIs (ADT feeds)',
      ]
    },
    {
      title: 'Phase 3: Offline Edge & Synchronization',
      status: 'future',
      items: [
        'Service Worker for full offline ambulance operation',
        'Conflict-free Replicated Data Types (CRDTs)',
        'Mesh networking for disaster scenarios',
        'Edge AI inference (ONNX Runtime Web)',
        'Automatic sync when connectivity restored',
        'Satellite communication fallback protocol',
      ]
    },
    {
      title: 'Phase 4: ABDM/ABHA Ecosystem',
      status: 'future',
      items: [
        'Ayushman Bharat Digital Mission integration',
        'ABHA ID lookup for patient identification',
        'Health Information Provider (HIP) registration',
        'HL7 FHIR R4 compliance for interoperability',
        'National Health Stack API integration',
        'Multi-language support (Hindi, regional)',
      ]
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#0B2342' }}>Innovation Roadmap</h1>
        <p className="text-sm text-slate-500 mt-2">Engineering trajectory of Aarogya Scribe</p>
        <p className="text-xs text-slate-400 mt-1">Team HealthNova | K.R. Mangalam University (KRMU), SMAS</p>
      </div>

      <div className="space-y-6">
        {phases.map((phase, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                phase.status === 'active' ? 'bg-teal-500' : phase.status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-400'
              }`}>
                {i + 1}
              </div>
              <h2 className="font-bold text-lg" style={{ color: '#0B2342' }}>{phase.title}</h2>
              <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                phase.status === 'active' ? 'bg-teal-100 text-teal-700' : phase.status === 'upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {phase.status === 'active' ? '● Current' : phase.status === 'upcoming' ? '○ Next' : '○ Future'}
              </span>
            </div>
            <ul className="space-y-2">
              {phase.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                  <ChevronRight size={14} className="mt-1 text-slate-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Hackathon Disclosure */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-lg mb-3" style={{ color: '#0B2342' }}>Hackathon Project Disclosure</h2>
        <div className="text-sm text-slate-600 space-y-2">
          <p><strong>Project:</strong> AAROGYA EMERGENCY QR Scribe</p>
          <p><strong>Slogan:</strong> "Scan to Save — Voice-First Emergency Handover"</p>
          <p><strong>Team:</strong> HealthNova</p>
          <p><strong>Institution:</strong> K.R. Mangalam University (KRMU), School of Medical and Allied Sciences (SMAS)</p>
          <p><strong>Stack:</strong> React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, QRCode.js</p>
          <p><strong>Architecture:</strong> Client-side first with resilient localStorage fallback. Production-ready toggle for Supabase + OpenAI integration.</p>
          <p><strong>Key Innovation:</strong> Deterministic AI engine that works fully offline, with safety-first verification workflow preventing unauthorized clinical data transmission.</p>
        </div>
      </div>
    </div>
  );
}

// ==================== SHARED COMPONENTS ====================
function InputField({ label, value, onChange, placeholder }: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || `Blank = Unknown / Unconfirmed`}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-300"
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Draft': 'bg-amber-100 text-amber-700 border-amber-200',
    'Awaiting Verification': 'bg-orange-100 text-orange-700 border-orange-200',
    'Verified': 'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

function VitalCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-bold text-sm" style={{ color: '#0B2342' }}>
        {value || <span className="text-slate-300">--</span>}
      </p>
      {unit && <p className="text-xs text-slate-400">{unit}</p>}
    </div>
  );
}

function generateHandoverSummary(c: EmergencyCase): string {
  const parts: string[] = [];
  parts.push(`${c.patientLabel}, ${c.age}y ${c.sex}`);
  parts.push(`${c.category.toLowerCase()} emergency`);
  if (c.chiefComplaint) parts.push(c.chiefComplaint.split('.')[0]);
  if (c.vitals.bp) parts.push(`BP ${c.vitals.bp}`);
  if (c.vitals.hr) parts.push(`HR ${c.vitals.hr}`);
  if (c.vitals.spo2) parts.push(`SpO2 ${c.vitals.spo2}%`);
  if (c.allergies && c.allergies !== 'Unknown / Unconfirmed') parts.push(`Allergies: ${c.allergies}`);
  else parts.push('Allergies unknown');
  if (c.interventionsPerformed) parts.push(`Interventions: ${c.interventionsPerformed.split(',')[0]}`);
  return parts.join('. ') + '.';
}
