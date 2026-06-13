/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
  deleteUser,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { createUserProfile, getUserProfile, getUserByEmail, deleteUserProfile } from '../services/userService';
import { UserProfile } from '../types';
import { generateCustomerId } from '../utils/validators';
import { getProfileCompletion } from '../utils/profileCompletion';

/**
 * Definição do formato do contexto de autenticação.
 */
interface AuthContextType {
  user: User | null;               // Objeto de usuário nativo do Firebase
  profile: UserProfile | null;     // Perfil customizado do Firestore
  loadingAuth: boolean;            // Indica se a validação inicial do Firebase está ocorrendo
  register: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  isProfileComplete: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const googleProvider = new GoogleAuthProvider();
const PROFILE_CACHE_KEY = '@beautyglam:user_profile_v2';

const getEmailVerificationSettings = () => ({
  url: `${window.location.origin}/login?verified=1`,
  handleCodeInApp: false,
});

const getPasswordResetSettings = () => ({
  url: `${window.location.origin}/login?passwordReset=1`,
  handleCodeInApp: false,
});

/**
 * AuthProvider: Gerencia o estado global de autenticação e perfil do usuário.
 * Implementa cache local para carregamento instantâneo do nome do usuário no Header.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Inicialização síncrona do perfil através do localStorage para evitar atrasos na UI
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [loadingAuth, setLoadingAuth] = useState(true);

  /**
   * Busca os dados estendidos do usuário no Firestore e atualiza o cache local.
   */
  const fetchProfile = async (uid: string) => {
    try {
      const data = await getUserProfile(uid);
      if (data) {
        const userProfile = data as UserProfile;
        setProfile(userProfile);
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(userProfile));
      }
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
    }
  };

  /**
   * Monitora a mudança de estado de autenticação do Firebase.
   */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        if (!firebaseUser.emailVerified) {
          setProfile(null);
          localStorage.removeItem(PROFILE_CACHE_KEY);
          setLoadingAuth(false);
          return;
        }

        setLoadingAuth(false);
        fetchProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem(PROFILE_CACHE_KEY);
        setLoadingAuth(false);
      }
    });
    return () => unsub();
  }, []);

  /**
   * Realiza o cadastro de um novo usuário, criando tanto a conta no Auth quanto o perfil no Firestore.
   */
  async function register(email: string, password: string, displayName = '') {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const normalizedDisplayName = displayName.trim() || email.split('@')[0];
    const newProfile = {
      email: cred.user.email || '',
      displayName: normalizedDisplayName,
      customerId: generateCustomerId(),
      addresses: []
    };
    await updateProfile(cred.user, { displayName: normalizedDisplayName });
    await createUserProfile(cred.user.uid, newProfile);
    await sendEmailVerification(cred.user, getEmailVerificationSettings());
    localStorage.removeItem(PROFILE_CACHE_KEY);
    setUser(null);
    setProfile(null);
    await signOut(auth);
    return cred;
  }

  /**
   * Autentica um usuário existente.
   */
  async function login(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  /**
   * Autenticação via Google Popup. Gerencia a criação automática de perfil para novos usuários sociais.
   */
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

  /**
   * Finaliza a sessão do usuário e limpa o cache local.
   */
  async function logout() {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    return signOut(auth);
  }

  async function sendVerificationEmail() {
    if (!auth.currentUser || auth.currentUser.emailVerified) return;
    await sendEmailVerification(auth.currentUser, getEmailVerificationSettings());
  }

  async function refreshUser() {
    if (!auth.currentUser) return null;
    await reload(auth.currentUser);
    setUser(auth.currentUser);
    return auth.currentUser;
  }

  /**
   * Memorização do valor do contexto para otimização de performance.
   */
  const value = useMemo(() => ({ 
    user, profile, loadingAuth, register, login, loginWithGoogle, logout,
    sendVerificationEmail,
    resetPassword: (email: string) => sendPasswordResetEmail(auth, email, getPasswordResetSettings()),
    refreshUser,
    changePassword: async (p: string) => auth.currentUser ? firebaseUpdatePassword(auth.currentUser, p) : undefined,
    changeEmail: async (e: string) => auth.currentUser ? firebaseUpdateEmail(auth.currentUser, e) : undefined,
    isProfileComplete: getProfileCompletion(profile).isComplete,
    refreshProfile: () => user ? fetchProfile(user.uid) : Promise.resolve(),
    deleteAccount: async () => { 
      if (auth.currentUser) { 
        await deleteUserProfile(auth.currentUser.uid); 
        await deleteUser(auth.currentUser); 
      } 
    }
  }), [user, profile, loadingAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para facilitar o acesso às funções de autenticação em qualquer componente.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider />');
  return ctx;
}
