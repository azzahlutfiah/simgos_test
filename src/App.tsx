import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleAuthProvider } from './lib/firebase.ts';
import { Pasien, StatsResponse } from './types.ts';
import { 
  Plus, 
  Search, 
  LogOut, 
  UserCheck, 
  FileSpreadsheet, 
  Users, 
  Activity, 
  PieChart as PieIcon, 
  Baby, 
  Calendar, 
  MapPin, 
  Phone, 
  UserRound, 
  Trash2, 
  Edit, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RefreshCw,
  Clock,
  BriefcaseMedical,
  Sparkles,
  Database,
  Terminal,
  Play,
  BookOpen,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'daftar' | 'analitik' | 'mysql'>('daftar');

  // MySQL simulation console states
  const [mysqlQuery, setMysqlQuery] = useState('SELECT * FROM pasien ORDER BY id_pasien ASC LIMIT 10;');
  const [mysqlResult, setMysqlResult] = useState<{ columns: string[], rows: any[], rowCount?: number | null } | null>(null);
  const [mysqlError, setMysqlError] = useState<string | null>(null);
  const [mysqlLoading, setMysqlLoading] = useState(false);
  const [mysqlSuccessMsg, setMysqlSuccessMsg] = useState<string | null>(null);

  // Pacient & Stats states
  const [patients, setPatients] = useState<Pasien[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  // Mutation modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Pasien | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Pasien | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    noRm: '',
    nik: '',
    namaPasien: '',
    jenisKelamin: 'L' as 'L' | 'P',
    tanggalLahir: '',
    alamat: '',
    noHp: ''
  });
  const [formError, setFormError] = useState('');
  const [mutationLoading, setMutationLoading] = useState(false);

  // Trace user session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Sync user in postgres
        try {
          const idToken = await currentUser.getIdToken();
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            }
          });
        } catch (err) {
          console.error("Auth sync failed", err);
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch data with reset to page 1 on filter changes
  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user, searchQuery, genderFilter, offset]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, patients]); // Fetch fresh stats when patients list updates

  const getAuthHeaders = async () => {
    if (!auth.currentUser) return {};
    const idToken = await auth.currentUser.getIdToken();
    return {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    };
  };

  const runMysqlQuery = async (queryToRun?: string) => {
    const q = (queryToRun || mysqlQuery).trim();
    if (!q) return;
    setMysqlLoading(true);
    setMysqlError(null);
    setMysqlSuccessMsg(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/mysql/query', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal mengeksekusi query.');
      }
      setMysqlResult({
        columns: data.columns || [],
        rows: data.rows || [],
        rowCount: data.rowCount
      });
      if (data.rowCount !== null && data.rowCount !== undefined) {
        setMysqlSuccessMsg(`Query OK! ${data.rowCount} baris data berhasil diperbarui.`);
        // Refresh patients & stats if UPDATE, INSERT, or DELETE was done
        fetchPatients();
        fetchStats();
      } else {
        setMysqlSuccessMsg(`Query berhasil! Menampilkan ${data.rows.length} baris data.`);
      }
    } catch (err: any) {
      console.error(err);
      setMysqlError(err.message || 'Terjadi kesalahan saat memproses query SQL.');
      setMysqlResult(null);
    } finally {
      setMysqlLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoadingData(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/pasien?search=${encodeURIComponent(searchQuery)}&gender=${genderFilter}&limit=${limit}&offset=${offset}`, {
        headers
      });
      const result = await res.json();
      if (res.ok) {
        setPatients(result.data || []);
        setTotalPatients(result.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error loading patients', err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/pasien/stats', { headers });
      const result = await res.json();
      if (res.ok) {
        setStats(result);
      }
    } catch (err) {
      console.error('Error loading statistics', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Google Sign In Error', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out Error', err);
    }
  };

  const handleOpenAddModal = () => {
    // Generate randomized default values to make it clinician-friendly to quickly add records
    const seedNum = Math.floor(100000 + Math.random() * 900000);
    const randNIK = `3171${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setFormData({
      noRm: `RM-${seedNum}`,
      nik: randNIK,
      namaPasien: '',
      jenisKelamin: 'L',
      tanggalLahir: '1995-06-15',
      alamat: 'Jl. ',
      noHp: '08' + Math.floor(1000000000 + Math.random() * 9000000000)
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (p: Pasien) => {
    setPatientToEdit(p);
    setFormData({
      noRm: p.noRm,
      nik: p.nik,
      namaPasien: p.namaPasien,
      jenisKelamin: p.jenisKelamin,
      tanggalLahir: p.tanggalLahir,
      alamat: p.alamat,
      noHp: p.noHp
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (p: Pasien) => {
    setPatientToDelete(p);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    setFormError('');

    // NIK validation (16 digits)
    if (!/^\d{16}$/.test(formData.nik)) {
      setFormError('Nomor Induk Kependudukan (NIK) harus berisi tepat 16 digit angka!');
      return;
    }

    if (!formData.namaPasien.trim()) {
      setFormError('Nama lengkap pasien wajib diisi!');
      return;
    }

    if (!formData.alamat.trim()) {
      setFormError('Alamat lengkap pasien wajib diisi!');
      return;
    }

    setMutationLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/pasien', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchPatients();
      } else {
        const errResult = await res.json();
        setFormError(errResult.error || 'Gagal menyimpan data pasien.');
      }
    } catch (err) {
      setFormError('Koneksi terganggu. Gagal menghubungi server.');
    } finally {
      setMutationLoading(false);
    }
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    if (!patientToEdit) return;
    setFormError('');

    if (!/^\d{16}$/.test(formData.nik)) {
      setFormError('NIK harus berisi tepat 16 digit angka!');
      return;
    }

    setMutationLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/pasien/${patientToEdit.idPasien}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchPatients();
      } else {
        const errResult = await res.json();
        setFormError(errResult.error || 'Gagal mengubah data pasien.');
      }
    } catch (err) {
      setFormError('Koneksi terganggu. Gagal mengubah data.');
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!patientToDelete) return;
    setMutationLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/pasien/${patientToDelete.idPasien}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setShowDeleteModal(false);
        fetchPatients();
      }
    } catch (err) {
      console.error('Gagal menghapus', err);
    } finally {
      setMutationLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && offset + limit < totalPatients) {
      setOffset(offset + limit);
    } else if (direction === 'prev' && offset - limit >= 0) {
      setOffset(offset - limit);
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <Activity className="absolute text-emerald-600 animate-pulse" size={24} />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse font-display">
          Memuat Sistem SIM GOS...
        </p>
      </div>
    );
  }

  // Login View
  if (!user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-tr from-slate-100 via-slate-50 to-blue-50/50 items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 relative overflow-hidden transition-all duration-3 hover:translate-y-[-2px]">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -ml-16 -mb-16 opacity-60"></div>

          <div className="relative text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-lg mx-auto mb-6 transform hover:scale-105 duration-300">
              <Sparkles size={32} className="animate-pulse" />
            </div>

            <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">
              SIM GOS
            </h1>
            <p className="text-md font-semibold text-sky-600 tracking-wider uppercase mt-1">
              Sistem Informasi Manajemen Rumah Sakit
            </p>
            <p className="text-sm text-slate-500 mt-3 px-4 max-w-sm mx-auto leading-relaxed">
              Portal data pasien rumah sakit modern dengan verifikasi aman, analitik real-time, dan manajemen rekam medis.
            </p>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <button
                id="btn-login-google"
                onClick={handleLogin}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-semibold shadow-md active:scale-[0.98] border border-slate-900 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 duration-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Masuk dengan Akun Google
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <span className="text-xs text-slate-400 font-mono tracking-wide">
              Protected by Google Firebase Secure OAuth
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in complete Clinicians view
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5F9] text-[#1E293B] font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-[240px] bg-[#0F172A] text-[#CBD5E1] hidden md:flex flex-col border-r border-[#1E293B] shrink-0 h-full">
        <div className="p-6 border-b border-[#1E293B] flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-[#3B82F6] rounded-md flex items-center justify-center text-white font-bold">
            S
          </div>
          <div className="font-bold text-[18px] text-white">SIMGOS TEST</div>
        </div>

        <nav className="py-4 flex-grow space-y-0.5 overflow-y-auto shrink-0">
          {/* Active Tab: Daftar Pasien */}
          <button
            onClick={() => { setActiveTab('daftar'); setOffset(0); }}
            className={`w-full px-6 py-3 flex items-center gap-3 text-[14px] font-medium transition-colors border-l-4 cursor-pointer text-left ${
              activeTab === 'daftar'
                ? 'bg-[#1E293B] text-white border-l-[#3B82F6]'
                : 'text-slate-400 hover:bg-[#1E293B]/50 hover:text-white border-l-transparent'
            }`}
          >
            <Users size={16} />
            Database Pasien
          </button>

          {/* Active Tab: Analitik */}
          <button
            onClick={() => setActiveTab('analitik')}
            className={`w-full px-6 py-3 flex items-center gap-3 text-[14px] font-medium transition-colors border-l-4 cursor-pointer text-left ${
              activeTab === 'analitik'
                ? 'bg-[#1E293B] text-white border-l-[#3B82F6]'
                : 'text-[#CBD5E1]/70 hover:bg-[#1E293B]/50 hover:text-white border-l-transparent'
            }`}
          >
            <Activity size={16} />
            Analitik & Laporan
          </button>

          {/* Active Tab: MySQL Console Sandbox */}
          <button
            onClick={() => { setActiveTab('mysql'); runMysqlQuery('SELECT * FROM pasien ORDER BY id_pasien ASC LIMIT 10;'); }}
            className={`w-full px-6 py-3 flex items-center gap-3 text-[14px] font-medium transition-colors border-l-4 cursor-pointer text-left ${
              activeTab === 'mysql'
                ? 'bg-[#1E293B] text-white border-l-[#3B82F6]'
                : 'text-[#CBD5E1]/70 hover:bg-[#1E293B]/50 hover:text-white border-l-transparent'
            }`}
          >
            <Terminal size={16} />
            Konsol & Sandbox MySQL
          </button>

          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-6 pt-6 pb-2">SI LAYANAN</div>
          <div className="px-6 py-3 flex items-center gap-3 text-sm text-slate-500 cursor-not-allowed">
            <Clock size={16} />
            <span>Jadwal Dokter</span>
          </div>
          <div className="px-6 py-3 flex items-center gap-3 text-sm text-slate-500 cursor-not-allowed">
            <BriefcaseMedical size={16} />
            <span>Rawat Jalan</span>
          </div>
          <div className="px-6 py-3 flex items-center gap-3 text-sm text-slate-500 cursor-not-allowed">
            <Users size={16} />
            <span>Rawat Inap</span>
          </div>
          <div className="px-6 py-3 flex items-center gap-3 text-sm text-slate-500 cursor-not-allowed">
            <Sparkles size={16} />
            <span>Apotek</span>
          </div>
        </nav>

        {/* User profile section at the bottom of the sidebar */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1322] shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs capitalize shrink-0">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <span className="font-bold text-xs text-white block truncate">{user.displayName || 'Clinician'}</span>
              <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
            </div>
          </div>
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-[#1e293b] hover:bg-rose-950/40 hover:text-rose-400 transition-colors rounded-lg text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800"
          >
            <LogOut size={13} />
            Keluar Portal
          </button>
        </div>

        <div className="p-6 border-t border-[#1E293B] text-[11px] font-medium text-slate-600 shrink-0">
          v1.0.4-stable
        </div>
      </aside>

      {/* Main Panel Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top header bar */}
        <header className="md:hidden bg-[#0F172A] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-400 rounded-md flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-bold text-sm tracking-wide">SIMGOS TEST</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1E293B] p-0.5 rounded-lg text-xs">
              <button
                onClick={() => { setActiveTab('daftar'); setOffset(0); }}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${activeTab === 'daftar' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                RM
              </button>
              <button
                onClick={() => setActiveTab('analitik')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${activeTab === 'analitik' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                Analisa
              </button>
              <button
                onClick={() => { setActiveTab('mysql'); runMysqlQuery('SELECT * FROM pasien ORDER BY id_pasien ASC LIMIT 10;'); }}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${activeTab === 'mysql' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                MySQL
              </button>
            </div>
            <button
              id="btn-logout-mobile"
              onClick={handleLogout}
              className="p-1.5 bg-[#1E293B] text-rose-400 rounded-lg"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Real Header (Matches Design HTML) */}
        <header className="h-[72px] md:h-20 bg-white border-b border-[#E2E8F0] px-6 md:px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[18px] font-bold text-[#1E293B] leading-none mb-1">
              {activeTab === 'daftar' ? 'Data Master Pasien' : activeTab === 'analitik' ? 'Analitik & Demografi Pasien' : 'Konsol & Sandbox MySQL'}
            </h1>
            <p className="text-[12px] text-[#64748B] leading-none">
              {activeTab === 'daftar' 
                ? 'Kelola informasi rekam medis pasien terintegrasi' 
                : activeTab === 'analitik'
                ? 'Analisis visual rasio gender dan rentang klasifikasi usia'
                : 'Eksekusi query SQL & DML fundamental langsung pada database simgos_test'}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {activeTab === 'daftar' && (
              <>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#64748B]" size={14} />
                  <input
                    type="text"
                    placeholder="Cari No. RM atau Nama..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setOffset(0); }}
                    className="pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-md text-[13px] w-56 md:w-64 focus:outline-hidden focus:ring-1 focus:ring-blue-500 placeholder:text-[#94A3B8]"
                  />
                </div>

                <select
                  value={genderFilter}
                  onChange={(e) => { setGenderFilter(e.target.value); setOffset(0); }}
                  className="px-3 py-2 border border-[#E2E8F0] bg-white rounded-md text-[13px] focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-700"
                >
                  <option value="">Semua Gender</option>
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>

                <button
                  onClick={handleOpenAddModal}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[13px] px-4 py-2 rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} />
                  + Pasien Baru
                </button>
              </>
            )}
          </div>
        </header>

        {/* Stats Grid Container (Matches Design HTML) */}
        <div className="grid grid-cols-3 gap-5 px-6 pt-6 md:px-8 shrink-0">
          <div className="bg-white p-4 md:p-5 rounded-lg border border-[#E2E8F0] shadow-xs">
            <div className="text-[12px] text-[#64748B] uppercase tracking-widest font-semibold">Total Pasien</div>
            <div className="text-2xl font-bold mt-1 text-[#0F172A]">
              {stats?.total ?? patients.length}
            </div>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-lg border border-[#E2E8F0] shadow-xs">
            <div className="text-[12px] text-[#64748B] uppercase tracking-widest font-semibold">Pasien Baru Hari Ini</div>
            <div className="text-2xl font-bold mt-1 text-[#0F172A]">12</div>
          </div>
          <div className="bg-[#FFFFFF] p-4 md:p-5 rounded-lg border border-[#E2E8F0] shadow-xs">
            <div className="text-[12px] text-[#64748B] uppercase tracking-widest font-semibold">Kapasitas Record</div>
            <div className="text-2xl font-bold mt-1 text-[#0F172A]">85%</div>
          </div>
        </div>

         {/* Interactive Workspace area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Tab 1: Patient List & Management */}
        {activeTab === 'daftar' && (
          <div className="space-y-6">
            {/* Filter and search parameters */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Box */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari pasien berdasarkan Nama, NIK, No RM, atau Alamat..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setOffset(0); }}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-800 rounded-xl border border-slate-200/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-hidden transition-all text-sm group"
                />
              </div>

              {/* Gender dropdown */}
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:inline">
                  Filter Gender:
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => { setGenderFilter(e.target.value); setOffset(0); }}
                  className="w-full md:w-44 px-3.5 py-3 bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-hidden transition-all text-sm"
                >
                  <option value="">Semua Gender</option>
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            {/* Patients Table Container */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-4 px-6 text-center w-16">ID</th>
                      <th className="py-4 px-5 w-28">No. RM</th>
                      <th className="py-4 px-5">NIK Pasien</th>
                      <th className="py-4 px-5">Nama Lengkap</th>
                      <th className="py-4 px-5 text-center w-24">Gender</th>
                      <th className="py-4 px-5">Tanggal Lahir</th>
                      <th className="py-4 px-5">No. Handphone</th>
                      <th className="py-4 px-5">Alamat Lengkap</th>
                      <th className="py-4 px-5 w-32">Registrasi</th>
                      <th className="py-4 px-6 text-center w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingData ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-10 h-10 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-sm font-medium animate-pulse">Menghubungi server, mengambil data pasien...</span>
                          </div>
                        </td>
                      </tr>
                    ) : patients.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                            <Users className="text-slate-300" size={48} />
                            <h3 className="text-md font-semibold text-slate-700 mt-2">Pasien Tidak Ditemukan</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              Tidak ada data pasien yang cocok dengan pencarian kata kunci atau filter gender Anda saat ini.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      patients.map((p) => (
                        <tr key={p.idPasien} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 px-6 text-center font-mono text-xs font-semibold text-slate-400">
                            {p.idPasien}
                          </td>
                          <td className="py-4 px-5 font-mono text-xs font-bold text-blue-700">
                            {p.noRm}
                          </td>
                          <td className="py-4 px-5 font-mono text-xs text-slate-600">
                            {p.nik}
                          </td>
                          <td className="py-4 px-5 font-semibold text-slate-800">
                            {p.namaPasien}
                          </td>
                          <td className="py-4 px-5 text-center">
                            {p.jenisKelamin === 'L' ? (
                              <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full gap-1">
                                Laki laki
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold text-pink-700 bg-pink-50 border border-pink-100 rounded-full gap-1">
                                Perempuan
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-sm text-slate-600">
                            {formatDate(p.tanggalLahir)}
                          </td>
                          <td className="py-4 px-5 text-sm font-medium text-slate-600">
                            {p.noHp}
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-500 max-w-[200px] truncate" title={p.alamat}>
                            {p.alamat}
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDateTime(p.tanggalDaftar)}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                                title="Ubah profil"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(p)}
                                className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                                title="Hapus pasien"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Custom styled Clinician Pagination Controller */}
              <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-500 font-medium">
                  Menampilkan <strong className="text-slate-800">{patients.length > 0 ? offset + 1 : 0}</strong> - {' '}
                  <strong className="text-slate-800">{Math.min(offset + limit, totalPatients)}</strong> dari total{' '}
                  <strong className="text-blue-700">{totalPatients}</strong> pasien terdaftar
                </span>

                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={offset === 0 || loadingData}
                    className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:text-slate-300 disabled:bg-slate-50 disabled:border-slate-100 rounded-xl transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-semibold px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl">
                    Halaman {Math.floor(offset / limit) + 1} / {Math.ceil(totalPatients / limit) || 1}
                  </span>
                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={offset + limit >= totalPatients || loadingData}
                    className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:text-slate-300 disabled:bg-slate-50 disabled:border-slate-100 rounded-xl transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dashboard Analytics & Performance */}
        {activeTab === 'analitik' && (
          <div className="space-y-8">
            {/* Core Stats Bento Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-2xl p-6 relative overflow-hidden flex items-center gap-5">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                  <Users size={32} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                    Total Pasien Terdaftar
                  </span>
                  <strong className="text-4xl font-extrabold tracking-tight text-slate-900 block mt-1">
                    {stats?.total ?? patients.length}
                  </strong>
                </div>
              </div>

              {/* Male ratio card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-2xl p-6 relative overflow-hidden flex items-center gap-5">
                <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl">
                  <UserCheck size={32} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                    Distribusi Laki-laki
                  </span>
                  <strong className="text-3xl font-bold tracking-tight text-slate-800 block mt-1">
                    {stats?.genderBreakdown?.find(g => g.name === 'Laki-laki')?.value ?? 0} Pasien
                  </strong>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    ({stats?.total ? Math.round(((stats.genderBreakdown.find(g => g.name === 'Laki-laki')?.value || 0) / stats.total) * 100) : 0}% dari total)
                  </span>
                </div>
              </div>

              {/* Female ratio card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-2xl p-6 relative overflow-hidden flex items-center gap-5">
                <div className="p-4 bg-pink-50 text-pink-600 rounded-2xl">
                  <UserRound size={32} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                    Distribusi Perempuan
                  </span>
                  <strong className="text-3xl font-bold tracking-tight text-slate-800 block mt-1">
                    {stats?.genderBreakdown?.find(g => g.name === 'Perempuan')?.value ?? 0} Pasien
                  </strong>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    ({stats?.total ? Math.round(((stats.genderBreakdown.find(g => g.name === 'Perempuan')?.value || 0) / stats.total) * 100) : 0}% dari total)
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Doughnut Chart on Genders */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <PieIcon className="text-slate-400" size={18} />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Demografi Pasien Berdasarkan Gender
                  </h3>
                </div>

                <div className="h-72 w-full flex items-center justify-center">
                  {loadingStats ? (
                    <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  ) : stats?.total ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={stats.genderBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stats.genderBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-slate-400">Tidak ada data rasio gender</span>
                  )}
                </div>
              </div>

              {/* Bar Chart on age groups */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <Baby className="text-slate-400" size={18} />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Demografi Pasien Berdasarkan Kelompok Usia
                  </h3>
                </div>

                <div className="h-72 w-full">
                  {loadingStats ? (
                    <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin flex m-auto"></div>
                  ) : stats?.ageGroups ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.ageGroups}
                        margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="group" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Banyak Pasien">
                          {stats.ageGroups.map((entry, index) => {
                            const colors = ['#06b6d4', '#4f46e5', '#3b82f6', '#f59e0b'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-slate-400">Tidak ada data visualisasi usia</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: MySQL Live Console Sandbox */}
        {activeTab === 'mysql' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            {/* Upper control layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Console Workspace: 7 cols */}
              <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-2xl p-6 lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="text-[#3B82F6]" size={18} />
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                        MySQL Terminal Console
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#E2E8F0] text-slate-600 px-2.5 py-1 rounded-sm">
                      ROOT@SIMGOS_TEST
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                    Ketik perintah SQL standard untuk tabel <code className="bg-slate-100 text-blue-600 px-1 py-0.5 rounded font-mono font-bold">pasien</code> di bawah ini, atau klik salah satu preset panduan di panel kanan untuk mencobanya secara otomatis.
                  </p>

                  <div className="relative">
                    <textarea
                      value={mysqlQuery}
                      onChange={(e) => setMysqlQuery(e.target.value)}
                      placeholder="Masukkan query SQL di sini..."
                      rows={5}
                      className="w-full bg-[#111827] text-[#10B981] placeholder:text-slate-600 font-mono text-[13px] p-4 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 leading-relaxed resize-none border-0 shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          runMysqlQuery();
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-[#64748B]">
                    <span>Tekan <kbd className="bg-slate-100 border border-slate-200 px-1 rounded text-slate-600 font-bold font-sans">Ctrl + Enter</kbd> untuk mengeksekusi cepat</span>
                    <button
                      onClick={() => setMysqlQuery('')}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer font-bold"
                    >
                      Bersihkan Editor
                    </button>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 flex gap-3">
                  <button
                    onClick={() => runMysqlQuery()}
                    disabled={mysqlLoading || !mysqlQuery.trim()}
                    className="flex-1 max-w-xs inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-semibold text-xs shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer text-left"
                  >
                    <Play size={12} fill="white" />
                    {mysqlLoading ? "Menjalankan..." : "Jalankan Query"}
                  </button>

                  <button
                    onClick={() => {
                      setMysqlQuery("SELECT * FROM pasien ORDER BY id_pasien ASC LIMIT 10;");
                      runMysqlQuery("SELECT * FROM pasien ORDER BY id_pasien ASC LIMIT 10;");
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all font-medium text-xs rounded-xl cursor-pointer text-left"
                  >
                    <RefreshCw size={12} className={mysqlLoading ? "animate-spin" : ""} />
                    Reset Default
                  </button>
                </div>
              </div>

              {/* Right Presets: 5 cols */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="text-indigo-600" size={16} />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest leading-none">
                      Panduan Belajar & Tugas SQL
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      {
                        title: "1. Tampilkan Semua Pasien",
                        query: "SELECT * FROM pasien;",
                        desc: "Menampilkan semua data 100 pasien lengkap untuk verifikasi awal."
                      },
                      {
                        title: "2. Kolom Spesifik Pasien",
                        query: "SELECT nama_pasien, jenis_kelamin, tanggal_lahir FROM pasien;",
                        desc: "Menjaring nama, gender, dan tanggal lahir saja untuk pemetaan data cepat."
                      },
                      {
                        title: "3. 10 Pendaftar Terakhir",
                        query: "SELECT * FROM pasien ORDER BY tanggal_daftar DESC LIMIT 10;",
                        desc: "Mengambil data rekam medis 10 pasien terbaru berdasarkan pendaftaran."
                      },
                      {
                        title: "4. Laki-laki Lahir Setelah 2000 (Filter)",
                        query: "SELECT * FROM pasien WHERE jenis_kelamin = 'L' AND tanggal_lahir > '2000-01-01';",
                        desc: "Mengeksekusikan filter bersyarat ganda (gender L dan lahir di atas tahun 2000)."
                      },
                      {
                        title: "5. Agregasi Gender Pasien (Agregasi)",
                        query: "SELECT jenis_kelamin, COUNT(*) AS jumlah_pasien FROM pasien GROUP BY jenis_kelamin;",
                        desc: "Menghitung volume pasien Laki-laki dan Perempuan secara agregat di database."
                      },
                      {
                        title: "6. Ubah No HP RM0001 (Update)",
                        query: "UPDATE pasien SET no_hp = '081111111111' WHERE no_rm = 'RM0001';",
                        desc: "Mengubah nomor HP pasien RM0001 (Ahmad Fauzi) menjadi '081111111111'."
                      }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setMysqlQuery(preset.query);
                          runMysqlQuery(preset.query);
                        }}
                        className="w-full text-left p-3 bg-white border border-slate-100 hover:border-blue-300 hover:shadow-2xs rounded-xl transition-all cursor-pointer block group text-[11px]"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-700 mb-1 group-hover:text-blue-600">
                          <span>{preset.title}</span>
                          <span className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded font-mono">Run Presets</span>
                        </div>
                        <p className="text-[#64748B] mb-1.5 leading-snug">
                          {preset.desc}
                        </p>
                        <code className="block bg-slate-50 text-slate-500 p-1.5 rounded-sm font-mono text-[10px] border border-slate-100/50 truncate group-hover:bg-blue-50/20 group-hover:text-blue-700">
                          {preset.query}
                        </code>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 mt-3">
                  💡 Klik salah satu panel di atas untuk mengisi console dan menjalankan perintah SQL.
                </div>
              </div>
            </div>

            {/* Notifications / Alerts */}
            {mysqlError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 leading-relaxed">
                <AlertTriangle className="text-rose-500 font-bold shrink-0 mt-0.5" size={15} />
                <div className="w-full overflow-hidden">
                  <span className="font-bold block mb-0.5">Kesalahan Eksekusi SQL:</span>
                  <p className="font-mono bg-white/50 p-2 rounded mt-1 border border-rose-100 text-[11px] overflow-x-auto">{mysqlError}</p>
                </div>
              </div>
            )}

            {mysqlSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 flex items-center gap-2.5">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={15} />
                <div>
                  <span className="font-bold">{mysqlSuccessMsg}</span>
                </div>
              </div>
            )}

            {/* Results output view */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b border-secondary-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="text-slate-500" size={15} />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest leading-none">
                    Tampilan Output Database Simulator
                  </h3>
                </div>
                {mysqlResult && (
                  <span className="text-[10px] font-mono font-bold bg-[#E2E8F0] text-slate-600 px-2.5 py-1 rounded-sm">
                    {mysqlResult.rows.length} rows returned
                  </span>
                )}
              </div>

              <div className="overflow-x-auto max-h-[350px]">
                {mysqlResult ? (
                  mysqlResult.rows.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono text-[10px] uppercase font-bold tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">#</th>
                          {mysqlResult.columns.map((col, idx) => (
                            <th key={idx} className="py-3 px-4 font-bold border-r border-slate-100 last:border-r-0 text-slate-600">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[12px] text-slate-700">
                        {mysqlResult.rows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-4 text-center text-slate-400 bg-slate-50/20 font-bold border-r border-slate-100">{rowIdx + 1}</td>
                            {mysqlResult.columns.map((col, colIdx) => {
                              let cellValue = row[col];
                              // Format dates
                              if (cellValue && typeof cellValue === 'string' && (cellValue.includes('T') || cellValue.match(/^\d{4}-\d{2}-\d{2}/))) {
                                if (col === 'tanggal_lahir') {
                                  cellValue = cellValue.split('T')[0];
                                } else if (col === 'tanggal_daftar') {
                                  cellValue = new Date(cellValue).toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
                                }
                              }
                              return (
                                <td key={colIdx} className="py-2.5 px-4 border-r border-[#F1F5F9] last:border-r-0">
                                  {cellValue === null ? <span className="text-slate-300 italic">NULL</span> : String(cellValue)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      <p className="font-semibold text-slate-500 mb-1">Query berhasil dijalankan</p>
                      <p className="text-[11px] text-[#64748B]">Namun tidak mengembalikan baris data (kosong atau modifikasi baris berhasil).</p>
                    </div>
                  )
                ) : (
                  <div className="py-14 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                    <Database className="text-slate-300 mb-2" size={32} />
                    <p className="font-semibold text-slate-500 mb-1">Konsol Belum Dijalankan</p>
                    <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed mx-auto">
                      Masukkan perintah di editor di atas atau klik salah satu preset tombol tugas belajar untuk melihat rekam medis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>

      {/* MODAL 1: ADD NEW PATIENT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <BriefcaseMedical size={20} />
                <h3 className="font-bold text-slate-800 font-display">Daftarkan Pasien Baru</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    No. Rekam Medis (RM) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.noRm}
                    onChange={(e) => setFormData({ ...formData, noRm: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-mono font-bold text-blue-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 Digit NIK KTP..."
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nama Lengkap Pasien <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama sesuai KTP..."
                  value={formData.namaPasien}
                  onChange={(e) => setFormData({ ...formData, namaPasien: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Tanggal Lahir <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nomor Handphone (No. HP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567..."
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Alamat Lengkap Rumah <span className="text-rose-500">*</span>
                </label>
                <textarea
                  placeholder="Gunting gang, jalan, RT/RW, kelurahan..."
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm h-20 resize-none"
                  required
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={mutationLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md inline-flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {mutationLoading ? 'Menyimpan...' : 'Simpan Pasien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PATIENT */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <Edit size={20} />
                <h3 className="font-bold text-slate-800 font-display">Ubah Profil Pasien</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    No. Rekam Medis (RM) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.noRm}
                    onChange={(e) => setFormData({ ...formData, noRm: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-mono font-bold text-blue-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nama Lengkap Pasien <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.namaPasien}
                  onChange={(e) => setFormData({ ...formData, namaPasien: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Tanggal Lahir <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nomor Handphone (No. HP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Alamat Lengkap Rumah <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm h-20 resize-none"
                  required
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={mutationLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md inline-flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {mutationLoading ? 'Menyimpan...' : 'Perbarui Pasien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {showDeleteModal && patientToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center gap-3 text-rose-500">
              <Trash2 size={24} />
              <h3 className="font-extrabold text-slate-800 font-display text-lg">Hapus Pasien Terdaftar</h3>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Apakah Anda benar-benar yakin ingin menghapus data pasien bernama{' '}
              <strong className="text-slate-800">"{patientToDelete.namaPasien}"</strong> dengan nomor Rekam Medis{' '}
              <strong className="text-blue-700">"{patientToDelete.noRm}"</strong>?
            </p>
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              Perhatian: Tindakan ini bersifat permanen dan data pasien tidak akan bisa dipulihkan kembali dari sistem simgos_test.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm"
              >
                Kembali
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={mutationLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-md text-sm disabled:opacity-50"
              >
                {mutationLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
