import { SimulatedPatient, PatientSimilarityResult } from '../types';
import { SIMULATED_PATIENTS } from '../data/simulatedPatients';

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
 * Calculates similarity between a search query and a simulated patient
 * Returns a score between 0 and 100%
 */
export function calculateMatchScore(query: string, patient: SimulatedPatient): { score: number; matchedFields: string[] } {
  if (!query || !query.trim()) return { score: 0, matchedFields: [] };

  const rawQuery = query.trim().toLowerCase();
  const normQuery = normalizeText(query);
  const matchedFields: string[] = [];

  // Check 1: Exact matches in RM or NIK or Kode
  if (patient.nomorRekamMedis.toLowerCase().includes(rawQuery)) {
    matchedFields.push('Nomor Rekam Medis');
    return { score: 98, matchedFields };
  }
  if (patient.kode.toLowerCase() === rawQuery) {
    matchedFields.push('Kode Registrasi');
    return { score: 100, matchedFields };
  }
  if (patient.nik && patient.nik.includes(rawQuery) && rawQuery.length >= 4) {
    matchedFields.push('NIK');
    return { score: 95, matchedFields };
  }

  // Check 2: Name similarity
  const rawPatientName = patient.nama.toLowerCase();
  const normPatientName = normalizeText(patient.nama);

  // Exact substring check
  if (rawPatientName.includes(rawQuery) || normPatientName.includes(normQuery)) {
    matchedFields.push('Nama Pasien (Sub-kata)');
    const ratio = Math.min(100, Math.round((normQuery.length / normPatientName.length) * 100) + 40);
    return { score: Math.max(75, Math.min(99, ratio)), matchedFields };
  }

  // Token-by-token comparison (handles first name, middle name, last name reordering)
  const queryTokens = normQuery.split(' ').filter(Boolean);
  const patientTokens = normPatientName.split(' ').filter(Boolean);

  let tokenScoreSum = 0;
  for (const qToken of queryTokens) {
    let maxTokenScore = 0;
    for (const pToken of patientTokens) {
      const jw = jaroWinklerSimilarity(qToken, pToken);
      const lev = 1 - (levenshteinDistance(qToken, pToken) / Math.max(qToken.length, pToken.length));
      const tokenScore = (jw * 0.6 + Math.max(0, lev) * 0.4);
      if (tokenScore > maxTokenScore) {
        maxTokenScore = tokenScore;
      }
    }
    tokenScoreSum += maxTokenScore;
  }

  const averageTokenScore = queryTokens.length > 0 ? (tokenScoreSum / queryTokens.length) : 0;

  // Whole string Jaro-Winkler
  const wholeJw = jaroWinklerSimilarity(normQuery, normPatientName);
  const wholeLev = Math.max(0, 1 - (levenshteinDistance(normQuery, normPatientName) / Math.max(normQuery.length, normPatientName.length)));

  const combined = (averageTokenScore * 0.6 + wholeJw * 0.25 + wholeLev * 0.15) * 100;
  const finalScore = Math.min(99, Math.max(0, Math.round(combined)));

  if (finalScore >= 50) {
    matchedFields.push('Nama Pasien');
  }

  return { score: finalScore, matchedFields };
}

/**
 * Searches simulated patients and returns up to 3 best candidates sorted descending
 */
export function searchSimulatedPatients(query: string): PatientSimilarityResult[] {
  if (!query || query.trim().length < 2) return [];

  const results: PatientSimilarityResult[] = SIMULATED_PATIENTS.map((patient) => {
    const { score, matchedFields } = calculateMatchScore(query, patient);
    return {
      ...patient,
      similarityScore: score,
      matchedFields,
    };
  });

  return results
    .filter((res) => res.similarityScore >= 45) // meaningful similarity threshold
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3);
}
