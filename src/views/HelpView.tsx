import React from 'react';
import { X, Smartphone, AlertTriangle, ShieldCheck, BatteryCharging, Radio } from 'lucide-react';

interface HelpViewProps {
  onClose: () => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-navy/60 backdrop-blur-xs">
      <div className="bg-white border border-border rounded-modal w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-dropdown p-6 text-text-primary">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-btn bg-accent-teal/10 text-accent-teal flex items-center justify-center">
              <Smartphone className="w-4 h-4" strokeWidth={2} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-primary-navy tracking-tight">
              Operational Guidelines & GPS Tips
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-btn bg-bg-main hover:bg-slate-200 text-text-secondary flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close guidelines"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-xs sm:text-sm">
          {/* Driver Critical Notice */}
          <div className="p-4 rounded-btn bg-status-warning/10 border border-status-warning/20 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-status-warning">
              <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>Driver GPS Reliability Rules</span>
            </div>
            <p className="leading-relaxed text-text-primary">
              Mobile browsers restrict background execution when the phone display sleeps.
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-secondary">
              <li>Keep this web application open with screen active while operating.</li>
              <li>Connect driver smartphone to dashboard charging mount.</li>
              <li>Ensure device location mode is set to <strong>High Accuracy</strong>.</li>
            </ul>
          </div>

          {/* Location Permissions Guide */}
          <div className="p-4 rounded-btn bg-bg-main border border-border space-y-2">
            <h3 className="font-bold text-primary-navy flex items-center space-x-2">
              <Radio className="w-4 h-4 text-accent-teal" strokeWidth={2} />
              <span>Location Permission Troubleshooting</span>
            </h3>
            <p className="text-text-secondary">
              If the console says <strong>LOCATION PERMISSION DENIED</strong>:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-text-primary font-medium">
              <li>Tap the site settings lock icon in your browser address bar.</li>
              <li>Set <strong>Location</strong> permissions to <strong>Allow</strong>.</li>
              <li>Reload the page and press <strong>START TRIP</strong>.</li>
            </ol>
          </div>

          {/* Free Tier Architecture Notes */}
          <div className="p-4 rounded-btn bg-status-success/10 border border-status-success/20 space-y-1.5">
            <h3 className="font-bold text-status-success flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              <span>Zero Hardware & Free Tier Operation</span>
            </h3>
            <p className="text-text-primary leading-relaxed text-xs">
              GPS publishes are throttled to every 5-10 seconds while moving to preserve phone battery and stay safely within cloud database free tiers with ₹0 monthly recurring hardware expense.
            </p>
          </div>

          {/* Student Alerts Tips */}
          <div className="p-4 rounded-btn bg-bg-main border border-border space-y-1.5">
            <h3 className="font-bold text-primary-navy flex items-center space-x-2">
              <BatteryCharging className="w-4 h-4 text-accent-teal" strokeWidth={2} />
              <span>Proximity Milestone Chimes</span>
            </h3>
            <p className="text-text-secondary leading-relaxed text-xs">
              Synthesized via the HTML5 Web Audio API. Automated notification tones trigger at 5km, 3km, 2km, 1km, and stop arrival milestones.
            </p>
          </div>
        </div>

        <div className="pt-5 border-t border-border flex justify-end">
          <button onClick={onClose} className="btn-primary !py-2 !px-5 text-xs font-semibold">
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
