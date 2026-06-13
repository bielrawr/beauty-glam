/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Product, Wishlist, WishlistItem } from '../types';
import { clearWishlistStorage, loadWishlist, saveWishlist } from '../services/wishlistStorage';
import { fetchRemoteWishlist, saveRemoteWishlist } from '../services/wishlistRemote';

interface WishlistContextType {
  wishlist: Wishlist;
  totalWishlistItems: number;
  isWishlistAvailable: boolean;
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
}

type WishlistAction =
  | { type: 'HYDRATE'; payload: Wishlist }
  | { type: 'ADD'; payload: Product }
  | { type: 'REMOVE'; payload: number }
  | { type: 'CLEAR' };

const WishlistContext = createContext<WishlistContextType | null>(null);

function toWishlistItem(product: Product): WishlistItem {
  return {
    productId: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    description: product.description,
    category: product.category,
  };
}

function mergeWishlists(localWishlist: Wishlist, remoteWishlist: Wishlist): Wishlist {
  const map = new Map<number, WishlistItem>();
  for (const item of remoteWishlist.items || []) map.set(item.productId, { ...item });
  for (const item of localWishlist.items || []) map.set(item.productId, { ...item });
  return { items: Array.from(map.values()) };
}

function reducer(state: Wishlist, action: WishlistAction): Wishlist {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'ADD': {
      if (state.items.some((item) => item.productId === action.payload.id)) return state;
      return { items: [...state.items, toWishlistItem(action.payload)] };
    }
    case 'REMOVE':
      return { items: state.items.filter((item) => item.productId !== action.payload) };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loadingAuth } = useAuth();
  const [wishlist, dispatch] = useReducer(reducer, { items: [] });
  const isInitialMount = useRef(true);
  const isSyncing = useRef(false);
  const userRef = useRef(user);
  const wishlistRef = useRef(wishlist);
  const isWishlistAvailable = Boolean(user?.emailVerified);

  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  useEffect(() => {
    if (loadingAuth) return;

    const sync = async () => {
      const previousUser = userRef.current;

      if (!user) {
        if (previousUser?.emailVerified) {
          saveWishlist(wishlistRef.current, previousUser.uid);
          await saveRemoteWishlist(previousUser.uid, wishlistRef.current).catch(console.error);
        }

        clearWishlistStorage();
        dispatch({ type: 'CLEAR' });
        userRef.current = null;
        return;
      }

      if (!user.emailVerified) {
        clearWishlistStorage();
        dispatch({ type: 'CLEAR' });
        userRef.current = user;
        return;
      }

      if (!previousUser || previousUser.uid !== user.uid || !previousUser.emailVerified) {
        isSyncing.current = true;
        try {
          const cached = loadWishlist(user.uid);
          let remote: Wishlist = { items: [] };

          try {
            remote = await fetchRemoteWishlist(user.uid);
          } catch (error) {
            console.error("Erro ao buscar lista de desejos remota:", error);
          }

          const merged = mergeWishlists(cached, remote);
          dispatch({ type: 'HYDRATE', payload: merged });
          saveWishlist(merged, user.uid);
          clearWishlistStorage();
          await saveRemoteWishlist(user.uid, merged).catch(console.error);
        } catch (error) {
          console.error("Erro na sincronizacao da lista de desejos:", error);
        } finally {
          isSyncing.current = false;
        }
      }

      userRef.current = user;
    };

    sync();
  }, [user, loadingAuth]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!user?.emailVerified) {
      clearWishlistStorage();
      return;
    }

    saveWishlist(wishlist, user.uid);

    if (!isSyncing.current) {
      const timer = setTimeout(() => {
        saveRemoteWishlist(user.uid, wishlist).catch(console.error);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [wishlist, user]);

  const value = useMemo(() => ({
    wishlist: isWishlistAvailable ? wishlist : { items: [] },
    totalWishlistItems: isWishlistAvailable ? wishlist.items.length : 0,
    isWishlistAvailable,
    isInWishlist: (productId: number) => (
      isWishlistAvailable && wishlist.items.some((item) => item.productId === productId)
    ),
    addToWishlist: (product: Product) => {
      if (!isWishlistAvailable) return;
      dispatch({ type: 'ADD', payload: product });
    },
    removeFromWishlist: (productId: number) => {
      if (!isWishlistAvailable) return;
      dispatch({ type: 'REMOVE', payload: productId });
    },
    toggleWishlist: (product: Product) => {
      if (!isWishlistAvailable) return;
      if (wishlist.items.some((item) => item.productId === product.id)) {
        dispatch({ type: 'REMOVE', payload: product.id });
        return;
      }
      dispatch({ type: 'ADD', payload: product });
    },
    clearWishlist: () => {
      if (!isWishlistAvailable) return;
      dispatch({ type: 'CLEAR' });
    },
  }), [isWishlistAvailable, wishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist deve ser usado dentro de <WishlistProvider />');
  return ctx;
}
