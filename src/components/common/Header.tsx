import React, { useState, useEffect } from 'react';
import { Bus, Wifi, WifiOff, HelpCircle, Shield, GraduationCap, Car, FlaskConical } from 'lucide-react';
import type { UserRole } from '../../types';

interface HeaderProps {
  currentRole: UserRole | null;
  onSelectRole: (role: UserRole | null) => void;
  isDemo: boolean;
  onToggleDemo: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  isDemo,
  onToggleDemo,
  onOpenHelp,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

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

  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-navy-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => onSelectRole(null)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-900/30 group-hover:scale-105 transition-transform">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">ANSHARY</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">TRACKER</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">College Transit · Smartphone GPS</p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Connectivity Status */}
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
            }`}
            title={isOnline ? 'Network Connected' : 'Connection Lost - Check Internet'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="text-[11px]">Offline</span>
              </>
            )}
          </div>

          {/* Role Navigation Pills */}
          <div className="hidden sm:flex items-center bg-navy-850 p-1 rounded-xl border border-navy-800 text-xs">
            <button
              onClick={() => onSelectRole('student')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                currentRole === 'student'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              onClick={() => onSelectRole('driver')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                currentRole === 'driver'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Driver</span>
            </button>
            <button
              onClick={() => onSelectRole('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                currentRole === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Demo Mode Toggle Button */}
          <button
            onClick={onToggleDemo}
            className={`p-2 rounded-lg border text-xs flex items-center space-x-1 transition ${
              isDemo
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-navy-850 border-navy-800 text-slate-400 hover:text-slate-200 hover:bg-navy-800'
            }`}
            title={isDemo ? "Demo Active - Click to exit" : "Test in Demo Simulation"}
          >
            <FlaskConical className="w-4 h-4" />
            <span className="hidden lg:inline text-xs font-medium">{isDemo ? 'Demo On' : 'Demo Mode'}</span>
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-800 text-slate-300 hover:text-white transition"
            title="Help & Driver Guidelines"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
