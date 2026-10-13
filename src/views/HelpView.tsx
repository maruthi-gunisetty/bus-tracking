import React from 'react';
import { X, Smartphone, AlertTriangle, ShieldCheck, BatteryCharging, Radio } from 'lucide-react';

interface HelpViewProps {
  onClose: () => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-navy-900 border border-navy-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Guidelines & Troubleshooting</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-4 text-xs sm:text-sm">
          {/* Driver Critical Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Driver GPS Reliability Rules</span>
            </div>
            <p className="leading-relaxed">
              Mobile browsers aggressively suspend GPS updates when the screen is locked or the tab is minimized.
            </p>
            <ul className="list-disc list-inside space-y-1 font-medium">
              <li>Keep this browser tab <strong>open and screen ON</strong> while driving.</li>
              <li>Connect your phone to a car charger / dashboard mount.</li>
              <li>Ensure device Location / GPS mode is set to <strong>High Accuracy</strong>.</li>
            </ul>
          </div>

          {/* Location Permissions Guide */}
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center space-x-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Location Permission Troubleshooting</span>
            </h3>
            <p className="text-slate-300">
              If the app displays <strong>LOCATION PERMISSION DENIED</strong>:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Tap the lock / site settings icon in your browser address bar.</li>
              <li>Set <strong>Location</strong> permissions to <strong>Allow</strong>.</li>
              <li>Reload the page and press <strong>START TRIP</strong> again.</li>
            </ol>
          </div>

          {/* Free Tier Architecture Notes */}
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Free-Tier Spark Safety</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              GPS publishes are throttled to every 8 seconds or 20m movement to stay within Firebase Spark quotas.
              Students only read their specific bus&apos;s active trip document.
            </p>
          </div>

          {/* Student Alerts Tips */}
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center space-x-2">
              <BatteryCharging className="w-4 h-4 text-purple-400" />
              <span>Student Alert Tips</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Ensure you have tapped the audio permission button on the student screen so the browser allows automatic Web Audio chimes when your bus crosses 5km, 3km, 2km, and 1km milestones.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-navy-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
