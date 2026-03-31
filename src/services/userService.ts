import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COLLECTION = 'users';

/**
 * Verifica se um endereço de e-mail já está cadastrado na coleção de usuários do Firestore.
 */
export const getUserByEmail = async (email: string) => {
  try {
    const q = query(collection(db, COLLECTION), where("email", "==", email));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return false;
  }
};

/**
 * Cria ou atualiza o perfil completo do usuário no Firestore.
 * Garante que campos essenciais como endereços e datas de auditoria existam.
 */
export const createUserProfile = async (userId: string, profileData: any) => {
  try {
    const userRef = doc(db, COLLECTION, userId);
    await setDoc(userRef, {
      ...profileData,
      addresses: profileData.addresses || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Erro ao criar perfil de usuário:", error);
    throw error;
  }
};

/**
 * Atualiza campos específicos do perfil do usuário (ex: nome, telefone).
 * Registra automaticamente a data da última atualização.
 */
export const updateProfileData = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, COLLECTION, userId);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};

/**
 * Atualiza exclusivamente a lista de endereços salvos pelo usuário.
 */
export const updateAddresses = async (userId: string, addresses: any[]) => {
  try {
    const userRef = doc(db, COLLECTION, userId);
    await setDoc(userRef, {
      addresses,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Erro ao atualizar endereços:", error);
    throw error;
  }
};

/**
 * Busca e retorna todos os dados do perfil de um usuário no Firestore.
 * Retorna null se o perfil não for encontrado.
 */
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, COLLECTION, userId);
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error("Erro ao buscar perfil de usuário:", error);
    throw error;
  }
};

/**
 * Remove permanentemente o documento de perfil do usuário do Firestore.
 */
export const deleteUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Erro ao excluir perfil:", error);
    throw error;
  }
};
