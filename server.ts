import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SOP_RULES_TEXT = `
DAFTAR PROSEDUR STANDAR OPERASIONAL (SOP) RSGM MARANATHA:
- Prosedur Gawat Darurat Medis: IF pasien gawat darurat (perdarahan tidak berhenti, sesak napas berat, nyeri dada hebat, atau penurunan kesadaran) THEN segera alihkan ke Jalur Merah / Ruang Tindakan Darurat (IGD) dan panggil dokter/perawat triase seketika.
- Prosedur Tanda Bahaya Spesifik Gigi & Mulut: IF pasien memiliki tanda bahaya gigi/mulut (pembengkakan wajah berat/asimetris, sulit bernapas/menelan, trismus/sulit buka mulut < 1 jari) THEN rujuk segera ke dokter gigi jaga / perawat triase untuk evaluasi cepat sebelum antrean biasa.
- Prosedur Pelayanan Pasien Prioritas: IF pasien adalah lansia (> 65 tahun), ibu hamil risiko tinggi, atau penyandang disabilitas THEN berikan nomor antrean Prioritas / Fast-Track dan sediakan tempat duduk prioritas di dekat loket.
- Prosedur Kedatangan Booking Online Tepat Waktu: IF pasien booking online datang tepat waktu (dalam batas toleransi maksimal 10 menit dari jadwal booking) dan nomor antrean valid THEN lakukan verifikasi cepat data identitas dan langsung arahkan ke ruang tunggu poli terkait.
- Prosedur Keterlambatan Pasien Booking Online: IF pasien booking online datang terlambat lebih dari 10 menit THEN pasien tetap dilayani dengan penyesuaian antrean reguler poli yang sama atau dialihkan ke antrean walk-in jika kuota tersedia.
- Prosedur Penggantian Bukti & Nomor Antrean Hilang: IF pasien lupa atau kehilangan nomor antrean / kartu THEN lakukan pencocokan data identitas (NIK / Nama Lengkap / Tanggal Lahir / No RM); setelah identitas fisik terverifikasi, cetak ulang slip nomor antrean pengganti.
- Prosedur Registrasi Pasien Baru: IF pasien walk-in adalah pasien baru (belum pernah berobat dan belum punya Nomor Rekam Medis) THEN lakukan registrasi data identitas lengkap, buatkan berkas/No RM baru, dan terbitkan nomor antrean poli tujuan.
- Prosedur Pemeriksaan Spesifik Poli Gigi Pasien Lama: IF pasien walk-in lama dengan keluhan spesifik gigi atau mulut yang jelas THEN arahkan ke Poli Gigi (Umum / Konservasi) sesuai riwayat rekam medis sebelumnya.
- Prosedur Pemeriksaan Rutin Poli Umum Pasien Lama: IF pasien walk-in lama dengan keluhan umum (seperti demam, pusing, batuk, pilek, lemas) THEN arahkan ke Poli Umum.
- Prosedur Pelayanan Pasien Anak & Pedodonsia: IF pasien adalah anak-anak usia < 12 tahun THEN arahkan ke Poli Anak (atau Poli Gigi Anak / Pedodonsia jika keluhan gigi).
- Prosedur Penapisan Awal & Konsultasi Perawat Triase: IF keluhan pasien belum jelas, samar, atau memiliki keluhan ganda yang tumpang tindih antar-poli THEN staf TIDAK BOLEH menebak; minta arahan perawat penapis / tenaga medis jaga untuk penapisan awal.
- Prosedur Pelayanan BPJS Kesehatan Aktif: IF pasien peserta BPJS Kesehatan aktif dengan rujukan Faskes 1 yang valid THEN proses administrasi melalui loket BPJS / penerbitan Surat Eligibilitas Peserta (SEP).
- Prosedur Kendala Rujukan & Kepesertaan BPJS: IF pasien peserta BPJS dengan masa berlaku rujukan habis atau kartu non-aktif THEN arahkan ke loket informasi BPJS untuk perpanjangan, atau berikan opsi pendaftaran sebagai pasien umum/mandiri.
- Prosedur Riwayat Kesehatan & Kewaspadaan Klinis (RULE 15): IF terdapat informasi kesehatan penting (alergi, penyakit menahun, obat rutin, sedang hamil) THEN catat sesuai prosedur dan teruskan kepada perawat atau dokter; keputusan tindakan medis ditentukan tenaga medis.
- Prosedur Pelayanan Asuransi Swasta & Jaminan Perusahaan: IF pasien menggunakan Asuransi Swasta / Jaminan Perusahaan THEN lakukan verifikasi eligibilitas kartu dan konfirmasi surat jaminan (GL) sebelum pasien masuk ke poli.
- Prosedur Jalur Cepat Pengulangan Resep Pasien Kronis: IF pasien datang hanya untuk pengulangan resep rutin obat kronis (kondisi stabil tanpa keluhan akut) THEN arahkan ke loket Jalur Cepat Farmasi / Poli Kronis tanpa perlu antre di poli umum reguler.
- Prosedur Administrasi Medis, Surat Keterangan & Pengambilan Lab: IF pasien datang hanya untuk legalisir, surat keterangan sehat, atau pengambilan hasil laboratorium THEN arahkan ke Loket Administrasi Rekam Medis / Loket Informasi.
- Prosedur Kedatangan di Luar Jam Operasional Poli: IF pasien datang di luar jam operasional poli yang dituju THEN tawarkan layanan IGD (bila darurat/akut) atau bantu reservasi booking jadwal untuk keesokan harinya.
- Prosedur Pembatalan Kunjungan & Penolakan Tindakan: IF pasien membatalkan kunjungan atau menolak tindakan pemeriksaan THEN staf wajib mencatat alasan pembatalan pada sistem dan meminta tanda tangan form penolakan/batal.
- Prosedur Mediasi Kendala Sistem & Komplain: IF terjadi kendala sistem atau komplain pasien terkait antrean THEN alihkan komunikasi ke meja Customer Care / Supervisor Loket agar antrean utama tetap berjalan tertib.
- Prosedur Penanganan Kuota Dokter Penuh: IF kuota dokter poli tujuan hari ini telah penuh THEN berikan alternatif dokter pengganti di poli yang sama, jadwal hari berikutnya, atau rujukan faskes jejaring bila mendesak.
- Prosedur Kelengkapan Riwayat Pasien (RULE 22 USULAN): IF alergi atau penyakit menahun masih belum ditanyakan dan belum tercatat THEN tanyakan alergi dan penyakit menahun sebelum pasien diteruskan. Pada pasien baru berstatus paling krusial.
`;

