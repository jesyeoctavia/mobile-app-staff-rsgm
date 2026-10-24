import React from 'react';
import { PatientFormData } from '../types';
import { AlertOctagon, ShieldAlert, HeartHandshake, ArrowLeft, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

interface Step2ScreeningProps {
  formData: PatientFormData;
  onChange: (updates: Partial<PatientFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2Screening: React.FC<Step2ScreeningProps> = ({
  formData,
  onChange,
  onNext,
  onPrev,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Langkah 2: Skrining Cepat &amp; Prioritas
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Deteksi tanda bahaya fisik dan identifikasi pasien kelompok rentan untuk alokasi jalur khusus.
        </p>
      </div>

      <div className="space-y-4">
        {/* Aturan 1: Gawat Darurat Umum */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all ${
            formData.kondisiGawatDarurat
              ? 'bg-red-50/80 border-red-500 shadow-sm'
              : 'bg-white border-slate-200 hover:border-red-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${formData.kondisiGawatDarurat ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'}`}>
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Kondisi Gawat Darurat Medis
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-700">
                    Jalur Merah
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Pasien mengalami perdarahan yang tidak berhenti, sesak napas berat, nyeri dada hebat, atau penurunan kesadaran.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.kondisiGawatDarurat}
                onChange={(e) => onChange({ kondisiGawatDarurat: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
          {formData.kondisiGawatDarurat && (
            <div className="mt-3 p-2.5 bg-red-100/70 border border-red-300 rounded-lg text-xs font-semibold text-red-800">
              ⚠️ Pasien akan dialihkan langsung ke Ruang Tindakan Darurat / IGD. Panggil dokter/perawat triase seketika.
            </div>
          )}
        </div>

        {/* Tanda Bahaya Spesifik Gigi & Mulut */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all ${
            formData.tandaBahayaGigi
              ? 'bg-amber-50/80 border-amber-500 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${formData.tandaBahayaGigi ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Tanda Bahaya Spesifik Gigi &amp; Mulut
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-800">
                    Triase Gigi
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Pasien memiliki pembengkakan wajah berat/asimetris, trismus (sulit buka mulut &lt; 1 jari), atau sulit bernapas/menelan akibat infeksi odontogenik.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.tandaBahayaGigi}
                onChange={(e) => onChange({ tandaBahayaGigi: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
          {formData.tandaBahayaGigi && (
            <div className="mt-3 p-2.5 bg-amber-100/70 border border-amber-300 rounded-lg text-xs font-semibold text-amber-900">
              ⚠️ Rujuk segera ke dokter gigi jaga / perawat triase untuk evaluasi cepat jalan napas &amp; drainase.
            </div>
          )}
        </div>

        {/* Kelompok Prioritas Khusus (Fast-Track) */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Kelompok Prioritas Khusus / Rentan
              </h3>
              <p className="text-xs text-slate-500">
                Lansia, ibu hamil risiko tinggi, atau disabilitas mendapatkan nomor antrean Fast-Track dan kursi prioritas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { id: 'none', label: 'Bukan Prioritas' },
              { id: 'lansia', label: 'Lansia (>65 Thn)' },
              { id: 'hamil_resiko', label: 'Ibu Hamil Risiko' },
              { id: 'disabilitas', label: 'Disabilitas Fisik' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ kategoriPrioritas: cat.id as any })}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  formData.kategoriPrioritas === cat.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Situasi Operasional Khusus */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Situasi Operasional Khusus (Opsional):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300">
              <input
                type="checkbox"
                checked={formData.diluarJamLayanan}
                onChange={(e) => onChange({ diluarJamLayanan: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-slate-700">
                Datang di luar jam operasional poli tujuan
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300">
              <input
                type="checkbox"
                checked={formData.kuotaPoliPenuh}
                onChange={(e) => onChange({ kuotaPoliPenuh: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-slate-700">
                Kuota dokter poli hari ini telah penuh
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs"
        >
          <span>Lanjut ke Keluhan &amp; AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
