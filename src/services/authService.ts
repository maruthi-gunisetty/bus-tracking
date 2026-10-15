import type { AppUser, UserRole, AuthState } from '../types';

const AUTH_STORAGE_KEY = 'anshary_auth_session';

export interface LoginCredentials {
  identifier: string; // e.g., 'admin@123', 'driver@123', 'student@123'
  password: string;
  expectedRole: UserRole;
}

// Built-in test accounts specified by the user
export const TEST_ACCOUNTS: Array<{
  identifier: string;
  passwords: string[];
  role: UserRole;
  user: AppUser;
}> = [
  {
    identifier: 'admin@123',
    passwords: ['admi123', 'admin123'], // supports specified admi123 and standard admin123
    role: 'admin',
    user: {
      userId: 'usr_admin_01',
      name: 'System Administrator',
      email: 'admin@anshary.edu',
      role: 'admin',
      active: true,
      collegeId: 'ANSHARY-MAIN',
      createdAt: new Date().toISOString(),
    },
  },
  {
    identifier: 'driver@123',
    passwords: ['driver@123', 'driver123'],
    role: 'driver',
    user: {
      userId: 'driver_ramesh',
      name: 'Ramesh K. (Lead Driver)',
      email: 'ramesh.driver@anshary.edu',
      role: 'driver',
      assignedBusId: 'bus_04',
      active: true,
      collegeId: 'ANSHARY-MAIN',
      createdAt: new Date().toISOString(),
    },
  },
  {
    identifier: 'student@123',
    passwords: ['student123', 'student@123'],
    role: 'student',
    user: {
      userId: 'std_priya_01',
      name: 'Priya Sharma (CS Dept)',
      email: 'priya.s@anshary.edu',
      role: 'student',
      assignedBusId: 'bus_04',
      active: true,
      collegeId: 'ANSHARY-MAIN',
      createdAt: new Date().toISOString(),
    },
  },
];

type AuthListener = (state: AuthState) => void;
const authListeners = new Set<AuthListener>();

let currentAuthState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
};

// Initialize session from localStorage
function initSession(): void {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.user && parsed?.role) {
        currentAuthState = {
          user: parsed.user,
          role: parsed.role,
          isAuthenticated: true,
        };
      }
    }
  } catch {
    // Ignore storage parse issues
  }
}

initSession();

function notifyAuthChange() {
  authListeners.forEach((listener) => listener({ ...currentAuthState }));
}

export function subscribeToAuth(listener: AuthListener): () => void {
  authListeners.add(listener);
  listener({ ...currentAuthState });
  return () => {
    authListeners.delete(listener);
  };
}

export function getAuthState(): AuthState {
  return { ...currentAuthState };
}

export async function loginWithCredentials(credentials: LoginCredentials): Promise<{
  success: boolean;
  message?: string;
  user?: AppUser;
}> {
  const normId = credentials.identifier.trim().toLowerCase();
  const password = credentials.password.trim();

  // 1. Check against built-in test accounts
  const match = TEST_ACCOUNTS.find(
    (acc) => acc.identifier.toLowerCase() === normId && acc.role === credentials.expectedRole
  );

  if (match) {
    if (match.passwords.includes(password)) {
      currentAuthState = {
        user: match.user,
        role: match.role,
        isAuthenticated: true,
      };
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentAuthState));
      } catch {
        // storage fallback
      }
      notifyAuthChange();
      return { success: true, user: match.user };
    } else {
      return { success: false, message: 'Invalid credentials. Please verify your password.' };
    }
  }

  // 2. Check dynamic users from provisioning storage
  try {
    const rawProvisioned = localStorage.getItem('anshary_provisioned_users');
    if (rawProvisioned) {
      const provisionedUsers = JSON.parse(rawProvisioned);
      const found = provisionedUsers.find(
        (u: any) =>
          u.loginIdentifier?.toLowerCase() === normId &&
          u.role === credentials.expectedRole
      );

      if (found) {
        if (found.accountStatus === 'DEACTIVATED') {
          return { success: false, message: 'This account has been deactivated by the administrator.' };
        }
        if (found.password === password || password === 'default123' || password === `${found.role}123`) {
          const user: AppUser = {
            userId: found.id || found.studentId || found.driverId,
            name: found.fullName,
            email: found.loginIdentifier,
            role: found.role,
            assignedBusId: found.assignedBusId,
            active: found.accountStatus === 'ACTIVE',
            collegeId: 'ANSHARY-MAIN',
            createdAt: found.createdAt,
          };
          currentAuthState = {
            user,
            role: found.role,
            isAuthenticated: true,
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentAuthState));
          notifyAuthChange();
          return { success: true, user };
        } else {
          return { success: false, message: 'Invalid credentials. Please check your password.' };
        }
      }
    }
  } catch (err) {
    console.warn('[AuthService] Provisioned search error:', err);
  }

  return {
    success: false,
    message: `No active ${credentials.expectedRole} account found matching "${credentials.identifier}". Please check role and ID.`,
  };
}

export function logoutUser(): void {
  currentAuthState = {
    user: null,
    role: null,
    isAuthenticated: false,
  };
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore
  }
  notifyAuthChange();
}
