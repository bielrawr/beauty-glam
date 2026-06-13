import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Wishlist } from '../types';

const COLLECTION = 'profiles';

export const fetchRemoteWishlist = async (userId: string): Promise<Wishlist> => {
  try {
    const docRef = doc(db, COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return (docSnap.data().wishlist as Wishlist | undefined) || { items: [] };
    }

    return { items: [] };
  } catch (error) {
    console.error("Erro ao carregar lista de desejos remota:", error);
    throw error;
  }
};

export const saveRemoteWishlist = async (userId: string, wishlist: Wishlist): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, userId);
    await setDoc(docRef, {
      wishlist,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Erro ao salvar lista de desejos remota:", error);
    throw error;
  }
};
