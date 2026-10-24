import React from 'react';
import { WizardStepId } from '../types';
import { Check, ChevronRight } from 'lucide-react';

interface WizardStepsProps {
  currentStep: WizardStepId;
  onStepClick?: (step: WizardStepId) => void;
}

const STEP_LABELS: Record<WizardStepId, string> = {
  1: '1. Identifikasi & Rekam Medis',
  2: '2. Skrining Cepat & Prioritas',
  3: '3. Keluhan Utama & AI',
  4: '4. Penjaminan Pembayaran',
  5: '5. Keputusan Jalur & Serah Terima',
};

export const WizardSteps: React.FC<WizardStepsProps> = ({ currentStep, onStepClick }) => {
  const percent = ((currentStep - 1) / 4) * 100;

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Subtle Breadcrumb Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] hidden sm:inline">
            Formulir Triase:
          </span>
          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
            {STEP_LABELS[currentStep]}
          </span>
        </div>

        {/* Minimal Stepper Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {([1, 2, 3, 4, 5] as WizardStepId[]).map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <button
                key={step}
                type="button"
                onClick={() => onStepClick && onStepClick(step)}
                disabled={step > currentStep}
                title={STEP_LABELS[step]}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-slate-100 text-teal-800 hover:bg-slate-200'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleek Progress Line */}
      <div className="w-full bg-slate-100 h-1">
        <div
          className="bg-teal-600 h-1 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
