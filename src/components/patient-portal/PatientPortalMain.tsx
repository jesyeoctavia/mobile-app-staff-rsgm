import React, { useState, useEffect } from 'react';
import { PatientAccount, HospitalAppointment } from '../../types';
import {
  getCurrentPatient,
  logoutPatient,
  getStoredAppointments,
  getAllAccounts,
} from '../../utils/patientStorage';
import { PatientDigitalCard } from './PatientDigitalCard';
import { PatientBookingForm } from './PatientBookingForm';
import { PatientLiveQueue } from './PatientLiveQueue';
import { PatientMedicalRecordView } from './PatientMedicalRecordView';
import { PatientBillingView } from './PatientBillingView';
import { PatientBottomNav, PatientTabId } from './PatientBottomNav';
import { PatientAuthModal } from './PatientAuthModal';
import {
  Calendar,
  Clock,
  FileText,
  ReceiptText,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  Building,
  PlusCircle,
  ChevronRight,
  ArrowRight,
  Stethoscope,
  Heart,
  PhoneCall,
  Activity,
} from 'lucide-react';

interface PatientPortalMainProps {
  onLogout?: () => void;
}

export const PatientPortalMain: React.FC<PatientPortalMainProps> = ({ onLogout }) => {
  const [currentPatient, setCurrentPatient] = useState<PatientAccount | null>(null);
  const [appointments, setAppointments] = useState<HospitalAppointment[]>([]);
  const [activeTab, setActiveTab] = useState<PatientTabId>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load patient and appointments from localStorage on mount and listen to changes
  const reloadData = () => {
    let patient = getCurrentPatient();
    if (!patient) {
      // Default to first account (Muhammad Rizky Pratama) if none logged in yet
      const accounts = getAllAccounts();
      if (accounts.length > 0) {
        patient = accounts[0];
      }
    }
    setCurrentPatient(patient);
    setAppointments(getStoredAppointments());
  };

  useEffect(() => {
    reloadData();

    const handleAuthChange = () => reloadData();
    const handleApptChange = () => setAppointments(getStoredAppointments());

    window.addEventListener('patient-auth-changed', handleAuthChange);
    window.addEventListener('hospital-appointments-updated', handleApptChange);

    return () => {
      window.removeEventListener('patient-auth-changed', handleAuthChange);
      window.removeEventListener('hospital-appointments-updated', handleApptChange);
    };
  }, []);

  const handleLogout = () => {
    logoutPatient();
    if (onLogout) {
      onLogout();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const activeBooking = appointments.find((a) => a.status !== 'Dibatalkan');
  const unpaidCount = appointments.filter((a) => a.statusPembayaran !== 'Lunas').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-20 md:pb-12">
      {/* Top Banner Patient Info & Logout */}
      <div className="bg-slate-950 text-white px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Portal Pasien:</span>
            <span className="font-extrabold text-teal-300 bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800">
              PORTAL MANDIRI PASIEN
            </span>
            {currentPatient && (
              <span className="hidden sm:inline text-slate-400 border-l border-slate-800 pl-2">
                Pasien: <strong className="text-white">{currentPatient.nama}</strong> ({currentPatient.nomorRekamMedis})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white font-bold rounded-lg transition-colors flex items-center gap-1 border border-rose-800/60 shadow-xs"
              title="Keluar dari akun pasien"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
                    RSGM MARANATHA
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                    PORTAL PASIEN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pendaftaran Online &amp; Rekam Medis Mandiri
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: 'home' as PatientTabId, label: 'Beranda & Kartu', icon: User },
                { id: 'booking' as PatientTabId, label: 'Booking Janji Temu', icon: Calendar },
                {
                  id: 'queue' as PatientTabId,
                  label: 'Live Antrean',
                  icon: Clock,
                  badge: activeBooking ? '1' : undefined,
                },
                { id: 'records' as PatientTabId, label: 'e-Rekam Medis', icon: FileText },
                {
                  id: 'billing' as PatientTabId,
                  label: 'Tagihan & Bayar',
                  icon: ReceiptText,
                  badge: unpaidCount > 0 ? String(unpaidCount) : undefined,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 relative ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Active Patient Profile & Logout */}
            <div className="flex items-center gap-2.5">
              {currentPatient ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-800 block truncate max-w-[140px]">
                      {currentPatient.nama}
                    </span>
                    <span className="text-[10px] font-mono text-teal-700 font-bold block">
                      {currentPatient.nomorRekamMedis}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Ganti Akun / Logout"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Masuk / Daftar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentPatient ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Silakan Masuk ke Portal Pasien</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Gunakan NIK atau Nomor Rekam Medis untuk melihat status antrean, booking janji temu, dan rekam medis digital Anda.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
            >
              Masuk / Pilih Akun Pasien
            </button>
          </div>
        ) : (
          <>
            {/* VIEW 1: HOME & DIGITAL CARD */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                {/* Greeting & Quick Action Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Selamat Datang di Portal Pasien,</span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      {currentPatient.nama}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      NIK: <span className="font-mono">{currentPatient.nik}</span> • e-RM: <span className="font-mono text-teal-700 font-bold">{currentPatient.nomorRekamMedis}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('booking')}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Buat Janji Temu Dokter</span>
                    </button>
                  </div>
                </div>

                {/* Digital Card & Active Queue Widget Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Digital Patient Card */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-teal-600" />
                      <span>Kartu Berobat Digital Pasien (e-KTA)</span>
                    </h3>
                    <PatientDigitalCard patient={currentPatient} />
                  </div>

                  {/* Active Queue Status Widget */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>Status Kunjungan &amp; Antrean Aktif Hari Ini</span>
                    </h3>

                    {activeBooking ? (
                      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-teal-500/50 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                              Antrean Aktif
                            </span>
                          </div>
                          <span className="font-mono font-black text-xl text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                            {activeBooking.nomorAntrean}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Poli &amp; Dokter</span>
                            <span className="font-bold text-slate-900 block truncate">{activeBooking.poli}</span>
                            <span className="text-slate-500 block truncate">{activeBooking.namaDokter}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Jadwal &amp; Jam</span>
                            <span className="font-bold text-teal-700 block">{activeBooking.tanggalKunjungan}</span>
                            <span className="text-slate-600 block">{activeBooking.jamKunjungan}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Status: <strong className="text-slate-800">{activeBooking.status}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('queue')}
                            className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <span>Buka Live Tracker</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3">
                        <p className="text-xs text-slate-500">
                          Tidak ada janji temu aktif untuk hari ini. Silakan lakukan booking online dokter untuk mendapatkan nomor antrean.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('booking')}
                          className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors"
                        >
                          + Daftar Antrean Sekarang
                        </button>
                      </div>
                    )}

                    {/* Features Quick Menu */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('records')}
                        className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition-all text-left flex items-start gap-3"
                      >
                        <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">e-Rekam Medis</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Riwayat diagnosis &amp; resep dokter</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('billing')}
                        className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition-all text-left flex items-start gap-3"
                      >
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                          <ReceiptText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">Tagihan &amp; Bayar</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Kuitansi &amp; simulasi QRIS</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Sync with Hospital Staff Notice */}
                <div className="bg-gradient-to-r from-sky-50 via-teal-50 to-indigo-50 border border-sky-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-teal-600 text-white shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Sinkronisasi Tanpa Antre: Menghubungkan Pasien &amp; Front-Desk Staf RSGM
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Ketika Anda menekan <em>"Konfirmasi Booking"</em>, nomor antrean dan seluruh data Anda (identitas, keluhan, riwayat alergi) langsung muncul pada layar SIMRS Front-Desk Staf. Petugas tidak perlu mengetik ulang saat Anda tiba di loket!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('booking')}
                    className="shrink-0 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Daftar Booking Online</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: BOOKING JANJI TEMU */}
            {activeTab === 'booking' && (
              <PatientBookingForm
                patient={currentPatient}
                onBookingSuccess={(app) => {
                  setAppointments(getStoredAppointments());
                  setActiveTab('queue');
                }}
                onCancel={() => setActiveTab('home')}
              />
            )}

            {/* VIEW 3: LIVE QUEUE TRACKER */}
            {activeTab === 'queue' && (
              <PatientLiveQueue
                appointments={appointments}
                onOpenBooking={() => setActiveTab('booking')}
                onSelectAppointmentForPayment={(app) => setActiveTab('billing')}
              />
            )}

            {/* VIEW 4: e-REKAM MEDIS (READ-ONLY) */}
            {activeTab === 'records' && (
              <PatientMedicalRecordView patient={currentPatient} />
            )}

            {/* VIEW 5: BILLING & PAYMENT SIMULATION */}
            {activeTab === 'billing' && (
              <PatientBillingView
                patient={currentPatient}
                appointments={appointments}
                onPaymentSuccess={() => setAppointments(getStoredAppointments())}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <PatientBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        activeBookingCount={activeBooking ? 1 : 0}
        unpaidBillingCount={unpaidCount}
      />

      {/* Auth Modal for Login / Register / Demo Switch */}
      <PatientAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentPatient(user);
          reloadData();
        }}
      />
    </div>
  );
};
