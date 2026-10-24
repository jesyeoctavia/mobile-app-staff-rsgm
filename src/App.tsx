import React, { useState, useMemo } from 'react';
import {
  WizardStepId,
  PatientFormData,
  DecisionResult,
  AiComplaintSuggestionState,
  AiSopQaSuggestionState,
  AiUsageRecord,
  SessionHistoryItem,
  SimulatedPatient,
} from './types';
import { evaluateTriageRules } from './utils/triageEngine';
import { Navbar } from './components/Navbar';
import { WizardSteps } from './components/WizardSteps';
import { Step1PatientIdentity } from './components/Step1PatientIdentity';
import { Step2Screening } from './components/Step2Screening';
import { Step3Complaint } from './components/Step3Complaint';
import { Step4Administration } from './components/Step4Administration';
import { Step5DecisionResult } from './components/Step5DecisionResult';
import { FloatingAiButton } from './components/FloatingAiButton';
import { AiAssistantBottomSheet } from './components/AiAssistantBottomSheet';
import { SessionHistoryModal } from './components/SessionHistoryModal';
import { SopReferenceModal } from './components/SopReferenceModal';
import { DoctorScheduleModal } from './components/DoctorScheduleModal';
import { MedicalRecordModal } from './components/MedicalRecordModal';
import { SIMULATED_PATIENTS } from './data/simulatedPatients';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const INITIAL_FORM_DATA: PatientFormData = {
  // Step 1
  poliTujuanAwal: 'Poli Gigi', // Default selector at start
  jenisKunjungan: 'booking',
  statusPasien: 'lama',
  namaPasien: 'Muhammad Rizky Pratama',
  nik: '3171011405920001',
  tanggalLahir: '14-05-1992',
  nomorRekamMedis: 'RM-001049',
  noAntrean: 'BOK-049',
  jadwalBooking: 'Hari ini, 08:30 WIB (Poli Gigi)',
  jamKedatangan: '08:38 WIB',
  menitKeterlambatan: 8, // Default 8 menit (masuk toleransi <= 10 menit, On-Time)

  // Step 2
  kondisiGawatDarurat: false,
  tandaBahayaGigi: false,
  kategoriPrioritas: 'none',
  kuotaPoliPenuh: false,
  diluarJamLayanan: false,

  // Step 3
  teksKeluhanBebas:
    'Pasien mengeluh gigi geraham bawah kanan sakit nyut-nyutan sejak 3 hari lalu, pipi agak sedikit bengkak dan agak ngilu saat minum dingin.',
  ringkasanKeluhan: '',
  lokasiKeluhan: 'Gigi geraham bawah kanan',
  durasiKeluhan: '3 hari',
  keluhanJelas: 'ya',
  targetPoliStaf: 'gigi',
  usiaPasienTahun: 32,

  // Step 4
  jenisPenjamin: 'bpjs',
  statusBpjs: 'aktif_rujukan_valid',
  asuransiTerverifikasi: false,
  tujuanKhusus: 'pemeriksaan_poli',
  batalKunjungan: false,
  kendalaKomplain: false,
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<WizardStepId>(1);
  const [formData, setFormData] = useState<PatientFormData>(INITIAL_FORM_DATA);

  // Modals state
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDoctorScheduleModalOpen, setIsDoctorScheduleModalOpen] = useState(false);
  const [isMedicalRecordModalOpen, setIsMedicalRecordModalOpen] = useState(false);
  const [selectedMedicalRecordPatient, setSelectedMedicalRecordPatient] = useState<SimulatedPatient | null>(
    SIMULATED_PATIENTS[0]
  );
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiDrawerTabOverride, setAiDrawerTabOverride] = useState<'keluhan' | 'pencocokan' | 'sop' | undefined>(undefined);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 5000);
  };

  // AI Fitur 1 (Keluhan) state
  const [complaintSuggestion, setComplaintSuggestion] = useState<AiComplaintSuggestionState | null>(null);
  const [isAiGeneratingComplaint, setIsAiGeneratingComplaint] = useState(false);

  // AI Fitur 3 (SOP Q&A) state
  const [sopQaList, setSopQaList] = useState<AiSopQaSuggestionState[]>([]);
  const [isAskingSop, setIsAskingSop] = useState(false);

  // AI Global Audit List for the current active patient session
  const [aiUsageList, setAiUsageList] = useState<AiUsageRecord[]>([]);

  // Session History (stored in memory, NO localStorage)
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([
    {
      id: 'SES-001',
      waktu: '08:15 WIB',
      namaPasien: 'Budi Santoso',
      noRekamMedis: 'RM-001042',
      noAntreanFinal: 'UMUM-035',
      jalurKeputusan: 'Pemeriksaan Poli Umum (Reguler)',
      prosedurSop: 'Prosedur Pemeriksaan Rutin Poli Umum Pasien Lama',
      bantuanAiStatus: '1 Digunakan',
      statusKedatangan: 'Tepat Waktu (On-Time)',
      catatanSerahTerima: '[POLI UMUM] Pasien walk-in lama. Keluhan: "Kontrol rutin tensi bulanan".\n[STATUS PEMAKAIAN AI]\n• Fitur 1 (Merapikan Keluhan): DIGUNAKAN',
      aiUsageList: [
        {
          id: 'ai-init-1',
          fiturId: 'fitur1_keluhan',
          fiturNama: 'Fitur 1 (Merapikan Keluhan)',
          timestamp: '08:12 WIB',
          status: 'digunakan',
          detail: 'Ringkasan keluhan dirapikan: Kontrol hipertensi bulanan tanpa keluhan akut.',
        },
      ],
    },
  ]);

  // Derived AI counters
  const aiUsedCount = useMemo(() => {
    return aiUsageList.filter((a) => a.status === 'digunakan').length;
  }, [aiUsageList]);

  const aiIgnoredCount = useMemo(() => {
    return aiUsageList.filter((a) => a.status === 'diabaikan').length;
  }, [aiUsageList]);

  // Indicator if an AI suggestion is waiting for decision
  const hasReadySuggestion = useMemo(() => {
    const complaintWaiting = complaintSuggestion && complaintSuggestion.decisionState === 'menunggu';
    const sopWaiting = sopQaList.some((s) => s.decisionState === 'menunggu');
    return Boolean(complaintWaiting || sopWaiting);
  }, [complaintSuggestion, sopQaList]);

  // Form field updater helper
  const handleUpdateFormData = (updates: Partial<PatientFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // -------------------------------------------------------------
  // FITUR 1: Bantuan AI untuk Merapikan Keluhan + Tanda Bahaya
  // -------------------------------------------------------------
  const handleGenerateComplaintAi = async (customText?: string) => {
    const textToAnalyze = customText || formData.teksKeluhanBebas;
    if (!textToAnalyze.trim()) {
      showToast('Ketik teks keluhan pasien terlebih dahulu.');
      return;
    }

    setIsAiGeneratingComplaint(true);

    try {
      const response = await fetch('/api/gemini/keluhan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keluhan: textToAnalyze }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const resJson = await response.json();

      if (!resJson.success || !resJson.data) {
        throw new Error(resJson.error || 'Gagal memproses keluhan');
      }

      const data = resJson.data;

      const newSuggestion: AiComplaintSuggestionState = {
        ringkasan: data.ringkasan || textToAnalyze,
        lokasi: data.lokasi || 'Tidak spesifik',
        durasi: data.durasi || 'Tidak disebutkan',
        tanda_bahaya: Boolean(data.tanda_bahaya),
        saran_layanan: Array.isArray(data.saran_layanan) ? data.saran_layanan : [],
        pertanyaan_klarifikasi: Array.isArray(data.pertanyaan_klarifikasi) ? data.pertanyaan_klarifikasi : [],
        perlu_arahan_petugas: Boolean(data.perlu_arahan_petugas),
        decisionState: 'menunggu',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setComplaintSuggestion(newSuggestion);

      if (newSuggestion.tanda_bahaya) {
        showToast('⚠️ AI mendeteksi potensi tanda bahaya. Harap perhatikan banner merah.');
      }
    } catch (err) {
      console.error('Error generating complaint AI:', err);
      showToast('AI tidak dapat dihubungi, lanjutkan secara manual');
    } finally {
      setIsAiGeneratingComplaint(false);
    }
  };

  const handleUseComplaintSuggestion = () => {
    if (!complaintSuggestion) return;

    setFormData((prev) => ({
      ...prev,
      ringkasanKeluhan: complaintSuggestion.ringkasan,
      lokasiKeluhan: complaintSuggestion.lokasi,
      durasiKeluhan: complaintSuggestion.durasi,
      tandaBahayaGigi: complaintSuggestion.tanda_bahaya ? true : prev.tandaBahayaGigi,
      targetPoliStaf: complaintSuggestion.saran_layanan.some((s) => s.toLowerCase().includes('gigi'))
        ? 'gigi'
        : complaintSuggestion.saran_layanan.some((s) => s.toLowerCase().includes('umum'))
        ? 'umum'
        : prev.targetPoliStaf,
    }));

    setComplaintSuggestion((prev) => (prev ? { ...prev, decisionState: 'digunakan' } : null));

    const newRecord: AiUsageRecord = {
      id: `ai-rec-${Date.now()}`,
      fiturId: 'fitur1_keluhan',
      fiturNama: 'Fitur 1 (Merapikan Keluhan)',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'digunakan',
      detail: `Ringkasan: "${complaintSuggestion.ringkasan}". Lokasi: ${complaintSuggestion.lokasi}. Durasi: ${complaintSuggestion.durasi}. Tanda Bahaya: ${complaintSuggestion.tanda_bahaya ? 'Ya' : 'Tidak'}.`,
    };

    setAiUsageList((prev) => [newRecord, ...prev.filter((r) => r.fiturId !== 'fitur1_keluhan')]);
  };

  const handleIgnoreComplaintSuggestion = () => {
    if (!complaintSuggestion) return;

    setComplaintSuggestion((prev) => (prev ? { ...prev, decisionState: 'diabaikan' } : null));

    const newRecord: AiUsageRecord = {
      id: `ai-rec-${Date.now()}`,
      fiturId: 'fitur1_keluhan',
      fiturNama: 'Fitur 1 (Merapikan Keluhan)',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'diabaikan',
      detail: 'Staf memilih mengabaikan saran AI dan menggunakan input manual.',
    };

    setAiUsageList((prev) => [newRecord, ...prev.filter((r) => r.fiturId !== 'fitur1_keluhan')]);
  };

  // -------------------------------------------------------------
  // FITUR 2: Pencocokan Data Pasien (Deterministik Lokal)
  // -------------------------------------------------------------
  const handleSelectPatientCandidate = (candidate: SimulatedPatient) => {
    setFormData((prev) => ({
      ...prev,
      namaPasien: candidate.nama,
      tanggalLahir: candidate.tanggalLahir,
      nomorRekamMedis: candidate.nomorRekamMedis,
      jadwalBooking: candidate.jadwalBooking,
      nik: candidate.nik || prev.nik,
      noAntrean: `RE-BOK-${candidate.nomorRekamMedis.slice(-3)}`,
      poliTujuanAwal: candidate.poli === 'Poli Gigi' ? 'Poli Gigi' : 'Poli Umum',
      jenisKunjungan: 'booking',
      statusPasien: 'lama',
    }));

    setSelectedMedicalRecordPatient(candidate);

    const newRecord: AiUsageRecord = {
      id: `ai-rec-${Date.now()}`,
      fiturId: 'fitur2_pencocokan',
      fiturNama: 'Fitur 2 (Pencocokan Pasien Cerdas)',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'digunakan',
      detail: `Pasien dicocokkan ke ${candidate.nama} (${candidate.nomorRekamMedis}) via kemiripan deterministik Jaro-Winkler.`,
    };

    setAiUsageList((prev) => [newRecord, ...prev.filter((r) => r.fiturId !== 'fitur2_pencocokan')]);
    setIsAiDrawerOpen(false);
    showToast(`✓ Data pasien ${candidate.nama} berhasil diterapkan.`);
  };

  const handleIgnorePatientMatching = () => {
    const newRecord: AiUsageRecord = {
      id: `ai-rec-${Date.now()}`,
      fiturId: 'fitur2_pencocokan',
      fiturNama: 'Fitur 2 (Pencocokan Pasien Cerdas)',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'diabaikan',
      detail: 'Staf menyatakan kandidat bukan pasien yang dimaksud.',
    };

    setAiUsageList((prev) => [newRecord, ...prev.filter((r) => r.fiturId !== 'fitur2_pencocokan')]);
  };

  // -------------------------------------------------------------
  // FITUR 3: Asisten Tanya-Jawab SOP (Gemini API Prosedur)
  // -------------------------------------------------------------
  const handleAskSopQuestion = async (pertanyaan: string) => {
    if (!pertanyaan.trim()) return;

    setIsAskingSop(true);

    try {
      const response = await fetch('/api/gemini/sop-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pertanyaan }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const resJson = await response.json();

      if (!resJson.success || !resJson.data) {
        throw new Error(resJson.error || 'Gagal memproses pertanyaan SOP');
      }

      const data = resJson.data;

      const newQaItem: AiSopQaSuggestionState = {
        id: `sop-qa-${Date.now()}`,
        pertanyaan,
        jawaban: data.jawaban || 'Tidak diatur dalam aturan, minta arahan petugas berwenang.',
        prosedur_terkait: Array.isArray(data.prosedur_terkait)
          ? data.prosedur_terkait
          : Array.isArray(data.aturan_terkait)
          ? data.aturan_terkait
          : [],
        tercakup: Boolean(data.tercakup ?? true),
        decisionState: 'menunggu',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setSopQaList((prev) => [newQaItem, ...prev]);
    } catch (err) {
      console.error('Error asking SOP question:', err);
      showToast('AI tidak dapat dihubungi, lanjutkan secara manual');
    } finally {
      setIsAskingSop(false);
    }
  };

  const handleUseSopSuggestion = (id: string) => {
    const target = sopQaList.find((s) => s.id === id);
    if (!target) return;

    setSopQaList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, decisionState: 'digunakan' } : item))
    );

    const newRecord: AiUsageRecord = {
      id: `ai-rec-${Date.now()}`,
      fiturId: 'fitur3_sop_qa',
      fiturNama: 'Fitur 3 (Asisten Tanya-Jawab SOP)',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'digunakan',
      detail: `Pertanyaan: "${target.pertanyaan}". Prosedur: ${target.prosedur_terkait.join(', ') || 'SOP Prosedur'}.`,
    };

    setAiUsageList((prev) => [newRecord, ...prev]);
  };

  const handleIgnoreSopSuggestion = (id: string) => {
    const target = sopQaList.find((s) => s.id === id);
    if (!target) return;

    setSopQaList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, decisionState: 'diabaikan' } : item))
    );

    const newRecord: AiUsageRecord = {
      id: `ai-rec-${Date.now()}`,
      fiturId: 'fitur3_sop_qa',
      fiturNama: 'Fitur 3 (Asisten Tanya-Jawab SOP)',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'diabaikan',
      detail: `Pertanyaan "${target.pertanyaan}" diabaikan oleh staf.`,
    };

    setAiUsageList((prev) => [newRecord, ...prev]);
  };

  // -------------------------------------------------------------
  // Decision Calculation & Session Management
  // -------------------------------------------------------------
  const calculatedDecision = useMemo(() => {
    return evaluateTriageRules(formData);
  }, [formData]);

  const handleSaveSession = () => {
    const used = aiUsageList.filter((a) => a.status === 'digunakan').length;
    const ignored = aiUsageList.filter((a) => a.status === 'diabaikan').length;

    let aiSummaryText = 'Tidak dipakai';
    if (used > 0 && ignored > 0) {
      aiSummaryText = `${used} Digunakan, ${ignored} Diabaikan`;
    } else if (used > 0) {
      aiSummaryText = `${used} Digunakan`;
    } else if (ignored > 0) {
      aiSummaryText = `${ignored} Diabaikan`;
    }

    const newSession: SessionHistoryItem = {
      id: `SES-${String(sessionHistory.length + 1).padStart(3, '0')}`,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      namaPasien: formData.namaPasien || 'Pasien Tanpa Nama',
      noRekamMedis: formData.nomorRekamMedis || '-',
      noAntreanFinal: calculatedDecision.nomorAntreanFinal,
      jalurKeputusan: calculatedDecision.namaJalur,
      prosedurSop: calculatedDecision.namaSop,
      statusKedatangan: calculatedDecision.statusKedatangan,
      bantuanAiStatus: aiSummaryText,
      aiUsageList: [...aiUsageList],
      catatanSerahTerima: calculatedDecision.catatanSerahTerima,
    };

    setSessionHistory((prev) => [newSession, ...prev]);
    showToast('✓ Sesi triase pasien berhasil disimpan ke riwayat!');
    setIsHistoryModalOpen(true);
  };

  const handleResetWizard = () => {
    setFormData({
      ...INITIAL_FORM_DATA,
      namaPasien: '',
      nik: '',
      tanggalLahir: '',
      nomorRekamMedis: '',
      noAntrean: '',
      teksKeluhanBebas: '',
      ringkasanKeluhan: '',
    });
    setComplaintSuggestion(null);
    setAiUsageList([]);
    setCurrentStep(1);
    showToast('Formulir direset untuk sesi pasien baru.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased pb-20 sm:pb-12">
      {/* Top Formal Navbar with Hamburger Drawer & Quick Action Links */}
      <Navbar
        currentStep={currentStep}
        aiUsedCount={aiUsedCount}
        aiIgnoredCount={aiIgnoredCount}
        historyCount={sessionHistory.length}
        onOpenSopModal={() => setIsSopModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenDoctorScheduleModal={() => setIsDoctorScheduleModalOpen(true)}
        onOpenMedicalRecordModal={() => {
          const matched = SIMULATED_PATIENTS.find(
            (p) =>
              p.nomorRekamMedis.toLowerCase() === (formData.nomorRekamMedis || '').toLowerCase() ||
              p.nama.toLowerCase().includes((formData.namaPasien || '').toLowerCase().trim())
          );
          setSelectedMedicalRecordPatient(matched || SIMULATED_PATIENTS[0]);
          setIsMedicalRecordModalOpen(true);
        }}
        onOpenAiDrawer={() => {
          setAiDrawerTabOverride(undefined);
          setIsAiDrawerOpen(true);
        }}
        onResetWizard={handleResetWizard}
      />

      {/* Clean Formal Wizard Progress Line */}
      <WizardSteps
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Toast Alert Message if any */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentStep === 1 && (
          <Step1PatientIdentity
            formData={formData}
            onChange={handleUpdateFormData}
            onOpenAiMatching={() => {
              setAiDrawerTabOverride('pencocokan');
              setIsAiDrawerOpen(true);
            }}
            onOpenMedicalRecord={(p) => {
              setSelectedMedicalRecordPatient(p || SIMULATED_PATIENTS[0]);
              setIsMedicalRecordModalOpen(true);
            }}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Screening
            formData={formData}
            onChange={handleUpdateFormData}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Complaint
            formData={formData}
            onChange={handleUpdateFormData}
            complaintSuggestion={complaintSuggestion}
            onGenerateComplaintAi={handleGenerateComplaintAi}
            onUseComplaintSuggestion={handleUseComplaintSuggestion}
            onIgnoreComplaintSuggestion={handleIgnoreComplaintSuggestion}
            isAiGeneratingComplaint={isAiGeneratingComplaint}
            onNext={() => setCurrentStep(4)}
            onPrev={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Administration
            formData={formData}
            onChange={handleUpdateFormData}
            onNext={() => setCurrentStep(5)}
            onPrev={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5DecisionResult
            formData={formData}
            decision={calculatedDecision}
            aiUsageList={aiUsageList}
            onSaveSession={handleSaveSession}
            onResetWizard={handleResetWizard}
            onPrev={() => setCurrentStep(4)}
          />
        )}
      </main>

      {/* Floating Action Button "✨ Bantu AI" */}
      <FloatingAiButton
        isLoading={isAiGeneratingComplaint || isAskingSop}
        hasReadySuggestion={hasReadySuggestion}
        onClick={() => {
          setAiDrawerTabOverride(undefined);
          setIsAiDrawerOpen(true);
        }}
      />

      {/* Bottom Sheet Mobile-First Drawer for AI Assistant */}
      <AiAssistantBottomSheet
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        currentStep={currentStep}
        teksKeluhan={formData.teksKeluhanBebas}
        onUpdateTeksKeluhan={(txt) => handleUpdateFormData({ teksKeluhanBebas: txt })}
        complaintSuggestion={complaintSuggestion}
        onGenerateComplaintAi={handleGenerateComplaintAi}
        onUseComplaintSuggestion={handleUseComplaintSuggestion}
        onIgnoreComplaintSuggestion={handleIgnoreComplaintSuggestion}
        isAiGeneratingComplaint={isAiGeneratingComplaint}
        onSelectPatientCandidate={handleSelectPatientCandidate}
        onIgnorePatientMatching={handleIgnorePatientMatching}
        onAskSopQuestion={handleAskSopQuestion}
        isAskingSop={isAskingSop}
        sopQaList={sopQaList}
        onUseSopSuggestion={handleUseSopSuggestion}
        onIgnoreSopSuggestion={handleIgnoreSopSuggestion}
        activeTabOverride={aiDrawerTabOverride}
      />

      {/* SOP Reference Modal */}
      <SopReferenceModal
        isOpen={isSopModalOpen}
        onClose={() => setIsSopModalOpen(false)}
      />

      {/* Doctor Schedule Modal */}
      <DoctorScheduleModal
        isOpen={isDoctorScheduleModalOpen}
        onClose={() => setIsDoctorScheduleModalOpen(false)}
        onSelectPoli={(poli) => {
          handleUpdateFormData({
            poliTujuanAwal: poli,
            targetPoliStaf: poli === 'Poli Gigi' ? 'gigi' : poli === 'Poli Gigi Anak' ? 'anak' : 'umum',
          });
          showToast(`✓ Poli tujuan awal diatur ke: ${poli}`);
        }}
      />

      {/* Medical Record (e-RM) Modal */}
      <MedicalRecordModal
        isOpen={isMedicalRecordModalOpen}
        onClose={() => setIsMedicalRecordModalOpen(false)}
        patient={selectedMedicalRecordPatient}
        allPatients={SIMULATED_PATIENTS}
        onSelectPatient={(p) => {
          setSelectedMedicalRecordPatient(p);
          handleUpdateFormData({
            namaPasien: p.nama,
            tanggalLahir: p.tanggalLahir,
            nomorRekamMedis: p.nomorRekamMedis,
            jadwalBooking: p.jadwalBooking,
            nik: p.nik || '',
            noAntrean: `BOK-${p.nomorRekamMedis.slice(-3)}`,
            poliTujuanAwal: p.poli === 'Poli Gigi' ? 'Poli Gigi' : 'Poli Umum',
            statusPasien: 'lama',
          });
          showToast(`Pasien ${p.nama} dipilih.`);
        }}
      />

      {/* Session History Modal */}
      <SessionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        sessions={sessionHistory}
      />
    </div>
  );
}
