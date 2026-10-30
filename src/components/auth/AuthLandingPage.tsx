import React, { useState } from 'react';
import { AuthSessionUser, StaffAccount, PatientAccount } from '../../types';
import {
  getAllStaffAccounts,
  loginStaff,
  registerStaff,
  getAllAccounts,
  loginPatient,
  registerPatient,
} from '../../utils/patientStorage';
import { SIMULATED_PATIENTS } from '../../data/simulatedPatients';
import {
  ShieldCheck,
  Building,
  User,
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Heart,
  Calendar,
  Smartphone,
  ChevronRight,
  Shield,
  FileText,
} from 'lucide-react';

interface AuthLandingPageProps {
  onLoginSuccess: (session: AuthSessionUser) => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({ onLoginSuccess }) => {
  // Main role portal tab: 'staff' (Admin/Staf) vs 'patient' (Pasien)
  const [roleTab, setRoleTab] = useState<'staff' | 'patient'>('staff');

  // Sub-mode: 'login' vs 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- STAFF STATE ---
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const [newStaffForm, setNewStaffForm] = useState({
    nip: '',
    username: '',
    nama: '',
    role: 'staf_loket' as 'admin' | 'staf_loket' | 'perawat_triase',
    unitKerja: 'Front-Desk Loket Pendaftaran & Antrean',
    password: '',
  });

  // --- PATIENT STATE ---
  const [patientNik, setPatientNik] = useState('');
  const [patientPassword, setPatientPassword] = useState('');

  const [newPatientForm, setNewPatientForm] = useState({
    nik: '',
    nama: '',
    tanggalLahir: '',
    telepon: '',
    jenisKelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    golonganDarah: 'O (+)',
    alamat: '',
    password: '',
    alergi: '',
    penyakitMenahun: '',
    obatRutin: '',
  });

  const staffAccounts = getAllStaffAccounts();

  // --- HANDLERS ---
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!staffUsername.trim()) {
      setErrorMsg('Harap masukkan Username atau NIP Petugas / Admin.');
      return;
    }

