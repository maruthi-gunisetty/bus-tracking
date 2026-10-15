import React from 'react';
import { FlaskConical, X } from 'lucide-react';

interface DemoBannerProps {
  isDemo: boolean;
  onToggleDemo: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ isDemo, onToggleDemo }) => {
  if (!isDemo) return null;

  return (
    <div className="bg-status-warning/15 text-primary-navy px-4 py-2 text-xs font-medium flex items-center justify-between border-b border-status-warning/30 shadow-subtle">
      <div className="flex items-center space-x-2.5">
        <div className="w-5 h-5 rounded-btn bg-status-warning text-white flex items-center justify-center shrink-0">
          <FlaskConical className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
        <span className="text-xs text-text-primary">
          <strong className="uppercase bg-white text-primary-navy border border-status-warning/40 px-1.5 py-0.5 rounded text-[10px] font-bold mr-2">
            Simulation Active
          </strong>
          Using isolated client-side mock telemetry. Real smartphone GPS and cloud writes are paused.
        </span>
      </div>
      <button
        onClick={onToggleDemo}
        className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1 shrink-0"
        title="Exit Demo Mode"
      >
        <span>Exit Simulation</span>
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
};
