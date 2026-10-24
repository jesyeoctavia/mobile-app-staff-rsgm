import React, { useState } from 'react';
import { DOCTOR_SCHEDULES } from '../data/doctorSchedules';
import { DoctorSchedule } from '../types';
import { X, Calendar, Clock, UserCheck, Stethoscope, Building, Search, Users } from 'lucide-react';

interface DoctorScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPoli?: (poli: 'Poli Umum' | 'Poli Gigi' | 'Poli Gigi Anak') => void;
}

export const DoctorScheduleModal: React.FC<DoctorScheduleModalProps> = ({
  isOpen,
  onClose,
  onSelectPoli,
}) => {
  const [selectedPoliFilter, setSelectedPoliFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredDoctors = DOCTOR_SCHEDULES.filter((doc) => {
    const matchesPoli = selectedPoliFilter === 'Semua' || doc.poli === selectedPoliFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      doc.namaDokter.toLowerCase().includes(q) ||
      doc.spesialisasi.toLowerCase().includes(q) ||
      doc.poli.toLowerCase().includes(q);
    return matchesPoli && matchesSearch;
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
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  Jadwal Praktik Dokter &amp; Ketersediaan Kuota
                </h3>
                <p className="text-xs text-slate-300">
                  Poli Umum, Poli Gigi &amp; Poli Gigi Anak • Update Real-Time Hari Ini
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

          {/* Filters & Search */}
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama dokter atau keahlian..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Poli Filters */}
              <div className="flex gap-1.5 flex-wrap">
                {['Semua', 'Poli Umum', 'Poli Gigi', 'Poli Gigi Anak (Pedodonsia)'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPoliFilter(p)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      selectedPoliFilter === p
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto space-y-3.5">
            {filteredDoctors.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                Tidak ada dokter yang cocok dengan filter pencarian.
              </div>
            ) : (
              filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {doc.namaDokter}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.gelar}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {doc.spesialisasi}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        <Building className="w-3.5 h-3.5" />
                        {doc.poli} • {doc.ruangPeriksa}
                      </span>

                      <span className="flex items-center gap-1 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {doc.jamMulai} - {doc.jamSelesai} WIB ({doc.sesi})
                      </span>

                      <span className="text-slate-500">
                        Hari: <strong>{doc.hariPraktik.join(', ')}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Quota & Status Pill */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        doc.statusPraktik === 'Sedang Praktik'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : doc.statusPraktik === 'Akan Datang'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          doc.statusPraktik === 'Sedang Praktik'
                            ? 'bg-emerald-500 animate-pulse'
                            : 'bg-slate-400'
                        }`}
                      />
                      {doc.statusPraktik}
                    </span>

                    <div className="text-right text-xs">
                      <span className="text-slate-400 block font-medium">Kuota Antrean:</span>
                      <strong className="text-slate-800">
                        {doc.kuotaTerisi} / {doc.kuotaMaksimal} Pasien
                      </strong>
                    </div>

                    {onSelectPoli && (
                      <button
                        type="button"
                        onClick={() => {
                          const target =
                            doc.poli === 'Poli Gigi Anak (Pedodonsia)'
                              ? 'Poli Gigi Anak'
                              : doc.poli;
                          onSelectPoli(target);
                          onClose();
                        }}
                        className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg border border-teal-200 transition-colors"
                      >
                        Pilih Poli Ini
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors"
            >
              Tutup Jadwal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
