import React, { useState } from 'react';
import {
  Menu,
  X,
  ShieldCheck,
  Calendar,
  FileText,
  BookOpen,
  History,
  Sparkles,
  Stethoscope,
  Clock,
  PhoneCall,
  User,
  ChevronRight,
  Smartphone,
  LogOut,
} from 'lucide-react';
import { WizardStepId, StaffAccount } from '../types';

interface NavbarProps {
  currentStep: WizardStepId;
  aiUsedCount: number;
  aiIgnoredCount: number;
  historyCount: number;
  currentStaff?: StaffAccount | null;
  onOpenSopModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenDoctorScheduleModal: () => void;
  onOpenMedicalRecordModal: () => void;
  onOpenAiDrawer: () => void;
  onResetWizard: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  aiUsedCount,
  aiIgnoredCount,
  historyCount,
  currentStaff,
  onOpenSopModal,
  onOpenHistoryModal,
  onOpenDoctorScheduleModal,
  onOpenMedicalRecordModal,
  onOpenAiDrawer,
  onResetWizard,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger Button + Brand */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Buka menu navigasi"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div
                onClick={onResetWizard}
                role="button"
                tabIndex={0}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-teal-400 transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
                      RSGM MARANATHA
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-teal-900/80 text-teal-300 border border-teal-700 rounded">
                      SIMRS TRIASE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden xs:block">
                    Poli Umum &amp; Poli Gigi • Front-Desk &amp; Asisten AI
                  </p>
                </div>
              </div>
            </div>

            {/* Center Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                type="button"
                onClick={onOpenDoctorScheduleModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Jadwal Dokter</span>
              </button>

              <button
                type="button"
                onClick={onOpenMedicalRecordModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Rekam Medis (e-RM)</span>
              </button>

              <button
                type="button"
                onClick={onOpenSopModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Pedoman SOP</span>
              </button>

              <button
                type="button"
                onClick={onOpenHistoryModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span>Riwayat Sesi</span>
                {historyCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-teal-500 text-slate-900 text-[10px] font-black rounded-full">
                    {historyCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Right: Staff Info, Switch to Patient POV, AI Counter & Logout */}
            <div className="flex items-center space-x-2">
              {currentStaff && (
                <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-slate-800/90 rounded-xl border border-slate-700 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[10px]">
                    {currentStaff.role === 'admin' ? 'ADM' : 'STF'}
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-white block leading-tight truncate max-w-[130px]">
                      {currentStaff.nama.split(' ')[0]} {currentStaff.nama.split(' ')[1] || ''}
                    </span>
                    <span className="text-[10px] text-teal-400 block font-medium capitalize">
                      {currentStaff.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )}

              <div
                onClick={onOpenAiDrawer}
                role="button"
                tabIndex={0}
                title="Buka panel Asisten AI"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 cursor-pointer transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline text-slate-400">Bantuan AI:</span>
                <span className="font-bold text-emerald-400">{aiUsedCount} digunakan</span>
                <span className="text-slate-600">,</span>
                <span className="font-semibold text-slate-400">{aiIgnoredCount} diabaikan</span>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Keluar dari Sesi Staf RSGM"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-300 border border-slate-700 hover:border-rose-700/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Hamburger Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-900 text-white shadow-2xl flex flex-col z-50 border-r border-slate-800">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Menu Utama RSGM Maranatha</h3>
                  <p className="text-[11px] text-slate-400">Portal SIMRS &amp; Triase</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider mb-1">
                Layanan Klinis &amp; Pendaftaran
              </div>

              <button
                type="button"
                onClick={() => {
                  onResetWizard();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="font-bold block">Pendaftaran &amp; Triase Pasien</span>
                    <span className="text-[10px] text-slate-400">Mulai alur verifikasi pasien baru/booking</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenDoctorScheduleModal();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="font-bold block">Jadwal Praktik Dokter</span>
                    <span className="text-[10px] text-slate-400">Poli Gigi, Umum &amp; Kuota Antrean</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenMedicalRecordModal();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="font-bold block">Berkas Rekam Medis (e-RM)</span>
                    <span className="text-[10px] text-slate-400">Riwayat diagnosa ICD-10 &amp; alergi obat</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              <div className="pt-3 text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider mb-1">
                SOP &amp; Operasional Front-Desk
              </div>

              <button
                type="button"
                onClick={() => {
                  onOpenSopModal();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold block">Pedoman SOP Prosedur</span>
                    <span className="text-[10px] text-slate-400">Prosedur baku penapisan &amp; alur poli</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenHistoryModal();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold block">Riwayat Sesi Triase</span>
                    <span className="text-[10px] text-slate-400">Log serah-terima &amp; jejak pemakaian AI</span>
                  </div>
                </div>
                {historyCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-teal-500 text-slate-900 text-[10px] font-black rounded-full">
                    {historyCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenAiDrawer();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-3 rounded-xl bg-indigo-950/60 border border-indigo-800 text-indigo-200 hover:text-white transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <div>
                    <span className="font-bold block">Asisten AI Front-Desk</span>
                    <span className="text-[10px] text-indigo-300">Keluhan, pencocokan data &amp; tanya SOP</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-500" />
              </button>
            </div>

            {onLogout && (
              <div className="p-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Keluar dari Sesi Staf / Admin</span>
                </button>
              </div>
            )}

            {/* Drawer Footer Info */}
            <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 bg-slate-950/40">
              <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Jam Operasional: 08:00 - 21:00 WIB</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Panggilan Darurat / IGD 24 Jam: (021) 789-0123
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
