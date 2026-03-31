import { Cart } from '../types';

const CART_KEY = '@vibestore:cart';

/**
 * Carrega os dados do carrinho armazenados localmente no navegador (localStorage).
 * Retorna um carrinho vazio caso não haja dados salvos ou ocorra um erro de processamento.
 */
export const loadCart = (): Cart => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : { items: [] };
  } catch (error) {
    console.error("Erro ao carregar carrinho local:", error);
    return { items: [] };
  }
};

/**
 * Persiste os dados do carrinho no localStorage do navegador.
 */
export const saveCart = (cart: Cart): void => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Erro ao salvar carrinho local:", error);
  }
};
