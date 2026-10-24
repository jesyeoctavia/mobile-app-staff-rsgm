import { PatientFormData, DecisionResult } from '../types';

/**
 * Pure evaluation function based on the clinic's formal SOP procedures.
 * Strictly adheres to 10-minute punctuality tolerance.
 * Removes any "Aturan X" numbering; outputs formal clinical procedural naming.
 */
export function evaluateTriageRules(data: PatientFormData): DecisionResult {
  // Determine arrival timing status
  let statusKedatangan: DecisionResult['statusKedatangan'] = 'Non-Booking';
  if (data.jenisKunjungan === 'booking') {
    statusKedatangan = data.menitKeterlambatan <= 10 ? 'Tepat Waktu (On-Time)' : 'Terlambat (> 10 Menit)';
  }

  // 1. Gawat Darurat Umum
  if (data.kondisiGawatDarurat) {
    return {
      prosedurSopId: 1,
      namaSop: 'Prosedur Gawat Darurat Medis',
      kodeJalur: 'merah',
      namaJalur: 'Jalur Merah - Tindakan Darurat Segera (IGD)',
      namaPoliAtauLoket: 'Ruang Tindakan Darurat / IGD',
      nomorAntreanFinal: 'EMG-01',
      statusKedatangan,
      alasanProsedur: 'Pasien mengalami kondisi gawat darurat (perdarahan tidak berhenti, sesak napas berat, nyeri dada hebat, atau penurunan kesadaran).',
      instruksiStaf: [
        'SEGERA alihkan pasien ke Ruang Tindakan Darurat (IGD) tanpa menunggu pengurusan administrasi.',
        'Panggil dokter jaga dan perawat triase seketika.',
        'Pengisian dokumen identitas dan penjaminan ditunda hingga kondisi pasien stabil.',
      ],
      catatanSerahTerima: `[STATUS MEDIS GAWAT DARURAT] Pasien memerlukan penanganan medis segera di IGD. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}". Panggil tim triase langsung.`,
    };
  }

  // 2. Tanda Bahaya Maksilofasial / Gigi & Mulut
  if (data.tandaBahayaGigi) {
    return {
      prosedurSopId: 2,
      namaSop: 'Prosedur Tanda Bahaya Spesifik Gigi & Mulut',
      kodeJalur: 'merah',
      namaJalur: 'Jalur Triase Cepat Dokter Gigi',
      namaPoliAtauLoket: 'Poli Gigi (Meja Tindakan Prioritas Triase)',
      nomorAntreanFinal: 'TR-G01',
      statusKedatangan,
      alasanProsedur: 'Pasien memiliki tanda bahaya maksilofasial (pembengkakan wajah asimetris berat, trismus/sulit buka mulut < 1 jari, atau sulit menelan/bernapas).',
      instruksiStaf: [
        'Arahkan langsung ke perawat triase gigi / dokter gigi jaga untuk asesmen jalan napas dan infeksi akut.',
        'Jangan tempatkan di antrean pemeriksaan estetik atau reguler.',
        'Siapkan fasilitas darurat bila terjadi penyempitan jalan napas.',
      ],
      catatanSerahTerima: `[PERINGATAN GIGI - TRIASE CEPAT] Tanda bahaya maksilofasial teridentifikasi (pembengkakan wajah / trismus / disfagia). Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}". Evaluasi cepat sebelum tindakan lanjut.`,
    };
  }

  // 3. Pembatalan Kunjungan / Penolakan Tindakan Medis
  if (data.batalKunjungan) {
    return {
      prosedurSopId: 19,
      namaSop: 'Prosedur Pembatalan Kunjungan Medis',
      kodeJalur: 'abu',
      namaJalur: 'Administrasi Pembatalan Kunjungan',
      namaPoliAtauLoket: 'Loket Informasi & Pengarsipan Batal',
      nomorAntreanFinal: 'VOID',
      statusKedatangan,
      alasanProsedur: 'Pasien membatalkan pendaftaran atau menolak tindakan pemeriksaan medis.',
      instruksiStaf: [
        'Catat alasan pembatalan kunjungan secara jelas di sistem rekam medis.',
        'Minta tanda tangan lembar edukasi pembatalan / penolakan tindakan.',
        'Batalkan nomor antrean aktif pada server antrean loket.',
      ],
      catatanSerahTerima: `[PEMBATALAN KUNJUNGAN] Pasien membatalkan pendaftaran. Alasan dicatat pada berkas administrasi.`,
    };
  }

  // 4. Kendala Sistem / Mediasi Komplain
  if (data.kendalaKomplain) {
    return {
      prosedurSopId: 20,
      namaSop: 'Prosedur Mediasi Kendala & Komplain',
      kodeJalur: 'kuning',
      namaJalur: 'Meja Layanan Khusus & Customer Care',
      namaPoliAtauLoket: 'Meja Customer Care / Supervisor Loket',
      nomorAntreanFinal: 'CC-01',
      statusKedatangan,
      alasanProsedur: 'Terjadi kendala sistem pendaftaran antrean atau komplain layanan dari pasien.',
      instruksiStaf: [
        'Alihkan komunikasi ke Supervisor Loket / Customer Care agar jalur antrean utama tidak terhambat.',
        'Lakukan pengecekan log pendaftaran sistem secara manual.',
        'Beri penjelasan persuasif sesuai standar pelayanan prima klinik.',
      ],
      catatanSerahTerima: `[KENDALA SISTEM / KOMPLAIN] Pasien dialihkan ke Supervisor / Customer Care untuk mediasi dan verifikasi manual.`,
    };
  }

  // 5. Kedatangan di Luar Jam Operasional Poli
  if (data.diluarJamLayanan) {
    return {
      prosedurSopId: 18,
      namaSop: 'Prosedur Layanan di Luar Jam Operasional',
      kodeJalur: 'kuning',
      namaJalur: 'Layanan Di Luar Jam Operasional Poli',
      namaPoliAtauLoket: 'IGD (Jika Akut) atau Loket Reservasi Esok Hari',
      nomorAntreanFinal: 'RES-NEXT',
      statusKedatangan,
      alasanProsedur: 'Pasien datang di luar jadwal operasional dokter poli yang dituju.',
      instruksiStaf: [
        'Jika keluhan akut atau mendesak, tawarkan penanganan di IGD 24 jam.',
        'Jika kondisi stabil/elektif, bantu reservasi jadwal kunjungan untuk esok hari.',
      ],
      catatanSerahTerima: `[LUAR JAM LAYANAN] Poli telah selesai jam praktiknya. Edukasi opsi IGD atau booking jadwal berikutnya.`,
    };
  }

  // 6. Kuota Poli Hari Ini Penuh
  if (data.kuotaPoliPenuh) {
    return {
      prosedurSopId: 21,
      namaSop: 'Prosedur Penanganan Kuota Dokter Penuh',
      kodeJalur: 'kuning',
      namaJalur: 'Penanganan Kuota Poli Penuh',
      namaPoliAtauLoket: 'Loket Informasi & Penjadwalan Ulang',
      nomorAntreanFinal: 'WAIT-FULL',
      statusKedatangan,
      alasanProsedur: 'Kuota penerimaan dokter poli tujuan hari ini telah mencapai batas maksimal.',
      instruksiStaf: [
        'Tawarkan opsi dokter pengganti di poli serupa pada hari yang sama bila tersedia.',
        'Tawarkan booking slot terdepan untuk hari besok.',
        'Berikan alternatif rujukan ke faskes jejaring bila penanganan mendesak.',
      ],
      catatanSerahTerima: `[KUOTA PENUH] Kuota dokter poli tujuan hari ini telah penuh. Ditawarkan opsi dokter pengganti atau jadwal esok hari.`,
    };
  }

  // 7. Pengulangan Resep Rutin Pasien Kronis (Stabil)
  if (data.tujuanKhusus === 'resep_kronis') {
    return {
      prosedurSopId: 16,
      namaSop: 'Prosedur Jalur Cepat Farmasi Pasien Kronis',
      kodeJalur: 'biru',
      namaJalur: 'Jalur Cepat Farmasi / Poli Kronis',
      namaPoliAtauLoket: 'Loket Fast-Track Farmasi',
      nomorAntreanFinal: 'FARM-08',
      statusKedatangan,
      alasanProsedur: 'Pasien datang hanya untuk pengulangan resep rutin obat kronis dengan kondisi stabil tanpa keluhan akut.',
      instruksiStaf: [
        'Arahkan langsung ke Loket Fast-Track Farmasi tanpa perlu antre di poli reguler.',
        'Verifikasi kartu kontrol rutin dan buku obat kronis pasien.',
      ],
      catatanSerahTerima: `[PENGULANGAN RESEP KRONIS] Pasien stabil tanpa keluhan akut. Diarahkan langsung ke Farmasi Jalur Cepat.`,
    };
  }

  // 8. Administrasi Medis / Pengambilan Hasil Lab
  if (data.tujuanKhusus === 'admin_surat_lab') {
    return {
      prosedurSopId: 17,
      namaSop: 'Prosedur Administrasi Medis & Laboratorium',
      kodeJalur: 'biru',
      namaJalur: 'Loket Administrasi Medis & Laboratorium',
      namaPoliAtauLoket: 'Loket Administrasi Rekam Medis',
      nomorAntreanFinal: 'ADM-05',
      statusKedatangan,
      alasanProsedur: 'Pasien datang untuk legalisir, surat keterangan sehat, atau pengambilan hasil laboratorium.',
      instruksiStaf: [
        'Arahkan ke Loket Administrasi Rekam Medis / Informasi.',
        'Minta tanda pengenal atau bukti resi pengambilan sampel lab.',
      ],
      catatanSerahTerima: `[KEPERLUAN ADMINISTRASI] Keperluan legalisir berkas / surat keterangan / hasil lab.`,
    };
  }

  // 9. Kelompok Prioritas Khusus (Lansia, Hamil Risiko Tinggi, Disabilitas)
  if (data.kategoriPrioritas !== 'none') {
    const prioritasLabel =
      data.kategoriPrioritas === 'lansia'
        ? 'Lansia (> 65 Tahun)'
        : data.kategoriPrioritas === 'hamil_resiko'
        ? 'Ibu Hamil Risiko Tinggi'
        : 'Penyandang Disabilitas Fisik';

    const poliTujuan = data.poliTujuanAwal || (data.targetPoliStaf === 'gigi' ? 'Poli Gigi' : 'Poli Umum');

    return {
      prosedurSopId: 3,
      namaSop: 'Prosedur Pelayanan Pasien Prioritas',
      kodeJalur: 'hijau',
      namaJalur: `Jalur Fast-Track Prioritas (${prioritasLabel})`,
      namaPoliAtauLoket: `${poliTujuan} (Antrean Prioritas)`,
      nomorAntreanFinal: 'PRIO-03',
      statusKedatangan,
      alasanProsedur: `Pasien memenuhi kriteria kelompok rentan prioritas: ${prioritasLabel}.`,
      instruksiStaf: [
        'Terbitkan nomor antrean Fast-Track Prioritas khusus.',
        'Persilakan pasien dan pendamping duduk di kursi prioritas dekat loket/pintu poli.',
        'Bantu mobilitas dan pengisian berkas bila diperlukan.',
      ],
      catatanSerahTerima: `[PASIEN PRIORITAS] Kategori: ${prioritasLabel}. Tujuan: ${poliTujuan}. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}". Diberikan antrean prioritas.`,
    };
  }

  // 10. Pasien Booking Online - Strict 10-Minute Tolerance Check!
  if (data.jenisKunjungan === 'booking') {
    // TOLERANSI STRICT: <= 10 Menit = TEPAT WAKTU (ON-TIME)
    if (data.menitKeterlambatan <= 10) {
      const poliTujuan = data.poliTujuanAwal || (data.targetPoliStaf === 'gigi' ? 'Poli Gigi' : 'Poli Umum');
      return {
        prosedurSopId: 4,
        namaSop: 'Prosedur Booking Online Tepat Waktu',
        kodeJalur: 'hijau',
        namaJalur: 'Verifikasi Booking Online - Tepat Waktu (On-Time)',
        namaPoliAtauLoket: `Ruang Tunggu ${poliTujuan}`,
        nomorAntreanFinal: data.noAntrean || 'BOK-012',
        statusKedatangan: 'Tepat Waktu (On-Time)',
        alasanProsedur: 'Pasien booking online hadir tepat waktu (dalam toleransi maksimal 10 menit dari jadwal booking) dan nomor antrean valid.',
        instruksiStaf: [
          'Lakukan verifikasi cepat barcode / kode booking di sistem SIMRS.',
          'Konfirmasi poli tujuan dan langsung persilakan pasien ke ruang tunggu poli.',
        ],
        catatanSerahTerima: `[BOOKING TEPAT WAKTU / ON-TIME] Hadir tepat waktu (${data.jamKedatangan || '09:00'}). Jadwal: ${data.jadwalBooking || '-'}. Tujuan: ${poliTujuan}. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}".`,
      };
    } else {
      // TERLAMBAT > 10 MENIT!
      const poliTujuan = data.poliTujuanAwal || (data.targetPoliStaf === 'gigi' ? 'Poli Gigi' : 'Poli Umum');
      return {
        prosedurSopId: 5,
        namaSop: 'Prosedur Keterlambatan Pasien Booking Online',
        kodeJalur: 'kuning',
        namaJalur: `Penyesuaian Antrean Booking (Terlambat ${data.menitKeterlambatan} Menit)`,
        namaPoliAtauLoket: `${poliTujuan} (Penyesuaian Urutan Antrean)`,
        nomorAntreanFinal: `${data.noAntrean || 'BOK-012'}-LATE`,
        statusKedatangan: 'Terlambat (> 10 Menit)',
        alasanProsedur: `Pasien booking online hadir terlambat melebihi batas toleransi 10 menit (keterlambatan: ${data.menitKeterlambatan} menit).`,
        instruksiStaf: [
          'Nomor antrean booking disesuaikan dengan antrean berjalan poli.',
          'Beri penjelasan secara ramah kepada pasien mengenai penyesuaian nomor antrean akibat keterlambatan > 10 menit.',
          'Pasien dipersilakan menunggu di ruang tunggu poli dengan estimasi waktu baru.',
        ],
        catatanSerahTerima: `[BOOKING TERLAMBAT / LATE] Terlambat ${data.menitKeterlambatan} menit (> batas toleransi 10 menit). Antrean disesuaikan. Tujuan: ${poliTujuan}. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}".`,
      };
    }
  }

  // 11. Pasien Baru Walk-in (Belum Punya No RM)
  if (data.statusPasien === 'baru') {
    return {
      prosedurSopId: 8,
      namaSop: 'Prosedur Registrasi Pasien Baru',
      kodeJalur: 'biru',
      namaJalur: 'Registrasi Pasien Baru & Penerbitan No RM',
      namaPoliAtauLoket: 'Loket Pendaftaran Pasien Baru',
      nomorAntreanFinal: 'BARU-014',
      statusKedatangan: 'Non-Booking',
      alasanProsedur: 'Pasien walk-in baru belum memiliki berkas Rekam Medis (No RM).',
      instruksiStaf: [
        'Minta kartu identitas resmi pasien (KTP/KIA/Kartu Keluarga).',
        'Lakukan registrasi biodata lengkap di SIMRS dan buat berkas Rekam Medis baru.',
        'Terbitkan Nomor Rekam Medis (No RM) dan nomor antrean poli tujuan.',
      ],
      catatanSerahTerima: `[PASIEN BARU] Registrasi pasien baru. No RM diterbitkan. Tujuan: ${data.poliTujuanAwal}. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}".`,
    };
  }

  // 12. Keluhan Belum Jelas / Ragu
  if (data.keluhanJelas === 'tidak' || data.keluhanJelas === 'ragu' || data.targetPoliStaf === 'belum_tahu') {
    return {
      prosedurSopId: 12,
      namaSop: 'Prosedur Penapisan Triase Awal',
      kodeJalur: 'kuning',
      namaJalur: 'Penapisan Awal / Penilaian Perawat Triase',
      namaPoliAtauLoket: 'Meja Perawat Triase / Penapis Awal',
      nomorAntreanFinal: 'TRI-06',
      statusKedatangan: 'Non-Booking',
      alasanProsedur: 'Keluhan pasien belum jelas, samar, atau memiliki keluhan ganda yang tumpang tindih antar-poli.',
      instruksiStaf: [
        'Staf loket tidak diperkenankan berspekulasi menetapkan poli.',
        'Arahkan pasien ke meja perawat triase awal untuk anamnesis penapisan klinis.',
        'Setelah perawat menentukan poli yang tepat, terbitkan slip antrean definitif.',
      ],
      catatanSerahTerima: `[PERLU PENAPISAN AWAL] Keluhan belum spesifik / tumpang tindih. Teks: "${data.teksKeluhanBebas}". Butuh arahan perawat penapis.`,
    };
  }

  // 13. Pasien Anak (< 12 Tahun)
  if (data.usiaPasienTahun > 0 && data.usiaPasienTahun < 12) {
    const isGigi = data.poliTujuanAwal === 'Poli Gigi' || data.poliTujuanAwal === 'Poli Gigi Anak' || data.targetPoliStaf === 'gigi';
    const namaPoli = isGigi ? 'Poli Gigi Anak (Pedodonsia)' : 'Poli Anak';
    return {
      prosedurSopId: 11,
      namaSop: 'Prosedur Pelayanan Pasien Anak',
      kodeJalur: 'hijau',
      namaJalur: `Layanan Pasien Anak (${namaPoli})`,
      namaPoliAtauLoket: namaPoli,
      nomorAntreanFinal: isGigi ? 'PED-04' : 'ANK-07',
      statusKedatangan: 'Non-Booking',
      alasanProsedur: 'Pasien adalah anak-anak berusia di bawah 12 tahun.',
      instruksiStaf: [
        `Arahkan pasien ke ${namaPoli}.`,
        'Pastikan orang tua / wali mendampingi selama proses pendaftaran dan pemeriksaan.',
      ],
      catatanSerahTerima: `[PASIEN ANAK] Usia: ${data.usiaPasienTahun} tahun. Tujuan: ${namaPoli}. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}".`,
    };
  }

  // 14. BPJS Kesehatan
  if (data.jenisPenjamin === 'bpjs') {
    const targetPoli = data.poliTujuanAwal || (data.targetPoliStaf === 'gigi' ? 'Poli Gigi' : 'Poli Umum');
    if (data.statusBpjs === 'aktif_rujukan_valid') {
      return {
        prosedurSopId: 13,
        namaSop: 'Prosedur BPJS Kesehatan Terverifikasi',
        kodeJalur: 'hijau',
        namaJalur: 'Pelayanan BPJS Kesehatan - Terverifikasi SEP',
        namaPoliAtauLoket: `Loket BPJS -> ${targetPoli}`,
        nomorAntreanFinal: targetPoli === 'Poli Gigi' ? 'BPJS-G11' : 'BPJS-U19',
        statusKedatangan: 'Non-Booking',
        alasanProsedur: 'Pasien peserta BPJS Kesehatan aktif dengan surat rujukan faskes tingkat 1 yang valid.',
        instruksiStaf: [
          'Cetak Surat Eligibilitas Peserta (SEP) melalui portal BPJS.',
          `Arahkan pasien ke ruang tunggu ${targetPoli}.`,
        ],
        catatanSerahTerima: `[BPJS AKTIF] SEP terbit. Penjamin: BPJS Kesehatan. Poli: ${targetPoli}. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}".`,
      };
    } else {
      return {
        prosedurSopId: 14,
        namaSop: 'Prosedur Kendala Administrasi BPJS',
        kodeJalur: 'kuning',
        namaJalur: 'Kendala Administrasi BPJS (Rujukan Habis / Non-Aktif)',
        namaPoliAtauLoket: 'Loket Informasi & Kepesertaan BPJS',
        nomorAntreanFinal: 'INFO-BPJS',
        statusKedatangan: 'Non-Booking',
        alasanProsedur: 'Masa berlaku rujukan BPJS telah habis atau status kartu tercatat non-aktif.',
        instruksiStaf: [
          'Arahkan ke Loket Informasi BPJS untuk pengecekan status Mobile JKN / perpanjangan rujukan.',
          'Berikan opsi pendaftaran sebagai pasien mandiri/umum bila pasien ingin segera diperiksa hari ini.',
        ],
        catatanSerahTerima: `[BPJS KENDALA] Kartu non-aktif atau rujukan kedaluwarsa. Diberikan edukasi perpanjangan atau opsi umum.`,
      };
    }
  }

  // 15. Asuransi Swasta
  if (data.jenisPenjamin === 'asuransi_swasta') {
    const targetPoli = data.poliTujuanAwal || (data.targetPoliStaf === 'gigi' ? 'Poli Gigi' : 'Poli Umum');
    return {
      prosedurSopId: 15,
      namaSop: 'Prosedur Asuransi Swasta & Rekanan',
      kodeJalur: 'hijau',
      namaJalur: 'Layanan Asuransi Swasta / Korporat',
      namaPoliAtauLoket: `Loket Asuransi -> ${targetPoli}`,
      nomorAntreanFinal: targetPoli === 'Poli Gigi' ? 'ASR-G08' : 'ASR-U14',
      statusKedatangan: 'Non-Booking',
      alasanProsedur: 'Pasien menggunakan jaminan Asuransi Swasta / Jaminan Perusahaan.',
      instruksiStaf: [
        'Lakukan gesek kartu / verifikasi portal eligibilitas asuransi dan pastikan benefit poli aktif.',
        'Konfirmasi Surat Jaminan (Guarantee Letter) sebelum pasien masuk ruang periksa.',
      ],
      catatanSerahTerima: `[ASURANSI SWASTA] Eligibilitas asuransi diverifikasi. Tujuan: ${targetPoli}. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}".`,
    };
  }

  // 16. Poli Gigi Walk-in Lama
  if (data.poliTujuanAwal === 'Poli Gigi' || data.targetPoliStaf === 'gigi') {
    return {
      prosedurSopId: 9,
      namaSop: 'Prosedur Pemeriksaan Poli Gigi Reguler',
      kodeJalur: 'hijau',
      namaJalur: 'Pemeriksaan Poli Gigi (Reguler)',
      namaPoliAtauLoket: 'Ruang Periksa Poli Gigi & Mulut',
      nomorAntreanFinal: 'GIGI-021',
      statusKedatangan: 'Non-Booking',
      alasanProsedur: 'Pasien walk-in lama dengan keluhan spesifik gigi atau mulut yang jelas.',
      instruksiStaf: [
        'Ambil berkas rekam medis gigi atau buka odontogram elektronik.',
        'Arahkan pasien ke ruang tunggu Poli Gigi.',
      ],
      catatanSerahTerima: `[POLI GIGI] Pasien walk-in lama. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}". Lokasi: ${data.lokasiKeluhan || 'Gigi'}. Durasi: ${data.durasiKeluhan || '-'}.`,
    };
  }

  // 17. Poli Umum Walk-in Lama (Default)
  return {
    prosedurSopId: 10,
    namaSop: 'Prosedur Pemeriksaan Poli Umum Reguler',
    kodeJalur: 'hijau',
    namaJalur: 'Pemeriksaan Poli Umum (Reguler)',
    namaPoliAtauLoket: 'Ruang Periksa Poli Umum',
    nomorAntreanFinal: 'UMUM-035',
    statusKedatangan: 'Non-Booking',
    alasanProsedur: 'Pasien walk-in lama dengan keluhan umum yang jelas.',
    instruksiStaf: [
      'Siapkan status rekam medis umum.',
      'Arahkan pasien ke ruang periksa Poli Umum sesuai urutan antrean.',
    ],
    catatanSerahTerima: `[POLI UMUM] Pasien walk-in lama. Keluhan: "${data.ringkasanKeluhan || data.teksKeluhanBebas}". Durasi: ${data.durasiKeluhan || '-'}.`,
  };
}
