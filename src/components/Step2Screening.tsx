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

        {/* Riwayat Kesehatan Penting (Alergi, Penyakit Menahun, Obat Rutin, Sedang Hamil) */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-indigo-100 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Riwayat Kesehatan Penting
                </h3>
                <p className="text-xs text-slate-500">
                  Kewaspadaan alergi obat/makanan, penyakit menahun, obat rutin, dan kehamilan.
                </p>
              </div>
            </div>
            {formData.statusPasien === 'baru' ? (
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 rounded-full">
                Pasien Baru (Wajib)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 rounded-full">
                Pasien Lama
              </span>
            )}
          </div>

          {/* Item 1: Alergi */}
          <div className="space-y-2">
            {formData.statusPasien === 'lama' && formData.alergiTercatat ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    Alergi tercatat:{' '}
                    <strong className="underline text-emerald-950 font-bold">
                      {formData.alergiTercatat}
                    </strong>{' '}
                    (tidak ditanya ulang)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Tercatat di e-RM
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>1. Alergi (Obat / Makanan / Lateks)</span>
                    {formData.statusPasien === 'baru' && (
                      <span className="px-2 py-0.2 text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300 rounded">
                        Wajib ditanyakan pada pasien baru
                      </span>
                    )}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.statusPasien === 'lama' ? '(Belum tercatat)' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'belum_ditanyakan', label: 'Belum ditanyakan' },
                    { id: 'tidak_ada', label: 'Tidak ada' },
                    { id: 'ada', label: 'Ada' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange({ statusAlergi: opt.id as any })}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                        formData.statusAlergi === opt.id
                          ? opt.id === 'ada'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : opt.id === 'tidak_ada'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {formData.statusAlergi === 'ada' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={formData.deskripsiAlergi}
                      onChange={(e) => onChange({ deskripsiAlergi: e.target.value })}
                      placeholder="Sebutkan jenis alergi (contoh: penisilin, amoxicillin, udang/seafood, lateks)..."
                      className="w-full text-xs border border-amber-300 bg-amber-50/50 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Item 2: Penyakit Menahun */}
          <div className="space-y-2">
            {formData.statusPasien === 'lama' && formData.penyakitMenahunTercatat ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    Penyakit Menahun tercatat:{' '}
                    <strong className="underline text-emerald-950 font-bold">
                      {formData.penyakitMenahunTercatat}
                    </strong>{' '}
                    (tidak ditanya ulang)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Tercatat di e-RM
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>2. Penyakit Menahun (Hipertensi, Diabetes, Jantung, Asma)</span>
                    {formData.statusPasien === 'baru' && (
                      <span className="px-2 py-0.2 text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300 rounded">
                        Wajib ditanyakan pada pasien baru
                      </span>
                    )}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.statusPasien === 'lama' ? '(Belum tercatat)' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'belum_ditanyakan', label: 'Belum ditanyakan' },
                    { id: 'tidak_ada', label: 'Tidak ada' },
                    { id: 'ada', label: 'Ada' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange({ statusPenyakitMenahun: opt.id as any })}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                        formData.statusPenyakitMenahun === opt.id
                          ? opt.id === 'ada'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : opt.id === 'tidak_ada'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {formData.statusPenyakitMenahun === 'ada' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={formData.deskripsiPenyakitMenahun}
                      onChange={(e) => onChange({ deskripsiPenyakitMenahun: e.target.value })}
                      placeholder="Sebutkan jenis penyakit menahun (contoh: hipertensi, diabetes melitus, jantung, asma)..."
                      className="w-full text-xs border border-amber-300 bg-amber-50/50 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Item 3: Obat Rutin */}
          <div className="space-y-2">
            {formData.statusPasien === 'lama' && formData.obatRutinTercatat ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    Obat Rutin tercatat:{' '}
                    <strong className="underline text-emerald-950 font-bold">
                      {formData.obatRutinTercatat}
                    </strong>{' '}
                    (tidak ditanya ulang)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Tercatat di e-RM
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>3. Obat Rutin</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.statusPasien === 'lama' ? '(Belum tercatat)' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'belum_ditanyakan', label: 'Belum ditanyakan' },
                    { id: 'tidak_ada', label: 'Tidak ada' },
                    { id: 'ada', label: 'Ada' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange({ statusObatRutin: opt.id as any })}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                        formData.statusObatRutin === opt.id
                          ? opt.id === 'ada'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : opt.id === 'tidak_ada'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {formData.statusObatRutin === 'ada' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={formData.deskripsiObatRutin}
                      onChange={(e) => onChange({ deskripsiObatRutin: e.target.value })}
                      placeholder="Sebutkan obat rutin yang dikonsumsi (contoh: obat tekanan darah, obat diabetes rutin)..."
                      className="w-full text-xs border border-amber-300 bg-amber-50/50 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checkbox: Sedang Hamil */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.sedangHamil}
                onChange={(e) => onChange({ sedangHamil: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded shrink-0 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900">Pasien Sedang Hamil</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  Default mengikuti data tercatat di profil. Centang jika pasien mengonfirmasi kondisi kehamilan saat ini.
                </span>
              </div>
            </label>
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

      {/* Validation Warning for New Patients */}
      {formData.statusPasien === 'baru' &&
        (formData.statusAlergi === 'belum_ditanyakan' ||
          formData.statusPenyakitMenahun === 'belum_ditanyakan') && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Wajib ditanyakan pada pasien baru:</strong> Pilihan Alergi dan Penyakit Menahun harus dijawab (bukan "Belum ditanyakan") sebelum tombol "Lanjut" aktif.
            </span>
          </div>
        )}

      {/* Reminder Warning for Old Patients */}
      {formData.statusPasien === 'lama' &&
        ((!formData.alergiTercatat && formData.statusAlergi === 'belum_ditanyakan') ||
          (!formData.penyakitMenahunTercatat &&
            formData.statusPenyakitMenahun === 'belum_ditanyakan')) && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Pengingat:</strong> Alergi atau Penyakit Menahun belum ditanyakan kepada pasien. Anda dapat melanjutkan, namun dianjurkan mengonfirmasi data sebelum pemeriksaan.
            </span>
          </div>
        )}

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
          disabled={
            formData.statusPasien === 'baru' &&
            (formData.statusAlergi === 'belum_ditanyakan' ||
              formData.statusPenyakitMenahun === 'belum_ditanyakan' ||
              (formData.statusAlergi === 'ada' && !formData.deskripsiAlergi.trim()) ||
              (formData.statusPenyakitMenahun === 'ada' &&
                !formData.deskripsiPenyakitMenahun.trim()))
          }
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs"
        >
          <span>Lanjut ke Keluhan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
