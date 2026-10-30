import React, { useState } from 'react';
import { HospitalAppointment, PatientAccount } from '../../types';
import { DOCTOR_SCHEDULES } from '../../data/doctorSchedules';
import { saveNewAppointment } from '../../utils/patientStorage';
import {
  Calendar,
  Clock,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  ChevronRight,
  Send,
  CreditCard,
} from 'lucide-react';

interface PatientBookingFormProps {
  patient: PatientAccount;
  onBookingSuccess: (appointment: HospitalAppointment) => void;
  onCancel: () => void;
}

export const PatientBookingForm: React.FC<PatientBookingFormProps> = ({
  patient,
  onBookingSuccess,
  onCancel,
}) => {
  const [selectedPoli, setSelectedPoli] = useState<'Poli Gigi' | 'Poli Umum' | 'Poli Gigi Anak'>('Poli Gigi');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    DOCTOR_SCHEDULES.find((d) => d.poli === 'Poli Gigi')?.id || DOCTOR_SCHEDULES[0].id
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSession, setSelectedSession] = useState<'Pagi' | 'Sore'>('Pagi');
  const [keluhanUtama, setKeluhanUtama] = useState('');
  const [penjamin, setPenjamin] = useState<'bpjs' | 'umum' | 'asuransi_swasta'>('bpjs');

  // Health history state pre-filled from patient profile
  const [alergi, setAlergi] = useState(patient.riwayatKesehatan?.alergi || '');
  const [penyakitMenahun, setPenyakitMenahun] = useState(patient.riwayatKesehatan?.penyakit_menahun || '');
  const [obatRutin, setObatRutin] = useState(patient.riwayatKesehatan?.obat_rutin || '');
  const [sedangHamil, setSedangHamil] = useState(patient.riwayatKesehatan?.sedang_hamil === 'ya');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter doctors according to selected poli
  const availableDoctors = DOCTOR_SCHEDULES.filter((d) => {
    if (selectedPoli === 'Poli Gigi') return d.poli === 'Poli Gigi';
    if (selectedPoli === 'Poli Gigi Anak') return d.poli.includes('Anak') || d.poli === 'Poli Gigi';
    return d.poli === 'Poli Umum';
  });

  const selectedDoctor = DOCTOR_SCHEDULES.find((d) => d.id === selectedDoctorId) || availableDoctors[0];

  const handlePoliChange = (poli: 'Poli Gigi' | 'Poli Umum' | 'Poli Gigi Anak') => {
    setSelectedPoli(poli);
    const doc = DOCTOR_SCHEDULES.find((d) => {
      if (poli === 'Poli Gigi') return d.poli === 'Poli Gigi';
      if (poli === 'Poli Gigi Anak') return d.poli.includes('Anak') || d.poli === 'Poli Gigi';
      return d.poli === 'Poli Umum';
    });
    if (doc) setSelectedDoctorId(doc.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!keluhanUtama.trim()) {
      setErrorMsg('Harap ceritakan keluhan utama yang Anda rasakan secara singkat.');
      return;
    }

    setIsSubmitting(true);

    const jamEstimasi = selectedSession === 'Pagi' ? '08:45 WIB' : '14:15 WIB';

    const newAppointment = saveNewAppointment({
      patientNik: patient.nik,
      patientNama: patient.nama,
      nomorRekamMedis: patient.nomorRekamMedis,
      tanggalLahir: patient.tanggalLahir,
      telepon: patient.telepon,
      poli: selectedPoli,
      dokterId: selectedDoctor.id,
      namaDokter: selectedDoctor.namaDokter,
      tanggalKunjungan: selectedDate,
      jamKunjungan: jamEstimasi,
      sesi: selectedSession,
      keluhanUtama: keluhanUtama.trim(),
      riwayatKesehatan: {
        alergi: alergi.trim(),
        penyakit_menahun: penyakitMenahun.trim(),
        obat_rutin: obatRutin.trim(),
        sedang_hamil: sedangHamil ? 'ya' : 'tidak',
      },
      jenisPenjamin: penjamin,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onBookingSuccess(newAppointment);
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Form Title Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block mb-1">
              Pendaftaran Online Mandiri
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Booking Janji Temu Dokter RSGM Maranatha
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 mt-1">
              Reservasi nomor antrean tanpa antre manual di loket pendaftaran fisik.
            </p>
          </div>
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/10 border border-white/20 items-center justify-center text-teal-300">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Sync Guarantee Notice */}
        <div className="mt-4 p-3 rounded-2xl bg-teal-900/60 border border-teal-400/30 flex items-start gap-2.5 text-xs text-teal-100">
          <Sparkles className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
          <span>
            <strong>Sinkronisasi Instan ke SIMRS Staf:</strong> Data booking Anda akan otomatis muncul di sistem loket pendaftaran. Anda tidak perlu mengisi formulir kertas saat tiba.
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Pilih Poli Tujuan */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">1</span>
            <span>Pilih Poliklinik Tujuan *</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'Poli Gigi' as const,
                title: 'Poli Gigi & Mulut',
                desc: 'Tambal, scaling, cabut gigi, perawatan saraf & konservasi',
                icon: '🦷',
              },
              {
                id: 'Poli Umum' as const,
                title: 'Poli Umum',
                desc: 'Penyakit dalam, demam, flu, hipertensi & pemeriksaan rutin',
                icon: '🩺',
              },
              {
                id: 'Poli Gigi Anak' as const,
                title: 'Poli Gigi Anak (Pedodonsia)',
                desc: 'Khusus pasien anak usia di bawah 12 tahun',
                icon: '👶',
              },
            ].map((p) => {
              const isSelected = selectedPoli === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePoliChange(p.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl">{p.icon}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{p.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Pilih Dokter Spesialis */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">2</span>
            <span>Pilih Dokter &amp; Ruangan Praktik *</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableDoctors.map((doc) => {
              const isSelected = selectedDoctorId === doc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{doc.namaDokter}</h4>
                      <p className="text-[11px] text-teal-700 font-semibold mt-0.5">{doc.gelar}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{doc.ruangPeriksa}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      Sesi: {doc.sesi}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Tanggal & Sesi Kedatangan */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">3</span>
            <span>Jadwal &amp; Sesi Kunjungan *</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Kunjungan
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilihan Sesi Pelayanan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSession('Pagi')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    selectedSession === 'Pagi'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Sesi Pagi (08:00 - 12:00)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSession('Sore')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    selectedSession === 'Sore'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Sesi Sore (13:00 - 17:00)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Keluhan Utama Pasien */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">4</span>
            <span>Keluhan Utama Yang Dirasakan *</span>
          </label>
          <div>
            <textarea
              rows={3}
              value={keluhanUtama}
              onChange={(e) => setKeluhanUtama(e.target.value)}
              placeholder="Contoh: Gigi belakang terasa nyeri saat mengunyah makanan keras, gusi terasa agak ngilu sejak 2 hari lalu..."
              className="w-full p-3.5 text-xs sm:text-sm border border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Deskripsi keluhan ini akan langsung diteruskan ke lembar triase dokter &amp; front-desk.
            </span>
          </div>
        </div>

        {/* Step 5: Riwayat Kesehatan Penting Pasien */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">5</span>
            <span>Konfirmasi Riwayat Alergi &amp; Penyakit Menahun Pasien</span>
          </label>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Riwayat Alergi (Obat / Makanan):
                </label>
                <input
                  type="text"
                  value={alergi}
                  onChange={(e) => setAlergi(e.target.value)}
                  placeholder="Contoh: Penisilin, Udang, atau kosongkan jika tidak ada"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Penyakit Menahun (Hipertensi/Diabetes/Asma):
                </label>
                <input
                  type="text"
                  value={penyakitMenahun}
                  onChange={(e) => setPenyakitMenahun(e.target.value)}
                  placeholder="Contoh: Hipertensi, Asma, atau tidak ada"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Obat Rutin Yang Sedang Dikonsumsi:
                </label>
                <input
                  type="text"
                  value={obatRutin}
                  onChange={(e) => setObatRutin(e.target.value)}
                  placeholder="Contoh: Amlodipine 5mg atau tidak ada"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              {patient.jenisKelamin === 'Perempuan' && (
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="hamilCheck"
                    checked={sedangHamil}
                    onChange={(e) => setSedangHamil(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <label htmlFor="hamilCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Sedang Hamil / Menyusui
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 6: Jenis Penjamin Pembayaran */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">6</span>
            <span>Jenis Penjamin Layanan</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'bpjs' as const, label: 'BPJS Kesehatan', desc: 'Cover 100% rujukan faskes 1' },
              { id: 'umum' as const, label: 'Pasien Umum / Mandiri', desc: 'Bayar mandiri QRIS / Loket' },
              { id: 'asuransi_swasta' as const, label: 'Asuransi Swasta', desc: 'Prudential, Sinarmas, dll.' },
            ].map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => setPenjamin(j.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  penjamin === j.id
                    ? 'border-teal-600 bg-teal-50/70 font-bold'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{j.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{j.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:bg-slate-400"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Menerbitkan Nomor Antrean...' : 'Konfirmasi Booking & Terbitkan Antrean'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
