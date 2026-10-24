export type WizardStepId = 1 | 2 | 3 | 4 | 5;

export interface MedicalVisitRecord {
  tanggal: string;
  poli: string;
  dokter: string;
  keluhanUtama: string;
  diagnosisIcd10: string;
  tindakanMedis: string;
  resepObat: string[];
  tandaVital: {
    tekananDarah: string;
    nadi: string;
    suhu: string;
    beratBadan?: string;
  };
  catatanDokter?: string;
}

export interface PatientRiwayatKesehatan {
  alergi: string; // teks, "" jika kosong/belum tercatat
  penyakit_menahun: string; // teks, "" jika kosong/belum tercatat
  obat_rutin: string; // teks, "" jika kosong/belum tercatat
  sedang_hamil: 'ya' | 'tidak'; // ya / tidak
}

export interface SimulatedPatient {
  kode: string;
  nama: string;
  tanggalLahir: string;
  nomorRekamMedis: string;
  jadwalBooking: string;
  poli: string;
  telepon?: string;
  nik?: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  alamat: string;
  golonganDarah: string;
  riwayatKesehatan: PatientRiwayatKesehatan;
  alergi: {
    ada: boolean;
    daftarAlergi: string[]; // e.g. ["Penisilin / Amoxicillin", "Ibuprofen"]
  };
  komorbid: string[];
  riwayatKunjungan: MedicalVisitRecord[];
}

export interface PatientSimilarityResult extends SimulatedPatient {
  similarityScore: number; // 0 - 100
  matchedFields: string[];
}

export interface DoctorSchedule {
  id: string;
  namaDokter: string;
  gelar: string;
  spesialisasi: string;
  poli: 'Poli Umum' | 'Poli Gigi' | 'Poli Gigi Anak (Pedodonsia)';
  ruangPeriksa: string;
  hariPraktik: string[];
  jamMulai: string;
  jamSelesai: string;
  sesi: 'Pagi' | 'Sore' | 'Malam';
  statusPraktik: 'Sedang Praktik' | 'Akan Datang' | 'Selesai';
  kuotaMaksimal: number;
  kuotaTerisi: number;
}

export interface AiComplaintResponse {
  ringkasan: string;
  lokasi: string;
  durasi: string;
  tanda_bahaya: boolean;
  saran_layanan: string[];
  pertanyaan_klarifikasi: string[];
  perlu_arahan_petugas: boolean;
}

export type AiDecisionStatus = 'menunggu' | 'digunakan' | 'diabaikan';

export interface AiComplaintSuggestionState extends AiComplaintResponse {
  decisionState: AiDecisionStatus;
  timestamp: string;
}

export interface AiSopQaResponse {
  jawaban: string;
  prosedur_terkait: string[];
  tercakup: boolean;
}

export interface AiSopQaSuggestionState extends AiSopQaResponse {
  id: string;
  pertanyaan: string;
  decisionState: AiDecisionStatus;
  timestamp: string;
}

export interface AiUsageRecord {
  id: string;
  fiturId: 'fitur1_keluhan' | 'fitur2_pencocokan' | 'fitur3_sop_qa';
  fiturNama: string;
  timestamp: string;
  status: 'digunakan' | 'diabaikan';
  detail: string;
}

export interface PatientFormData {
  // Step 1
  poliTujuanAwal: 'Poli Umum' | 'Poli Gigi' | 'Poli Gigi Anak'; // Explicit dropdown upfront
  jenisKunjungan: 'booking' | 'walkin';
  statusPasien: 'lama' | 'baru';
  namaPasien: string;
  nik: string;
  tanggalLahir: string;
  nomorRekamMedis: string;
  noAntrean: string;
  jadwalBooking: string;
  jamKedatangan: string;
  menitKeterlambatan: number; // 0 = on-time, <= 10 = on-time toleransi, > 10 = terlambat

  // Step 2
  kondisiGawatDarurat: boolean;
  tandaBahayaGigi: boolean;
  kategoriPrioritas: 'none' | 'lansia' | 'hamil_resiko' | 'disabilitas';
  kuotaPoliPenuh: boolean;
  diluarJamLayanan: boolean;

  // Riwayat Kesehatan Penting (Langkah 2)
  statusAlergi: 'belum_ditanyakan' | 'tidak_ada' | 'ada';
  deskripsiAlergi: string;
  alergiTercatat?: string;
  statusPenyakitMenahun: 'belum_ditanyakan' | 'tidak_ada' | 'ada';
  deskripsiPenyakitMenahun: string;
  penyakitMenahunTercatat?: string;
  statusObatRutin: 'belum_ditanyakan' | 'tidak_ada' | 'ada';
  deskripsiObatRutin: string;
  obatRutinTercatat?: string;
  sedangHamil: boolean;

  // Step 3
  teksKeluhanBebas: string;
  ringkasanKeluhan: string;
  lokasiKeluhan: string;
  durasiKeluhan: string;
  keluhanJelas: 'ya' | 'tidak' | 'ragu';
  targetPoliStaf: 'gigi' | 'umum' | 'anak' | 'belum_tahu';
  usiaPasienTahun: number;

  // Step 4
  jenisPenjamin: 'umum' | 'bpjs' | 'asuransi_swasta';
  statusBpjs: 'aktif_rujukan_valid' | 'kadaluwarsa_nonaktif';
  asuransiTerverifikasi: boolean;
  tujuanKhusus: 'pemeriksaan_poli' | 'resep_kronis' | 'admin_surat_lab';
  batalKunjungan: boolean;
  kendalaKomplain: boolean;
}

export interface HealthHistoryRuleAlert {
  triggered: boolean;
  kodeRule: string; // 'RULE 15' | 'RULE 22 (USULAN, belum divalidasi pakar)'
  judul: string;
  alasan: string;
}

export interface DecisionResult {
  prosedurSopId: number;
  namaSop: string;
  kodeJalur: 'merah' | 'kuning' | 'hijau' | 'biru' | 'abu';
  namaJalur: string;
  namaPoliAtauLoket: string;
  nomorAntreanFinal: string;
  alasanProsedur: string;
  instruksiStaf: string[];
  catatanSerahTerima: string;
  statusKedatangan?: 'Tepat Waktu (On-Time)' | 'Terlambat (> 10 Menit)' | 'Non-Booking';
  rule15Alert?: HealthHistoryRuleAlert;
  rule22Alert?: HealthHistoryRuleAlert;
  riwayatKesehatanSummary?: string;
}

export interface SessionHistoryItem {
  id: string;
  waktu: string;
  timestamp?: string;
  namaPasien: string;
  noRekamMedis: string;
  noAntreanFinal: string;
  jalurKeputusan: string;
  prosedurSop: string;
  bantuanAiStatus: string;
  statusKedatangan?: string;
  aiUsageList: AiUsageRecord[];
  catatanSerahTerima: string;
  riwayatKesehatan?: string;
}

export interface SopRule {
  id: number;
  judul: string;
  kategori: 'Darurat & Triase' | 'Antrean & Kedatangan' | 'Pendaftaran & Alur' | 'Penjaminan' | 'Layanan Khusus & Kendala';
  kondisiIf: string;
  tindakanThen: string;
}
