import React, { useState } from 'react';
import { SimulatedPatient } from '../types';
import {
  X,
  FileText,
  AlertTriangle,
  HeartPulse,
  Pill,
  Calendar,
  Stethoscope,
  User,
  ShieldCheck,
  Search,
  CheckCircle,
} from 'lucide-react';

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: SimulatedPatient | null;
  allPatients: SimulatedPatient[];
  onSelectPatient: (p: SimulatedPatient) => void;
}

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  isOpen,
  onClose,
  patient,
  allPatients,
  onSelectPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const currentPatient = patient || allPatients[0];

  const filteredPatients = allPatients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.nama.toLowerCase().includes(q) ||
      p.nomorRekamMedis.toLowerCase().includes(q) ||
      p.poli.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold">
                    Berkas Rekam Medis Elektronik (e-RM)
                  </h3>
                  <span className="px-2 py-0.5 text-[11px] font-mono bg-teal-800 text-teal-200 rounded border border-teal-700">
                    SIMRS Terpadu
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Data Identitas, Riwayat Berobat, Diagnosis ICD-10, Tindakan Medis &amp; Kewaspadaan Alergi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content: Split View on Desktop */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar: Patient Switcher */}
            <div className="w-full md:w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
              <div className="p-3 border-b border-slate-200">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pasien / No RM..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-200 max-h-44 md:max-h-none">
                {filteredPatients.map((p) => {
                  const isSelected = currentPatient.kode === p.kode;
                  return (
                    <button
                      key={p.kode}
                      type="button"
                      onClick={() => onSelectPatient(p)}
                      className={`w-full text-left p-3 text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-50 text-teal-950 font-bold border-l-4 border-teal-600'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{p.nama}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {p.nomorRekamMedis} • {p.poli}
                        </div>
                      </div>
                      {p.alergi.ada && (
                        <span className="w-2 h-2 rounded-full bg-red-500" title="Ada Alergi" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Record Detail View */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 bg-white">
              {/* Patient Identity Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {currentPatient.nama}
                      </h4>
                      <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-xs font-bold">
                        {currentPatient.nomorRekamMedis}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      NIK: {currentPatient.nik || '-'} • Golongan Darah: <strong>{currentPatient.golonganDarah}</strong>
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-400 block font-medium">Poli Langganan:</span>
                    <span className="font-bold text-teal-700">{currentPatient.poli}</span>
                  </div>
                </div>

                {/* Identity Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3">
                  <div>
                    <span className="text-slate-400 block">Tgl Lahir / Usia:</span>
                    <strong className="text-slate-800">{currentPatient.tanggalLahir}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Jenis Kelamin:</span>
                    <strong className="text-slate-800">{currentPatient.jenisKelamin}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nomor Telepon:</span>
                    <strong className="text-slate-800 font-mono">{currentPatient.telepon || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Alamat Domisili:</span>
                    <span className="text-slate-800 font-medium line-clamp-1">{currentPatient.alamat}</span>
                  </div>
                </div>
              </div>

              {/* RIWAYAT KESEHATAN PENTING SIMRS (Alergi, Penyakit Menahun, Obat Rutin, Sedang Hamil) */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Riwayat Kesehatan Penting (Tercatat di Profil Pasien)</span>
                  </h5>
                  <span className="text-[10px] text-slate-500 italic">
                    *Kosong = Belum tercatat di sistem (bukan berarti tidak punya)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-400 block font-medium">Alergi:</span>
                    <strong className={currentPatient.riwayatKesehatan?.alergi ? 'text-amber-800' : 'text-slate-400 font-normal italic'}>
                      {currentPatient.riwayatKesehatan?.alergi || 'Belum tercatat (kosong)'}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-400 block font-medium">Penyakit Menahun:</span>
                    <strong className={currentPatient.riwayatKesehatan?.penyakit_menahun ? 'text-indigo-950' : 'text-slate-400 font-normal italic'}>
                      {currentPatient.riwayatKesehatan?.penyakit_menahun || 'Belum tercatat (kosong)'}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-400 block font-medium">Obat Rutin:</span>
                    <strong className={currentPatient.riwayatKesehatan?.obat_rutin ? 'text-indigo-950' : 'text-slate-400 font-normal italic'}>
                      {currentPatient.riwayatKesehatan?.obat_rutin || 'Belum tercatat (kosong)'}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-400 block font-medium">Sedang Hamil:</span>
                    <strong className={currentPatient.riwayatKesehatan?.sedang_hamil === 'ya' ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      {currentPatient.riwayatKesehatan?.sedang_hamil === 'ya' ? 'Ya (Hamil)' : 'Tidak'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* CRITICAL: ALERGI & KOMORBIDITAS BANNER */}
              <div className="space-y-3">
                {currentPatient.alergi.ada || currentPatient.riwayatKesehatan?.alergi ? (
                  <div className="p-4 bg-red-50 border-2 border-red-400 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-red-950 flex items-center gap-2">
                        <span>PERINGATAN: PASIEN MEMILIKI RIWAYAT ALERGI OBAT / MAKANAN</span>
                        <span className="px-2 py-0.2 bg-red-200 text-red-800 rounded text-[10px] uppercase font-black">
                          WASPADA
                        </span>
                      </h5>
                      <p className="mt-1 text-xs font-bold text-red-900">
                        {currentPatient.riwayatKesehatan?.alergi || currentPatient.alergi.daftarAlergi.join(', ')}
                      </p>
                      <p className="text-[11px] text-red-700 mt-1 italic">
                        *Wajib dikonfirmasi sebelum dokter meresepkan antibiotik atau analgesik.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
                    <HeartPulse className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>
                      <strong>Status Alergi Obat:</strong> Belum ada catatan reaksi alergi obat di berkas kunjungan sebelumnya.
                    </span>
                  </div>
                )}
              </div>

              {/* RIWAYAT BEROBAT / KUNJUNGAN TERDAHULU */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    Riwayat Kunjungan &amp; Rekam Medis Sebelumnya ({currentPatient.riwayatKunjungan.length})
                  </h5>
                  <span className="text-[11px] text-slate-500">
                    Tersinkronisasi dengan odontogram &amp; catatan SIMRS
                  </span>
                </div>

                {currentPatient.riwayatKunjungan.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Belum ada riwayat kunjungan sebelumnya untuk pasien ini.
                  </div>
                ) : (
                  currentPatient.riwayatKunjungan.map((kunj, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                    >
                      {/* Visit Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                            {kunj.tanggal}
                          </span>
                          <span className="font-semibold text-slate-800 text-xs">
                            {kunj.poli}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          Dokter: <strong>{kunj.dokter}</strong>
                        </div>
                      </div>

                      {/* Vital Signs Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                        <div>
                          <span className="text-slate-400">TD:</span>{' '}
                          <strong>{kunj.tandaVital.tekananDarah}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Nadi:</span>{' '}
                          <strong>{kunj.tandaVital.nadi}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Suhu:</span>{' '}
                          <strong>{kunj.tandaVital.suhu}</strong>
                        </div>
                        {kunj.tandaVital.beratBadan && (
                          <div>
                            <span className="text-slate-400">BB:</span>{' '}
                            <strong>{kunj.tandaVital.beratBadan}</strong>
                          </div>
                        )}
                      </div>

                      {/* Clinical Details */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block">Anamnesis / Keluhan Saat Datang:</span>
                          <p className="text-slate-900 font-medium">"{kunj.keluhanUtama}"</p>
                        </div>

                        <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl">
                          <span className="text-sky-800 font-bold block text-[11px] uppercase tracking-wide">
                            Diagnosis (ICD-10):
                          </span>
                          <p className="text-sky-950 font-bold text-xs sm:text-sm mt-0.5">
                            {kunj.diagnosisIcd10}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-400 block">Tindakan Medis / Intervensi:</span>
                          <p className="text-slate-800 font-medium">{kunj.tindakanMedis}</p>
                        </div>

                        {kunj.resepObat.length > 0 && (
                          <div>
                            <span className="text-slate-400 block mb-1 flex items-center gap-1">
                              <Pill className="w-3.5 h-3.5 text-slate-400" />
                              Resep Obat yang Diberikan:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {kunj.resepObat.map((obat, oIdx) => (
                                <span
                                  key={oIdx}
                                  className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-mono"
                                >
                                  {obat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {kunj.catatanDokter && (
                          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                            Catatan Edukasi Dokter: {kunj.catatanDokter}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500">
              Kerahasiaan data medis dilindungi undang-undang rekam medis &amp; Permenkes RI.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors"
            >
              Tutup Berkas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
