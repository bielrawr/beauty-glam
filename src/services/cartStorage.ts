import { Cart } from '../types';

const CART_KEY = '@beautyglam:cart';

/**
 * Salva o carrinho no localStorage.
 */
export const saveCart = (cart: Cart): void => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

/**
 * Carrega o carrinho do localStorage.
 */
export const loadCart = (): Cart => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : { items: [] };
  } catch {
    return { items: [] };
  }
};

/**
 * Remove o carrinho do localStorage.
 */
export const clearCartStorage = (): void => {
  localStorage.removeItem(CART_KEY);
};
