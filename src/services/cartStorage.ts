import { Cart } from '../types';

const CART_KEY = '@vibestore:cart';

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
  const saved = localStorage.getItem(CART_KEY);
  return saved ? JSON.parse(saved) : { items: [] };
};

/**
 * Remove o carrinho do localStorage.
 */
export const clearCartStorage = (): void => {
  localStorage.removeItem(CART_KEY);
};
