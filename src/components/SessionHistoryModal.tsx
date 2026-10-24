import React, { useState } from 'react';
import { SessionHistoryItem } from '../types';
import { X, History, Sparkles, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionHistoryItem[];
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
}) => {
  const [selectedSession, setSelectedSession] = useState<SessionHistoryItem | null>(null);

  if (!isOpen) return null;

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
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Riwayat Sesi Triase Front-Desk
                </h3>
                <p className="text-xs text-slate-500">
                  Semua sesi tercatat di memori selama aplikasi berjalan ({sessions.length} sesi)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">Belum Ada Sesi Tersimpan</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Selesaikan langkah wizard sampai Langkah 5 dan klik "Simpan Sesi ke Riwayat" untuk mencatat sesi triase.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3.5">Waktu</th>
                      <th className="py-3 px-3.5">Pasien</th>
                      <th className="py-3 px-3.5">No Antrean</th>
                      <th className="py-3 px-3.5">Riwayat Kesehatan</th>
                      <th className="py-3 px-3.5">Jalur &amp; Prosedur SOP</th>
                      <th className="py-3 px-3.5">Bantuan AI</th>
                      <th className="py-3 px-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.map((ses) => (
                      <tr key={ses.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {ses.waktu}
                        </td>
                        <td className="py-3 px-3.5">
                          <strong className="text-slate-900 block text-xs">{ses.namaPasien}</strong>
                          <span className="text-[11px] text-slate-500 font-mono">{ses.noRekamMedis}</span>
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-teal-700">
                          {ses.noAntreanFinal}
                          {ses.statusKedatangan && (
                            <span
                              className={`block text-[10px] font-bold ${
                                ses.statusKedatangan.includes('On-Time')
                                  ? 'text-emerald-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {ses.statusKedatangan}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-xs text-slate-700 max-w-[200px]">
                          <span className="text-[11px] line-clamp-2 font-medium">
                            {ses.riwayatKesehatan || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-slate-800 block text-xs">{ses.jalurKeputusan}</span>
                          <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 inline-block mt-0.5 line-clamp-1">
                            {ses.prosedurSop}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          {ses.bantuanAiStatus === 'Tidak dipakai' ? (
                            <span className="text-slate-400 font-medium italic text-xs">
                              Tidak dipakai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              <Sparkles className="w-3 h-3" />
                              {ses.bantuanAiStatus}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSession(ses)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Session Detail Drawer / Card if selected */}
            {selectedSession && (
              <div className="mt-6 p-5 bg-slate-50 border border-slate-300 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <h4 className="font-bold text-sm text-slate-900">
                      Detail Sesi: {selectedSession.namaPasien} ({selectedSession.noAntreanFinal})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSession(null)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Tutup Detail
                  </button>
                </div>

                {selectedSession.riwayatKesehatan && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Riwayat Kesehatan Penting:
                    </span>
                    <p className="text-xs text-slate-800 font-medium">
                      {selectedSession.riwayatKesehatan}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Catatan Serah-Terima (Handover Notes):
                  </span>
                  <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl whitespace-pre-line leading-relaxed">
                    {selectedSession.catatanSerahTerima}
                  </div>
                </div>

                {/* AI Audit Trail */}
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Jejak Pemakaian Bantuan AI:
                  </span>
                  {selectedSession.aiUsageList.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Tidak ada penggunaan AI pada sesi ini.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedSession.aiUsageList.map((ai) => (
                        <div
                          key={ai.id}
                          className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{ai.fiturNama}</span>
                            <p className="text-[11px] text-slate-500">{ai.detail}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ai.status === 'digunakan'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ai.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
