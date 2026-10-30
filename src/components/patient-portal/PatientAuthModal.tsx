import React, { useState } from 'react';
import { PatientAccount } from '../../types';
import { getAllAccounts, loginPatient, registerPatient } from '../../utils/patientStorage';
import { SIMULATED_PATIENTS } from '../../data/simulatedPatients';
import { User, Lock, Phone, Calendar, Heart, ShieldCheck, Check, AlertCircle, Sparkles, UserPlus, LogIn } from 'lucide-react';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: PatientAccount) => void;
}

export const PatientAuthModal: React.FC<PatientAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login form state
  const [loginNik, setLoginNik] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regForm, setRegForm] = useState({
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
    sedangHamil: false,
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!loginNik.trim()) {
      setErrorMsg('Harap masukkan NIK atau No. Rekam Medis.');
      return;
    }
    const result = loginPatient(loginNik, loginPassword);
    if (result.success && result.user) {
      onSuccess(result.user);
      onClose();
    } else {
      setErrorMsg(result.message || 'Login gagal. Periksa kembali NIK atau pilih akun demo.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!regForm.nik.trim() || !regForm.nama.trim() || !regForm.tanggalLahir.trim()) {
      setErrorMsg('Harap lengkapi NIK, Nama Lengkap, dan Tanggal Lahir.');
      return;
    }

    const randomRmNumber = `RM-00${Math.floor(1100 + Math.random() * 899)}`;
    const newAccount: PatientAccount = {
      nik: regForm.nik.trim(),
      nama: regForm.nama.trim(),
      nomorRekamMedis: randomRmNumber,
      telepon: regForm.telepon.trim() || '0812-0000-0000',
      password: regForm.password || 'password123',
      tanggalLahir: regForm.tanggalLahir.trim(),
      jenisKelamin: regForm.jenisKelamin,
      golonganDarah: regForm.golonganDarah,
      alamat: regForm.alamat.trim() || 'Bandung, Jawa Barat',
      riwayatKesehatan: {
        alergi: regForm.alergi.trim(),
        penyakit_menahun: regForm.penyakitMenahun.trim(),
        obat_rutin: regForm.obatRutin.trim(),
        sedang_hamil: regForm.sedangHamil ? 'ya' : 'tidak',
      },
    };

    const result = registerPatient(newAccount);
    if (result.success) {
      onSuccess(newAccount);
      onClose();
    } else {
      setErrorMsg(result.message || 'Pendaftaran gagal.');
    }
  };

  const handleQuickDemoLogin = (p: typeof SIMULATED_PATIENTS[0]) => {
    const nik = p.nik || `317101${p.nomorRekamMedis.replace(/\D/g, '').padStart(10, '0')}`;
    const result = loginPatient(nik);
    if (result.success && result.user) {
      onSuccess(result.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight">Portal Pasien RSGM Maranatha</h3>
                <p className="text-xs text-teal-300">Akses Mandiri &amp; Pendaftaran Online Pasien</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              &times;
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 mt-4 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login' ? 'bg-teal-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login Pasien)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register' ? 'bg-teal-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIK Pasien atau Nomor Rekam Medis (No RM)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={loginNik}
                    onChange={(e) => setLoginNik(e.target.value)}
                    placeholder="Contoh: 3171011405920001 atau RM-001049"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Bisa menggunakan NIK 16 digit atau Nomor Rekam Medis Anda.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi (demo default: password123)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun Pasien</span>
              </button>

              {/* DEMO ACCOUNTS QUICK SHORTCUT */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pilihan Cepat: Masuk Akun Pasien Terdaftar (Simulasi)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left">
                  {SIMULATED_PATIENTS.slice(0, 4).map((p) => (
                    <button
                      key={p.kode}
                      type="button"
                      onClick={() => handleQuickDemoLogin(p)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-800 transition-all text-xs text-left"
                    >
                      <div className="font-bold truncate">{p.nama}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{p.nomorRekamMedis}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    NIK Pasien (16 Digit) *
                  </label>
                  <input
                    type="text"
                    value={regForm.nik}
                    onChange={(e) => setRegForm({ ...regForm, nik: e.target.value })}
                    placeholder="3273012304950001"
                    maxLength={16}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lengkap Sesuai KTP *
                  </label>
                  <input
                    type="text"
                    value={regForm.nama}
                    onChange={(e) => setRegForm({ ...regForm, nama: e.target.value })}
                    placeholder="Contoh: Anisa Rahmawati"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tgl Lahir (DD-MM-YYYY) *
                  </label>
                  <input
                    type="text"
                    value={regForm.tanggalLahir}
                    onChange={(e) => setRegForm({ ...regForm, tanggalLahir: e.target.value })}
                    placeholder="12-07-1995"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={regForm.jenisKelamin}
                    onChange={(e) => setRegForm({ ...regForm, jenisKelamin: e.target.value as any })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Golongan Darah
                  </label>
                  <select
                    value={regForm.golonganDarah}
                    onChange={(e) => setRegForm({ ...regForm, golonganDarah: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="O (+)">O (+)</option>
                    <option value="A (+)">A (+)</option>
                    <option value="B (+)">B (+)</option>
                    <option value="AB (+)">AB (+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={regForm.telepon}
                    onChange={(e) => setRegForm({ ...regForm, telepon: e.target.value })}
                    placeholder="0812-3456-7890"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kata Sandi Akun
                  </label>
                  <input
                    type="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Riwayat Kesehatan Awal */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Riwayat Kesehatan Pasien (Opsional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Riwayat Alergi (Obat/Makanan):</label>
                    <input
                      type="text"
                      value={regForm.alergi}
                      onChange={(e) => setRegForm({ ...regForm, alergi: e.target.value })}
                      placeholder="Contoh: Penisilin / Tidak ada"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Penyakit Menahun / Obat Rutin:</label>
                    <input
                      type="text"
                      value={regForm.penyakitMenahun}
                      onChange={(e) => setRegForm({ ...regForm, penyakitMenahun: e.target.value })}
                      placeholder="Contoh: Hipertensi / Asma"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun Pasien &amp; Buat e-RM</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