    const res = loginStaff(staffUsername, staffPassword);
    if (res.success && res.staff) {
      onLoginSuccess({
        roleType: 'staff',
        staffData: res.staff,
      });
    } else {
      setErrorMsg(res.message || 'Login staf gagal. Periksa kembali username/NIP atau gunakan tombol login cepat demo.');
    }
  };

  const handleStaffRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newStaffForm.nip.trim() || !newStaffForm.username.trim() || !newStaffForm.nama.trim()) {
      setErrorMsg('Harap lengkapi NIP, Username, dan Nama Lengkap Pegawai.');
      return;
    }

    const newStaff: StaffAccount = {
      id: `STAFF-${Date.now()}`,
      nip: newStaffForm.nip.trim(),
      username: newStaffForm.username.trim(),
      nama: newStaffForm.nama.trim(),
      role: newStaffForm.role,
      unitKerja:
        newStaffForm.role === 'admin'
          ? 'Direksi & Administrator SIMRS RSGM'
          : newStaffForm.role === 'perawat_triase'
          ? 'Instalasi Triase Medis & Penapisan Awal'
          : 'Front-Desk Loket Pendaftaran & Antrean',
      password: newStaffForm.password || 'staf123',
    };

    const res = registerStaff(newStaff);
    if (res.success) {
      onLoginSuccess({
        roleType: 'staff',
        staffData: newStaff,
      });
    } else {
      setErrorMsg(res.message || 'Pendaftaran staf gagal.');
    }
  };

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!patientNik.trim()) {
      setErrorMsg('Harap masukkan NIK (16 digit) atau Nomor Rekam Medis (No RM).');
      return;
    }

    const res = loginPatient(patientNik, patientPassword);
    if (res.success && res.user) {
      onLoginSuccess({
        roleType: 'patient',
        patientData: res.user,
      });
    } else {
      setErrorMsg(res.message || 'Login pasien gagal. Periksa kembali NIK atau gunakan tombol login cepat demo.');
    }
  };

  const handlePatientRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newPatientForm.nik.trim() || !newPatientForm.nama.trim() || !newPatientForm.tanggalLahir.trim()) {
      setErrorMsg('Harap lengkapi NIK, Nama Lengkap, dan Tanggal Lahir.');
      return;
    }

    const randomRmNumber = `RM-00${Math.floor(1100 + Math.random() * 899)}`;
    const newPatient: PatientAccount = {
      nik: newPatientForm.nik.trim(),
      nama: newPatientForm.nama.trim(),
      nomorRekamMedis: randomRmNumber,
      telepon: newPatientForm.telepon.trim() || '0812-3456-7890',
      tanggalLahir: newPatientForm.tanggalLahir.trim(),
      jenisKelamin: newPatientForm.jenisKelamin,
      golonganDarah: newPatientForm.golonganDarah,
      alamat: newPatientForm.alamat.trim() || 'Bandung, Jawa Barat',
      password: newPatientForm.password || 'password123',
      riwayatKesehatan: {
        alergi: newPatientForm.alergi.trim(),
        penyakit_menahun: newPatientForm.penyakitMenahun.trim(),
        obat_rutin: newPatientForm.obatRutin.trim(),
        sedang_hamil: 'tidak',
      },
    };

    const res = registerPatient(newPatient);
    if (res.success) {
      onLoginSuccess({
        roleType: 'patient',
        patientData: newPatient,
      });
    } else {
      setErrorMsg(res.message || 'Pendaftaran pasien gagal.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex flex-col justify-between text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Decorative Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-white leading-tight">
                  RSGM MARANATHA
                </span>
                <span className="px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-teal-900/80 text-teal-300 border border-teal-700 rounded">
                  PORTAL MASUK
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sistem Terpadu SIMRS Triase Loket &amp; Portal Mandiri Pasien
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Autentikasi Terverifikasi &amp; Aman</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 my-auto">
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Hero Gate Switcher (Admin/Staf vs Pasien) */}
          <div className="bg-slate-900 text-white p-5 sm:p-7 border-b border-slate-800">
            <div className="text-center max-w-lg mx-auto mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400 block mb-1">
                Selamat Datang di Portal Rumah Sakit Gigi &amp; Mulut
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Silakan Masuk atau Daftarkan Akun Anda
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Pilih peran Anda untuk diarahkan ke ruang kerja front-desk staf atau portal reservasi mandiri pasien.
              </p>
            </div>

            {/* Role Select Tabs */}
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto bg-slate-950 p-1.5 rounded-2xl border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setRoleTab('staff');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-3 px-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  roleTab === 'staff'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Admin / Staf RSGM</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleTab('patient');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-3 px-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  roleTab === 'patient'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Pasien RSGM</span>
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="p-6 sm:p-8">
            {/* Sub-mode Toggle (Masuk vs Daftar) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {roleTab === 'staff'
                    ? authMode === 'login'
                      ? 'Masuk sebagai Admin / Staf Front-Desk'
                      : 'Pendaftaran Akun Pegawai / Staf Baru'
                    : authMode === 'login'
                    ? 'Masuk ke Portal Pasien Mandiri'
                    : 'Pendaftaran Pasien Baru (Pembuatan e-RM)'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {roleTab === 'staff'
                    ? 'Akses ke modul triase klinis, pencocokan antrean, dan panduan SOP rumah sakit.'
                    : 'Akses ke kartu berobat digital, booking online dokter, dan catatan e-RM.'}
                </p>
              </div>

              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    authMode === 'register'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daftar
                </button>
              </div>
            </div>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ================= SECTION A: ROLE STAFF / ADMIN ================= */}
            {roleTab === 'staff' && (
              <div className="space-y-6">
                {authMode === 'login' ? (
                  <form onSubmit={handleStaffLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Username Pegawai atau NIP Staf *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={staffUsername}
                          onChange={(e) => setStaffUsername(e.target.value)}
                          placeholder="Contoh: admin atau staf.loket"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Gunakan akun yang telah didaftarkan oleh Administrator RSGM Maranatha.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kata Sandi *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          value={staffPassword}
                          onChange={(e) => setStaffPassword(e.target.value)}
                          placeholder="Masukkan kata sandi (demo: admin123 atau staf123)"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Dashboard Staf SIMRS</span>
                    </button>

                    {/* 2 Staff Accounts Reference Box */}
                    <div className="pt-3 border-t border-slate-200">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                          <span>2 Akun Staf / Admin Resmi (Ketik untuk Masuk):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="font-bold text-slate-900 block">Akun 1: Administrator SIMRS</span>
                            <span className="text-slate-600 block mt-0.5">Username: <code className="font-mono font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded">admin</code></span>
                            <span className="text-slate-600 block mt-0.5">Password: <code className="font-mono font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded">admin123</code></span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="font-bold text-slate-900 block">Akun 2: Staf Loket &amp; Triase</span>
                            <span className="text-slate-600 block mt-0.5">Username: <code className="font-mono font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded">staf_loket</code></span>
                            <span className="text-slate-600 block mt-0.5">Password: <code className="font-mono font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded">staf123</code></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleStaffRegister} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Nomor Induk Pegawai (NIP) *
                        </label>
                        <input
                          type="text"
                          value={newStaffForm.nip}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, nip: e.target.value })}
                          placeholder="199501012022011005"
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Nama Lengkap &amp; Gelar *
                        </label>
                        <input
                          type="text"
                          value={newStaffForm.nama}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, nama: e.target.value })}
                          placeholder="drg. Sarah Amanda / Rian Pratama"
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Username Login *
                        </label>
                        <input
                          type="text"
                          value={newStaffForm.username}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, username: e.target.value })}
                          placeholder="sarah.triase"
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Peran &amp; Unit Penugasan
                        </label>
                        <select
                          value={newStaffForm.role}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value as any })}
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                          <option value="staf_loket">Staf Front-Desk &amp; Loket Antrean</option>
                          <option value="perawat_triase">Perawat Penapis / Triase Medis</option>
                          <option value="admin">Administrator SIMRS &amp; Direksi</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Kata Sandi Akun
                      </label>
                      <input
                        type="password"
                        value={newStaffForm.password}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Daftarkan Akun Staf &amp; Masuk</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ================= SECTION B: ROLE PASIEN ================= */}
            {roleTab === 'patient' && (
              <div className="space-y-6">
                {authMode === 'login' ? (
                  <form onSubmit={handlePatientLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        NIK Pasien (16 Digit) atau Nomor Rekam Medis (No RM) *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={patientNik}
                          onChange={(e) => setPatientNik(e.target.value)}
                          placeholder="Contoh: 3171011405920001 atau RM-001049"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Pasien yang sudah pernah berobat di RSGM Maranatha dapat memasukkan No RM atau NIK.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kata Sandi *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          value={patientPassword}
                          onChange={(e) => setPatientPassword(e.target.value)}
                          placeholder="Masukkan kata sandi (demo: pasien123)"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Portal Pasien Mandiri</span>
                    </button>

                    {/* 2 Patient Accounts Reference Box */}
                    <div className="pt-3 border-t border-slate-200">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-teal-600" />
                          <span>2 Akun Pasien Terdaftar (Ketik NIK/No RM untuk Masuk):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="font-bold text-slate-900 block">Pasien 1: Poli Gigi &amp; Mulut</span>
                            <span className="text-slate-600 block mt-0.5">No RM: <code className="font-mono font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded">RM-001049</code></span>
                            <span className="text-slate-600 block mt-0.5">NIK: <code className="font-mono font-bold text-slate-700">3171011405920001</code></span>
                            <span className="text-slate-600 block mt-0.5">Password: <code className="font-mono font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded">pasien123</code></span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="font-bold text-slate-900 block">Pasien 2: Poli Umum</span>
                            <span className="text-slate-600 block mt-0.5">No RM: <code className="font-mono font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded">RM-001052</code></span>
                            <span className="text-slate-600 block mt-0.5">NIK: <code className="font-mono font-bold text-slate-700">3171022209880003</code></span>
                            <span className="text-slate-600 block mt-0.5">Password: <code className="font-mono font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded">pasien123</code></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePatientRegister} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          NIK Pasien (16 Digit KTP) *
                        </label>
                        <input
                          type="text"
                          value={newPatientForm.nik}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, nik: e.target.value })}
                          placeholder="3273012304950001"
                          maxLength={16}
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Nama Lengkap Sesuai KTP *
                        </label>
                        <input
                          type="text"
                          value={newPatientForm.nama}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, nama: e.target.value })}
                          placeholder="Contoh: Anisa Rahmawati"
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Tanggal Lahir *
                        </label>
                        <input
                          type="text"
                          value={newPatientForm.tanggalLahir}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, tanggalLahir: e.target.value })}
                          placeholder="12-07-1995"
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Jenis Kelamin
                        </label>
                        <select
                          value={newPatientForm.jenisKelamin}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, jenisKelamin: e.target.value as any })}
                          className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Golongan Darah
                        </label>
                        <select
                          value={newPatientForm.golonganDarah}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, golonganDarah: e.target.value })}
                          className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                          <option value="O (+)">O (+)</option>
                          <option value="A (+)">A (+)</option>
                          <option value="B (+)">B (+)</option>
                          <option value="AB (+)">AB (+)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Nomor WhatsApp / HP
                        </label>
                        <input
                          type="tel"
                          value={newPatientForm.telepon}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, telepon: e.target.value })}
                          placeholder="0812-3456-7890"
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Kata Sandi
                        </label>
                        <input
                          type="password"
                          value={newPatientForm.password}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, password: e.target.value })}
                          placeholder="Minimal 6 karakter"
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Riwayat Kesehatan Awal */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                        Riwayat Kesehatan (Alergi / Penyakit Menahun)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Alergi Obat / Makanan:</label>
                          <input
                            type="text"
                            value={newPatientForm.alergi}
                            onChange={(e) => setNewPatientForm({ ...newPatientForm, alergi: e.target.value })}
                            placeholder="Contoh: Penisilin / Tidak ada"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Penyakit Menahun / Obat Rutin:</label>
                          <input
                            type="text"
                            value={newPatientForm.penyakitMenahun}
                            onChange={(e) => setNewPatientForm({ ...newPatientForm, penyakitMenahun: e.target.value })}
                            placeholder="Contoh: Hipertensi / Asma"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Daftarkan Pasien &amp; Buka e-RM</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Triase Klinis Otomatis</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">
                Evaluasi SOP 5 jalur (Merah, Kuning, Hijau, Biru, Abu) dan deteksi tanda bahaya.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Sinkronisasi Booking Mandiri</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">
                Pasien booking online langsung terhubung ke loket tanpa pengisian formulir ulang.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">e-RM &amp; Keamanan Data</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">
                Pemisahan hak akses: POV Pasien (Read-Only) dan POV Staf (Penapisan Lengkap).
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-slate-500 text-xs border-t border-white/5">
        &copy; {new Date().getFullYear()} Rumah Sakit Gigi &amp; Mulut (RSGM) Maranatha Bandung. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
};