// Helper to sanitize and extract JSON safely
function safeJsonParse(rawText: string) {
  let cleaned = rawText.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return JSON.parse(cleaned);
}

// Fitur 1: Bantuan AI untuk Merapikan Keluhan + Penanda Tanda Bahaya
app.post('/api/gemini/keluhan', async (req: Request, res: Response) => {
  try {
    const { keluhan } = req.body;
    if (!keluhan || typeof keluhan !== 'string' || !keluhan.trim()) {
      res.status(400).json({ error: 'Teks keluhan tidak boleh kosong' });
      return;
    }

    const systemInstruction = `
Anda adalah asisten AI triase front-desk RSGM Maranatha yang bertugas merapikan catatan keluhan dan mendeteksi potensi tanda bahaya untuk staf loket/resepsionis.

TUGAS AI (HANYA INI):
1. Merapikan: Dari teks bebas keluhan yang diketik staf, buat ringkasan keluhan utama dalam 1 kalimat padat dan jelas, identifikasi lokasi keluhan (misal: "Gigi geraham kanan bawah", "Kepala bagian depan", "Tidak spesifik"), dan durasi (misal: "3 hari", "Sejak pagi tadi", "Tidak disebutkan").
2. Menandai tanda bahaya: Jika teks mengandung atau mengindikasikan kondisi seperti:
   - Perdarahan tidak berhenti
   - Pembengkakan wajah berat / asimetris
   - Sulit membuka mulut (trismus) atau sulit menelan
   - Cedera kecelakaan / trauma benturan
   Maka set tanda_bahaya: true. Jika tidak ada kondisi di atas, set tanda_bahaya: false.
3. Saran layanan: Berikan SATU atau DUA kategori layanan yang mungkin sesuai sebagai saran (contoh: ["Poli Gigi"], ["Poli Umum"], atau ["IGD / Tindakan Darurat"]). 
   PENTING: Jika keluhan bisa masuk lebih dari satu layanan, samar, atau tidak jelas, jangan menebak! Set perlu_arahan_petugas: true dan cantumkan dalam array saran_layanan: ["Keluhan belum jelas, minta arahan petugas berwenang"].
4. Pertanyaan klarifikasi: Berikan maksimal 3 pertanyaan lanjutan yang sopan dan ringkas yang bisa ditanyakan staf ke pasien untuk memperjelas keluhan.

LARANGAN KERAS:
- Jangan menyebut diagnosis, nama penyakit, penyebab, atau prognosis.
- Jangan menyarankan obat, dosis, atau tindakan medis.
- Jangan menyatakan tingkat keparahan; cukup tandai "perlu dinilai tenaga medis" via tanda_bahaya.
- Jika ragu, selalu arahkan bahwa keputusan ada pada petugas berwenang atau tenaga medis.
- Gunakan bahasa Indonesia yang baik dan formal.

DATA PRIVASI:
Data yang Anda terima adalah simulasi teks keluhan saja tanpa identitas pasien dan tanpa data riwayat penyakit/kesehatan.

FORMAT OUTPUT:
Keluarkan HANYA JSON valid tanpa teks lain di luar JSON:
{
  "ringkasan": "string (1 kalimat ringkasan keluhan)",
  "lokasi": "string (lokasi keluhan)",
2. Menandai tanda bahaya: Jika teks mengandung atau mengindikasikan kondisi seperti:
   - Perdarahan tidak berhenti
   - Pembengkakan wajah berat / asimetris
   - Sulit membuka mulut (trismus) atau sulit menelan
   - Cedera kecelakaan / trauma benturan
   Maka set tanda_bahaya: true. Jika tidak ada kondisi di atas, set tanda_bahaya: false.
3. Saran layanan: Berikan SATU atau DUA kategori layanan yang mungkin sesuai sebagai saran (contoh: ["Poli Gigi"], ["Poli Umum"], atau ["IGD / Tindakan Darurat"]). 
   PENTING: Jika keluhan bisa masuk lebih dari satu layanan, samar, atau tidak jelas, jangan menebak! Set perlu_arahan_petugas: true dan cantumkan dalam array saran_layanan: ["Keluhan belum jelas, minta arahan petugas berwenang"].
4. Pertanyaan klarifikasi: Berikan maksimal 3 pertanyaan lanjutan yang sopan dan ringkas yang bisa ditanyakan staf ke pasien untuk memperjelas keluhan.

LARANGAN KERAS:
- Jangan menyebut diagnosis, nama penyakit, penyebab, atau prognosis.
- Jangan menyarankan obat, dosis, atau tindakan medis.
- Jangan menyatakan tingkat keparahan; cukup tandai "perlu dinilai tenaga medis" via tanda_bahaya.
- Jika ragu, selalu arahkan bahwa keputusan ada pada petugas berwenang atau tenaga medis.
- Gunakan bahasa Indonesia yang baik dan formal.

DATA PRIVASI:
Data yang Anda terima adalah simulasi keluhan tanpa identitas pasien.

FORMAT OUTPUT:
Keluarkan HANYA JSON valid tanpa teks lain di luar JSON:
{
  "ringkasan": "string (1 kalimat ringkasan keluhan)",
  "lokasi": "string (lokasi keluhan)",
  "durasi": "string (durasi atau 'Tidak disebutkan')",
  "tanda_bahaya": boolean,
  "saran_layanan": ["string"],
  "pertanyaan_klarifikasi": ["string"],
  "perlu_arahan_petugas": boolean
}
`;

    // 15 seconds timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Teks keluhan bebas dari pasien:\n"${keluhan.trim()}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      clearTimeout(timeout);

      const raw = response.text || '{}';
      const parsed = safeJsonParse(raw);

      // Validate structure with robust fallbacks
      const result = {
        ringkasan: typeof parsed.ringkasan === 'string' && parsed.ringkasan ? parsed.ringkasan : keluhan.trim(),
        lokasi: typeof parsed.lokasi === 'string' && parsed.lokasi ? parsed.lokasi : 'Tidak spesifik',
        durasi: typeof parsed.durasi === 'string' && parsed.durasi ? parsed.durasi : 'Tidak disebutkan',
        tanda_bahaya: Boolean(parsed.tanda_bahaya),
        saran_layanan: Array.isArray(parsed.saran_layanan) && parsed.saran_layanan.length > 0 ? parsed.saran_layanan.slice(0, 2) : ['Keluhan belum jelas, minta arahan petugas berwenang'],
        pertanyaan_klarifikasi: Array.isArray(parsed.pertanyaan_klarifikasi) ? parsed.pertanyaan_klarifikasi.slice(0, 3) : [],
        perlu_arahan_petugas: Boolean(parsed.perlu_arahan_petugas),
      };

      res.json({ success: true, data: result });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error: any) {
    console.error('Error generating keluhan summary:', error);
    res.status(500).json({
      success: false,
      error: 'AI tidak dapat dihubungi, lanjutkan secara manual',
    });
  }
});

