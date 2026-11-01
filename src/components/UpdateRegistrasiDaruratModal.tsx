import React, { useState } from 'react';
import { PatientFormData } from '../types';
import {
  FileEdit,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertCircle,
  Phone,
  Home,
  CreditCard,
  Heart,
} from 'lucide-react';

interface UpdateRegistrasiDaruratModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PatientFormData;
  onSaveUpdates: (updates: Partial<PatientFormData>) => void;
}

export const UpdateRegistrasiDaruratModal: React.FC<UpdateRegistrasiDaruratModalProps> = ({
  isOpen,
  onClose,
  formData,
  onSaveUpdates,
}) => {
  if (!isOpen) return null;

  const [namaAsli, setNamaAsli] = useState(
    formData.namaPasien.startsWith('Tn. X') || formData.namaPasien.startsWith('Ny. X') || formData.namaPasien.startsWith('An. X')
      ? ''
      : formData.namaPasien
  );
  const [nikAsli, setNikAsli] = useState(formData.nik || '');
  const [tanggalLahir, setTanggalLahir] = useState(formData.tanggalLahir || '');
  const [usia, setUsia] = useState<number>(formData.usiaPasienTahun || 30);
  const [penjamin, setPenjamin] = useState<'umum' | 'bpjs' | 'asuransi_swasta'>(formData.jenisPenjamin || 'bpjs');
  const [keluargaPenanggungJawab, setKeluargaPenanggungJawab] = useState(formData.keluargaPenanggungJawab || '');
  const [kontakDarurat, setKontakDarurat] = useState(formData.kontakDarurat || '');
  const [alamat, setAlamat] = useState('Kota Bandung, Jawa Barat');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!namaAsli.trim()) {
      setErrorMsg('Harap masukkan nama lengkap asli pasien.');
      return;
    }

    if (nikAsli.trim() && nikAsli.trim().length !== 16) {
      setErrorMsg('NIK harus berjumlah 16 digit angka (sesuai e-KTP).');
      return;
    }

    // Generate permanent RM if still temporary
    let permanentRm = formData.nomorRekamMedis;
    if (permanentRm.startsWith('RMS-EMG') || permanentRm.startsWith('RMS-')) {
      permanentRm = `RM-00${Math.floor(1055 + Math.random() * 800)}`;
    }

    onSaveUpdates({
      namaPasien: namaAsli.trim(),
      nik: nikAsli.trim(),
      tanggalLahir: tanggalLahir.trim(),
      usiaPasienTahun: Number(usia),
      nomorRekamMedis: permanentRm,
      jenisPenjamin: penjamin,
      keluargaPenanggungJawab: keluargaPenanggungJawab.trim(),
      kontakDarurat: kontakDarurat.trim(),
      dataRegistrasiStabilDiupdate: true,
      // Keep emergency status noted but stabilized
      isFastTrackEmergency: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Update Data Registrasi Pasien (Kondisi Stabil)
              </h3>
              <p className="text-[11px] text-slate-400">
                Pembaruan identitas resmi pasien darurat (dari ID Sementara {formData.idSementara || formData.namaPasien})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-teal-900">
            <div>
              <span className="font-bold block">Status Saat Ini: Pasien Telah Ditangani &amp; Stabil</span>
              <span className="text-[11px] text-teal-700">
                Nomor Antrean: <strong>{formData.noAntrean}</strong> • ID Sementara: <strong>{formData.idSementara || formData.namaPasien}</strong>
              </span>
            </div>
            <span className="px-2.5 py-1 bg-teal-600 text-white font-bold text-[10px] rounded-full uppercase">
              Registrasi Definitif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Asli Pasien *
              </label>
              <input
                type="text"
                value={namaAsli}
                onChange={(e) => setNamaAsli(e.target.value)}
                placeholder="Contoh: Hendra Kusuma"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Induk Kependudukan (NIK 16 Digit)
              </label>
              <input
                type="text"
                value={nikAsli}
                onChange={(e) => setNikAsli(e.target.value)}
                placeholder="327301xxxxxxxxxx"
                maxLength={16}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Lahir (DD-MM-YYYY)
              </label>
              <input
                type="text"
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                placeholder="15-08-1990"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Perkiraan Usia (Tahun)
              </label>
              <input
                type="number"
                value={usia}
                onChange={(e) => setUsia(Number(e.target.value))}
                min={1}
                max={120}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Penjamin Biaya Perawatan
              </label>
              <select
                value={penjamin}
                onChange={(e) => setPenjamin(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="bpjs">BPJS Kesehatan (Rujukan Darurat)</option>
                <option value="umum">Umum / Pembayaran Mandiri</option>
                <option value="asuransi_swasta">Asuransi Swasta / Perusahaan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Keluarga / Wali Penanggung Jawab
              </label>
              <input
                type="text"
                value={keluargaPenanggungJawab}
                onChange={(e) => setKeluargaPenanggungJawab(e.target.value)}
                placeholder="Contoh: Ibu Rina (Istri / Orang Tua)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Kontak Darurat (HP/WhatsApp)
              </label>
              <input
                type="text"
                value={kontakDarurat}
                onChange={(e) => setKontakDarurat(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Domisili Pasien
              </label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Alamat tempat tinggal pasien"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            💡 Sistem akan secara otomatis menerbitkan Nomor Rekam Medis permanen dan memperbarui catatan triase klinis pasien.
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan &amp; Perbarui Data Rekam Medis</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
