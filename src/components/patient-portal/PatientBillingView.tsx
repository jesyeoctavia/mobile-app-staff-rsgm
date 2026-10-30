import React, { useState } from 'react';
import { PatientAccount, PatientBillingRecord, HospitalAppointment } from '../../types';
import { getPatientBillings, payAppointmentBill } from '../../utils/patientStorage';
import {
  ReceiptText,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface PatientBillingViewProps {
  patient: PatientAccount;
  appointments: HospitalAppointment[];
  onPaymentSuccess?: () => void;
}

export const PatientBillingView: React.FC<PatientBillingViewProps> = ({
  patient,
  appointments,
  onPaymentSuccess,
}) => {
  const billings = getPatientBillings(patient.nik);
  const [selectedBilling, setSelectedBilling] = useState<PatientBillingRecord | null>(
    billings[0] || null
  );

  // Payment simulator modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Transfer Virtual Account' | 'Kasir Loket RSGM'>('QRIS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [justPaidSuccess, setJustPaidSuccess] = useState(false);

  const handleOpenPay = (bill: PatientBillingRecord) => {
    setSelectedBilling(bill);
    setIsPaymentModalOpen(true);
    setJustPaidSuccess(false);
  };

  const handleExecutePayment = () => {
    if (!selectedBilling) return;
    setIsProcessing(true);
    setTimeout(() => {
      payAppointmentBill(selectedBilling.appointmentId, paymentMethod);
      setIsProcessing(false);
      setJustPaidSuccess(true);
      if (onPaymentSuccess) onPaymentSuccess();
    }, 800);
  };

  if (billings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <ReceiptText className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-base text-slate-900">Belum Ada Tagihan Pembayaran</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Tidak ada tagihan atau invoice tertunggak untuk profil Anda. Tagihan akan otomatis terbit saat Anda melakukan booking atau selesai pemeriksaan.
        </p>
      </div>
    );
  }

  const activeBill = selectedBilling || billings[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
                Billing &amp; Invoice Portal
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Rincian Biaya &amp; Pembayaran Digital RSGM Maranatha
              </h2>
              <p className="text-xs text-teal-100">
                Transparansi biaya administrasi, jasa dokter, dan penjaminan kesehatan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Invoice list */}
        <div className="lg:col-span-1 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Tagihan Kunjungan ({billings.length})
          </h4>
          <div className="space-y-2">
            {billings.map((bill) => {
              const isSelected = activeBill?.id === bill.id;
              const isLunas = bill.statusPembayaran === 'Lunas';
              return (
                <button
                  key={bill.id}
                  type="button"
                  onClick={() => setSelectedBilling(bill)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/80 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">{bill.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLunas
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {bill.statusPembayaran}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{bill.poli}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 font-medium">{bill.tanggal}</span>
                    <span className="font-extrabold text-teal-700 font-mono">
                      {bill.totalBiaya === 0 ? 'Rp 0 (Covered BPJS)' : `Rp ${bill.totalBiaya.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Invoice detail preview */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                Lembar Kuitansi Elektronik
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Invoice No: {activeBill.id}
              </h3>
              <p className="text-xs text-slate-500">
                No. Antrean: <strong>{activeBill.nomorAntrean}</strong> • {activeBill.poli}
              </p>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                  activeBill.statusPembayaran === 'Lunas'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {activeBill.statusPembayaran === 'Lunas' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>STATUS: {activeBill.statusPembayaran.toUpperCase()}</span>
              </span>
              {activeBill.waktuPembayaran && (
                <span className="text-[11px] text-slate-500 block mt-1">
                  Dibayar via {activeBill.metodePembayaran} ({activeBill.waktuPembayaran})
                </span>
              )}
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Rincian Biaya Pelayanan
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {activeBill.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs sm:text-sm bg-white">
                  <div>
                    <span className="font-semibold text-slate-800 block">{item.deskripsi}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Kategori: {item.kategori}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      item.biaya < 0 ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {item.biaya < 0
                      ? `- Rp ${Math.abs(item.biaya).toLocaleString('id-ID')}`
                      : `Rp ${item.biaya.toLocaleString('id-ID')}`}
                  </span>
                </div>
              ))}

              {/* Total Row */}
              <div className="p-4 bg-slate-50 flex items-center justify-between text-sm sm:text-base font-extrabold border-t border-slate-200">
                <span className="text-slate-900">Total Biaya Yang Harus Dibayar:</span>
                <span className="text-teal-700 font-mono text-lg">
                  {activeBill.totalBiaya === 0
                    ? 'Rp 0 (Ditanggung BPJS)'
                    : `Rp ${activeBill.totalBiaya.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Kode Referensi Transaksi: <strong className="font-mono text-slate-700">{activeBill.kodeReferensi}</strong>
            </div>

            <div className="flex items-center gap-2">
              {activeBill.statusPembayaran !== 'Lunas' && activeBill.totalBiaya > 0 ? (
                <button
                  type="button"
                  onClick={() => handleOpenPay(activeBill)}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Bayar Sekarang (Simulasi QRIS / VA)</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kuitansi Pembayaran Terverifikasi Sah</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Simulator Modal */}
      {isPaymentModalOpen && selectedBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base tracking-tight">
                  Simulasi Pembayaran Digital RSGM
                </h3>
                <p className="text-xs text-teal-300">
                  {selectedBilling.id} • Total: Rp {selectedBilling.totalBiaya.toLocaleString('id-ID')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {justPaidSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    Pembayaran Berhasil Diverifikasi!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Kuitansi elektronik dan status antrean Anda di sistem front-desk staf RSGM Maranatha telah diperbarui menjadi <strong>LUNAS</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Tutup &amp; Lihat Kuitansi
                  </button>
                </div>
              ) : (
                <>
                  {/* Select Payment Method */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Pilih Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'QRIS' as const, label: 'QRIS', icon: QrCode },
                        { id: 'Transfer Virtual Account' as const, label: 'Virtual Account', icon: CreditCard },
                        { id: 'Kasir Loket RSGM' as const, label: 'Kasir Fisik', icon: Building },
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSel = paymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id)}
                            className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1 ${
                              isSel
                                ? 'border-teal-600 bg-teal-50 font-bold text-teal-900'
                                : 'border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <Icon className="w-5 h-5 text-teal-600" />
                            <span className="text-[11px]">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* QRIS / VA Preview */}
                  {paymentMethod === 'QRIS' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Scan QRIS dengan BCA, Mandiri, GoPay, OVO, atau ShopeePay
                      </span>
                      {/* Realistic simulated QR code box */}
                      <div className="w-36 h-36 bg-white border-2 border-slate-800 p-2 mx-auto rounded-xl flex items-center justify-center shadow-inner">
                        <div className="w-full h-full border border-teal-600 grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-sm">
                          <span className="bg-white rounded-xs" />
                          <span className="bg-teal-400 rounded-xs" />
                          <span className="bg-white rounded-xs" />
                          <span className="bg-teal-400 rounded-xs" />
                          <span className="bg-white rounded-xs" />
                          <span className="bg-slate-900" />
                          <span className="bg-white rounded-xs" />
                          <span className="bg-slate-900" />
                          <span className="bg-teal-400 rounded-xs" />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Merchant: RSGM MARANATHA (NMID: ID1029384756)
                      </span>
                    </div>
                  )}

                  {paymentMethod === 'Transfer Virtual Account' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <span className="font-bold text-slate-800 block">Nomor Virtual Account Mandiri / BCA:</span>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm flex items-center justify-between">
                        <span>8809 3171 0114 0592</span>
                        <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded font-sans">Mandiri VA</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Batas transfer maksimal 60 menit sebelum sesi pemeriksaan dimulai.
                      </span>
                    </div>
                  )}

                  {paymentMethod === 'Kasir Loket RSGM' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                      <p className="font-bold">Pembayaran Tunai / EDC di Loket Kasir RSGM</p>
                      <p className="text-slate-500 text-[11px]">
                        Tunjukkan nomor antrean <strong>{selectedBilling.nomorAntrean}</strong> ke petugas kasir saat Anda tiba di rumah sakit.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={isProcessing}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isProcessing ? 'Memverifikasi Pembayaran...' : 'Simulasi: "Konfirmasi Bayar Berhasil"'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