// Fitur 3: Asisten Tanya-Jawab SOP berdasarkan 21 Aturan IF...THEN
app.post('/api/gemini/sop-qa', async (req: Request, res: Response) => {
  try {
    const { pertanyaan } = req.body;
    if (!pertanyaan || typeof pertanyaan !== 'string' || !pertanyaan.trim()) {
      res.status(400).json({ error: 'Pertanyaan tidak boleh kosong' });
      return;
    }

    const systemInstruction = `
Anda adalah Asisten Tanya-Jawab SOP Front-Desk Klinik.
Anda bertugas membantu staf loket / perawat resepsionis menjawab pertanyaan operasional alur pelayanan pasien.

${SOP_RULES_TEXT}

INSTRUKSI JAWABAN:
1. Jawab HANYA berdasarkan 21 aturan SOP di atas.
2. Sebutkan secara jelas nama prosedur SOP yang dipakai (misalnya: "Berdasarkan Prosedur Keterlambatan Pasien Booking: ...").
3. PENTING: JANGAN cantumkan nomor atau frasa "Aturan X" atau "Aturan 1/2/dst". Gunakan nama prosedur formal secara profesional.
4. Toleransi keterlambatan booking online adalah MAKSIMAL 10 MENIT. Jika terlambat > 10 menit, nomor booking disesuaikan dengan antrean reguler atau dialihkan ke walk-in bila kuota ada.
5. Gunakan bahasa Indonesia singkat, padat, lugas, dan prosedural.
6. Jika pertanyaan pengguna TIDAK diatur atau berada di luar cakupan prosedur tersebut, jawab persis: "Tidak diatur dalam aturan, minta arahan petugas berwenang."
7. LARANGAN KERAS:
   - Jangan menyebut diagnosis, nama penyakit, penyebab, atau prognosis.
   - Jangan menyarankan obat, dosis, atau tindakan medis.
   - Jangan menyatakan tingkat keparahan.
   - Jika ragu, arahkan ke petugas berwenang atau tenaga medis.

FORMAT OUTPUT:
Keluarkan HANYA JSON valid:
{
  "jawaban": "string (teks jawaban singkat berbasis nama prosedur)",
  "prosedur_terkait": ["string (misal: 'Prosedur Keterlambatan Pasien Booking')"],
  "tercakup": boolean
}
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Pertanyaan staf loket: "${pertanyaan.trim()}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      clearTimeout(timeout);

      const raw = response.text || '{}';
      const parsed = safeJsonParse(raw);

      res.json({
        success: true,
        data: {
          jawaban: parsed.jawaban || 'Tidak diatur dalam aturan, minta arahan petugas berwenang.',
          prosedur_terkait: Array.isArray(parsed.prosedur_terkait)
            ? parsed.prosedur_terkait
            : Array.isArray(parsed.aturan_terkait)
            ? parsed.aturan_terkait
            : [],
          tercakup: Boolean(parsed.tercakup ?? true),
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error: any) {
    console.error('Error answering SOP Q&A:', error);
    res.status(500).json({
      success: false,
      error: 'AI tidak dapat dihubungi, lanjutkan secara manual',
    });
  }
});

// Serve frontend in dev or prod
async function setupApp() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error('Failed to start server:', err);
});
