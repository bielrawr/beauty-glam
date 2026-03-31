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

/**
 * Interface que define as propriedades e métodos disponíveis no contexto de autenticação.
 */
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

/**
 * Mapeamento de erros comuns do Firebase para mensagens em Português.
 */
const translateFirebaseError = (code: string) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'Este e-mail já está em uso.';
    case 'auth/invalid-email': return 'E-mail inválido.';
    case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/requires-recent-login':
      return 'Esta operação é sensível e requer um login recente. Por favor, saia e entre novamente antes de mudar seu e-mail ou senha.';
    default: return 'Ocorreu um erro. Tente novamente.';
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provedor de Autenticação que gerencia o estado do usuário, perfil e operações relacionadas.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  /**
   * Busca o perfil do usuário no Firestore com base no UID.
   */
  const fetchProfile = async (uid: string) => {
    try {
      const data = await getUserProfile(uid);
      setProfile(data as UserProfile);
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
    }
  };

  /**
   * Monitora as mudanças no estado de autenticação do Firebase.
   */
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

  /**
   * Registra um novo usuário com e-mail, senha e nome opcional.
   */
  async function register(email: string, password: string, displayName = '') {
    try {
      // 1. Verificação manual no Firestore para evitar duplicidade
      const emailExists = await getUserByEmail(email);
      if (emailExists) {
        throw { code: 'auth/email-already-in-use' };
      }

      // 2. Criação do usuário no Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // 3. Criação do Perfil no Firestore com ID de cliente único
      await createUserProfile(cred.user.uid, {
        email: cred.user.email || '',
        displayName: displayName || email.split('@')[0],
        customerId: generateCustomerId(),
      });
      
      await fetchProfile(cred.user.uid);
      return cred;
    } catch (err: any) {
      throw new Error(translateFirebaseError(err.code || ''));
    }
  }

  /**
   * Exclui a conta do usuário logado e seu perfil no Firestore.
   */
  async function deleteAccount() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // 1. Apaga os dados do perfil no Firestore
      await deleteUserProfile(currentUser.uid);
      // 2. Apaga a conta de autenticação do Firebase
      await deleteUser(currentUser);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        throw new Error("Esta ação é sensível e exige um login recente. Saia e entre novamente antes de excluir sua conta.");
      }
      throw err;
    }
  }

  /**
   * Altera a senha do usuário logado.
   */
  async function changePassword(newPassword: string) {
    if (!auth.currentUser) return;
    try {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
    } catch (err: any) {
      throw new Error(translateFirebaseError(err.code));
    }
  }

  /**
   * Altera o e-mail do usuário logado.
   */
  async function changeEmail(newEmail: string) {
    if (!auth.currentUser) return;
    try {
      await firebaseUpdateEmail(auth.currentUser, newEmail);
    } catch (err: any) {
      throw new Error(translateFirebaseError(err.code));
    }
  }

  /**
   * Recarrega os dados do perfil do usuário logado.
   */
  async function refreshProfile() {
    if (user) await fetchProfile(user.uid);
  }

  /**
   * Realiza o login com e-mail e senha.
   */
  async function login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      throw new Error(translateFirebaseError(err.code));
    }
  }

  /**
   * Realiza o login utilizando a conta do Google.
   */
  async function loginWithGoogle() {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const existingProfile = await getUserProfile(cred.user.uid);
      if (!existingProfile) {
        await createUserProfile(cred.user.uid, {
          email: cred.user.email || '',
          displayName: cred.user.displayName || cred.user.email?.split('@')[0] || '',
          photoURL: cred.user.photoURL || undefined,
          customerId: generateCustomerId(),
        });
      }
      await fetchProfile(cred.user.uid);
      return cred;
    } catch (err: any) {
      throw new Error(translateFirebaseError(err.code));
    }
  }

  /**
   * Realiza o logout do usuário.
   */
  async function logout() {
    return signOut(auth);
  }

  const value = useMemo(
    () => ({ 
      user, 
      profile, 
      loadingAuth, 
      register, 
      login, 
      loginWithGoogle, 
      logout,
      changePassword,
      changeEmail,
      refreshProfile,
      deleteAccount
    }),
    [user, profile, loadingAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook personalizado para acessar o contexto de autenticação.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider />');
  return ctx;
}
