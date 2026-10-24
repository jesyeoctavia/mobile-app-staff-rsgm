import React, { useState } from 'react';
import { PatientFormData, DecisionResult, AiUsageRecord } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  Sparkles,
  ClipboardList,
  Save,
  Clock,
  Printer,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';

interface Step5DecisionResultProps {
  formData: PatientFormData;
  decision: DecisionResult;
  aiUsageList: AiUsageRecord[];
  onSaveSession: () => void;
  onResetWizard: () => void;
  onPrev: () => void;
}

export const Step5DecisionResult: React.FC<Step5DecisionResultProps> = ({
  formData,
  decision,
  aiUsageList,
  onSaveSession,
  onResetWizard,
  onPrev,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHandover = () => {
    const fullText = `=== RSGM MARANATHA - CATATAN SERAH TERIMA TRIASE ===\nNama Pasien: ${formData.namaPasien || '-'}\nNo RM: ${formData.nomorRekamMedis || '-'}\nPoli: ${decision.namaPoliAtauLoket}\nAntrean: ${decision.nomorAntreanFinal}\nJalur: ${decision.namaJalur}\n\n${decision.catatanSerahTerima}\n\n[STATUS PEMAKAIAN AI]\n${aiUsageList.length === 0 ? 'Bantuan AI: Tidak dipakai' : aiUsageList.map((item) => `• ${item.fiturNama}: ${item.status.toUpperCase()} (${item.detail})`).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getBadgeColors = (code: DecisionResult['kodeJalur']) => {
    switch (code) {
      case 'merah':
        return 'bg-red-600 text-white border-red-700';
      case 'kuning':
        return 'bg-amber-500 text-white border-amber-600';
      case 'hijau':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'biru':
        return 'bg-sky-600 text-white border-sky-700';
      default:
        return 'bg-slate-600 text-white border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Langkah 5: Keputusan Alur Jalur Pasien &amp; Serah Terima
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Hasil evaluasi deterministik 22 Aturan IF...THEN SOP RSGM Maranatha beserta rekap jejak Bantuan AI.
        </p>
      </div>

      {/* Main Decision Banner Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md overflow-hidden">
        {/* Banner Top Strip */}
        <div className={`px-6 py-4 flex flex-wrap items-center justify-between gap-3 ${getBadgeColors(decision.kodeJalur)}`}>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest opacity-90 block">
              Alur Jalur Ditetapkan (SOP Resmi)
            </span>
            <h3 className="text-lg sm:text-2xl font-black tracking-tight mt-0.5">
              {decision.namaJalur}
            </h3>
          </div>
          <div className="bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/30 text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-90">
              Prosedur Standar
            </span>
            <span className="text-xs sm:text-sm font-extrabold line-clamp-1">
              {decision.namaSop}
            </span>
          </div>
        </div>

        {/* Inner Details */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Patient Quick Summary + Status Kedatangan */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Nama Pasien:</span>
              <strong className="text-slate-900 text-sm">{formData.namaPasien || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">No. Rekam Medis:</span>
              <strong className="text-slate-900 font-mono text-sm">{formData.nomorRekamMedis || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Nomor Antrean Final:</span>
              <strong className="text-teal-700 font-mono text-base font-black">
                {decision.nomorAntreanFinal}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Ruang / Meja Tujuan:</span>
              <strong className="text-slate-900 text-xs sm:text-sm">
                {decision.namaPoliAtauLoket}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Ketepatan Waktu:</span>
              <span
                className={`inline-block font-black px-2 py-0.5 rounded text-[11px] ${
                  decision.statusKedatangan === 'Tepat Waktu (On-Time)'
                    ? 'bg-emerald-100 text-emerald-800'
                    : decision.statusKedatangan === 'Terlambat (> 10 Menit)'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {decision.statusKedatangan || 'Non-Booking'}
              </span>
            </div>
          </div>

          {/* PERINGATAN RULE 15: Informasi Kesehatan Penting */}
          {decision.rule15Alert?.triggered && (
            <div className="p-4 bg-purple-50/90 border-2 border-purple-300 rounded-2xl space-y-1.5 shadow-xs animate-fadeIn">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-black uppercase rounded-lg bg-purple-200 text-purple-900 border border-purple-300">
                  {decision.rule15Alert.kodeRule}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-purple-950">
                  {decision.rule15Alert.judul}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-purple-900 font-medium leading-relaxed">
                {decision.rule15Alert.alasan}
              </p>
            </div>
          )}

          {/* PERINGATAN RULE 22 (USULAN): Tanyakan Alergi & Penyakit Menahun */}
          {decision.rule22Alert?.triggered && (
            <div className="p-4 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-1.5 shadow-xs animate-fadeIn">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-black uppercase rounded-lg bg-amber-200 text-amber-900 border border-amber-300">
                  {decision.rule22Alert.kodeRule}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                  {decision.rule22Alert.judul}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                {decision.rule22Alert.alasan}
              </p>
            </div>
          )}

          {/* SOP Reasoning Explanation */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
            <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Dasar Keputusan Prosedur SOP:
            </h4>
            <p className="text-xs sm:text-sm text-teal-900 leading-relaxed font-medium">
              {decision.alasanProsedur}
            </p>
          </div>

          {/* Procedural Instructions for Staff */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-slate-500" />
              Instruksi Kerja Staf Loket:
            </h4>
            <div className="space-y-1.5">
              {decision.instruksiStaf.map((ins, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{ins}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Catatan Serah-Terima (Handover Notes) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                Catatan Serah-Terima untuk Perawat / Dokter
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Otomatis dirangkum dari keluhan &amp; keputusan
                </span>
                <button
                  type="button"
                  onClick={handleCopyHandover}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Salin Catatan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs whitespace-pre-line leading-relaxed shadow-inner border border-slate-800">
              {decision.catatanSerahTerima}
              {'\n\n'}
              [STATUS PEMAKAIAN AI PADA SESI INI]
              {'\n'}
              {aiUsageList.length === 0
                ? 'Bantuan AI: Tidak dipakai'
                : aiUsageList
                    .map(
                      (item) =>
                        `• ${item.fiturNama}: ${item.status.toUpperCase()} (${item.detail})`
                    )
                    .join('\n')}
            </div>
          </div>

          {/* JEJAK PEMAKAIAN ASISTEN AI (Per pasien) */}
          <div className="border border-indigo-200 bg-indigo-50/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                  Jejak Pemakaian Bantuan AI (Audit Trail)
                </h4>
              </div>
              <span className="text-xs font-bold text-indigo-700">
                {aiUsageList.length} aktivitas tercatat
              </span>
            </div>

            {aiUsageList.length === 0 ? (
              <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-500 text-center">
                Bantuan AI: <strong>Tidak dipakai</strong> pada sesi pasien ini.
              </div>
            ) : (
              <div className="space-y-2">
                {aiUsageList.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-white rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{rec.fiturNama}</strong>
                        <span className="text-[10px] text-slate-400">{rec.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">
                        {rec.detail}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        rec.status === 'digunakan'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {rec.status === 'digunakan' ? 'Digunakan' : 'Diabaikan'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Simpan Sesi & Mulai Baru */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
        >
          &larr; Ubah Data Langkah 4
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetWizard}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Sesi Pasien Baru</span>
          </button>

          <button
            type="button"
            onClick={onSaveSession}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Sesi ke Riwayat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
