import { Product } from '../types';

const BASE_URL = 'https://makeup-api.herokuapp.com/api/v1';

interface MakeupApiProduct {
  id: number;
  name: string;
  price?: string | number | null;
  description?: string | null;
  category?: string | null;
  product_type?: string | null;
  api_featured_image?: string | null;
  image_link?: string | null;
  rating?: string | number | null;
}

const toProduct = (item: MakeupApiProduct): Product => ({
  id: item.id,
  title: item.name,
  price: Number.parseFloat(String(item.price)) || 10.0,
  description: item.description || "Sem descrição disponível.",
  category: item.category || item.product_type || "Maquiagem",
  image: item.api_featured_image || item.image_link || "",
  rating: {
    rate: Number.parseFloat(String(item.rating)) || 0,
    count: 0
  }
});

/**
 * Serviço responsável por buscar produtos da marca Maybelline.
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${BASE_URL}/products.json?brand=maybelline`);
    
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
    
    const data: MakeupApiProduct[] = await response.json();
    
    return data.map(toProduct);
  } catch (error) {
    console.error("Erro ao buscar produtos da Makeup API:", error);
    throw error;
  }
};

export const getProductById = async (id: number | string): Promise<Product> => {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}.json`);
    if (!response.ok) throw new Error("Erro ao buscar produto");
    const item: MakeupApiProduct = await response.json();
    
    return toProduct(item);
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
