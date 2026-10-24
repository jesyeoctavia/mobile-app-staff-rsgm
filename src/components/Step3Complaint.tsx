import React from 'react';
import { PatientFormData, AiComplaintSuggestionState } from '../types';
import {
  Sparkles,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Clock,
  Info,
} from 'lucide-react';

interface Step3ComplaintProps {
  formData: PatientFormData;
  onChange: (updates: Partial<PatientFormData>) => void;
  complaintSuggestion: AiComplaintSuggestionState | null;
  onGenerateComplaintAi: () => Promise<void>;
  onUseComplaintSuggestion: () => void;
  onIgnoreComplaintSuggestion: () => void;
  isAiGeneratingComplaint: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export const Step3Complaint: React.FC<Step3ComplaintProps> = ({
  formData,
  onChange,
  complaintSuggestion,
  onGenerateComplaintAi,
  onUseComplaintSuggestion,
  onIgnoreComplaintSuggestion,
  isAiGeneratingComplaint,
  onNext,
  onPrev,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Langkah 3: Keluhan Utama Pasien
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Ketik teks bebas keluhan pasien dan tentukan kejelasan serta poli yang sesuai.
        </p>
      </div>

      {/* Free Text Input from Staff */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Teks Bebas Keluhan (Diktat / Input Staf Loket) *
          </label>
          <span className="text-[11px] text-slate-400">
            Privasi: Hanya teks keluhan (tanpa nama, riwayat, atau identitas pasien)
          </span>
        </div>

        <textarea
          rows={3}
          value={formData.teksKeluhanBebas}
          onChange={(e) => {
            onChange({ teksKeluhanBebas: e.target.value });
            if (!formData.ringkasanKeluhan) {
              onChange({ teksKeluhanBebas: e.target.value, ringkasanKeluhan: e.target.value });
            }
          }}
          placeholder="Ketik keterangan bebas dari pasien di sini... contoh: 'Gigi geraham belakang kanan nyeri berdenyut sejak 3 hari, sekarang pipi sebelah kanan bengkak dan agak sulit membuka mulut saat makan.'"
          className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />

        {/* Simulasi cepat input keluhan */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 self-center">Simulasi cepat:</span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  teksKeluhanBebas:
                    'Pasien mengeluh gigi geraham kanan bawah sangat sakit sejak 3 hari, wajah kanan bengkak besar dan sulit membuka mulut.',
                })
              }
              className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
            >
              Gigi Bengkak &amp; Trismus (Bahaya)
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  teksKeluhanBebas:
                    'Gigi depan berlubang sedikit dan ngilu jika minum air dingin sejak 1 minggu lalu.',
                })
              }
              className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
            >
              Gigi Ngilu Biasa (Poli Gigi)
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  teksKeluhanBebas:
                    'Badan terasa meriang sejak kemarin, batuk kering dan kepala pusing.',
                })
              }
              className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
            >
              Demam &amp; Batuk (Poli Umum)
            </button>
          </div>
        </div>
      </div>

      {/* KARTU SARAN AI (Jika sudah digenerate) */}
      {complaintSuggestion && (
        <div className="border-2 border-indigo-200 bg-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 animate-fadeIn">
          {/* Header Card & Status Chip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Saran AI
              </h3>
              <span className="text-[11px] text-slate-400">
                {complaintSuggestion.timestamp}
              </span>
            </div>

            {/* Decision Status Chip */}
            <div>
              {complaintSuggestion.decisionState === 'menunggu' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Menunggu keputusan staf
                </span>
              )}
              {complaintSuggestion.decisionState === 'digunakan' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Digunakan
                </span>
              )}
              {complaintSuggestion.decisionState === 'diabaikan' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                  <XCircle className="w-4 h-4 text-slate-500" />
                  Diabaikan
                </span>
              )}
            </div>
          </div>

          {/* Red Flag Warning Banner if tanda_bahaya === true */}
          {complaintSuggestion.tanda_bahaya && (
            <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-red-900">
                  Perlu dinilai tenaga medis segera. Hubungi perawat / tenaga medis.
                </h4>
                <p className="text-xs text-red-700 mt-0.5">
                  Teks keluhan mengindikasikan potensi kondisi gawat/tanda bahaya (perdarahan tidak berhenti, pembengkakan wajah berat, trismus/sulit membuka mulut atau menelan, cedera kecelakaan). Peringatan ini bersifat penanda; staf tetap menentukan jalur melalui pertanyaan wizard di bawah.
                </p>
              </div>
            </div>
          )}

          {/* Ambiguous Complaint Notice if perlu_arahan_petugas === true */}
          {complaintSuggestion.perlu_arahan_petugas && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong>Keluhan belum jelas, minta arahan petugas berwenang.</strong> AI tidak berspekulasi menentukan poli apabila data klinis masih kabur.
              </div>
            </div>
          )}

          {/* AI Structured Content */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="font-semibold text-slate-700">Ringkasan Keluhan (1 Kalimat):</span>
              <p className="mt-1 text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium leading-relaxed">
                {complaintSuggestion.ringkasan}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Lokasi Keluhan:
                </span>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {complaintSuggestion.lokasi}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Durasi Keluhan:
                </span>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {complaintSuggestion.durasi}
                </span>
              </div>
            </div>

            {/* Saran Kategori Layanan (Maks 2) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-700 text-xs">Saran Kategori Layanan:</span>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Saran, bukan keputusan
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {complaintSuggestion.saran_layanan.map((srv, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Pertanyaan Klarifikasi (Maks 3) */}
            {complaintSuggestion.pertanyaan_klarifikasi.length > 0 && (
              <div>
                <span className="font-semibold text-slate-700 text-xs">
                  Pertanyaan Klarifikasi Staf ke Pasien (Maks 3):
                </span>
                <ul className="mt-1 space-y-1.5">
                  {complaintSuggestion.pertanyaan_klarifikasi.map((q, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200"
                    >
                      <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons: Gunakan & Abaikan */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onIgnoreComplaintSuggestion}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                complaintSuggestion.decisionState === 'diabaikan'
                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              Abaikan
            </button>

            <button
              type="button"
              onClick={onUseComplaintSuggestion}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl transition-colors shadow-xs ${
                complaintSuggestion.decisionState === 'digunakan'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {complaintSuggestion.decisionState === 'digunakan' ? 'Sudah Digunakan' : 'Gunakan'}
              </span>
            </button>
          </div>

          {/* Mandatory micro text */}
          <p className="text-[11px] text-slate-500 italic text-center pt-1 border-t border-slate-100">
            Saran AI membantu merapikan informasi. AI tidak mendiagnosis. Keputusan ada pada staf dan tenaga medis.
          </p>
        </div>
      )}

      {/* Manual Staff Input Fields (Jalur keputusan manual oleh staf) */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            Penetapan Manual Oleh Staf (Dasar Aturan IF...THEN)
          </h3>
        </div>

        {/* Ringkasan Keluhan Utama (Terisi jika tekan 'Gunakan' atau diketik manual) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kolom Ringkasan Keluhan Utama (Masuk ke Catatan Serah-Terima) *
          </label>
          <input
            type="text"
            value={formData.ringkasanKeluhan}
            onChange={(e) => onChange({ ringkasanKeluhan: e.target.value })}
            placeholder="Ringkasan 1 kalimat yang jelas..."
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* "Keluhan sudah jelas?" Manual Choice by Staff */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Apakah keluhan sudah jelas atau butuh penapisan perawat? *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'ya', label: 'Ya, Keluhan Jelas' },
              { id: 'ragu', label: 'Ragu / Tumpang Tindih' },
              { id: 'tidak', label: 'Tidak Jelas (Minta Arahan Perawat)' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ keluhanJelas: opt.id as any })}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  formData.keluhanJelas === opt.id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {formData.keluhanJelas !== 'ya' && (
            <p className="mt-1.5 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
              Pasien akan diarahkan ke meja perawat penapis / perawat triase awal untuk evaluasi klinis sebelum antrean poli.
            </p>
          )}
        </div>

        {/* Target Poli Menurut Staf */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Poli yang Dituju *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'gigi', label: 'Poli Gigi & Mulut' },
                { id: 'umum', label: 'Poli Umum' },
                { id: 'anak', label: 'Poli Anak / Pedodonsia' },
                { id: 'belum_tahu', label: 'Belum Pasti (Triase)' },
              ].map((poli) => (
                <button
                  key={poli.id}
                  type="button"
                  onClick={() => onChange({ targetPoliStaf: poli.id as any })}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                    formData.targetPoliStaf === poli.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {poli.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Usia Pasien (Tahun) - Otomatis Pedodonsia bila &lt; 12 thn
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={formData.usiaPasienTahun || ''}
              onChange={(e) => onChange({ usiaPasienTahun: Number(e.target.value) })}
              placeholder="Contoh: 28 (atau 7 untuk anak-anak)"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {formData.usiaPasienTahun > 0 && formData.usiaPasienTahun < 12 && (
              <p className="mt-1 text-[11px] text-teal-700 font-medium">
                👶 Pasien anak terdeteksi (&lt;12 thn). Dialokasikan ke Poli Anak / Pedodonsia.
              </p>
            )}
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
          disabled={!formData.teksKeluhanBebas.trim()}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs"
        >
          <span>Lanjut ke Penjaminan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
