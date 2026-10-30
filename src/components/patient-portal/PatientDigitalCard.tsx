import React, { useState } from 'react';
import { PatientAccount } from '../../types';
import { QrCode, Copy, Check, ShieldCheck, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface PatientDigitalCardProps {
  patient: PatientAccount;
}

export const PatientDigitalCard: React.FC<PatientDigitalCardProps> = ({ patient }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRm = () => {
    navigator.clipboard.writeText(patient.nomorRekamMedis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-teal-500/30">
      {/* Decorative ambient glowing circles */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
              RSGM MARANATHA
            </h3>
            <p className="text-[11px] font-medium text-teal-300/90 tracking-wide">
              KARTU PASIEN DIGITAL (e-RM)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3 h-3" />
            TERVERIFIKASI
          </span>
        </div>
      </div>

      {/* Microchip & Contactless indicator */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Simulated EMV Smart Chip */}
          <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 border border-amber-500/40 p-1 flex flex-col justify-between shadow-inner">
            <div className="flex justify-between h-2 border-b border-amber-600/30">
              <span className="w-2 border-r border-amber-600/30" />
              <span className="w-2 border-l border-amber-600/30" />
            </div>
            <div className="flex justify-between h-2">
              <span className="w-2 border-r border-amber-600/30" />
              <span className="w-2 border-l border-amber-600/30" />
            </div>
          </div>
          {/* Simulated NFC wave */}
          <span className="text-white/40 text-xs font-mono font-bold tracking-widest pl-1">
            ))) RFID
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
            No. Rekam Medis
          </span>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-base sm:text-lg font-mono font-black text-teal-300 tracking-wider">
              {patient.nomorRekamMedis}
            </span>
            <button
              type="button"
              onClick={handleCopyRm}
              title="Salin No RM"
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Patient Main Identifiers */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="sm:col-span-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Nama Pasien
          </span>
          <p className="text-sm sm:text-base font-extrabold text-white tracking-wide truncate">
            {patient.nama}
          </p>
          <span className="text-[11px] font-mono text-slate-300 block mt-0.5">
            NIK: {patient.nik}
          </span>
        </div>

        <div className="flex sm:flex-col justify-between sm:justify-start gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Golongan Darah
            </span>
            <span className="text-xs sm:text-sm font-bold text-rose-300">
              {patient.golonganDarah || 'Belum Tercatat'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Tgl Lahir
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-200">
              {patient.tanggalLahir}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Simulated QR & Scan info */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Tunjukkan kode ini saat verifikasi mandiri di kiosk loket RSGM</span>
        </div>

        {/* Small decorative QR placeholder */}
        <div className="bg-white p-1 rounded-lg shadow-xs shrink-0">
          <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center p-0.5">
            <div className="w-full h-full border border-teal-400 grid grid-cols-2 gap-0.5 p-0.5">
              <span className="bg-teal-400 rounded-xs" />
              <span className="bg-slate-900" />
              <span className="bg-slate-900" />
              <span className="bg-teal-400 rounded-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
