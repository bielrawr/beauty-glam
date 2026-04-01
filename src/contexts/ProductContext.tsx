import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getProducts } from '../services/productsApi';
import { translateProduct } from '../utils/productTranslations';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      const translated = data.map((p: any) => translateProduct(p));
      setProducts(translated);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider 
      value={{ products, loading, error, searchQuery, setSearchQuery, refreshProducts: fetchProducts }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts deve ser usado dentro de um ProductProvider");
  return context;
}
