import React from 'react';
import { GraduationCap, Car, Shield, Navigation, BellRing, Smartphone, Sparkles, ArrowRight } from 'lucide-react';
import type { UserRole } from '../types';

interface LandingViewProps {
  onSelectRole: (role: UserRole) => void;
  onEnterDemo: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onSelectRole, onEnterDemo }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between max-w-5xl mx-auto px-4 py-8 sm:px-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 my-auto pt-4 pb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero Hardware · Smartphone GPS Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          ANSHARY <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">BUS TRACKER</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
          Real-time college bus tracking powered entirely by the driver&apos;s smartphone GPS.
          Accurate distance calculations, smart proximity alerts, and 100% free-tier architecture.
        </p>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 max-w-4xl mx-auto">
          {/* Student Card */}
          <button
            onClick={() => onSelectRole('student')}
            className="group text-left p-6 rounded-2xl bg-gradient-to-b from-navy-850 to-navy-900 border border-navy-800 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
              Student Portal
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-sky-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Track your assigned bus live on OpenStreetMap, check distance to your stop, and receive arrival alerts.
            </p>
            <div className="mt-4 pt-3 border-t border-navy-800 flex items-center text-xs font-semibold text-sky-400">
              <span>Track Bus Live</span>
            </div>
          </button>

          {/* Driver Card */}
          <button
            onClick={() => onSelectRole('driver')}
            className="group text-left p-6 rounded-2xl bg-gradient-to-b from-navy-850 to-navy-900 border border-navy-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
              Driver Console
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              One-touch START / END trip controls, automatic GPS broadcast, college geofence arrival detection.
            </p>
            <div className="mt-4 pt-3 border-t border-navy-800 flex items-center text-xs font-semibold text-amber-400">
              <span>Start / Manage Trip</span>
            </div>
          </button>

          {/* Admin Card */}
          <button
            onClick={() => onSelectRole('admin')}
            className="group text-left p-6 rounded-2xl bg-gradient-to-b from-navy-850 to-navy-900 border border-navy-800 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center justify-between">
              Admin Control
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Manage buses, assign drivers, add pickup points with map click, and view live fleet trips.
            </p>
            <div className="mt-4 pt-3 border-t border-navy-800 flex items-center text-xs font-semibold text-purple-400">
              <span>Manage Fleet</span>
            </div>
          </button>
        </div>

        {/* Demo Mode Action Button */}
        <div className="pt-6">
          <button
            onClick={onEnterDemo}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-semibold text-amber-300 hover:border-amber-500/50 transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Launch Simulation in Demo Mode</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights Footer */}
      <div className="border-t border-navy-850 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Smartphone className="w-4 h-4 text-sky-400" />
          <span>Zero GPS Hardware Needed</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <BellRing className="w-4 h-4 text-emerald-400" />
          <span>Smart Proximity & Arrival Audio</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Navigation className="w-4 h-4 text-amber-400" />
          <span>Throttled for ₹0 Free Tier</span>
        </div>
      </div>
    </div>
  );
};
