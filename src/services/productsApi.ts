import { Product } from '../types';

const BASE_URL = 'https://makeup-api.herokuapp.com/api/v1';

/**
 * Serviço responsável por buscar produtos da marca Maybelline.
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${BASE_URL}/products.json?brand=maybelline`);
    
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.id,
      title: item.name,
      price: parseFloat(item.price) || 10.0,
      description: item.description || "Sem descrição disponível.",
      category: item.category || item.product_type,
      image: item.api_featured_image || item.image_link,
      rating: {
        rate: parseFloat(item.rating) || 0,
        count: 0
      }
    }));
  } catch (error) {
    console.error("Erro ao buscar produtos da Makeup API:", error);
    throw error;
  }
};

export const getProductById = async (id: number | string) => {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}.json`);
    if (!response.ok) throw new Error("Erro ao buscar produto");
    const item = await response.json();
    
    return {
      id: item.id,
      title: item.name,
      price: parseFloat(item.price) || 10.0,
      description: item.description || "Sem descrição disponível.",
      category: item.category || item.product_type,
      image: item.api_featured_image || item.image_link,
      rating: {
        rate: parseFloat(item.rating) || 0,
        count: 0
      }
    };
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    throw error;
  }
};

export const getCategories = async (): Promise<string[]> => {
  return ["Eyeliner", "Lipstick", "Mascara", "Foundation"];
};

export const getProductsByCategory = async (category: string) => {
  const all = await getProducts();
  return all.filter(p => p.category.toLowerCase() === category.toLowerCase());
};
