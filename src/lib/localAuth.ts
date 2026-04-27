// Local Authentication System (No Firebase)
// Uses localStorage for user storage and session management

export interface LocalUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  isAnonymous: boolean;
}

interface StoredUser {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  createdAt: number;
}

const USERS_STORAGE_KEY = 'dsa_users';
const CURRENT_USER_KEY = 'dsa_current_user';
const SESSION_KEY = 'dsa_session_token';

// Helper to generate unique ID
function generateUID() {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Get all stored users
function getStoredUsers(): StoredUser[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save users to storage
function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<LocalUser> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getStoredUsers();
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        reject(new Error('User with this email already exists'));
        return;
      }

      // Validate inputs
      if (!email || !password || !displayName) {
        reject(new Error('Missing required fields'));
        return;
      }

      if (password.length < 6) {
        reject(new Error('Password must be at least 6 characters'));
        return;
      }

      const uid = generateUID();
      const newUser: StoredUser = {
        uid,
        email,
        password, // In production, this should be hashed
        displayName,
        createdAt: Date.now()
      };

      users.push(newUser);
      saveStoredUsers(users);

      // Create session
      const sessionToken = generateUID();
      localStorage.setItem(SESSION_KEY, sessionToken);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        uid,
        email,
        displayName,
        emailVerified: false,
        isAnonymous: false
      }));

      resolve({
        uid,
        email,
        displayName,
        emailVerified: false,
        isAnonymous: false
      });
    }, 500); // Simulate network delay
  });
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<LocalUser> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getStoredUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        reject(new Error('User not found'));
        return;
      }

      if (user.password !== password) {
        reject(new Error('Invalid password'));
        return;
      }

      // Create session
      const sessionToken = generateUID();
      localStorage.setItem(SESSION_KEY, sessionToken);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: false,
        isAnonymous: false
      }));

      resolve({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: false,
        isAnonymous: false
      });
    }, 500); // Simulate network delay
  });
}

// Sign in with Google (simulated - creates a persistent demo account)
export async function signInWithGoogle(): Promise<LocalUser> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if user already has a Google account
      const existingUser = localStorage.getItem('dsa_google_user');
      
      let googleUser;
      if (existingUser) {
        // Use existing Google account
        googleUser = JSON.parse(existingUser);
      } else {
        // Create new persistent Google account (only once)
        const uid = generateUID();
        googleUser = {
          uid,
          email: `google_${uid}@google.local`,
          displayName: 'Google User',
          emailVerified: true,
          isAnonymous: false
        };
        localStorage.setItem('dsa_google_user', JSON.stringify(googleUser));
      }

      // Create session
      const sessionToken = generateUID();
      localStorage.setItem(SESSION_KEY, sessionToken);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(googleUser));

      resolve(googleUser);
    }, 500);
  });
}

// Get current user
export function getCurrentUser(): LocalUser | null {
  try {
    const sessionToken = localStorage.getItem(SESSION_KEY);
    if (!sessionToken) return null;

    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

// Sign out
export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Listen to auth changes
export function onAuthChange(callback: (user: LocalUser | null) => void): () => void {
  // Check immediately
  callback(getCurrentUser());

  // Set up a listener for storage changes (for multi-tab support)
  const handleStorageChange = () => {
    callback(getCurrentUser());
  };

  window.addEventListener('storage', handleStorageChange);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}
