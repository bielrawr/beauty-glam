import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import styles from './Home.module.css';
import { Sparkles, ArrowRight, SearchX } from 'lucide-react';

/**
 * Assets oficiais para o slide da Hero Section.
 */
const HERO_IMAGES = [
  "/src/assets/hero-editorial.jpg",
  "/src/assets/hero-2.jpg",
  "/src/assets/hero-3.jpg",
  "/src/assets/hero-4.jpg",
  "/src/assets/hero-5.jpg"
];

/**
 * Página Inicial (Home): Ponto de entrada principal da loja.
 * Apresenta o banner editorial e a vitrine interativa de produtos.
 */
export function Home() {
  const { products, loading, error, searchQuery } = useProducts();
  const [activeCategory, setActiveCategory] = useState('Tudo');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const productsSectionRef = useRef<HTMLElement>(null);

  /**
   * Lógica do Slide Automático: Rotaciona as imagens a cada 15 segundos.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 15000); 
    return () => clearInterval(timer);
  }, []);

  /**
   * Normalização de texto: Remove acentos e padroniza para buscas precisas.
   */
  const normalize = (text: string) => {
    if (!text) return "";
    return text.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c");
  };

  /**
   * Scroll Suave: Leva o usuário para a seção de produtos.
   */
  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = productsSectionRef.current.getBoundingClientRect().top;
      window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
    }
  };

  /**
   * Dispara o scroll automático sempre que uma busca é iniciada.
   */
  useEffect(() => {
    if (searchQuery.trim().length > 0) scrollToProducts();
  }, [searchQuery]);

  /**
   * Extração dinâmica de categorias únicas presentes nos produtos carregados.
   */
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category))).sort();
    return ['Tudo', ...cats];
  }, [products]);

  /**
   * Motor de filtragem: Combina categoria ativa + termo de busca normalizado.
   */
  const filteredProducts = useMemo(() => {
    const query = normalize(searchQuery);
    return products.filter(p => {
      const matchesCategory = activeCategory === 'Tudo' || p.category === activeCategory;
      if (!query) return matchesCategory;
      const title = normalize(p.title);
      const desc = normalize(p.description);
      const cat = normalize(p.category);
      return matchesCategory && (title.includes(query) || desc.includes(query) || cat.includes(query));
    });
  }, [products, activeCategory, searchQuery]);

  /**
   * Renderização do Loader Temático (BeautyGlam Luxe).
   */
  if (loading) {
    return (
      <div className={styles.luxuryLoader}>
        <motion.div 
          className={styles.loaderLogo}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          B<span>G</span>
        </motion.div>
        <p>REVELANDO A BELEZA...</p>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
          <Sparkles size={16} color="var(--accent)" />
        </motion.div>
      </div>
    );
  }

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.home}>
      {/* Hero Section Editorial: Slide de imagens com animações suaves */}
      <section className={styles.hero}>
        <motion.div className={styles.abstractBar1} animate={{ x: [-10, 10, -10] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className={styles.abstractCircle1} animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

        <div className={`container ${styles.heroContainer}`}>
          <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className={styles.badge}><Sparkles size={14} /> Coleção Exclusiva</span>
            <h1 className={styles.heroTitle}>Beleza <span>Redefinida</span></h1>
            <p className={styles.heroDescription}>Produtos de alta performance com acabamento profissional para realçar o que há de melhor em você.</p>
            <div className={styles.heroActions}>
              <button onClick={scrollToProducts} className={styles.primaryBtn}>Comprar Agora <ArrowRight size={18} /></button>
              <button onClick={scrollToProducts} className={styles.secondaryBtn}>Ver Coleção</button>
            </div>
          </motion.div>
          
          <motion.div className={styles.heroImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <div className={styles.imageFrame}>
              <AnimatePresence>
                <motion.img 
                  key={currentImageIndex}
                  src={HERO_IMAGES[currentImageIndex]} 
                  alt="Beauty Model Editorial" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 4.0, ease: "linear" }}
                  className={styles.editorialImage}
                />
              </AnimatePresence>
              <div className={styles.goldLine} />
              
              <div className={styles.slideIndicators}>
                {HERO_IMAGES.map((_, i) => (
                  <div key={i} className={`${styles.dot} ${i === currentImageIndex ? styles.dotActive : ''}`} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vitrine de Produtos: Grade interativa com filtros dinâmicos */}
      <section ref={productsSectionRef} className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{searchQuery ? `Resultados para "${searchQuery}"` : 'Tendências de Beleza'}</h2>
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

          {/* Listagem de produtos filtrados ou estado vazio */}
          {filteredProducts.length > 0 ? (
            <div className={styles.grid}>
              {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
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
