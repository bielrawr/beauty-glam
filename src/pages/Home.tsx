import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import styles from './Home.module.css';
import { Sparkles, ArrowRight, SearchX } from 'lucide-react';

export function Home() {
  const { products, loading, error, searchQuery } = useProducts();
  const [activeCategory, setActiveCategory] = useState('Tudo');
  const productsSectionRef = useRef<HTMLElement>(null);

  /**
   * Função ultra-robusta para normalizar texto (remove acentos, cedilhas e espaços extras)
   */
  const normalize = (text: string) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/ç/g, "c"); // Garante o 'c' no lugar do 'ç'
  };

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = productsSectionRef.current.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      scrollToProducts();
    }
  }, [searchQuery]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category))).sort();
    return ['Tudo', ...cats];
  }, [products]);

  // Lógica de filtragem aprimorada
  const filteredProducts = useMemo(() => {
    const query = normalize(searchQuery);
    
    return products.filter(p => {
      // 1. Verifica categoria
      const matchesCategory = activeCategory === 'Tudo' || p.category === activeCategory;
      
      // 2. Se não houver busca, retorna apenas o filtro de categoria
      if (!query) return matchesCategory;

      // 3. Normaliza campos do produto para comparação
      const title = normalize(p.title);
      const desc = normalize(p.description);
      const cat = normalize(p.category);

      // 4. Verifica se o termo existe em qualquer parte relevante
      const matchesSearch = title.includes(query) || 
                            desc.includes(query) || 
                            cat.includes(query);
      
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>CARREGANDO COLEÇÃO DE LUXO...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.home}>
      {/* Hero Section Editorial */}
      <section className={styles.hero}>
        <motion.div 
          className={styles.abstractBar1}
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div 
          className={styles.abstractCircle1}
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className={`container ${styles.heroContainer}`}>
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className={styles.badge}>
              <Sparkles size={14} /> Coleção Exclusiva
            </span>
            <h1 className={styles.heroTitle}>
              Beleza <span>Redefinida</span>
            </h1>
            <p className={styles.heroDescription}>
              Produtos de alta performance com acabamento profissional para realçar o que há de melhor em você.
            </p>
            <div className={styles.heroActions}>
              <button onClick={scrollToProducts} className={styles.primaryBtn}>
                Comprar Agora <ArrowRight size={18} />
              </button>
              <button onClick={scrollToProducts} className={styles.secondaryBtn}>
                Ver Coleção
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.heroImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className={styles.imageFrame}>
              <img src="/src/assets/hero.png" alt="Beauty Model Luxe" />
              <div className={styles.goldLine} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section ref={productsSectionRef} className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Tendências de Beleza'}
            </h2>
            <div className={styles.filterBar}>
              {categories.map((cat) => (
                <button 
                  key={cat}
                  className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className={styles.grid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <SearchX size={60} strokeWidth={1} color="#CCCCCC" />
              <h3>Nenhum produto encontrado</h3>
              <p>Tente ajustar sua busca ou mudar de categoria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
