import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import styles from './Home.module.css';
import { Sparkles, ArrowRight, SearchX } from 'lucide-react';

/**
 * Assets oficiais para o slide da Hero Section.
 * Ficam em public/assets para serem servidos como caminhos globais no Netlify.
 */
const HERO_IMAGES = [
  '/assets/hero-editorial.jpg',
  '/assets/hero-2.jpg',
  '/assets/hero-3.jpg',
  '/assets/hero-4.jpg',
  '/assets/hero-5.jpg'
];

const SKELETON_FILTERS = Array.from({ length: 6 }, (_, index) => index);
const SKELETON_PRODUCTS = Array.from({ length: 8 }, (_, index) => index);

function HomeSkeleton() {
  return (
    <div className={styles.home} aria-busy="true" aria-label="Carregando conteudo">
      <section className={`${styles.hero} ${styles.skeletonHero}`}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonBadge}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonTitleShort}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonText}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonTextShort}`} />
            <div className={styles.skeletonActions}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonButton}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonButton}`} />
            </div>
          </div>

          <div className={styles.heroImage}>
            <div className={`${styles.imageFrame} ${styles.skeletonFrame}`}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonImage}`} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonSectionTitle}`} />
            <div className={styles.skeletonFilterBar}>
              {SKELETON_FILTERS.map((item) => (
                <div key={item} className={`${styles.skeletonBlock} ${styles.skeletonFilter}`} />
              ))}
            </div>
          </div>

          <div className={styles.grid}>
            {SKELETON_PRODUCTS.map((item) => (
              <div key={item} className={styles.skeletonCard}>
                <div className={`${styles.skeletonBlock} ${styles.skeletonCardImage}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonCardCategory}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonCardTitle}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonCardTitleShort}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonCardPrice}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

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
   * Garante que a Home sempre abra no topo ao ser carregada.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    HERO_IMAGES.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

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

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error) return <div className={styles.error}>{error}</div>;

  const renderHeroSlider = (frameClassName: string) => (
    <div className={frameClassName}>
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
  );

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
            <div className={styles.mobileHeroSlider}>
              {renderHeroSlider(`${styles.imageFrame} ${styles.mobileImageFrame}`)}
            </div>
            <div className={styles.heroActions}>
              <button onClick={scrollToProducts} className={styles.primaryBtn}>Comprar Agora <ArrowRight size={18} /></button>
              <button onClick={scrollToProducts} className={styles.secondaryBtn}>Ver Coleção</button>
            </div>
          </motion.div>
          
          <motion.div className={styles.heroImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {renderHeroSlider(styles.imageFrame)}
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
