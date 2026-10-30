import React, { useState } from 'react';
import { PatientAccount, MedicalVisitRecord } from '../../types';
import { SIMULATED_PATIENTS } from '../../data/simulatedPatients';
import {
  FileText,
  Calendar,
  User,
  Pill,
  Activity,
  AlertTriangle,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Info,
} from 'lucide-react';

interface PatientMedicalRecordViewProps {
  patient: PatientAccount;
}

export const PatientMedicalRecordView: React.FC<PatientMedicalRecordViewProps> = ({ patient }) => {
  // Find full clinical history from simulated patients or fallback
  const matchedSimulated = SIMULATED_PATIENTS.find(
    (p) =>
      p.nomorRekamMedis.toLowerCase() === patient.nomorRekamMedis.toLowerCase() ||
      p.nama.toLowerCase().includes(patient.nama.toLowerCase())
  );

  const visitHistory: MedicalVisitRecord[] =
    matchedSimulated?.riwayatKunjungan && matchedSimulated.riwayatKunjungan.length > 0
      ? matchedSimulated.riwayatKunjungan
      : [
          {
            tanggal: 'Hari ini',
            poli: 'Poli Gigi',
            dokter: 'drg. Amanda Putri, Sp.KG',
            keluhanUtama: 'Pemeriksaan rutin berkala dan keluhan gigi berlubang.',
            diagnosisIcd10: 'K02.1 Karies Gigi / Gigi Berlubang Ringan',
            tindakanMedis: 'Pemeriksaan intraoral, penambalan komposit ringan.',
            resepObat: ['Paracetamol 500 mg (3x1 bila nyeri)', 'Chlorhexidine kumur oral'],
            tandaVital: {
              tekananDarah: '120/80 mmHg',
              nadi: '76 x/menit',
              suhu: '36.5 °C',
            },
            catatanDokter: 'Jaga kebersihan gigi, sikat gigi minimal 2 kali sehari setelah makan dan sebelum tidur.',
          },
        ];

  const [selectedVisitIndex, setSelectedVisitIndex] = useState(0);
  const activeVisit = visitHistory[selectedVisitIndex] || visitHistory[0];

  return (
    <div className="space-y-6">
      {/* Header Notice */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
                Patient Portal e-RM (Read-Only)
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Ringkasan Rekam Medis Elektronik
              </h2>
              <p className="text-xs text-teal-100">
                Data resmi kunjungan klinis pasien RSGM Maranatha. Disajikan dengan ringkasan ramah awam.
              </p>
            </div>
          </div>

          <div className="bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-mono font-bold text-teal-200">
            {patient.nomorRekamMedis}
          </div>
        </div>

        {/* Read-only Security Banner */}
        <div className="mt-4 p-3 bg-teal-900/50 rounded-2xl border border-teal-400/30 flex items-start gap-2.5 text-xs text-teal-100">
          <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
          <span>
            <strong>Hak Akses Pasien:</strong> Halaman ini bersifat <em>Hanya Baca (Read-Only)</em> demi keamanan rekam medis nasional. Riwayat diagnosis, resep, dan tindakan hanya dapat divalidasi oleh Dokter Penanggung Jawab Pasien (DPJP).
          </span>
        </div>
      </div>

      {/* Health Profile Strip (Alergi, Penyakit Menahun, Obat Rutin) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Profil Kesehatan &amp; Riwayat Terverifikasi</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-rose-800 block">Riwayat Alergi Obat / Makanan</span>
            <span className="font-bold text-rose-950 mt-1 block">
              {patient.riwayatKesehatan?.alergi ? `⚠️ ${patient.riwayatKesehatan.alergi}` : 'Tidak Ada Alergi Tercatat'}
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-amber-800 block">Penyakit Menahun</span>
            <span className="font-bold text-amber-950 mt-1 block">
              {patient.riwayatKesehatan?.penyakit_menahun || 'Tidak Ada Penyakit Menahun'}
            </span>
          </div>

          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-sky-800 block">Obat Rutin Dikonsumsi</span>
            <span className="font-bold text-sky-950 mt-1 block">
              {patient.riwayatKesehatan?.obat_rutin || 'Tidak Ada Obat Rutin'}
            </span>
          </div>
        </div>
      </div>

      {/* Visit History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List of Past Visits */}
        <div className="lg:col-span-1 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Riwayat Kunjungan ({visitHistory.length})
          </h4>
          <div className="space-y-2">
            {visitHistory.map((v, idx) => {
              const isSelected = selectedVisitIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedVisitIndex(idx)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/80 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">{v.tanggal}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {v.poli}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-teal-800 truncate">{v.dokter}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{v.keluhanUtama}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Visit Details */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                Lembar Hasil Pemeriksaan Medis
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Kunjungan {activeVisit.tanggal} • {activeVisit.poli}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 block">{activeVisit.dokter}</span>
              <span className="text-[11px] text-slate-500">Dokter Penanggung Jawab</span>
            </div>
          </div>

          {/* Vital Signs */}
          {activeVisit.tandaVital && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Tanda-Tanda Vital Saat Pemeriksaan</span>
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Tekanan Darah</span>
                  <span className="font-extrabold text-slate-900">{activeVisit.tandaVital.tekananDarah}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Denyut Nadi</span>
                  <span className="font-extrabold text-slate-900">{activeVisit.tandaVital.nadi}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Suhu Tubuh</span>
                  <span className="font-extrabold text-slate-900">{activeVisit.tandaVital.suhu}</span>
                </div>
              </div>
            </div>
          )}

          {/* Keluhan & Diagnosis */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Keluhan Utama Pasien
              </span>
              <p className="text-slate-800 mt-1 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                "{activeVisit.keluhanUtama}"
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Diagnosis Dokter (Versi Ramah Awam)
              </span>
              <div className="mt-1 p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-teal-900 font-bold flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{activeVisit.diagnosisIcd10}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Tindakan Medis Yang Dilakukan
              </span>
              <p className="text-slate-800 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {activeVisit.tindakanMedis}
              </p>
            </div>
          </div>

          {/* Resep Obat & Instruksi Minum */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              <span>Resep Obat &amp; Petunjuk Penggunaan</span>
            </span>
            <div className="space-y-2">
              {activeVisit.resepObat.map((obat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{obat}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Resep Sah Dokter
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Catatan Edukasi Dokter */}
          {activeVisit.catatanDokter && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 block mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                <span>Pesan &amp; Catatan Edukasi dari Dokter:</span>
              </span>
              <p className="text-amber-950 font-medium">{activeVisit.catatanDokter}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
