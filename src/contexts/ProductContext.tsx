import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getProducts } from '../services/productsApi';
import { translateProduct } from '../utils/productTranslations';
import { Product } from '../types';

/**
 * Interface que define as propriedades e métodos disponíveis no contexto de produtos.
 */
interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

/**
 * Provedor de Produtos que gerencia a busca, tradução e carregamento da lista de produtos.
 */
export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca os produtos da API e aplica as traduções necessárias.
   */
  const fetchProducts = async () => {
    try {
      // Só mostra loading na primeira carga para evitar flashes na interface
      if (products.length === 0) setLoading(true);
      
      const data = await getProducts();
      const translated = data.map((p: any) => translateProduct(p));
      
      setProducts(translated);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega os produtos ao montar o componente.
   */
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, refreshProducts: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de produtos.
 */
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts deve ser usado dentro de um ProductProvider");
  return context;
}
