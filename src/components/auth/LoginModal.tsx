import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Eye,
  EyeOff,
  GraduationCap,
  Car,
  Shield,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { UserRole, AppUser } from '../../types';
import { loginWithCredentials } from '../../services/authService';

interface LoginModalProps {
  initialRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser, role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  initialRole,
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [prevInitialRole, setPrevInitialRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync role if initialRole changes
  if (prevInitialRole !== initialRole) {
    setPrevInitialRole(initialRole);
    setSelectedRole(initialRole);
    setErrorMessage(null);
  }

  if (!isOpen) return null;

  const roleMeta = {
    student: {
      title: 'Student Portal Sign In',
      subtitle: 'Track your assigned bus live and configure distance arrival chimes.',
      icon: GraduationCap,
      color: 'text-accent-teal',
      badgeBg: 'bg-accent-teal/10 text-accent-teal border-accent-teal/20',
      sampleId: 'student@123',
      samplePass: 'student123',
    },
    driver: {
      title: 'Driver Console Sign In',
      subtitle: 'Stream real-time phone GPS telemetry to subscribed student passengers.',
      icon: Car,
      color: 'text-primary-navy',
      badgeBg: 'bg-primary-navy/10 text-primary-navy border-primary-navy/20',
      sampleId: 'driver@123',
      samplePass: 'driver@123',
    },
    admin: {
      title: 'Administrator Sign In',
      subtitle: 'Manage student accounts, drivers, fleet buses, routes, and geofencing.',
      icon: Shield,
      color: 'text-secondary-navy',
      badgeBg: 'bg-secondary-navy/10 text-secondary-navy border-secondary-navy/20',
      sampleId: 'admin@123',
      samplePass: 'admi123',
    },
  };

  const currentMeta = roleMeta[selectedRole];
  const IconComponent = currentMeta.icon;

  const handleFillTestCredentials = () => {
    setIdentifier(currentMeta.sampleId);
    setPassword(currentMeta.samplePass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both your login identifier and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithCredentials({
        identifier: identifier.trim(),
        password: password.trim(),
        expectedRole: selectedRole,
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user, selectedRole);
        onClose();
      } else {
        setErrorMessage(res.message || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setErrorMessage('An unexpected authentication error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-navy/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-modal shadow-dropdown border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-bg-main relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-btn flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Role Pill Switcher */}
          <div className="flex p-1 bg-border/60 rounded-btn mb-4">
            {(['student', 'driver', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSelectedRole(r);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-[6px] capitalize transition-all cursor-pointer ${
                  selectedRole === r
                    ? 'bg-white text-primary-navy shadow-subtle'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-btn bg-white border border-border flex items-center justify-center shadow-subtle shrink-0">
              <IconComponent className={`w-5 h-5 ${currentMeta.color}`} strokeWidth={2} />
            </div>
            <div>
              <h2 id="login-title" className="text-base sm:text-lg font-bold text-primary-navy">
                {currentMeta.title}
              </h2>
              <p className="text-xs text-text-secondary">{currentMeta.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Credential Autofill Helper for Testing */}
          <div className="p-3 rounded-btn bg-accent-teal/5 border border-accent-teal/20 flex items-center justify-between gap-2">
            <div className="text-xs">
              <span className="font-bold text-primary-navy block">Test Account Available</span>
              <span className="text-[11px] text-text-secondary">
                ID: <code className="font-mono text-accent-teal font-bold">{currentMeta.sampleId}</code> | Pass: <code className="font-mono text-accent-teal font-bold">{currentMeta.samplePass}</code>
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillTestCredentials}
              className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1 shrink-0 text-accent-teal hover:border-accent-teal"
              title="Click to autofill specified test credentials"
            >
              <Sparkles className="w-3 h-3 text-accent-teal" />
              <span>Fill</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-btn bg-status-error/10 border border-status-error/20 flex items-start gap-2.5 text-xs text-status-error font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-text-secondary" />
              Login Identifier / Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={`e.g. ${currentMeta.sampleId}`}
              className="saas-input w-full"
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-text-secondary" />
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs text-text-muted hover:text-accent-teal flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="saas-input w-full pr-10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary !py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-text-muted pt-1">
            Student & Driver accounts are provisioned exclusively by college administration.
          </p>
        </form>
      </div>
    </div>
  );
};
