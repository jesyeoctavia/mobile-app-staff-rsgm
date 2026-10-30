import React, { useState } from 'react';
import { HospitalAppointment } from '../../types';
import { updateAppointment } from '../../utils/patientStorage';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  QrCode,
  Calendar,
  Volume2,
  Sparkles,
  MapPin,
  RefreshCw,
  Printer,
  ChevronRight,
} from 'lucide-react';

interface PatientLiveQueueProps {
  appointments: HospitalAppointment[];
  onOpenBooking: () => void;
  onSelectAppointmentForPayment?: (app: HospitalAppointment) => void;
}

export const PatientLiveQueue: React.FC<PatientLiveQueueProps> = ({
  appointments,
  onOpenBooking,
  onSelectAppointmentForPayment,
}) => {
  // Take active booking (or the latest one)
  const activeAppointment = appointments.find((a) => a.status !== 'Dibatalkan') || appointments[0];

  const [hasArrived, setHasArrived] = useState<boolean>(
    activeAppointment?.status === 'Sedang Dilayani' || false
  );

  if (!activeAppointment) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Belum Ada Nomor Antrean Aktif</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Anda belum memiliki reservasi antrean dokter untuk hari ini. Silakan buat booking janji temu baru.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenBooking}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
        >
          + Buat Booking Janji Temu
        </button>
      </div>
    );
  }

  // Calculate simulated numbers for live queue
  const queueSeq = parseInt(activeAppointment.nomorAntrean.replace(/\D/g, '') || '49', 10);
  const currentServingSeq = Math.max(1, queueSeq - 2);
  const remainingInFront = Math.max(0, queueSeq - currentServingSeq);

  const handleConfirmArrival = () => {
    setHasArrived(true);
    updateAppointment(activeAppointment.id, {
      status: 'Sedang Dilayani',
    });
  };

  return (
    <div className="space-y-6">
      {/* Live Ticket Card */}
      <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/30 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                Live Queue Tracker
              </span>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                Status Antrean Real-Time RSGM Maranatha
              </h3>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Terhubung Langsung ke Loket Front-Desk</span>
          </span>
        </div>

        {/* Big Queue Numbers Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Your Queue Number */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-center">
            <span className="text-[11px] uppercase font-bold text-teal-300 tracking-wider block mb-1">
              Nomor Antrean Anda
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest">
              {activeAppointment.nomorAntrean}
            </div>
            <span className="text-xs text-slate-300 mt-1 block">
              {activeAppointment.poli}
            </span>
          </div>

          {/* Current Serving at Counter */}
          <div className="bg-emerald-500/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-400/30 text-center">
            <span className="text-[11px] uppercase font-bold text-emerald-300 tracking-wider block mb-1">
              Sedang Dipanggil di Loket / Poli
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-widest">
              {activeAppointment.nomorAntrean.slice(0, 8)}
              {currentServingSeq.toString().padStart(3, '0')}
            </div>
            <span className="text-xs text-emerald-200 mt-1 block flex items-center justify-center gap-1">
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              <span>Panggilan Suara Aktif</span>
            </span>
          </div>

          {/* Remaining in front */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-center">
            <span className="text-[11px] uppercase font-bold text-amber-300 tracking-wider block mb-1">
              Sisa Antrean Di Depan Anda
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-amber-300 tracking-widest">
              {remainingInFront} Pasien
            </div>
            <span className="text-xs text-slate-300 mt-1 block">
              Estimasi Waktu: ± {remainingInFront * 7} Menit
            </span>
          </div>
        </div>

        {/* Appointment details strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 rounded-2xl p-4 border border-white/10 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Dokter Pemeriksa</span>
            <span className="font-bold text-white truncate block">{activeAppointment.namaDokter}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Jadwal &amp; Jam</span>
            <span className="font-bold text-teal-300 block">
              {activeAppointment.tanggalKunjungan} • {activeAppointment.jamKunjungan}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Penjamin</span>
            <span className="font-bold text-white block uppercase">
              {activeAppointment.jenisPenjamin}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Status Pembayaran</span>
            <span
              className={`font-bold inline-block px-2 py-0.5 rounded-full text-[10px] mt-0.5 ${
                activeAppointment.statusPembayaran === 'Lunas'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {activeAppointment.statusPembayaran}
            </span>
          </div>
        </div>
      </div>

      {/* Arrival Confirmation Action Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                Konfirmasi Kehadiran di RSGM Maranatha
              </h4>
              <p className="text-xs text-slate-500">
                Setelah Anda tiba di gedung RSGM Maranatha, lakukan konfirmasi agar staf loket mengetahui kehadiran Anda.
              </p>
            </div>
          </div>

          <div>
            {hasArrived ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>KEHADIRAN TERKONFIRMASI</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-teal-100 text-teal-800 border border-teal-200">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>MENUNGGU KEHADIRAN</span>
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              {hasArrived
                ? 'Status Anda telah tercatat hadir. Silakan menuju ke ruang tunggu poli yang dituju.'
                : 'Tekan tombol di samping saat Anda telah sampai di lobi atau ruang tunggu RSGM Maranatha.'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Petugas loket akan langsung memanggil nomor antrean Anda sesuai urutan kedatangan.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirmArrival}
            className={`shrink-0 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              hasArrived
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{hasArrived ? 'Sudah Hadir di RSGM' : 'Saya Sudah Tiba di RSGM'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
