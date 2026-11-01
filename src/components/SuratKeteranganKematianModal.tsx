import React, { useState } from 'react';
import { SuratKeteranganKematian, PatientFormData, StaffAccount } from '../types';
import { saveDeathCertificate } from '../utils/patientStorage';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  X,
  AlertTriangle,
  Building,
  User,
  Clock,
  Calendar,
  HeartOff,
} from 'lucide-react';

interface SuratKeteranganKematianModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PatientFormData;
  currentStaff?: StaffAccount | null;
  onSaveSkk?: (skk: SuratKeteranganKematian) => void;
}

export const SuratKeteranganKematianModal: React.FC<SuratKeteranganKematianModalProps> = ({
  isOpen,
  onClose,
  formData,
  currentStaff,
  onSaveSkk,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;
  const defaultNoSurat = `SKK/RSGM/${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

  const [skkData, setSkkData] = useState<SuratKeteranganKematian>({
    id: `SKK-${Date.now()}`,
    nomorSurat: defaultNoSurat,
    tanggalMeninggal: dateStr,
    jamMeninggal: timeStr,
    lokasiMeninggal: 'Ruang Resusitasi / Triase Gawat Darurat RSGM Maranatha',
    namaJenazah: formData.namaPasien || formData.idSementara || 'Tn. X',
    nomorRekamMedis: formData.nomorRekamMedis || 'RMS-EMG-001',
    nik: formData.nik || '',
    jenisKelamin: formData.idSementara?.includes('Ny.') ? 'Perempuan' : 'Laki-laki',
    umurTahun: formData.usiaPasienTahun || 45,
    alamat: 'Kota Bandung, Jawa Barat',
    klasifikasiKematian: 'DOA',
    penyebabKematianLangsung: 'Henti Jantung dan Paru (Cardiopulmonary Arrest)',
    penyebabKematianAntara: 'Syok Kardiogenik Akut / Asfiksia Berat',
    penyebabKematianDasar: formData.kondisiGawatDarurat
      ? 'Trauma Maksilofasial Akut & Obstruksi Jalan Nafas Berat'
      : 'Henti Jantung Mendadak',
    dokterPemeriksa: 'drg. Fransisca Kusuma, M.Kes / dr. DPJP Jaga IGD',
    sipDokter: 'SIP. 446.1/0812-Dinkes/2022',
    petugasPelapor: currentStaff?.nama || 'Petugas Front-Desk RSGM Maranatha',
    penerimaJenazah: formData.keluargaPenanggungJawab || 'Pihak Keluarga / Petugas Kamar Jenazah',
    hubunganPenerima: 'Keluarga Inti / Petugas Berwenang',
    waktuDibuat: `${dateStr}, ${timeStr}`,
    catatanKhusus: 'Pelayanan klinis dan penginputan SIMRS dihentikan otomatis.',
  });

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
======================================================
RUMAH SAKIT GIGI DAN MULUT MARANATHA (RSGM MARANATHA)
Jl. Prof. drg. Surya Sumantri No. 65, Bandung
Telp: (022) 201-2186 | Email: info@rsgm-maranatha.ac.id
======================================================
SURAT KETERANGAN KEMATIAN (SKK)
Nomor: ${skkData.nomorSurat}

Yang bertanda tangan di bawah ini menerangkan bahwa:
Nama Jenazah           : ${skkData.namaJenazah}
No. Rekam Medis        : ${skkData.nomorRekamMedis}
NIK                    : ${skkData.nik || '-'}
Jenis Kelamin          : ${skkData.jenisKelamin}
Perkiraan Umur         : ${skkData.umurTahun} Tahun
Alamat                 : ${skkData.alamat}

Telah dinyatakan MENINGGAL DUNIA pada:
Hari / Tanggal         : ${skkData.tanggalMeninggal}
Pukul                  : ${skkData.jamMeninggal}
Tempat Kematian        : ${skkData.lokasiMeninggal}
Klasifikasi            : ${skkData.klasifikasiKematian === 'DOA' ? 'Death on Arrival (DOA)' : 'Meninggal saat Tindakan Medis IGD'}

Penyebab Kematian:
a. Penyebab Langsung   : ${skkData.penyebabKematianLangsung}
b. Penyebab Antara     : ${skkData.penyebabKematianAntara}
c. Penyebab Dasar      : ${skkData.penyebabKematianDasar}

Dokter Pemeriksa       : ${skkData.dokterPemeriksa} (${skkData.sipDokter})
Petugas Administrasi   : ${skkData.petugasPelapor}
Penerima Jenazah       : ${skkData.penerimaJenazah} (${skkData.hubunganPenerima})

Diterbitkan resmi oleh SIMRS RSGM Maranatha.
======================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSave = () => {
    saveDeathCertificate(skkData);
    if (onSaveSkk) onSaveSkk(skkData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Top Modal Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <HeartOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  Surat Keterangan Kematian (SKK)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white uppercase">
                  Status: Meninggal Dunia
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dokumen Resmi SIMRS RSGM Maranatha • Timer Pelayanan Telah Dihentikan
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700">
          {/* Important Notice */}
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Protokol Penanganan Pasien Meninggal Dunia:</strong>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Pengisian formulir SKK ini otomatis mengarsipkan nomor rekam medis sementara / definitif dan menghentikan seluruh timer pendaftaran loket triase.
              </p>
            </div>
          </div>

          {/* Official Printable Hospital Document Sheet */}
          <div className="p-5 sm:p-6 rounded-2xl border-2 border-slate-300 bg-white font-sans text-slate-900 shadow-xs space-y-4">
            {/* Hospital Kop */}
            <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-widest text-slate-500 block">
                YAYASAN PERGURUAN TINGGI KRISTEN MARANATHA
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                RUMAH SAKIT GIGI DAN MULUT MARANATHA (RSGM MARANATHA)
              </h2>
              <p className="text-[11px] text-slate-600">
                Jl. Prof. drg. Surya Sumantri No. 65, Sukawarna, Kec. Sukajadi, Kota Bandung, Jawa Barat 40164
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Telp: (022) 201-2186 | Izin Operasional RS: 445/002/RSGM/DPMPTSP/2021
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center py-1">
              <h3 className="text-sm sm:text-base font-extrabold uppercase underline tracking-wider">
                SURAT KETERANGAN KEMATIAN
              </h3>
              <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                Nomor: {skkData.nomorSurat}
              </p>
            </div>

            {/* Editable Form Fields */}
            <div className="space-y-3 pt-2">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                I. Identitas Jenazah Pasien
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Lengkap / ID Jenazah *</label>
                  <input
                    type="text"
                    value={skkData.namaJenazah}
                    onChange={(e) => setSkkData({ ...skkData, namaJenazah: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Rekam Medis (No RM) *</label>
                  <input
                    type="text"
                    value={skkData.nomorRekamMedis}
                    onChange={(e) => setSkkData({ ...skkData, nomorRekamMedis: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-teal-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Induk Kependudukan (NIK)</label>
                  <input
                    type="text"
                    value={skkData.nik}
                    onChange={(e) => setSkkData({ ...skkData, nik: e.target.value })}
                    placeholder="Masukkan NIK jika telah diketahui"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Jenis Kelamin</label>
                    <select
                      value={skkData.jenisKelamin}
                      onChange={(e) => setSkkData({ ...skkData, jenisKelamin: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Perkiraan Umur</label>
                    <input
                      type="text"
                      value={skkData.umurTahun}
                      onChange={(e) => setSkkData({ ...skkData, umurTahun: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1 pt-3">
                II. Keterangan Waktu &amp; Penyebab Kematian
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Kematian *</label>
                  <input
                    type="text"
                    value={skkData.tanggalMeninggal}
                    onChange={(e) => setSkkData({ ...skkData, tanggalMeninggal: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Jam Meninggal (WIB) *</label>
                  <input
                    type="text"
                    value={skkData.jamMeninggal}
                    onChange={(e) => setSkkData({ ...skkData, jamMeninggal: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Klasifikasi Kematian</label>
                  <select
                    value={skkData.klasifikasiKematian}
                    onChange={(e) => setSkkData({ ...skkData, klasifikasiKematian: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="DOA">Death on Arrival (DOA)</option>
                    <option value="Tindakan_IGD">Meninggal saat Penanganan IGD</option>
                    <option value="Rawat_Inap">Meninggal dalam Perawatan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    a. Penyebab Kematian Langsung (Immediate Cause)
                  </label>
                  <input
                    type="text"
                    value={skkData.penyebabKematianLangsung}
                    onChange={(e) => setSkkData({ ...skkData, penyebabKematianLangsung: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    b. Penyebab Antara (Antecedent Cause)
                  </label>
                  <input
                    type="text"
                    value={skkData.penyebabKematianAntara}
                    onChange={(e) => setSkkData({ ...skkData, penyebabKematianAntara: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    c. Penyebab Dasar (Underlying Cause)
                  </label>
                  <input
                    type="text"
                    value={skkData.penyebabKematianDasar}
                    onChange={(e) => setSkkData({ ...skkData, penyebabKematianDasar: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1 pt-3">
                III. Pengesahan &amp; Serah Terima Jenazah
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Dokter Pemeriksa (DPJP)</label>
                  <input
                    type="text"
                    value={skkData.dokterPemeriksa}
                    onChange={(e) => setSkkData({ ...skkData, dokterPemeriksa: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Petugas Administrasi Pelapor</label>
                  <input
                    type="text"
                    value={skkData.petugasPelapor}
                    onChange={(e) => setSkkData({ ...skkData, petugasPelapor: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Penerima Jenazah / Pihak Keluarga</label>
                  <input
                    type="text"
                    value={skkData.penerimaJenazah}
                    onChange={(e) => setSkkData({ ...skkData, penerimaJenazah: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Hubungan dengan Jenazah</label>
                  <input
                    type="text"
                    value={skkData.hubunganPenerima}
                    onChange={(e) => setSkkData({ ...skkData, hubunganPenerima: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Signature Preview Boxes */}
            <div className="grid grid-cols-2 pt-6 text-center text-xs text-slate-700">
              <div className="space-y-12">
                <p>Penerima Jenazah / Saksi,</p>
                <div>
                  <p className="font-bold underline">({skkData.penerimaJenazah})</p>
                  <p className="text-[10px] text-slate-500">{skkData.hubunganPenerima}</p>
                </div>
              </div>
              <div className="space-y-12">
                <p>Bandung, {skkData.tanggalMeninggal}<br />Dokter Penanggung Jawab Pelayanan,</p>
                <div>
                  <p className="font-bold underline">({skkData.dokterPemeriksa.split('/')[0].trim()})</p>
                  <p className="text-[10px] text-slate-500">{skkData.sipDokter}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak SKK</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Tersalin!' : 'Salin Teks Resmi'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saved ? 'Tersimpan ke SIMRS!' : 'Simpan & Arsipkan Dokumen SKK'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
