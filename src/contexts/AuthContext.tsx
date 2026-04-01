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

const translateFirebaseError = (code: string) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'Este e-mail já está em uso.';
    case 'auth/invalid-email': return 'E-mail inválido.';
    case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    default: return 'Ocorreu um erro. Tente novamente.';
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const data = await getUserProfile(uid);
      if (data) setProfile(data as UserProfile);
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
      }
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  async function register(email: string, password: string, displayName = '') {
    try {
      const emailExists = await getUserByEmail(email);
      if (emailExists) throw { code: 'auth/email-already-in-use' };
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const newProfile = {
        email: cred.user.email || '',
        displayName: displayName || email.split('@')[0],
        customerId: generateCustomerId(),
        addresses: []
      };
      await createUserProfile(cred.user.uid, newProfile);
      setProfile(newProfile);
      return cred;
    } catch (err: any) {
      throw new Error(translateFirebaseError(err.code || ''));
    }
  }

  async function login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      throw new Error(translateFirebaseError(err.code));
    }
  }

  async function loginWithGoogle() {
    try {
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
      } else {
        setProfile(existingProfile as UserProfile);
      }
      return cred;
    } catch (err: any) {
      throw new Error(translateFirebaseError(err.code));
    }
  }

  async function logout() {
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
