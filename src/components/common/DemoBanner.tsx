import React from 'react';
import { FlaskConical, X } from 'lucide-react';

interface DemoBannerProps {
  isDemo: boolean;
  onToggleDemo: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ isDemo, onToggleDemo }) => {
  if (!isDemo) return null;

  return (
    <div className="bg-amber-500/90 text-navy-950 px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-between border-b border-amber-600 shadow-md">
      <div className="flex items-center space-x-2">
        <FlaskConical className="w-4 h-4 shrink-0 text-navy-950 animate-bounce" />
        <span className="tracking-wide">
          <strong className="uppercase bg-navy-950 text-amber-300 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
            DEMO MODE
          </strong>
          Simulation Mode Active. Using isolated client-side mock data. No real GPS or Firestore writes.
        </span>
      </div>
      <button
        onClick={onToggleDemo}
        className="ml-3 shrink-0 inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-navy-950 text-amber-300 hover:bg-navy-900 text-xs transition"
        title="Exit Demo Mode"
      >
        <span>Exit Demo</span>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
