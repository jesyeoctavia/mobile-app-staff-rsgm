import React, { useRef } from 'react';
import { PatientFormData, SimulatedPatient } from '../types';
import {
  User,
  Calendar,
  Hash,
  Clock,
  Sparkles,
  Building,
  FileText,
  AlertCircle,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { SIMULATED_PATIENTS } from '../data/simulatedPatients';

interface Step1PatientIdentityProps {
  formData: PatientFormData;
  onChange: (updates: Partial<PatientFormData>) => void;
  onOpenAiMatching: () => void;
  onOpenMedicalRecord: (patient?: SimulatedPatient) => void;
  onNext: () => void;
}

export const Step1PatientIdentity: React.FC<Step1PatientIdentityProps> = ({
  formData,
  onChange,
  onOpenAiMatching,
  onOpenMedicalRecord,
  onNext,
}) => {
  // Store backup RM number so switching to 'baru' and back to 'lama' never loses the RM number
  const savedRmRef = useRef<string>(formData.nomorRekamMedis || 'RM-001049');

  const handleStatusChange = (newStatus: 'lama' | 'baru') => {
    if (newStatus === 'baru') {
      if (formData.nomorRekamMedis && formData.nomorRekamMedis !== '(Akan diterbitkan baru)') {
        savedRmRef.current = formData.nomorRekamMedis;
      }
      onChange({
        statusPasien: 'baru',
        nomorRekamMedis: '(Akan diterbitkan baru)',
      });
    } else {
      // Restore previous RM number!
      const restored =
        savedRmRef.current && savedRmRef.current !== '(Akan diterbitkan baru)'
          ? savedRmRef.current
          : 'RM-001049';
      onChange({
        statusPasien: 'lama',
        nomorRekamMedis: restored,
      });
    }
  };

  const handleQuickPickPatient = (p: SimulatedPatient) => {
    savedRmRef.current = p.nomorRekamMedis;
    onChange({
      namaPasien: p.nama,
      tanggalLahir: p.tanggalLahir,
      nomorRekamMedis: p.nomorRekamMedis,
      jadwalBooking: p.jadwalBooking,
      nik: p.nik || '',
      noAntrean: `BOK-${p.nomorRekamMedis.slice(-3)}`,
      poliTujuanAwal: p.poli === 'Poli Gigi' ? 'Poli Gigi' : 'Poli Umum',
      jenisKunjungan: 'booking',
      statusPasien: 'lama',
    });
  };

  // Toleransi keterlambatan STRICT: <= 10 menit = On-Time, > 10 menit = Terlambat
  const isOnTime = formData.menitKeterlambatan <= 10;
  const isBooking = formData.jenisKunjungan === 'booking';

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Langkah 1: Identifikasi Pasien &amp; Penetapan Poli
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Tentukan poli tujuan awal, jenis kedatangan, verifikasi status keterlambatan antrean, dan rekam medis pasien.
        </p>
      </div>

      {/* DROPDOWN POLI TUJUAN DI AWAL (Explicit upfront selector) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-teal-500 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600" />
            <span>Poli Tujuan Pasien (Pilih di Awal) *</span>
          </label>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Penetapan Awal
          </span>
        </div>

        <select
          value={formData.poliTujuanAwal || 'Poli Umum'}
          onChange={(e) => {
            const poli = e.target.value as PatientFormData['poliTujuanAwal'];
            onChange({
              poliTujuanAwal: poli,
              targetPoliStaf:
                poli === 'Poli Gigi' ? 'gigi' : poli === 'Poli Gigi Anak' ? 'anak' : 'umum',
            });
          }}
          className="w-full text-xs sm:text-sm font-bold text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
        >
          <option value="Poli Umum">Poli Umum (Pelayanan Medis Umum &amp; Penyakit Dalam)</option>
          <option value="Poli Gigi">Poli Gigi &amp; Mulut (Konservasi, Pencabutan &amp; Scaling)</option>
          <option value="Poli Gigi Anak">Poli Gigi Anak / Pedodonsia (Khusus Anak &lt; 12 Tahun)</option>
        </select>
      </div>

      {/* Jenis Kunjungan & Status Rekam Medis (With bug fix for restoring RM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Jenis Kunjungan */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Jenis Kedatangan Pasien
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ jenisKunjungan: 'booking' })}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
                formData.jenisKunjungan === 'booking'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Booking Online
            </button>
            <button
              type="button"
              onClick={() => onChange({ jenisKunjungan: 'walkin' })}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
                formData.jenisKunjungan === 'walkin'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Walk-In (Langsung)
            </button>
          </div>
        </div>

        {/* Status Rekam Medis Pasien */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Status Rekam Medis Pasien
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange('lama')}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
                formData.statusPasien === 'lama'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Pasien Lama (Punya RM)
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('baru')}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
                formData.statusPasien === 'baru'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Pasien Baru (Belum RM)
            </button>
          </div>
        </div>
      </div>

      {/* FITUR MONITOR KETEPATAN WAKTU & PANGGILAN ANTREAN (On-Time vs Terlambat) */}
      {isBooking && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
            isOnTime
              ? 'bg-emerald-50/80 border-emerald-400'
              : 'bg-amber-50/80 border-amber-400'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 mb-3 border-slate-200/60">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl text-white ${
                  isOnTime ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  Status Waktu Kedatangan Booking (Toleransi Maksimal 10 Menit)
                </h4>
                <p className="text-xs text-slate-600">
                  Jadwal: <strong>{formData.jadwalBooking || 'Hari ini, 09:00 WIB'}</strong> • Waktu Datang: <strong>{formData.jamKedatangan || '08:42 WIB'}</strong>
                </p>
              </div>
            </div>

            {/* LIVE PUNCTUALITY BADGE */}
            <div>
              {isOnTime ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>TEPAT WAKTU (ON-TIME)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-600 text-white shadow-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>TERLAMBAT (+{formData.menitKeterlambatan} MENIT)</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterlambatan Kedatangan Pasien:
              </label>
              <select
                value={formData.menitKeterlambatan}
                onChange={(e) => onChange({ menitKeterlambatan: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-bold"
              >
                <option value={0}>Tepat Waktu (0 menit - Hadir Sesuai Jadwal)</option>
                <option value={7}>Masuk Toleransi (7 menit keterlambatan &le; 10 menit)</option>
                <option value={10}>Batas Maksimal Toleransi (Tepat 10 menit)</option>
                <option value={15}>Terlambat &gt; 10 Menit (15 menit keterlambatan)</option>
                <option value={30}>Terlambat Tinggi (30 menit keterlambatan)</option>
              </select>
            </div>

            {/* Audio call out preview for front-desk */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 text-xs">
              <Volume2 className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                  Simulasi Panggilan Antrean Loket / Poli:
                </span>
                <span className="font-semibold text-slate-800">
                  "{formData.noAntrean || 'BOK-012'}, {formData.namaPasien || 'Pasien'}" —{' '}
                  <span className={isOnTime ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    [{isOnTime ? 'Status: On-Time' : `Status: Terlambat ${formData.menitKeterlambatan} Mnt`}]
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Patient Matching Banner (Fitur 2 trigger) */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Pencocokan Cerdas: Nomor Antrean Hilang / Lupa Kartu
            </h4>
            <p className="text-xs text-slate-600">
              Gunakan pencocokan data pintar lokal untuk mencari nama mirip (misal: "Muhamad" vs "Muhammad").
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAiMatching}
          className="shrink-0 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cari Pasien Pintar</span>
        </button>
      </div>

      {/* Patient Input Fields */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Data Identitas Pasien
          </span>

          {/* VIEW MEDICAL RECORD BUTTON FOR EXISTING PATIENTS */}
          {formData.statusPasien === 'lama' && (
            <button
              type="button"
              onClick={() => {
                const matched = SIMULATED_PATIENTS.find(
                  (p) =>
                    p.nomorRekamMedis.toLowerCase() === (formData.nomorRekamMedis || '').toLowerCase() ||
                    p.nama.toLowerCase().includes((formData.namaPasien || '').toLowerCase().trim())
                );
                onOpenMedicalRecord(matched || SIMULATED_PATIENTS[0]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl border border-sky-200 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>Lihat Berkas Rekam Medis (e-RM)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Pasien *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.namaPasien}
                onChange={(e) => onChange({ namaPasien: e.target.value })}
                placeholder="Contoh: Muhammad Rizky Pratama"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Rekam Medis (No RM)
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.nomorRekamMedis}
                onChange={(e) => {
                  savedRmRef.current = e.target.value;
                  onChange({ nomorRekamMedis: e.target.value });
                }}
                disabled={formData.statusPasien === 'baru'}
                placeholder="Contoh: RM-001049"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Lahir (DD-MM-YYYY)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.tanggalLahir}
                onChange={(e) => onChange({ tanggalLahir: e.target.value })}
                placeholder="14-05-1992"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIK Pasien (Opsional)
            </label>
            <input
              type="text"
              value={formData.nik}
              onChange={(e) => onChange({ nik: e.target.value })}
              placeholder="3171011405920001"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Slip Antrean
            </label>
            <input
              type="text"
              value={formData.noAntrean}
              onChange={(e) => onChange({ noAntrean: e.target.value })}
              placeholder="Contoh: BOK-049 atau A-12"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold"
            />
          </div>
        </div>

        {/* Quick Sample Profiles for Testing */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
            Pilih Cepat Profil Pasien Simulasi:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SIMULATED_PATIENTS.slice(0, 6).map((p) => (
              <button
                key={p.kode}
                type="button"
                onClick={() => handleQuickPickPatient(p)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors font-medium"
              >
                {p.nama.split(' ')[0]} ({p.poli})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.namaPasien.trim()}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs"
        >
          Lanjut ke Skrining Cepat &rarr;
        </button>
      </div>
    </div>
  );
};
