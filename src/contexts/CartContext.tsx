/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, ReactNode } from 'react';
import { loadCart, saveCart } from '../services/cartStorage';
import { fetchRemoteCart, saveRemoteCart } from '../services/cartRemote';
import { useAuth } from './AuthContext';
import { Cart, CartItem, Product } from '../types';

/**
 * Interface que define as operações disponíveis no carrinho de compras.
 */
interface CartContextType {
  cart: Cart;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

/**
 * Lógica de Merge: Combina o carrinho local (offline) com o remoto (cloud).
 * Em caso de conflito, preserva a maior quantidade de cada item.
 */
function mergeCarts(localCart: Cart, remoteCart: Cart): Cart {
  const map = new Map<number, CartItem>();
  for (const item of remoteCart.items || []) map.set(item.productId, { ...item });
  for (const item of localCart.items || []) {
    const existing = map.get(item.productId);
    if (existing) {
      map.set(item.productId, { ...existing, quantity: Math.max(existing.quantity, item.quantity) });
    } else {
      map.set(item.productId, { ...item });
    }
  }
  return { items: Array.from(map.values()) };
}

type CartAction =
  | { type: 'HYDRATE'; payload: Cart }
  | { type: 'ADD'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE'; payload: number }
  | { type: 'SET_QTY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR' };

/**
 * Reducer centralizado para garantir imutabilidade e rastreabilidade das ações no carrinho.
 */
function reducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'HYDRATE': return action.payload;
    case 'ADD': {
      const { product, quantity } = action.payload;
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return { ...state, items: state.items.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i) };
      }
      return { ...state, items: [...state.items, {
        productId: product.id, title: product.title, price: product.price,
        image: product.image, description: product.description, quantity,
      }] };
    }
    case 'REMOVE': return { ...state, items: state.items.filter((i) => i.productId !== action.payload) };
    case 'SET_QTY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) return { ...state, items: state.items.filter((i) => i.productId !== productId) };
      return { ...state, items: state.items.map((i) => i.productId === productId ? { ...i, quantity } : i) };
    }
    case 'CLEAR': return { items: [] };
    default: return state;
  }
}

/**
 * CartProvider: Orquestrador da persistência e sincronização do carrinho.
 * Lida com o fluxo: LocalStorage -> Firestore -> Merge no Login.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loadingAuth } = useAuth();
  const [cart, dispatch] = useReducer(reducer, { items: [] }, () => loadCart());
  
  const isInitialMount = useRef(true);
  const userRef = useRef(user);
  const isSyncing = useRef(false);

  /**
   * Fluxo de Sincronização de Login/Logout.
   * Quando o usuário loga, traz os dados do Cloud e mescla com os locais.
   */
  useEffect(() => {
    if (loadingAuth) return;

    const sync = async () => {
      // LOGIN: Dispara o merge de dados entre local e cloud
      if (user && !userRef.current) {
        isSyncing.current = true;
        try {
          const remote = await fetchRemoteCart(user.uid);
          const merged = mergeCarts(cart, remote);
          dispatch({ type: 'HYDRATE', payload: merged });
          await saveRemoteCart(user.uid, merged);
        } catch (e) {
          console.error("Erro na sincronização de dados do carrinho:", e);
        } finally {
          isSyncing.current = false;
        }
      } 
      // LOGOUT: Limpa o estado atual do carrinho
      else if (!user && userRef.current) {
        dispatch({ type: 'CLEAR' });
      }
      userRef.current = user;
    };

    sync();
  }, [user, loadingAuth]);

  /**
   * Persistência disparada por qualquer mudança no estado do carrinho.
   * Salva localmente e envia para o Cloud (debounce de 800ms).
   */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Salva no localStorage (Imediato)
    saveCart(cart);

    // Salva no Firestore (Se logado, com debounce para evitar excesso de requisições)
    if (user && !isSyncing.current) {
      const timer = setTimeout(() => {
        saveRemoteCart(user.uid, cart).catch(console.error);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [cart, user]);

  /**
   * Valor exportado pelo contexto, contendo o estado e as ações de manipulação.
   */
  const value = useMemo(() => ({
    cart,
    addItem: (p: Product, q = 1) => dispatch({ type: 'ADD', payload: { product: p, quantity: q } }),
    removeItem: (id: number) => dispatch({ type: 'REMOVE', payload: id }),
    setQuantity: (id: number, q: number) => dispatch({ type: 'SET_QTY', payload: { productId: id, quantity: q } }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
    totalItems: cart.items.reduce((acc, i) => acc + i.quantity, 0),
    totalPrice: cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0),
  }), [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook para gerenciar o carrinho de compras de qualquer lugar do app.
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider />');
  return ctx;
}
