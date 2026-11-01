import { SimulatedPatient, PatientSimilarityResult } from '../types';
import { SIMULATED_PATIENTS } from '../data/simulatedPatients';
import { getAllAccounts, getStoredAppointments } from './patientStorage';

/**
 * Normalizes string by trimming, lowercasing, and replacing common Indonesian phonetic spelling variations:
 * e.g., 'muhamad' vs 'muhammad', 'achmad' vs 'ahmad', 'oe' vs 'u', double letters, etc.
 */
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/oe/g, 'u')
    .replace(/ch/g, 'h')
    .replace(/dh/g, 'd')
    .replace(/th/g, 't')
    .replace(/kh/g, 'h')
    .replace(/sh/g, 's')
    .replace(/ph/g, 'f')
    .replace(/(.)\1+/g, '$1'); // Collapse repeated letters (e.g., muhammad -> muhamad)
}

/**
 * Computes Levenshtein Distance
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j], // deletion
          dp[i][j - 1], // insertion
          dp[i - 1][j - 1] // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Computes Jaro Similarity
 */
function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1.length || !s2.length) return 0.0;

  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const sim = (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;
  return sim;
}

/**
 * Computes Jaro-Winkler Similarity
 */
function jaroWinklerSimilarity(s1: string, s2: string): number {
  const jaroSim = jaroSimilarity(s1, s2);
  let prefix = 0;
  const maxPrefix = 4;
  for (let i = 0; i < Math.min(s1.length, s2.length, maxPrefix); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  const p = 0.1; // standard scaling factor
  return jaroSim + prefix * p * (1 - jaroSim);
}

/**
 * Retrieves ALL searchable patients in the system:
 * 1. Base simulated patients (P-001 to P-010)
 * 2. All accounts registered by users (via register forms or SIMRS)
 * 3. All appointments booked online
 */
export function getAllSearchablePatients(): SimulatedPatient[] {
  const patientMap = new Map<string, SimulatedPatient>();

  // 1. Base simulated patients
  for (const p of SIMULATED_PATIENTS) {
    const key = (p.nomorRekamMedis || p.kode || p.nama).toLowerCase();
    patientMap.set(key, p);
  }

  // 2. Registered accounts in localStorage (including any newly registered patient!)
  try {
    const registered = getAllAccounts();
    for (const acc of registered) {
      const key = (acc.nomorRekamMedis || acc.nik || acc.nama).toLowerCase();
      const existing = patientMap.get(key);
      if (existing) {
        patientMap.set(key, {
          ...existing,
          nama: acc.nama || existing.nama,
          nik: acc.nik || existing.nik,
          nomorRekamMedis: acc.nomorRekamMedis || existing.nomorRekamMedis,
          tanggalLahir: acc.tanggalLahir || existing.tanggalLahir,
          jenisKelamin: acc.jenisKelamin || existing.jenisKelamin,
          alamat: acc.alamat || existing.alamat,
          telepon: acc.telepon || existing.telepon,
          riwayatKesehatan: acc.riwayatKesehatan || existing.riwayatKesehatan,
        });
      } else {
        patientMap.set(key, {
          kode: `REG-${(acc.nomorRekamMedis || acc.nik || Math.random().toString()).slice(-4)}`,
          nama: acc.nama,
          tanggalLahir: acc.tanggalLahir || '01-01-1995',
          nomorRekamMedis: acc.nomorRekamMedis || `RM-00${Math.floor(1060 + Math.random() * 500)}`,
          jadwalBooking: 'Hari ini, 09:00 WIB (Poli Umum)',
          poli: 'Poli Umum',
          telepon: acc.telepon || '-',
          nik: acc.nik || '',
          jenisKelamin: acc.jenisKelamin || 'Laki-laki',
          alamat: acc.alamat || 'Kota Bandung, Jawa Barat',
          golonganDarah: acc.golonganDarah || 'O (+)',
          riwayatKesehatan: acc.riwayatKesehatan || {
            alergi: '',
            penyakit_menahun: '',
            obat_rutin: '',
            sedang_hamil: 'tidak',
          },
          alergi: {
            ada: Boolean(acc.riwayatKesehatan?.alergi),
            daftarAlergi: acc.riwayatKesehatan?.alergi ? [acc.riwayatKesehatan.alergi] : [],
          },
          komorbid: acc.riwayatKesehatan?.penyakit_menahun ? [acc.riwayatKesehatan.penyakit_menahun] : [],
          riwayatKunjungan: [],
        });
      }
    }
  } catch (e) {
    console.error('Error fetching registered accounts for patient search', e);
  }

  // 3. Registered appointments in localStorage
  try {
    const appointments = getStoredAppointments();
    for (const app of appointments) {
      const key = (app.nomorRekamMedis || app.patientNik || app.patientNama).toLowerCase();
      if (!patientMap.has(key)) {
        patientMap.set(key, {
          kode: `BOK-${app.nomorAntrean.slice(-3)}`,
          nama: app.patientNama,
          tanggalLahir: app.tanggalLahir,
          nomorRekamMedis: app.nomorRekamMedis,
          jadwalBooking: `${app.tanggalKunjungan}, ${app.jamKunjungan} (${app.poli})`,
          poli: app.poli === 'Poli Gigi' ? 'Poli Gigi' : 'Poli Umum',
          telepon: app.telepon,
          nik: app.patientNik,
          jenisKelamin: 'Laki-laki',
          alamat: 'Kota Bandung, Jawa Barat',
          golonganDarah: 'O (+)',
          riwayatKesehatan: app.riwayatKesehatan || {
            alergi: '',
            penyakit_menahun: '',
            obat_rutin: '',
            sedang_hamil: 'tidak',
          },
          alergi: {
            ada: Boolean(app.riwayatKesehatan?.alergi),
            daftarAlergi: app.riwayatKesehatan?.alergi ? [app.riwayatKesehatan.alergi] : [],
          },
          komorbid: app.riwayatKesehatan?.penyakit_menahun ? [app.riwayatKesehatan.penyakit_menahun] : [],
          riwayatKunjungan: [],
        });
      }
    }
  } catch (e) {
    console.error('Error fetching appointments for patient search', e);
  }

  return Array.from(patientMap.values());
}

/**
 * Calculates similarity between a search query and a patient
 * Returns a score between 0 and 100%
 */
export function calculateMatchScore(query: string, patient: SimulatedPatient): { score: number; matchedFields: string[] } {
  if (!query || !query.trim()) return { score: 0, matchedFields: [] };

  const rawQuery = query.trim().toLowerCase();
  const normQuery = normalizeText(query);
  const matchedFields: string[] = [];

  const rawPatientName = (patient.nama || '').toLowerCase();
  const normPatientName = normalizeText(patient.nama || '');
  const rm = (patient.nomorRekamMedis || '').toLowerCase();
  const rmClean = rm.replace(/[^a-z0-9]/g, '');
  const queryClean = rawQuery.replace(/[^a-z0-9]/g, '');
  const nik = (patient.nik || '').toLowerCase();

  // Check 1: Exact matches in RM or clean digits
  if (rm.includes(rawQuery) || (queryClean.length >= 2 && rmClean.includes(queryClean))) {
    matchedFields.push('Nomor Rekam Medis');
    return { score: 99, matchedFields };
  }

  // Check 2: NIK match
  if (nik && rawQuery.length >= 3 && nik.includes(rawQuery)) {
    matchedFields.push('NIK');
    return { score: 98, matchedFields };
  }

  // Check 3: Kode Registrasi
  if (patient.kode && patient.kode.toLowerCase() === rawQuery) {
    matchedFields.push('Kode Registrasi');
    return { score: 100, matchedFields };
  }

  // Check 4: Exact full name match
  if (rawPatientName === rawQuery || normPatientName === normQuery) {
    matchedFields.push('Nama Lengkap (Persis)');
    return { score: 100, matchedFields };
  }

  // Check 5: Substring check in name
  if (rawPatientName.includes(rawQuery) || normPatientName.includes(normQuery)) {
    matchedFields.push('Nama Pasien (Sub-kata)');
    return { score: 95, matchedFields };
  }

  // Check 6: Token-by-token comparison (handles reordered names, typos, and phonetic variants)
  const queryTokens = normQuery.split(' ').filter(Boolean);
  const patientTokens = normPatientName.split(' ').filter(Boolean);

  let hasDirectTokenMatch = false;
  let tokenScoreSum = 0;

  for (const qToken of queryTokens) {
    let maxTokenScore = 0;
    for (const pToken of patientTokens) {
      if (pToken === qToken) {
        maxTokenScore = 1.0;
        hasDirectTokenMatch = true;
      } else if (pToken.startsWith(qToken) || qToken.startsWith(pToken)) {
        maxTokenScore = Math.max(maxTokenScore, 0.9);
        hasDirectTokenMatch = true;
      } else {
        const jw = jaroWinklerSimilarity(qToken, pToken);
        const lev = 1 - (levenshteinDistance(qToken, pToken) / Math.max(qToken.length, pToken.length));
        const tokenScore = (jw * 0.6 + Math.max(0, lev) * 0.4);
        if (tokenScore > maxTokenScore) {
          maxTokenScore = tokenScore;
        }
      }
    }
    tokenScoreSum += maxTokenScore;
  }

  const averageTokenScore = queryTokens.length > 0 ? (tokenScoreSum / queryTokens.length) : 0;

  // Whole string Jaro-Winkler & Levenshtein
  const wholeJw = jaroWinklerSimilarity(normQuery, normPatientName);
  const wholeLev = Math.max(0, 1 - (levenshteinDistance(normQuery, normPatientName) / Math.max(normQuery.length, normPatientName.length)));

  const combined = (averageTokenScore * 0.6 + wholeJw * 0.25 + wholeLev * 0.15) * 100;
  const finalScore = Math.min(99, Math.max(0, Math.round(combined)));

  if (hasDirectTokenMatch || finalScore >= 45) {
    matchedFields.push('Nama Pasien');
  }

  return {
    score: hasDirectTokenMatch ? Math.max(85, finalScore) : finalScore,
    matchedFields,
  };
}

/**
 * Searches all patients (both simulated and newly registered accounts)
 * and returns up to 5 best candidates sorted descending
 */
export function searchSimulatedPatients(query: string): PatientSimilarityResult[] {
  if (!query || !query.trim()) return [];

  const allPatients = getAllSearchablePatients();
  const trimmed = query.trim().toLowerCase();
  const queryClean = trimmed.replace(/[^a-z0-9]/g, '');

  const results: PatientSimilarityResult[] = allPatients.map((patient) => {
    const { score, matchedFields } = calculateMatchScore(query, patient);
    return {
      ...patient,
      similarityScore: score,
      matchedFields,
    };
  });

  return results
    .filter((res) => {
      if (res.similarityScore >= 40) return true;
      const name = (res.nama || '').toLowerCase();
      const rm = (res.nomorRekamMedis || '').toLowerCase();
      const nik = (res.nik || '').toLowerCase();
      return (
        name.includes(trimmed) ||
        rm.includes(trimmed) ||
        (queryClean.length >= 2 && rm.replace(/[^a-z0-9]/g, '').includes(queryClean)) ||
        (trimmed.length >= 3 && nik.includes(trimmed))
      );
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);
}
