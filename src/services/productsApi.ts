import { Product } from '../types';

/**
 * Serviço responsável por centralizar as chamadas à API da FakeStore.
 * Isolar as requisições HTTP facilita a manutenção, troca de API e testes automatizados.
 */
const BASE_URL = 'https://fakestoreapi.com';

/**
 * Obtém a lista completa de produtos disponíveis na API.
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
};

/**
 * Obtém a lista de categorias de produtos disponíveis.
 */
export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/products/categories`);
    if (!response.ok) throw new Error("Erro ao buscar categorias");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    throw error;
  }
};

/**
 * Filtra os produtos por uma categoria específica.
 */
export const getProductsByCategory = async (category: string) => {
  try {
    const response = await fetch(`${BASE_URL}/products/category/${category}`);
    if (!response.ok) throw new Error("Erro ao buscar produtos por categoria");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar produtos por categoria:", error);
    throw error;
  }
};

/**
 * Busca os detalhes de um produto individual através do seu ID único.
 */
export const getProductById = async (id: number | string) => {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error("Erro ao buscar produto");
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    throw error;
  }
};
