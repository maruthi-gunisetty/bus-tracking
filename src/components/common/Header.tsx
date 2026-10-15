import React, { useState, useEffect, useRef } from 'react';
import {
  Bus,
  Wifi,
  WifiOff,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  GraduationCap,
  Car,
  HelpCircle,
  FlaskConical,
} from 'lucide-react';
import type { UserRole, AppUser } from '../../types';

interface HeaderProps {
  currentUser: AppUser | null;
  currentRole: UserRole | null;
  onOpenLogin: (role: UserRole) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  isDemo: boolean;
  onToggleDemo: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onOpenLogin,
  onLogout,
  onNavigateHome,
  isDemo,
  onToggleDemo,
  onOpenHelp,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [loginMenuOpen, setLoginMenuOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLoginMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRoleLogin = (role: UserRole) => {
    setLoginMenuOpen(false);
    setMobileMenuOpen(false);
    onOpenLogin(role);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentRole !== null) {
      onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onNavigateHome}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-btn bg-primary-navy flex items-center justify-center text-white shadow-subtle group-hover:bg-secondary-navy transition-colors">
            <Bus className="w-5 h-5 text-accent-teal" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-primary-navy">
                ANSHARY
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-accent-teal/10 text-accent-teal border border-accent-teal/20">
                BUS TRACKER
              </span>
            </div>
            <p className="text-[11px] text-text-muted hidden sm:block">
              College Transportation Management
            </p>
          </div>
        </div>

        {/* Desktop Nav Links (When on public landing or to scroll) */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-text-secondary">
          <button
            onClick={() => {
              onNavigateHome();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-primary-navy transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-primary-navy transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-primary-navy transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('trust')}
            className="hover:text-primary-navy transition-colors cursor-pointer"
          >
            Trust & Security
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-primary-navy transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Connectivity Status Pill */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-status-success/10 border-status-success/20 text-status-success'
                : 'bg-status-error/10 border-status-error/20 text-status-error animate-pulse'
            }`}
            title={isOnline ? 'Network Online' : 'Network Disconnected'}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
                <Wifi className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="hidden md:inline text-[11px]">Online</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-status-error"></span>
                <WifiOff className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="text-[11px]">Offline</span>
              </>
            )}
          </div>

          {/* Simulation Toggle */}
          <button
            onClick={onToggleDemo}
            className={`px-2.5 py-1 rounded-btn text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isDemo
                ? 'bg-status-warning/15 border-status-warning/30 text-status-warning'
                : 'bg-white border-border text-text-secondary hover:text-text-primary hover:border-slate-300'
            }`}
            title="Toggle Demo Simulation"
          >
            <FlaskConical className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">{isDemo ? 'Demo Mode' : 'Demo'}</span>
          </button>

          {/* Help button */}
          <button
            onClick={onOpenHelp}
            className="btn-icon"
            title="Help & Guidelines"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* User state / Login dropdown */}
          {currentUser && currentRole ? (
            <div className="flex items-center space-x-2 pl-1 border-l border-border">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-primary-navy truncate max-w-[130px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-accent-teal">
                  {currentRole}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5 text-status-error" strokeWidth={2} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLoginMenuOpen((prev) => !prev)}
                className="btn-primary !py-2 !px-4 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                aria-expanded={loginMenuOpen}
              >
                <User className="w-4 h-4" strokeWidth={2} />
                <span>Sign In</span>
                <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
              </button>

              {/* Login Role Dropdown */}
              {loginMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-card shadow-dropdown border border-border p-2 z-50">
                  <div className="px-3 py-2 border-b border-border/80 mb-1">
                    <p className="text-xs font-bold text-primary-navy uppercase tracking-wider">
                      Select Portal
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      Sign in to your authorized dashboard
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectRoleLogin('student')}
                    className="w-full text-left px-3 py-2.5 rounded-btn hover:bg-bg-subtle transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-btn bg-accent-teal/10 text-accent-teal flex items-center justify-center shrink-0 group-hover:bg-accent-teal group-hover:text-white transition-colors">
                      <GraduationCap className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">Student Login</p>
                      <p className="text-[11px] text-text-muted">Live tracking & stop alerts</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectRoleLogin('driver')}
                    className="w-full text-left px-3 py-2.5 rounded-btn hover:bg-bg-subtle transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-btn bg-primary-navy/10 text-primary-navy flex items-center justify-center shrink-0 group-hover:bg-primary-navy group-hover:text-white transition-colors">
                      <Car className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">Driver Login</p>
                      <p className="text-[11px] text-text-muted">Trip dispatch & phone GPS</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectRoleLogin('admin')}
                    className="w-full text-left px-3 py-2.5 rounded-btn hover:bg-bg-subtle transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-btn bg-secondary-navy/10 text-secondary-navy flex items-center justify-center shrink-0 group-hover:bg-secondary-navy group-hover:text-white transition-colors">
                      <Shield className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">Administrator Login</p>
                      <p className="text-[11px] text-text-muted">Fleet, routes & accounts</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="btn-icon lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-text-primary">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-btn hover:bg-bg-subtle"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-left px-3 py-2 rounded-btn hover:bg-bg-subtle"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left px-3 py-2 rounded-btn hover:bg-bg-subtle"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('trust')}
              className="text-left px-3 py-2 rounded-btn hover:bg-bg-subtle"
            >
              Trust & Security
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-left px-3 py-2 rounded-btn hover:bg-bg-subtle"
            >
              FAQ
            </button>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-xs font-bold text-text-muted uppercase mb-2">Access Portals</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSelectRoleLogin('student')}
                className="btn-secondary !py-2 !px-2 text-xs flex flex-col items-center text-center"
              >
                <GraduationCap className="w-4 h-4 mb-1 text-accent-teal" />
                Student
              </button>
              <button
                onClick={() => handleSelectRoleLogin('driver')}
                className="btn-secondary !py-2 !px-2 text-xs flex flex-col items-center text-center"
              >
                <Car className="w-4 h-4 mb-1 text-primary-navy" />
                Driver
              </button>
              <button
                onClick={() => handleSelectRoleLogin('admin')}
                className="btn-secondary !py-2 !px-2 text-xs flex flex-col items-center text-center"
              >
                <Shield className="w-4 h-4 mb-1 text-secondary-navy" />
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
