import React, { useRef, useState, useEffect } from 'react';
import { PatientFormData, SimulatedPatient, HospitalAppointment } from '../types';
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
  Smartphone,
  Check,
  RefreshCw,
} from 'lucide-react';
import { SIMULATED_PATIENTS } from '../data/simulatedPatients';
import { getStoredAppointments } from '../utils/patientStorage';

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

  // Load online appointments synchronized from Patient Portal
  const [onlineAppointments, setOnlineAppointments] = useState<HospitalAppointment[]>([]);

  useEffect(() => {
    setOnlineAppointments(getStoredAppointments());
    const handler = () => setOnlineAppointments(getStoredAppointments());
    window.addEventListener('hospital-appointments-updated', handler);
    return () => window.removeEventListener('hospital-appointments-updated', handler);
  }, []);

  const handleSelectOnlineBooking = (app: HospitalAppointment) => {
    savedRmRef.current = app.nomorRekamMedis;
    onChange({
      namaPasien: app.patientNama,
      nik: app.patientNik,
      tanggalLahir: app.tanggalLahir,
      nomorRekamMedis: app.nomorRekamMedis,
      noAntrean: app.nomorAntrean,
      jadwalBooking: `${app.tanggalKunjungan}, ${app.jamKunjungan} (${app.poli})`,
      jamKedatangan: 'Hari ini (Tiba di Loket)',
      menitKeterlambatan: app.menitKeterlambatan ?? 0,
      poliTujuanAwal: app.poli,
      targetPoliStaf: app.poli === 'Poli Gigi' ? 'gigi' : app.poli === 'Poli Gigi Anak' ? 'anak' : 'umum',
      jenisKunjungan: 'booking',
      statusPasien: app.nomorRekamMedis.startsWith('RM-') ? 'lama' : 'baru',
      teksKeluhanBebas: app.keluhanUtama || '',
      ringkasanKeluhan: app.keluhanUtama || '',
      jenisPenjamin: app.jenisPenjamin,
      alergiTercatat: app.riwayatKesehatan?.alergi || '',
      penyakitMenahunTercatat: app.riwayatKesehatan?.penyakit_menahun || '',
      obatRutinTercatat: app.riwayatKesehatan?.obat_rutin || '',
      sedangHamil: app.riwayatKesehatan?.sedang_hamil === 'ya',
      statusAlergi: app.riwayatKesehatan?.alergi ? 'ada' : 'belum_ditanyakan',
      deskripsiAlergi: app.riwayatKesehatan?.alergi || '',
      statusPenyakitMenahun: app.riwayatKesehatan?.penyakit_menahun ? 'ada' : 'belum_ditanyakan',
      deskripsiPenyakitMenahun: app.riwayatKesehatan?.penyakit_menahun || '',
      statusObatRutin: app.riwayatKesehatan?.obat_rutin ? 'ada' : 'belum_ditanyakan',
      deskripsiObatRutin: app.riwayatKesehatan?.obat_rutin || '',
    });
  };

  const handleStatusChange = (newStatus: 'lama' | 'baru') => {
    if (newStatus === 'baru') {
      if (formData.nomorRekamMedis && formData.nomorRekamMedis !== '(Akan diterbitkan baru)') {
        savedRmRef.current = formData.nomorRekamMedis;
      }
      onChange({
        statusPasien: 'baru',
        nomorRekamMedis: '(Akan diterbitkan baru)',
        alergiTercatat: '',
        penyakitMenahunTercatat: '',
        obatRutinTercatat: '',
        sedangHamil: false,
        statusAlergi: 'belum_ditanyakan',
        deskripsiAlergi: '',
        statusPenyakitMenahun: 'belum_ditanyakan',
        deskripsiPenyakitMenahun: '',
        statusObatRutin: 'belum_ditanyakan',
        deskripsiObatRutin: '',
      });
    } else {
      // Restore previous RM number and its health history
      const restored =
        savedRmRef.current && savedRmRef.current !== '(Akan diterbitkan baru)'
          ? savedRmRef.current
          : 'RM-001049';
      const matched = SIMULATED_PATIENTS.find((p) => p.nomorRekamMedis === restored);
      onChange({
        statusPasien: 'lama',
        nomorRekamMedis: restored,
        alergiTercatat: matched?.riwayatKesehatan?.alergi || '',
        penyakitMenahunTercatat: matched?.riwayatKesehatan?.penyakit_menahun || '',
        obatRutinTercatat: matched?.riwayatKesehatan?.obat_rutin || '',
        sedangHamil: matched?.riwayatKesehatan?.sedang_hamil === 'ya',
        statusAlergi: matched?.riwayatKesehatan?.alergi ? 'ada' : 'belum_ditanyakan',
        deskripsiAlergi: matched?.riwayatKesehatan?.alergi || '',
        statusPenyakitMenahun: matched?.riwayatKesehatan?.penyakit_menahun ? 'ada' : 'belum_ditanyakan',
        deskripsiPenyakitMenahun: matched?.riwayatKesehatan?.penyakit_menahun || '',
        statusObatRutin: matched?.riwayatKesehatan?.obat_rutin ? 'ada' : 'belum_ditanyakan',
        deskripsiObatRutin: matched?.riwayatKesehatan?.obat_rutin || '',
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
      alergiTercatat: p.riwayatKesehatan?.alergi || '',
      penyakitMenahunTercatat: p.riwayatKesehatan?.penyakit_menahun || '',
      obatRutinTercatat: p.riwayatKesehatan?.obat_rutin || '',
      sedangHamil: p.riwayatKesehatan?.sedang_hamil === 'ya',
      statusAlergi: p.riwayatKesehatan?.alergi ? 'ada' : 'belum_ditanyakan',
      deskripsiAlergi: p.riwayatKesehatan?.alergi || '',
      statusPenyakitMenahun: p.riwayatKesehatan?.penyakit_menahun ? 'ada' : 'belum_ditanyakan',
      deskripsiPenyakitMenahun: p.riwayatKesehatan?.penyakit_menahun || '',
      statusObatRutin: p.riwayatKesehatan?.obat_rutin ? 'ada' : 'belum_ditanyakan',
      deskripsiObatRutin: p.riwayatKesehatan?.obat_rutin || '',
    });
  };

  const isBooking = formData.jenisKunjungan === 'booking';

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Langkah 1: Identifikasi Pasien &amp; Penetapan Poli
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Tentukan poli tujuan awal, jenis kedatangan, data antrean booking online, dan status rekam medis pasien.
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

      {/* SINKRONISASI DATA BOOKING ONLINE DARI PORTAL PASIEN */}
      {isBooking ? (
        <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 border-2 border-teal-500/60 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Sinkronisasi Otomatis Pasien Booking Online</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                    {onlineAppointments.length} Pasien Tersedia
                  </span>
                </h4>
                <p className="text-[11px] text-slate-600">
                  Data yang diinput pasien di <strong>Portal Pasien (POV Pasien)</strong> otomatis tersimpan. Klik pasien untuk mengisi formulir seketika tanpa ketik ulang!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOnlineAppointments(getStoredAppointments())}
              className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-white/80 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Perbarui data booking"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {onlineAppointments.map((app) => {
              const isLoaded = formData.noAntrean === app.nomorAntrean;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleSelectOnlineBooking(app)}
                  className={`p-3 rounded-xl border-2 text-left transition-all relative ${
                    isLoaded
                      ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-400'
                      : 'bg-white hover:bg-teal-50/60 border-slate-200 hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono font-black text-xs ${isLoaded ? 'text-teal-200' : 'text-teal-700'}`}>
                      {app.nomorAntrean}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLoaded
                          ? 'bg-white/20 text-white'
                          : app.statusPembayaran === 'Lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.statusPembayaran}
                    </span>
                  </div>
                  <div className={`font-bold text-xs truncate ${isLoaded ? 'text-white' : 'text-slate-900'}`}>
                    {app.patientNama}
                  </div>
                  <div className={`text-[11px] mt-0.5 truncate ${isLoaded ? 'text-teal-100' : 'text-slate-500'}`}>
                    {app.poli} • {app.jamKunjungan}
                  </div>
                  {isLoaded && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-teal-200">
                      <Check className="w-3 h-3" />
                      <span>Data Aktif Terpilih di Triase</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Mode Pasien Walk-In (Datang Langsung ke Loket RSGM)</h4>
            <p className="mt-0.5 text-amber-800">
              Pasien walk-in belum reservasi melalui aplikasi. Staf loket menginput identitas secara langsung di bawah atau memilih profil simulasi, lalu menentukan nomor antrean fisik.
            </p>
          </div>
        </div>
      )}

      {/* INFORMASI JADWAL BOOKING ONLINE TERVERIFIKASI */}
      {isBooking && (
        <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                Jadwal Kunjungan Booking Online
              </h4>
              <p className="text-xs text-slate-600">
                Jadwal: <strong>{formData.jadwalBooking || 'Hari ini, 08:30 WIB'}</strong> • Jam Kedatangan: <strong>{formData.jamKedatangan || '08:38 WIB'}</strong>
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>TERVERIFIKASI SISTEM BOOKING</span>
          </span>
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
