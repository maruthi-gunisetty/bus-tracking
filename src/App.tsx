import { useState, useEffect } from 'react';
import type { UserRole, AppUser } from './types';
import { Header } from './components/common/Header';
import { DemoBanner } from './components/common/DemoBanner';
import { LandingView } from './views/LandingView';
import { DriverView } from './views/DriverView';
import { StudentView } from './views/StudentView';
import { AdminView } from './views/AdminView';
import { HelpView } from './views/HelpView';
import { LoginModal } from './components/auth/LoginModal';
import { TripProvider } from './context/TripContext';
import { subscribeToAuth, logoutUser } from './services/authService';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Login Modal state
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('student');

  // Subscribe to authentication session
  useEffect(() => {
    const unsub = subscribeToAuth((state) => {
      if (state.isAuthenticated && state.user && state.role) {
        setCurrentUser(state.user);
        setCurrentRole(state.role);
      } else {
        setCurrentUser(null);
        setCurrentRole(null);
      }
    });
    return unsub;
  }, []);

  const handleOpenLogin = (role: UserRole) => {
    setLoginInitialRole(role);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: AppUser, role: UserRole) => {
    setCurrentUser(user);
    setCurrentRole(role);
    setLoginModalOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentRole(null);
  };

  const handleToggleDemo = () => {
    setIsDemo((prev) => !prev);
  };

  const handleEnterDemo = () => {
    setIsDemo(true);
    setCurrentRole('student');
  };

  return (
    <TripProvider>
      <div className="min-h-screen bg-bg-main text-text-primary flex flex-col font-sans selection:bg-accent-teal/20 selection:text-primary-navy">
        {/* Permanent Demo Warning Banner if active */}
        <DemoBanner isDemo={isDemo} onToggleDemo={handleToggleDemo} />

        {/* Main Header with ANSHARY wordmark and Role Selector */}
        <Header
          currentUser={currentUser}
          currentRole={currentRole}
          onOpenLogin={handleOpenLogin}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentRole(null)}
          isDemo={isDemo}
          onToggleDemo={handleToggleDemo}
          onOpenHelp={() => setShowHelp(true)}
        />

        {/* Main View Container */}
        <main className="flex-1 w-full">
          {currentRole === null && (
            <LandingView
              onOpenLogin={handleOpenLogin}
              onEnterDemo={handleEnterDemo}
            />
          )}

          {currentRole === 'driver' && <DriverView isDemo={isDemo} />}

          {currentRole === 'student' && <StudentView isDemo={isDemo} />}

          {currentRole === 'admin' && (
            <AdminView isDemo={isDemo} onLogout={handleLogout} />
          )}
        </main>

        {/* Role-Specific Sign In Dialog */}
        <LoginModal
          initialRole={loginInitialRole}
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Help Guidelines Modal */}
        {showHelp && <HelpView onClose={() => setShowHelp(false)} />}
      </div>
    </TripProvider>
  );
}

export default App;
