import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  ShieldAlert,
  Send,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Calendar,
  Building,
} from 'lucide-react';
import {
  AiComplaintSuggestionState,
  AiSopQaSuggestionState,
  PatientSimilarityResult,
  SimulatedPatient,
  WizardStepId,
} from '../types';
import { searchSimulatedPatients } from '../utils/textSimilarity';

interface AiAssistantBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: WizardStepId;
  teksKeluhan: string;
  onUpdateTeksKeluhan: (text: string) => void;
  complaintSuggestion: AiComplaintSuggestionState | null;
  onGenerateComplaintAi: (customText?: string) => Promise<void>;
  onUseComplaintSuggestion: () => void;
  onIgnoreComplaintSuggestion: () => void;
  isAiGeneratingComplaint: boolean;
  onSelectPatientCandidate: (candidate: SimulatedPatient) => void;
  onIgnorePatientMatching: () => void;
  onAskSopQuestion: (pertanyaan: string) => Promise<void>;
  isAskingSop: boolean;
  sopQaList: AiSopQaSuggestionState[];
  onUseSopSuggestion: (id: string) => void;
  onIgnoreSopSuggestion: (id: string) => void;
  activeTabOverride?: 'keluhan' | 'pencocokan' | 'sop';
}

export const AiAssistantBottomSheet: React.FC<AiAssistantBottomSheetProps> = ({
  isOpen,
  onClose,
  currentStep,
  teksKeluhan,
  onUpdateTeksKeluhan,
  complaintSuggestion,
  onGenerateComplaintAi,
  onUseComplaintSuggestion,
  onIgnoreComplaintSuggestion,
  isAiGeneratingComplaint,
  onSelectPatientCandidate,
  onIgnorePatientMatching,
  onAskSopQuestion,
  isAskingSop,
  sopQaList,
  onUseSopSuggestion,
  onIgnoreSopSuggestion,
  activeTabOverride,
}) => {
  // Tabs: 'keluhan' | 'pencocokan' | 'sop'
  const [activeTab, setActiveTab] = useState<'keluhan' | 'pencocokan' | 'sop'>('keluhan');

  // Automatically switch tab based on current step or override
  useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride);
    } else if (currentStep === 1) {
      setActiveTab('pencocokan');
    } else if (currentStep === 3) {
      setActiveTab('keluhan');
    }
  }, [currentStep, activeTabOverride, isOpen]);

  // Fitur 2 State
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientCandidates, setPatientCandidates] = useState<PatientSimilarityResult[]>([]);
  const [hasSearchedPatient, setHasSearchedPatient] = useState(false);
  const [selectedCandidateCode, setSelectedCandidateCode] = useState<string | null>(null);

  const handleSearchPatient = () => {
    if (!patientSearchQuery.trim()) return;
    const results = searchSimulatedPatients(patientSearchQuery);
    setPatientCandidates(results);
    setHasSearchedPatient(true);
  };

  // Fitur 3 State
  const [sopQuestionInput, setSopQuestionInput] = useState('');

  const handleAskSop = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sopQuestionInput.trim() || isAskingSop) return;
    const q = sopQuestionInput;
    setSopQuestionInput('');
    await onAskSopQuestion(q);
  };

  const sampleQuestions = [
    'Pasien terlambat 12 menit, apa langkahnya?',
    'Pasien booking datang terlambat lebih dari 15 menit?',
    'Pasien mengeluh pipi bengkak dan susah buka mulut?',
    'Pasien lupa atau kehilangan nomor antrean?',
    'Pasien hanya ingin tebus resep rutin obat kronis?',
    'Rujukan BPJS pasien sudah habis masa berlakunya?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-0 bottom-0 max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl overflow-hidden border-t border-slate-200">
        {/* Drag handle pill */}
        <div className="w-full pt-2.5 pb-1 flex justify-center cursor-grab">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Asisten AI Front-Desk
              </h2>
              <p className="text-xs text-slate-500">
                Pilih bantuan sesuai kebutuhan langkah triase saat ini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('keluhan')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'keluhan'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>✨ 1. Keluhan &amp; Tanda Bahaya</span>
            {currentStep === 3 && (
              <span className="w-2 h-2 rounded-full bg-teal-500" title="Aktif di langkah ini" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pencocokan')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'pencocokan'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔍 2. Pencocokan Data Pasien</span>
            {currentStep === 1 && (
              <span className="w-2 h-2 rounded-full bg-teal-500" title="Aktif di langkah ini" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sop')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sop'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📖 3. Tanya Prosedur SOP</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: MERAPIKAN KELUHAN + TANDA BAHAYA */}
          {activeTab === 'keluhan' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5">
                <p className="text-xs sm:text-sm text-indigo-900 font-medium">
                  <strong>Tugas AI:</strong> Merapikan teks keluhan bebas staf menjadi ringkasan 1 kalimat, lokasi, durasi, mendeteksi tanda bahaya medis, dan saran layanan. Keputusan jalur tetap di tangan staf.
                </p>
              </div>

              {/* Input keluhan jika ingin diedit/diuji langsung */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teks Keluhan Bebas (Catatan Staf dari Pasien)
                </label>
                <textarea
                  rows={3}
                  value={teksKeluhan}
                  onChange={(e) => onUpdateTeksKeluhan(e.target.value)}
                  placeholder="Ketik keluhan pasien di sini, contoh: Pasien bilang gigi geraham bawah kanan sakit nyut-nyutan sejak 3 hari lalu, pipi mulai agak bengkak dan susah mangap..."
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-500 self-center">Contoh cepat:</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateTeksKeluhan(
                          'Pasien mengeluh gigi geraham bawah kanan sakit sekali sejak 3 hari, ada pembengkakan wajah sebelah kanan dan sulit membuka mulut.'
                        )
                      }
                      className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
                    >
                      Bengkak &amp; Trismus (Bahaya)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateTeksKeluhan(
                          'Gusi berdarah sedikit waktu sikat gigi tadi pagi di bagian depan, tidak ada bengkak dan tidak sakit.'
                        )
                      }
                      className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
                    >
                      Gusi Berdarah Ringan (Poli Gigi)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateTeksKeluhan(
                          'Badan agak meriang sejak semalam dan kepala pusing berat, lemas.'
                        )
                      }
                      className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
                    >
                      Meriang / Pusing (Poli Umum)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onGenerateComplaintAi()}
                    disabled={isAiGeneratingComplaint || !teksKeluhan.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                  >
                    {isAiGeneratingComplaint ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI sedang menyusun...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Rapikan &amp; Deteksi AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Kartu Saran AI */}
              {complaintSuggestion && (
                <div className="border-2 border-indigo-200 bg-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
                  {/* Card Header & Decision Status Chip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        Saran AI
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {complaintSuggestion.timestamp}
                      </span>
                    </div>

                    {/* Status Chip */}
                    <div>
                      {complaintSuggestion.decisionState === 'menunggu' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Menunggu keputusan staf
                        </span>
                      )}
                      {complaintSuggestion.decisionState === 'digunakan' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Digunakan
                        </span>
                      )}
                      {complaintSuggestion.decisionState === 'diabaikan' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
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
                          Terdapat potensi tanda bahaya (seperti pembengkakan wajah berat, trismus/sulit buka mulut, perdarahan masif, atau trauma). Peringatan ini untuk kehati-hatian staf; keputusan alur jalur tetap ditentukan secara manual melalui wizard.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ambiguous Complaint Banner if perlu_arahan_petugas */}
                  {complaintSuggestion.perlu_arahan_petugas && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-900 font-medium">
                        <strong>Keluhan belum jelas, minta arahan petugas berwenang.</strong> AI tidak menebak poli bila informasi belum spesifik atau berpotensi tumpang tindih.
                      </p>
                    </div>
                  )}

                  {/* Result Details */}
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div>
                      <span className="font-semibold text-slate-700">Ringkasan Keluhan (1 Kalimat):</span>
                      <p className="mt-0.5 text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                        {complaintSuggestion.ringkasan}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          Lokasi:
                        </span>
                        <span className="font-semibold text-slate-800">{complaintSuggestion.lokasi}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Durasi:
                        </span>
                        <span className="font-semibold text-slate-800">{complaintSuggestion.durasi}</span>
                      </div>
                    </div>

                    {/* Saran Layanan */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-700">Saran Kategori Layanan:</span>
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Saran, bukan keputusan
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {complaintSuggestion.saran_layanan.map((srv, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pertanyaan Klarifikasi */}
                    {complaintSuggestion.pertanyaan_klarifikasi.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-700">
                          Pertanyaan Lanjutan untuk Pasien (Maks 3):
                        </span>
                        <ul className="mt-1 space-y-1">
                          {complaintSuggestion.pertanyaan_klarifikasi.map((q, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-700 flex items-start gap-1.5 bg-slate-50 p-2 rounded-md border border-slate-200"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Buttons Gunakan & Abaikan */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={onIgnoreComplaintSuggestion}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        complaintSuggestion.decisionState === 'diabaikan'
                          ? 'bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      Abaikan
                    </button>

                    <button
                      type="button"
                      onClick={onUseComplaintSuggestion}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        complaintSuggestion.decisionState === 'digunakan'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{complaintSuggestion.decisionState === 'digunakan' ? 'Sudah Digunakan' : 'Gunakan'}</span>
                    </button>
                  </div>

                  {/* Mandatory Micro Disclaimer */}
                  <p className="text-[11px] text-slate-500 italic text-center pt-1">
                    Saran AI membantu merapikan informasi. AI tidak mendiagnosis. Keputusan ada pada staf dan tenaga medis.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENCOCOKAN DATA PINTAR */}
          {activeTab === 'pencocokan' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5">
                <h4 className="text-xs sm:text-sm font-bold text-sky-950 mb-0.5">
                  Pencocokan Pasien Cerdas (Deterministik Jaro-Winkler &amp; Levenshtein)
                </h4>
                <p className="text-xs text-sky-800">
                  Gunakan ketika nomor antrean hilang, pasien lupa membawa kartu, atau nama tidak persis sama (toleran terhadap ejaan seperti <em>Muhamad</em> dan <em>Muhammad</em>).
                </p>
              </div>

              {/* Search Box */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                    placeholder="Ketik nama pasien, No RM (misal: 1049), atau NIK..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchPatient}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
                >
                  Cari Pasien
                </button>
              </div>

              {/* Quick sample names */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">Coba cari:</span>
                {['Muhamad Rizky', 'Siti', 'Ahmad Fauzi', 'RM-001049', 'Dewi Lestari'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setPatientSearchQuery(sample);
                      const res = searchSimulatedPatients(sample);
                      setPatientCandidates(res);
                      setHasSearchedPatient(true);
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Candidates List (Maks 3) */}
              {hasSearchedPatient && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Kandidat Pasien Ditemukan ({patientCandidates.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Maksimal 3 hasil kemiripan tertinggi
                    </span>
                  </div>

                  {patientCandidates.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-600">
                      Tidak ada pasien yang cocok dengan query tersebut. Silakan periksa kembali atau daftarkan sebagai Pasien Baru di Langkah 1.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientCandidates.map((cand) => {
                        const isChosen = selectedCandidateCode === cand.kode;
                        return (
                          <div
                            key={cand.kode}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              isChosen
                                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-sky-300'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm sm:text-base">
                                  {cand.nama}
                                </span>
                                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                                  {cand.nomorRekamMedis}
                                </span>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  cand.similarityScore >= 80
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {cand.similarityScore}% Kemiripan
                              </span>
                            </div>

                            {/* Comparison Data */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Tgl Lahir: <strong>{cand.tanggalLahir}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Jadwal: <strong>{cand.jadwalBooking}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                <span>Poli: <strong>{cand.poli}</strong></span>
                              </div>
                            </div>

                            {/* Verification Warning Notice */}
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 mb-3 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>
                                <strong>Peringatan Verifikasi:</strong> Wajib verifikasi identitas fisik (KTP/kartu pasien) sebelum menerbitkan ulang nomor antrean.
                              </span>
                            </div>

                            {/* Actions: Gunakan kandidat ini / Bukan pasien ini */}
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCandidateCode(null);
                                  onIgnorePatientMatching();
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                Bukan Pasien Ini
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCandidateCode(cand.kode);
                                  onSelectPatientCandidate(cand);
                                }}
                                className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Gunakan Kandidat Ini</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASISTEN TANYA-JAWAB SOP */}
          {activeTab === 'sop' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5">
                <h4 className="text-xs sm:text-sm font-bold text-purple-950 mb-0.5">
                  Konsultasi Prosedur SOP Front-Desk Klinik
                </h4>
                <p className="text-xs text-purple-800">
                  AI menjawab HANYA berlandaskan prosedur standar operasional (SOP) baku klinik, menjelaskan langkah secara lugas, dan tanpa diagnosis medis.
                </p>
              </div>

              {/* Question Form */}
              <form onSubmit={handleAskSop} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Ajukan Pertanyaan Alur / Kendala ke AI SOP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sopQuestionInput}
                    onChange={(e) => setSopQuestionInput(e.target.value)}
                    placeholder="Contoh: Pasien booking terlambat 12 menit, apa langkahnya?"
                    className="flex-1 text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={isAskingSop || !sopQuestionInput.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                  >
                    {isAskingSop ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Tanya</span>
                  </button>
                </div>
              </form>

              {/* Sample Questions Pills */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Contoh Pertanyaan Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleQuestions.map((sq, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onAskSopQuestion(sq)}
                      className="text-left text-xs bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>

              {/* SOP QA History Cards */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Hasil Konsultasi Prosedur SOP
                </span>

                {sopQaList.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Belum ada pertanyaan SOP. Ajukan pertanyaan di atas untuk melihat panduan alur prosedur pelayanan.
                  </div>
                ) : (
                  sopQaList.map((item) => (
                    <div
                      key={item.id}
                      className="border-2 border-purple-200 bg-white rounded-xl p-4 shadow-xs space-y-3"
                    >
                      {/* Header with status chip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            Saran AI - Prosedur SOP
                          </span>
                          <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                        </div>

                        {/* Status Chip */}
                        <div>
                          {item.decisionState === 'menunggu' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Menunggu keputusan staf
                            </span>
                          )}
                          {item.decisionState === 'digunakan' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Digunakan
                            </span>
                          )}
                          {item.decisionState === 'diabaikan' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                              <XCircle className="w-3 h-3 text-slate-500" />
                              Diabaikan
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question asked */}
                      <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        Pertanyaan: "{item.pertanyaan}"
                      </p>

                      {/* AI Answer */}
                      <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                        {item.jawaban}
                      </div>

                      {/* Procedures cited tags */}
                      {((item.prosedur_terkait && item.prosedur_terkait.length > 0) ||
                        ((item as any).aturan_terkait && (item as any).aturan_terkait.length > 0)) && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[11px] text-slate-500">Dasar Prosedur:</span>
                          {(item.prosedur_terkait || (item as any).aturan_terkait).map((at: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[11px] font-semibold"
                            >
                              {at}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onIgnoreSopSuggestion(item.id)}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                            item.decisionState === 'diabaikan'
                              ? 'bg-slate-200 text-slate-700 border-slate-300'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          Abaikan
                        </button>

                        <button
                          type="button"
                          onClick={() => onUseSopSuggestion(item.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            item.decisionState === 'digunakan'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>{item.decisionState === 'digunakan' ? 'Sudah Digunakan' : 'Gunakan'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Fixed Disclaimer Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            AI membantu merapikan dan mencocokkan informasi. AI tidak mendiagnosis. Keputusan ada pada staf dan tenaga medis.
          </p>
        </div>
      </div>
    </div>
  );
};
