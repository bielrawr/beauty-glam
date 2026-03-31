import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../hooks/useProducts';
import { getCategories } from '../services/productsApi';
import { categoryTranslations } from '../utils/productTranslations';
import styles from './Home.module.css';
import { Product } from '../types';

/**
 * Página Inicial (Home).
 * Exibe o banner principal, filtros de categoria, barra de busca e o grid de produtos.
 */
export function Home() {
  const { products: allProducts, loading, error } = useProducts();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  /**
   * Carrega as categorias disponíveis ao montar o componente.
   */
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
      }
    };
    fetchCats();
  }, []);

  /**
   * Aplica os filtros de categoria e termo de busca sempre que houver mudanças.
   */
  useEffect(() => {
    let result = allProducts;

    // 1. Filtro de Categoria: Considera tanto a tradução quanto o termo original da API
    if (selectedCategory !== 'all') {
      result = result.filter(p => 
        p.category === categoryTranslations[selectedCategory] || p.category === selectedCategory
      );
    }

    // 2. Filtro de Busca por Texto (Case-insensitive)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, allProducts]);

  /**
   * Utilitário para exibir o nome amigável da categoria traduzida.
   */
  const getTranslatedCategory = (cat: string) => categoryTranslations[cat] || cat;

  /**
   * Exibe uma tela de loading estilizada somente no carregamento inicial da lista de produtos.
   */
  if (loading && allProducts.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '80vh',
        gap: '1rem' 
      }}>
        <h1 className="animate-pulse" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>
          VIBE<span style={{ color: 'var(--text-main)' }}>STORE</span>
        </h1>
        <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary-color)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <main className="container">
      <section className={styles.hero}>
        <h2>Descubra sua Vibe</h2>
        <p>
          Explore nossa curadoria de produtos exclusivos, desde tecnologia de ponta até moda atemporal.
        </p>
      </section>

      {/* Barra de Busca em Tempo Real */}
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input 
          type="text"
          className={styles.searchInput}
          placeholder="O que você está procurando hoje?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Navegação de Categorias */}
      <nav className={styles.categoryNav}>
        <button 
          onClick={() => setSelectedCategory('all')}
          className={`button ${selectedCategory === 'all' ? '' : 'secondary'}`}
        >
          Todos os Produtos
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`button ${selectedCategory === cat ? '' : 'secondary'}`}
          >
            {getTranslatedCategory(cat)}
          </button>
        ))}
      </nav>

      {error && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#dc2626' }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Informações sobre os resultados filtrados */}
          <div className={styles.resultsInfo}>
            {searchTerm.trim() !== '' ? (
              <>Resultados para "<strong>{searchTerm}</strong>": </>
            ) : (
              <>Exibindo <strong>{filteredProducts.length}</strong> produtos</>
            )}
            {selectedCategory !== 'all' && <> em <strong>{getTranslatedCategory(selectedCategory)}</strong></>}
          </div>
          
          {/* Fallback para resultados vazios */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.2rem' }}>Nenhum produto encontrado para sua busca.</p>
              <button className="linkDanger" style={{ marginTop: '1rem', textDecoration: 'underline' }} onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </>
      )}
    </main>
  );
}
