import React from 'react';
import { Home, CalendarPlus, Clock, FileText, ReceiptText } from 'lucide-react';

export type PatientTabId = 'home' | 'booking' | 'queue' | 'records' | 'billing';

interface PatientBottomNavProps {
  activeTab: PatientTabId;
  onTabChange: (tab: PatientTabId) => void;
  activeBookingCount: number;
  unpaidBillingCount: number;
}

export const PatientBottomNav: React.FC<PatientBottomNavProps> = ({
  activeTab,
  onTabChange,
  activeBookingCount,
  unpaidBillingCount,
}) => {
  const navItems = [
    { id: 'home' as PatientTabId, label: 'Beranda', icon: Home },
    { id: 'booking' as PatientTabId, label: 'Booking', icon: CalendarPlus },
    {
      id: 'queue' as PatientTabId,
      label: 'Antrean',
      icon: Clock,
      badge: activeBookingCount > 0 ? activeBookingCount : undefined,
    },
    { id: 'records' as PatientTabId, label: 'e-RM', icon: FileText },
    {
      id: 'billing' as PatientTabId,
      label: 'Tagihan',
      icon: ReceiptText,
      badge: unpaidBillingCount > 0 ? unpaidBillingCount : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg md:hidden">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                isActive ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 min-w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
