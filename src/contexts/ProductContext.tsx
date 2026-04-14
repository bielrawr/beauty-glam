import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getProducts } from '../services/productsApi';
import { translateProduct } from '../utils/productTranslations';
import { Product } from '../types';

/**
 * Interface que define as propriedades e métodos do contexto de produtos.
 */
interface ProductContextType {
  products: Product[];             // Lista completa de produtos carregados e traduzidos
  loading: boolean;                // Estado de carregamento da API
  error: string | null;            // Mensagem de erro amigável
  searchQuery: string;             // Termo atual da busca (global para o Header)
  setSearchQuery: (query: string) => void;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

/**
 * ProductProvider: Gerencia o ciclo de vida dos produtos na aplicação.
 * Realiza a busca na Makeup API, aplica a localização (tradução) e gerencia a busca global.
 */
export function ProductProvider({ children }: { children: ReactNode }) {
  // Inicializa a partir do localStorage para evitar loader se já houver cache
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('bg_products_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  // Só mostra o loader se NÃO houver cache disponível
  const [loading, setLoading] = useState(products.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Função central para carregar dados da API e transformar para o formato local.
   * Implementa estratégia "Stale-While-Revalidate" (mostra cache e busca novos dados).
   */
  const fetchProducts = async () => {
    try {
      // Se o cache estiver vazio, precisamos do loader agora
      if (products.length === 0) setLoading(true);
      
      const data = await getProducts();
      
      // Mapeamento e Tradução dinâmica para português (PT-BR)
      const translated = data.map((p: any) => translateProduct(p));
      
      setProducts(translated);
      setError(null);

      // Salva no cache persistente para a próxima visita
      localStorage.setItem('bg_products_cache', JSON.stringify(translated));
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      // Só exibe erro na tela se não houver dados do cache para mostrar
      if (products.length === 0) {
        setError("Erro ao carregar produtos.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Executa a busca ao montar o provedor.
   */
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

/**
 * Hook para acessar a vitrine de produtos e o motor de busca em qualquer página.
 */
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts deve ser usado dentro de um ProductProvider");
  return context;
}
