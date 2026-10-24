import React from 'react';
import { PatientFormData } from '../types';
import { CreditCard, Pill, FileSpreadsheet, XCircle, MessageSquareWarning, ArrowLeft, ArrowRight } from 'lucide-react';

interface Step4AdministrationProps {
  formData: PatientFormData;
  onChange: (updates: Partial<PatientFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step4Administration: React.FC<Step4AdministrationProps> = ({
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
          Langkah 4: Penjaminan &amp; Administrasi Khusus
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Verifikasi jenis pembayaran/penjamin, kebutuhan resep obat kronis, atau urusan administratif.
        </p>
      </div>

      <div className="space-y-4">
        {/* Jenis Penjaminan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Jenis Penjaminan Pembayaran *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'umum', label: 'Umum / Mandiri (Tunai/QRIS)' },
              { id: 'bpjs', label: 'BPJS Kesehatan' },
              { id: 'asuransi_swasta', label: 'Asuransi Swasta / Perusahaan' },
            ].map((penj) => (
              <button
                key={penj.id}
                type="button"
                onClick={() => onChange({ jenisPenjamin: penj.id as any })}
                className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl border text-center transition-all ${
                  formData.jenisPenjamin === penj.id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {penj.label}
              </button>
            ))}
          </div>

          {/* Sub-kondisi BPJS: Validitas Rujukan */}
          {formData.jenisPenjamin === 'bpjs' && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2 mt-3">
              <label className="block text-xs font-semibold text-emerald-950">
                Status Rujukan &amp; Keaktifan Kartu BPJS:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ statusBpjs: 'aktif_rujukan_valid' })}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-left transition-all ${
                    formData.statusBpjs === 'aktif_rujukan_valid'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Rujukan Faskes 1 Aktif &amp; Valid (Terbit SEP)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ statusBpjs: 'kadaluwarsa_nonaktif' })}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-left transition-all ${
                    formData.statusBpjs === 'kadaluwarsa_nonaktif'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  Rujukan Kedaluwarsa / Kartu Non-Aktif
                </button>
              </div>
            </div>
          )}

          {/* Sub-kondisi Asuransi Swasta */}
          {formData.jenisPenjamin === 'asuransi_swasta' && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-300 rounded-xl space-y-2 mt-3">
              <label className="block text-xs font-semibold text-blue-950">
                Verifikasi Surat Jaminan (Guarantee Letter / GL):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="asuransiCheck"
                  checked={formData.asuransiTerverifikasi}
                  onChange={(e) => onChange({ asuransiTerverifikasi: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="asuransiCheck" className="text-xs text-blue-900 font-medium">
                  Kartu asuransi dan surat jaminan (GL) telah terkonfirmasi aktif sebelum masuk poli
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Tujuan Khusus Non-Pemeriksaan Biasa */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Tujuan Khusus Pasien
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'pemeriksaan_poli',
                label: 'Pemeriksaan Poli Reguler',
                desc: 'Konsultasi dokter & tindakan klinis',
              },
              {
                id: 'resep_kronis',
                label: 'Tebus Resep Obat Kronis',
                desc: 'Kondisi stabil, pengulangan obat rutin',
              },
              {
                id: 'admin_surat_lab',
                label: 'Surat Medis / Hasil Lab',
                desc: 'Legalisir, surat sehat, hasil lab',
              },
            ].map((tj) => (
              <button
                key={tj.id}
                type="button"
                onClick={() => onChange({ tujuanKhusus: tj.id as any })}
                className={`p-3 text-left rounded-xl border transition-all ${
                  formData.tujuanKhusus === tj.id
                    ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm">{tj.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{tj.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Kasus Eksepsional: Batal atau Komplain */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Kendala Alur / Kasus Eksepsional (Opsional):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300">
              <input
                type="checkbox"
                checked={formData.batalKunjungan}
                onChange={(e) => onChange({ batalKunjungan: e.target.checked })}
                className="w-4 h-4 text-slate-600 rounded"
              />
              <span className="text-slate-700">
                Pasien membatalkan kunjungan / menolak tindakan medis
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300">
              <input
                type="checkbox"
                checked={formData.kendalaKomplain}
                onChange={(e) => onChange({ kendalaKomplain: e.target.checked })}
                className="w-4 h-4 text-slate-600 rounded"
              />
              <span className="text-slate-700">
                Kendala sistem antrean / komplain layanan
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
          <span>Hitung Jalur Keputusan SOP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
