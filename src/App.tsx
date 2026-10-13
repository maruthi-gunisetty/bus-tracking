import { useState } from 'react';
import type { UserRole } from './types';
import { Header } from './components/common/Header';
import { DemoBanner } from './components/common/DemoBanner';
import { LandingView } from './views/LandingView';
import { DriverView } from './views/DriverView';
import { StudentView } from './views/StudentView';
import { AdminView } from './views/AdminView';
import { HelpView } from './views/HelpView';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const handleToggleDemo = () => {
    setIsDemo((prev) => !prev);
  };

  const handleEnterDemo = () => {
    setIsDemo(true);
    setCurrentRole('student');
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-navy-700 selection:text-white">
      {/* Permanent Demo Warning Banner if active */}
      <DemoBanner isDemo={isDemo} onToggleDemo={handleToggleDemo} />

      {/* Main Responsive Navigation */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        isDemo={isDemo}
        onToggleDemo={handleToggleDemo}
        onOpenHelp={() => setShowHelp(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full">
        {currentRole === null && (
          <LandingView
            onSelectRole={(role) => setCurrentRole(role)}
            onEnterDemo={handleEnterDemo}
          />
        )}

        {currentRole === 'driver' && (
          <DriverView isDemo={isDemo} />
        )}

        {currentRole === 'student' && (
          <StudentView isDemo={isDemo} />
        )}

        {currentRole === 'admin' && (
          <AdminView isDemo={isDemo} />
        )}
      </main>

      {/* Help Modal */}
      {showHelp && (
        <HelpView onClose={() => setShowHelp(false)} />
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-navy-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ANSHARY BUS TRACKER · ₹0 Free-Tier Architecture</span>
          <span>OpenStreetMap & Leaflet · Firebase Spark Free Plan</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
