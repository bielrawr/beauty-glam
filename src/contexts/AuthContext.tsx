/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  deleteUser,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { createUserProfile, getUserProfile, getUserByEmail, deleteUserProfile } from '../services/userService';
import { UserProfile } from '../types';
import { generateCustomerId } from '../utils/validators';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loadingAuth: boolean;
  register: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const googleProvider = new GoogleAuthProvider();
const PROFILE_CACHE_KEY = '@beautyglam:user_profile_v2';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // 1. Tenta carregar o perfil do Cache IMEDIATAMENTE (Síncrono)
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [loadingAuth, setLoadingAuth] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const data = await getUserProfile(uid);
      if (data) {
        const userProfile = data as UserProfile;
        setProfile(userProfile);
        // 2. Salva no cache para o próximo F5
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(userProfile));
      }
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem(PROFILE_CACHE_KEY);
      }
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  async function register(email: string, password: string, displayName = '') {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile = {
      email: cred.user.email || '',
      displayName: displayName || email.split('@')[0],
      customerId: generateCustomerId(),
      addresses: []
    };
    await createUserProfile(cred.user.uid, newProfile);
    setProfile(newProfile);
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(newProfile));
    return cred;
  }

  async function login(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const existingProfile = await getUserProfile(cred.user.uid);
    if (!existingProfile) {
      const newProfile = {
        email: cred.user.email || '',
        displayName: cred.user.displayName || cred.user.email?.split('@')[0] || '',
        photoURL: cred.user.photoURL || undefined,
        customerId: generateCustomerId(),
        addresses: []
      };
      await createUserProfile(cred.user.uid, newProfile);
      setProfile(newProfile);
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(newProfile));
    } else {
      setProfile(existingProfile as UserProfile);
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(existingProfile));
    }
    return cred;
  }

  async function logout() {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    return signOut(auth);
  }

  const value = useMemo(() => ({ 
    user, profile, loadingAuth, register, login, loginWithGoogle, logout,
    changePassword: async (p: string) => auth.currentUser ? firebaseUpdatePassword(auth.currentUser, p) : undefined,
    changeEmail: async (e: string) => auth.currentUser ? firebaseUpdateEmail(auth.currentUser, e) : undefined,
    refreshProfile: () => user ? fetchProfile(user.uid) : Promise.resolve(),
    deleteAccount: async () => { if (auth.currentUser) { await deleteUserProfile(auth.currentUser.uid); await deleteUser(auth.currentUser); } }
  }), [user, profile, loadingAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider />');
  return ctx;
}
