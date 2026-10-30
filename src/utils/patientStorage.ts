import {
  HospitalAppointment,
  PatientAccount,
  PatientBillingRecord,
  PatientRiwayatKesehatan,
  StaffAccount,
  AuthSessionUser,
} from '../types';
import { SIMULATED_PATIENTS } from '../data/simulatedPatients';

const STORAGE_KEY_APPOINTMENTS = 'hospital_appointments';
const STORAGE_KEY_AUTH = 'patient_auth_user';
const STORAGE_KEY_ACCOUNTS = 'patient_accounts';
const STORAGE_KEY_STAFF_ACCOUNTS = 'rsgm_staff_accounts';
const STORAGE_KEY_ACTIVE_SESSION = 'rsgm_active_session';

// Seed 2 default staff accounts for RSGM Maranatha
const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'STAFF-01',
    nip: '198504122010011002',
    username: 'admin',
    nama: 'drg. Fransisca Kusuma, M.Kes',
    role: 'admin',
    unitKerja: 'Administrator SIMRS RSGM',
    password: 'admin123',
  },
  {
    id: 'STAFF-02',
    nip: '199208152018022005',
    username: 'staf_loket',
    nama: 'Nening Sri Rahayu, A.Md.RMIK',
    role: 'staf_loket',
    unitKerja: 'Front-Desk Loket & Triase',
    password: 'staf123',
  },
];

export function getAllStaffAccounts(): StaffAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAFF_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STAFF_ACCOUNTS, JSON.stringify(INITIAL_STAFF_ACCOUNTS));
      return INITIAL_STAFF_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_STAFF_ACCOUNTS;
  }
}

export function getActiveSession(): AuthSessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setActiveSession(session: AuthSessionUser | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  } else {
    localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(session));
    if (session.patientData) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session.patientData));
    }
  }
  window.dispatchEvent(new Event('rsgm-session-changed'));
  window.dispatchEvent(new Event('patient-auth-changed'));
}

export function loginStaff(usernameOrNip: string, password?: string): { success: boolean; message?: string; staff?: StaffAccount } {
  const staffList = getAllStaffAccounts();
  const query = usernameOrNip.trim().toLowerCase();
  const matched = staffList.find(
    (s) => s.username.toLowerCase() === query || s.nip.toLowerCase() === query
  );

  if (!matched) {
    return { success: false, message: 'Username atau NIP staf tidak terdaftar di sistem RSGM Maranatha.' };
  }

  if (password && matched.password && matched.password !== password.trim()) {
    return { success: false, message: 'Kata sandi salah. Silakan coba lagi.' };
  }

  const session: AuthSessionUser = {
    roleType: 'staff',
    staffData: matched,
  };
  setActiveSession(session);
  return { success: true, staff: matched };
}

export function registerStaff(newStaff: StaffAccount): { success: boolean; message?: string } {
  const staffList = getAllStaffAccounts();
  if (staffList.some((s) => s.username.toLowerCase() === newStaff.username.toLowerCase() || s.nip === newStaff.nip)) {
    return { success: false, message: 'Username atau NIP staf sudah digunakan.' };
  }

  const updated = [...staffList, newStaff];
  localStorage.setItem(STORAGE_KEY_STAFF_ACCOUNTS, JSON.stringify(updated));
  const session: AuthSessionUser = {
    roleType: 'staff',
    staffData: newStaff,
  };
  setActiveSession(session);
  return { success: true };
}

export function logoutAll(): void {
  setActiveSession(null);
}

