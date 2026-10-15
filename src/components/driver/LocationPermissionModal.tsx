import React from 'react';
import { MapPin, Navigation, Shield, X, Radio, ArrowRight } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  isRequesting: boolean;
  onAllow: () => void;
  onNotNow: () => void;
  onCancel?: () => void;
  title?: string;
  cancelText?: string;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  isRequesting,
  onAllow,
  onNotNow,
  onCancel,
  title = 'Enable Location Access',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  const handleDismiss = () => {
    if (onCancel) {
      onCancel();
    } else {
      onNotNow();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-navy/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-permission-title"
    >
      <div className="w-full max-w-md bg-white rounded-modal shadow-dropdown border border-border p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Location Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center">
              <span className="w-12 h-12 rounded-btn bg-accent-teal/15 flex items-center justify-center text-accent-teal shadow-subtle">
                <Navigation className="w-6 h-6 animate-pulse" strokeWidth={2} />
              </span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-status-success border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-teal">
                  Driver Smartphone Telemetry
                </span>
              </div>
              <h2
                id="location-permission-title"
                className="text-lg font-bold text-primary-navy tracking-tight"
              >
                {title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            disabled={isRequesting}
            className="w-8 h-8 rounded-btn flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Body Copy */}
        <div className="space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
          <p className="font-medium text-text-primary">
            Allow location access to display your current position and share your live location with authorized users during your active trip. Location sharing will stop when your trip ends.
          </p>

          <div className="p-3.5 rounded-card bg-bg-main border border-border space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-primary-navy">
              <Shield className="w-3.5 h-3.5 text-accent-teal shrink-0" />
              <span>Security & Privacy Assurances</span>
            </div>
            <ul className="space-y-1 text-text-secondary text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                <span>Tracking activates only when you begin an authorized shift trip.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                <span>Screen wake lock is used to maintain continuous GPS reception.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                <span>Broadcasting halts instantly when you tap &quot;End Trip&quot; or sign out.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isRequesting}
            className="btn-secondary !py-2.5 !px-4 text-xs font-semibold cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onAllow}
            disabled={isRequesting}
            className="btn-primary !py-2.5 !px-5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-subtle"
          >
            {isRequesting ? (
              <>
                <Radio className="w-4 h-4 animate-spin text-white" />
                <span>Prompting Browser Access...</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Allow Location</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
