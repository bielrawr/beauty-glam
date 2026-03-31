import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Cart } from '../types';

const COLLECTION = 'carts';

/**
 * Busca o carrinho remoto do usuário no Firestore.
 * Retorna um objeto de carrinho vazio caso o documento não exista.
 */
export const fetchRemoteCart = async (userId: string): Promise<Cart> => {
  try {
    const docRef = doc(db, COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Cart;
    }
    
    return { items: [] };
  } catch (error) {
    console.error("Erro ao carregar carrinho remoto:", error);
    throw error;
  }
};

/**
 * Salva o estado atual do carrinho do usuário no Firestore.
 * Utiliza merge para preservar outros campos caso existam.
 */
export const saveRemoteCart = async (userId: string, cart: Cart): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, userId);
    await setDoc(docRef, cart, { merge: true });
  } catch (error) {
    console.error("Erro ao salvar carrinho remoto:", error);
    throw error;
  }
};