// Seed default patient accounts based on simulated patients
function getInitialAccounts(): PatientAccount[] {
  return SIMULATED_PATIENTS.map((p) => ({
    nik: p.nik || `317101${p.nomorRekamMedis.replace(/\D/g, '').padStart(10, '0')}`,
    nama: p.nama,
    nomorRekamMedis: p.nomorRekamMedis,
    telepon: p.telepon || '0812-3456-7890',
    email: `${p.nama.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
    password: 'pasien123',
    tanggalLahir: p.tanggalLahir,
    jenisKelamin: p.jenisKelamin,
    golonganDarah: p.golonganDarah,
    alamat: p.alamat,
    riwayatKesehatan: {
      alergi: p.riwayatKesehatan?.alergi || '',
      penyakit_menahun: p.riwayatKesehatan?.penyakit_menahun || '',
      obat_rutin: p.riwayatKesehatan?.obat_rutin || '',
      sedang_hamil: p.riwayatKesehatan?.sedang_hamil || 'tidak',
    },
  }));
}

export function getAllAccounts(): PatientAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      const initial = getInitialAccounts();
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading accounts from localStorage', e);
    return getInitialAccounts();
  }
}

export function getCurrentPatient(): PatientAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function loginPatient(nik: string, password?: string): { success: boolean; message?: string; user?: PatientAccount } {
  const accounts = getAllAccounts();
  const cleanedNik = nik.trim();
  const found = accounts.find((a) => a.nik === cleanedNik || a.nomorRekamMedis.toLowerCase() === cleanedNik.toLowerCase());

  if (!found) {
    return { success: false, message: 'NIK atau No. Rekam Medis tidak ditemukan dalam database RSGM Maranatha.' };
  }

  if (password && found.password && found.password !== password.trim()) {
    return { success: false, message: 'Kata sandi salah. Silakan coba lagi.' };
  }

  const session: AuthSessionUser = {
    roleType: 'patient',
    patientData: found,
  };
  setActiveSession(session);
  return { success: true, user: found };
}

export function registerPatient(newAcc: PatientAccount): { success: boolean; message?: string } {
  const accounts = getAllAccounts();
  if (accounts.some((a) => a.nik === newAcc.nik.trim())) {
    return { success: false, message: 'NIK sudah terdaftar sebelumnya.' };
  }

  const updated = [newAcc, ...accounts];
  localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated));
  const session: AuthSessionUser = {
    roleType: 'patient',
    patientData: newAcc,
  };
  setActiveSession(session);
  return { success: true };
}

export function logoutPatient(): void {
  setActiveSession(null);
}

// APPOINTMENTS STORAGE
export function getStoredAppointments(): HospitalAppointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (!raw) {
      // Seed default demo appointment for initial experience
      const demo: HospitalAppointment[] = [
        {
          id: 'BOK-001049-01',
          patientNik: '3171011405920001',
          patientNama: 'Muhammad Rizky Pratama',
          nomorRekamMedis: 'RM-001049',
          tanggalLahir: '14-05-1992',
          telepon: '0812-3456-7890',
          poli: 'Poli Gigi',
          dokterId: 'DOC-01',
          namaDokter: 'drg. Amanda Putri, Sp.KG',
          tanggalKunjungan: new Date().toISOString().split('T')[0],
          jamKunjungan: '08:30 WIB',
          sesi: 'Pagi',
          nomorAntrean: 'BOK-049',
          keluhanUtama: 'Gigi geraham bawah kanan sakit nyut-nyutan sejak 3 hari lalu, pipi agak sedikit bengkak.',
          riwayatKesehatan: {
            alergi: '',
            penyakit_menahun: '',
            obat_rutin: '',
            sedang_hamil: 'tidak',
          },
          jenisPenjamin: 'bpjs',
          status: 'Menunggu Kedatangan',
          statusPanggilan: 'Belum Dipanggil',
          menitKeterlambatan: 0,
          biayaEstimasi: 125000,
          statusPembayaran: 'Lunas',
          metodePembayaran: 'BPJS Kesehatan (PBI/Non-PBI Tercover)',
          waktuPembayaran: 'Hari ini, 08:00 WIB',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(demo));
      return demo;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading appointments from localStorage', e);
    return [];
  }
}

export function saveNewAppointment(data: {
  patientNik: string;
  patientNama: string;
  nomorRekamMedis: string;
  tanggalLahir: string;
  telepon: string;
  poli: 'Poli Umum' | 'Poli Gigi' | 'Poli Gigi Anak';
  dokterId: string;
  namaDokter: string;
  tanggalKunjungan: string;
  jamKunjungan: string;
  sesi: 'Pagi' | 'Sore';
  keluhanUtama: string;
  riwayatKesehatan: PatientRiwayatKesehatan;
  jenisPenjamin: 'umum' | 'bpjs' | 'asuransi_swasta';
  biayaEstimasi?: number;
}): HospitalAppointment {
  const current = getStoredAppointments();
  const seq = (current.length + 1).toString().padStart(3, '0');
  const codePrefix = data.poli === 'Poli Gigi' ? 'GIG' : data.poli === 'Poli Gigi Anak' ? 'PED' : 'UMU';
  const noAntrean = `BOK-${codePrefix}-${seq}`;

  const defaultCost = data.jenisPenjamin === 'bpjs' ? 0 : data.poli === 'Poli Gigi' ? 185000 : 120000;

  const newApp: HospitalAppointment = {
    id: `BOK-${Date.now()}`,
    ...data,
    nomorAntrean: noAntrean,
    status: 'Menunggu Kedatangan',
    statusPanggilan: 'Belum Dipanggil',
    menitKeterlambatan: 0,
    biayaEstimasi: data.biayaEstimasi ?? defaultCost,
    statusPembayaran: data.jenisPenjamin === 'bpjs' ? 'Lunas' : 'Menunggu Pembayaran',
    metodePembayaran: data.jenisPenjamin === 'bpjs' ? 'BPJS Kesehatan (Terverifikasi)' : undefined,
    createdAt: new Date().toISOString(),
  };

  const updated = [newApp, ...current];
  localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(updated));
  window.dispatchEvent(new Event('hospital-appointments-updated'));
  return newApp;
}

export function updateAppointment(id: string, updates: Partial<HospitalAppointment>): void {
  const current = getStoredAppointments();
  const index = current.findIndex((a) => a.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...updates };
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(current));
    window.dispatchEvent(new Event('hospital-appointments-updated'));
  }
}

export function cancelAppointment(id: string): void {
  updateAppointment(id, { status: 'Dibatalkan' });
}

export function payAppointmentBill(id: string, method: 'QRIS' | 'Transfer Virtual Account' | 'Kasir Loket RSGM'): void {
  updateAppointment(id, {
    statusPembayaran: 'Lunas',
    metodePembayaran: method,
    waktuPembayaran: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
  });
}

// Generate Billing records from appointments
export function getPatientBillings(nik: string): PatientBillingRecord[] {
  const appointments = getStoredAppointments().filter((a) => a.patientNik === nik || a.nomorRekamMedis === nik);
  return appointments.map((app) => {
    const isGigi = app.poli.includes('Gigi');
    const isBpjs = app.jenisPenjamin === 'bpjs';

    const items = isBpjs
      ? [
          { deskripsi: 'Biaya Administrasi & Kartu Loket', kategori: 'Pendaftaran' as const, biaya: 25000 },
          { deskripsi: `Jasa Konsultasi & Pemeriksaan ${app.poli}`, kategori: 'Jasa Medis' as const, biaya: 80000 },
          { deskripsi: 'Tindakan Diagnostik Dasar', kategori: 'Tindakan' as const, biaya: 50000 },
          { deskripsi: 'Subsidi BPJS Kesehatan (Covered 100%)', kategori: 'Lainnya' as const, biaya: -155000 },
        ]
      : [
          { deskripsi: 'Biaya Pendaftaran & Kartu Berkas Loket', kategori: 'Pendaftaran' as const, biaya: 25000 },
          { deskripsi: `Jasa Konsultasi ${app.namaDokter}`, kategori: 'Jasa Medis' as const, biaya: isGigi ? 95000 : 65000 },
          { deskripsi: isGigi ? 'Tindakan Pemeriksaan Gigi & Antiseptik' : 'Pemeriksaan Tanda Vital & Stetoskop', kategori: 'Tindakan' as const, biaya: isGigi ? 65000 : 30000 },
        ];

    const totalBiaya = items.reduce((acc, curr) => acc + curr.biaya, 0);

    return {
      id: `INV-${app.id.replace('BOK-', '')}`,
      appointmentId: app.id,
      nomorAntrean: app.nomorAntrean,
      patientNama: app.patientNama,
      nomorRekamMedis: app.nomorRekamMedis,
      poli: app.poli,
      dokter: app.namaDokter,
      tanggal: app.tanggalKunjungan,
      items,
      totalBiaya: Math.max(0, totalBiaya),
      statusPembayaran: app.statusPembayaran,
      metodePembayaran: app.metodePembayaran as any,
      waktuPembayaran: app.waktuPembayaran,
      kodeReferensi: `RSGM-TRX-${app.nomorAntrean.replace(/\W/g, '')}`,
    };
  });
}
