import React, { useState, useEffect, useRef } from 'react';
import {
  PatientFormData,
  StaffAccount,
  StaffTimerColor,
  SuratKeteranganKematian,
} from '../types';
import { SuratKeteranganKematianModal } from './SuratKeteranganKematianModal';
import { UpdateRegistrasiDaruratModal } from './UpdateRegistrasiDaruratModal';
import {
  Clock,
  Pause,
  Play,
  RotateCcw,
  Flame,
  AlertTriangle,
  HeartOff,
  UserCheck,
  FileEdit,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  X,
  Building,
} from 'lucide-react';

interface StaffPatientStatusManagerProps {
  formData: PatientFormData;
  onChange: (updates: Partial<PatientFormData>) => void;
  currentStaff?: StaffAccount | null;
  onShowToast: (msg: string) => void;
}

export const StaffPatientStatusManager: React.FC<StaffPatientStatusManagerProps> = ({
  formData,
  onChange,
  currentStaff,
  onShowToast,
}) => {
  // Timer State
  const [seconds, setSeconds] = useState<number>(formData.durasiInputDetik || 0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isBypassed, setIsBypassed] = useState<boolean>(Boolean(formData.alasanBypassTimer));
  const [bypassReason, setBypassReason] = useState<string>(formData.alasanBypassTimer || '');
  const [isBypassModalOpen, setIsBypassModalOpen] = useState<boolean>(false);

  // Fast-track Emergency & Modals state
  const [isEmergencyDropdownOpen, setIsEmergencyDropdownOpen] = useState<boolean>(false);
  const [isUpdateRegistrasiModalOpen, setIsUpdateRegistrasiModalOpen] = useState<boolean>(false);
  const [isSkkModalOpen, setIsSkkModalOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-run timer when component mounts or when not bypassed
  useEffect(() => {
    // If patient is marked deceased, freeze timer
    if (formData.statusPelayananKhusus === 'meninggal_dunia') {
      setIsTimerRunning(false);
      return;
    }

    if (isTimerRunning && !isBypassed) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          // Periodically sync back to formData
          if (next % 5 === 0) {
            onChange({ durasiInputDetik: next });
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isBypassed, formData.statusPelayananKhusus]);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine timer indicator color based on criteria:
  // Hijau (< 3 menit: 0 - 179s)
  // Kuning (3 - 5 menit: 180s - 300s)
  // Merah (> 5 menit: > 300s)
  const getTimerColor = (sec: number): StaffTimerColor => {
    if (sec < 180) return 'hijau';
    if (sec <= 300) return 'kuning';
    return 'merah';
  };

  const timerColor = getTimerColor(seconds);

  const handleApplyBypass = (reason: string) => {
    setIsBypassed(true);
    setIsTimerRunning(false);
    setBypassReason(reason);
    onChange({ alasanBypassTimer: reason });
    setIsBypassModalOpen(false);
    onShowToast(`Timer pelayanan di-bypass: ${reason}`);
  };

  const handleResumeTimer = () => {
    setIsBypassed(false);
    setIsTimerRunning(true);
    setBypassReason('');
    onChange({ alasanBypassTimer: '' });
    onShowToast('Timer penginputan staf dilanjutkan.');
  };

  const handleResetTimer = () => {
    setSeconds(0);
    setIsTimerRunning(true);
    setIsBypassed(false);
    setBypassReason('');
    onChange({ durasiInputDetik: 0, alasanBypassTimer: '' });
    onShowToast('Timer penginputan staf di-reset.');
  };

  // Trigger Fast-Track Emergency Instant Registration
  const handleFastTrackEmergency = (genderType: 'Tn. X' | 'Ny. X' | 'An. X') => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const tempRm = `RMS-EMG-${randomSuffix}`;
    const tempAntrean = `IGD-EMG-${randomSuffix.toString().slice(0, 2)}`;

    onChange({
      namaPasien: `${genderType} (Pasien Kritis Darurat)`,
      idSementara: genderType,
      nomorRekamMedis: tempRm,
      noAntrean: tempAntrean,
      kondisiGawatDarurat: true,
      tandaBahayaGigi: false,
      kategoriPrioritas: 'disabilitas', // automatically highest priority
      poliTujuanAwal: 'Poli Umum',
      jenisKunjungan: 'walkin',
      statusPasien: 'baru',
      statusPelayananKhusus: 'fast_track_igd',
      isFastTrackEmergency: true,
      dataRegistrasiStabilDiupdate: false,
      teksKeluhanBebas: `[FAST-TRACK EMERGENCY IGD] Pasien tiba dalam kondisi gawat darurat tidak dikenal (${genderType}). Memerlukan tindakan resusitasi & stabilisasi medis segera tanpa menunggu kelengkapan administrasi.`,
      usiaPasienTahun: genderType === 'An. X' ? 5 : 35,
    });

    setIsEmergencyDropdownOpen(false);
    onShowToast(`🚨 Mode Fast-Track IGD Aktif: Diterbitkan ${genderType} (${tempRm})`);
  };

  // Trigger Deceased status (Meninggal Dunia)
  const handleDeclareDeceased = () => {
    // 1. Immediately freeze timer
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // 2. Update status to deceased
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    onChange({
      statusPelayananKhusus: 'meninggal_dunia',
      waktuKematian: nowTime,
    });

    // 3. Open Surat Keterangan Kematian (SKK) form
    setIsSkkModalOpen(true);
    onShowToast('Status Pasien: Meninggal Dunia. Timer pelayanan dihentikan.');
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs mb-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          {/* LEFT: Patient Mode & Identity Status Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                formData.statusPelayananKhusus === 'meninggal_dunia'
                  ? 'bg-rose-950 text-rose-300'
                  : formData.isFastTrackEmergency
                  ? 'bg-rose-600 text-white animate-pulse'
                  : formData.jenisKunjungan === 'walkin'
                  ? 'bg-teal-600 text-white'
                  : 'bg-sky-600 text-white'
              }`}
            >
              {formData.statusPelayananKhusus === 'meninggal_dunia' ? (
                <HeartOff className="w-5 h-5" />
              ) : formData.isFastTrackEmergency ? (
                <Flame className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-500">
                  Modul Status Pasien:
                </span>

                {formData.statusPelayananKhusus === 'meninggal_dunia' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-900 text-rose-100 flex items-center gap-1 shadow-2xs">
                    <HeartOff className="w-3 h-3" />
                    <span>PASIEN MENINGGAL DUNIA</span>
                  </span>
                ) : formData.isFastTrackEmergency ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 shadow-2xs animate-pulse">
                    <Flame className="w-3 h-3" />
                    <span>FAST-TRACK IGD (DARURAT)</span>
                  </span>
                ) : formData.jenisKunjungan === 'walkin' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Pasien Walk-In (Reguler Loket)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                    Pasien Booking Online
                  </span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                <span className="truncate max-w-[200px] sm:max-w-xs">
                  {formData.namaPasien || 'Pasien Tanpa Nama'}
                </span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="font-mono text-[11px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                  {formData.nomorRekamMedis || 'RM-Belum Ada'}
                </span>
                {formData.dataRegistrasiStabilDiupdate && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Data Stabil Terverifikasi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CENTER: AUTO-RUNNING STAFF INPUT TIMER WITH COLOR INDICATORS & BYPASS */}
          <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider hidden sm:inline">
                Timer Input Staf:
              </span>

              {/* Timer Pill with Color Logic */}
              <div
                className={`px-3 py-1 rounded-xl font-mono font-black text-sm sm:text-base flex items-center gap-1.5 border transition-all ${
                  isBypassed
                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                    : timerColor === 'hijau'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                    : timerColor === 'kuning'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-2xs'
                    : 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse shadow-2xs'
                }`}
                title={
                  isBypassed
                    ? `Timer Di-Bypass: ${bypassReason}`
                    : timerColor === 'hijau'
                    ? 'Hijau: Waktu Standar (<3 menit)'
                    : timerColor === 'kuning'
                    ? 'Kuning: Perhatian (3-5 menit)'
                    : 'Merah: Peringatan Melebihi SLA (>5 menit)'
                }
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>{formatTime(seconds)}</span>
              </div>
            </div>

            {/* Indicator label badge */}
            <div>
              {isBypassed ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-200/70 text-purple-900 border border-purple-300 flex items-center gap-1">
                  <Pause className="w-3 h-3" />
                  <span className="truncate max-w-[130px]" title={bypassReason}>
                    Bypass: {bypassReason || 'Keterbatasan Khusus'}
                  </span>
                </span>
              ) : timerColor === 'hijau' ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-200/70 text-emerald-900 border border-emerald-300">
                  🟢 Standar (&lt;3 Mnt)
                </span>
              ) : timerColor === 'kuning' ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200/80 text-amber-950 border border-amber-300">
                  🟡 Perhatian (3-5 Mnt)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-200 text-rose-950 border border-rose-300 animate-pulse">
                  🔴 Melebihi Batas (&gt;5 Mnt)
                </span>
              )}
            </div>

            {/* Timer Actions: Pause / Bypass / Resume / Reset */}
            <div className="flex items-center gap-1 ml-auto">
              {isBypassed ? (
                <button
                  type="button"
                  onClick={handleResumeTimer}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                  title="Lanjutkan timer input staf"
                >
                  <Play className="w-3 h-3" />
                  <span className="hidden sm:inline">Lanjutkan</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsBypassModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-1 transition-colors shadow-2xs"
                  title="Bypass / Jeda timer jika pasien memiliki kendala komunikasi atau keterbatasan khusus"
                >
                  <Pause className="w-3 h-3 text-amber-600" />
                  <span className="hidden sm:inline">Bypass / Jeda</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetTimer}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="Reset timer ke 00:00"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT: EMERGENCY ACTIONS & STATUS PENANGANAN KHUSUS */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Fast-Track Emergency Instant Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEmergencyDropdownOpen(!isEmergencyDropdownOpen)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all animate-pulse"
                title="Registrasi instan gawat darurat tanpa input identitas lengkap"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Fast-Track IGD</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Instant ID selection dropdown */}
              {isEmergencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-40 animate-fadeIn text-xs">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                    Pilih ID Sementara Pasien Kritis:
                  </div>
                  <div className="space-y-1 py-1">
                    <button
                      type="button"
                      onClick={() => handleFastTrackEmergency('Tn. X')}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-50 text-slate-800 font-bold flex items-center justify-between"
                    >
                      <span>👤 Tn. X (Pria Tidak Dikenal)</span>
                      <span className="text-[10px] text-rose-600 font-mono font-normal">IGD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFastTrackEmergency('Ny. X')}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-50 text-slate-800 font-bold flex items-center justify-between"
                    >
                      <span>👤 Ny. X (Wanita Tidak Dikenal)</span>
                      <span className="text-[10px] text-rose-600 font-mono font-normal">IGD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFastTrackEmergency('An. X')}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-50 text-slate-800 font-bold flex items-center justify-between"
                    >
                      <span>👶 An. X (Anak Tidak Dikenal)</span>
                      <span className="text-[10px] text-rose-600 font-mono font-normal">IGD</span>
                    </button>
                  </div>
                  <div className="px-2 py-1 text-[10px] text-slate-400 border-t border-slate-100">
                    Otomatis membuat nomor RM sementara dan bypass formulir ke prioritas gawat darurat.
                  </div>
                </div>
              )}
            </div>

            {/* 2. Update Data Registrasi (shown when emergency / temporary ID is active) */}
            {(formData.isFastTrackEmergency || formData.idSementara) && (
              <button
                type="button"
                onClick={() => setIsUpdateRegistrasiModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                title="Lengkapi identitas asli pasien setelah kondisi stabil"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Update Registrasi (Pasien Stabil)</span>
              </button>
            )}

            {/* 3. Status Pasien Meninggal Dunia & Form SKK */}
            <button
              type="button"
              onClick={handleDeclareDeceased}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs ${
                formData.statusPelayananKhusus === 'meninggal_dunia'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-slate-800 hover:bg-rose-950 hover:text-rose-200 text-slate-300 border border-slate-700'
              }`}
              title="Deklarasi kematian pasien, hentikan timer, dan terbitkan Surat Keterangan Kematian (SKK)"
            >
              <HeartOff className="w-3.5 h-3.5 text-rose-400" />
              <span>{formData.statusPelayananKhusus === 'meninggal_dunia' ? 'Lihat / Cetak SKK' : 'Meninggal Dunia (SKK)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: BYPASS / PAUSE TIMER WITH REASONS */}
      {isBypassModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Pause className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Bypass / Jeda Timer Staf</h3>
                  <p className="text-[11px] text-slate-400">Pilih alasan penyesuaian durasi input</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBypassModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">
                Pemberian dispensasi waktu penginputan loket sesuai SOP Rumah Sakit untuk kondisi khusus berikut:
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleApplyBypass('Kendala Komunikasi / Bahasa / Bisu-Tuli')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/60 font-semibold text-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>🗣️ Kendala Komunikasi / Bahasa / Bisu-Tuli</span>
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-bold">Pilih</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyBypass('Pasien Disabilitas Fisik / Lansia Geriatri')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/60 font-semibold text-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>🦯 Pasien Disabilitas Fisik / Lansia Geriatri</span>
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-bold">Pilih</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyBypass('Gangguan Sistem Jaringan SIMRS / Koneksi Bridging')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/60 font-semibold text-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>💻 Gangguan Sistem Jaringan SIMRS / Bridging</span>
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-bold">Pilih</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyBypass('Pendampingan Khusus / Pasien Butuh Bantuan Darurat')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/60 font-semibold text-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>🤝 Pendampingan Khusus Keluarga Pasien</span>
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-bold">Pilih</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsBypassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE REGISTRASI PASIEN SETELAH STABIL */}
      <UpdateRegistrasiDaruratModal
        isOpen={isUpdateRegistrasiModalOpen}
        onClose={() => setIsUpdateRegistrasiModalOpen(false)}
        formData={formData}
        onSaveUpdates={(updates) => {
          onChange(updates);
          onShowToast(`Data registrasi ${updates.namaPasien || 'pasien'} berhasil diperbarui ke SIMRS.`);
        }}
      />

      {/* MODAL 3: SURAT KETERANGAN KEMATIAN (SKK) */}
      <SuratKeteranganKematianModal
        isOpen={isSkkModalOpen}
        onClose={() => setIsSkkModalOpen(false)}
        formData={formData}
        currentStaff={currentStaff}
        onSaveSkk={(skk) => {
          onShowToast(`Dokumen SKK Nomor ${skk.nomorSurat} berhasil disimpan dan diarsipkan.`);
        }}
      />
    </>
  );
};
