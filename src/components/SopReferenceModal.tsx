import React, { useState } from 'react';
import { SOP_RULES } from '../data/sopRules';
import { X, BookOpen, Search, Filter } from 'lucide-react';
import { SopRule } from '../types';

interface SopReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SopReferenceModal: React.FC<SopReferenceModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  if (!isOpen) return null;

  const categories = [
    'Semua',
    'Darurat & Triase',
    'Antrean & Kedatangan',
    'Pendaftaran & Alur',
    'Penjaminan',
    'Layanan Khusus & Kendala',
  ];

  const filteredRules = SOP_RULES.filter((rule) => {
    const matchesCat = selectedCategory === 'Semua' || rule.kategori === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      rule.judul.toLowerCase().includes(q) ||
      rule.kondisiIf.toLowerCase().includes(q) ||
      rule.tindakanThen.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  Pedoman Prosedur Operasional Standar (SOP) Alur Pasien
                </h3>
                <p className="text-xs text-slate-300">
                  Standar baku operasional triase &amp; alur pelayanan RSGM Maranatha
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters & Search */}
          <div className="p-4 sm:p-6 border-b border-slate-200 space-y-3 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari prosedur, kata kunci (misal: 'terlambat', 'gigi', 'bpjs', 'batal')..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rules List */}
          <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3">
            {filteredRules.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Tidak ada prosedur yang cocok dengan pencarian Anda.
              </div>
            ) : (
              filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-300 transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {rule.judul}
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                      {rule.kategori}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950">
                      <strong>IF (Kondisi):</strong> {rule.kondisiIf}
                    </div>
                    <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950">
                      <strong>THEN (Tindakan):</strong> {rule.tindakanThen}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
