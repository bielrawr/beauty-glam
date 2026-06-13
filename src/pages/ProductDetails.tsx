import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, Star, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { getProductById } from '../services/productsApi';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { translateProduct } from '../utils/productTranslations';
import { Product } from '../types';
import styles from './ProductDetails.module.css';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlistAvailable, isInWishlist, toggleWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(translateProduct(data));
      } catch (err) {
        setError('Não foi possível carregar os detalhes do produto.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>CARREGANDO DETALHES...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.status}>
        <p>{error || 'Produto não encontrado.'}</p>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          Voltar para a Home
        </button>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);
  const wished = isInWishlist(product.id);

  return (
    <div className={`container ${styles.container}`}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> VOLTAR
      </button>

      <div className={styles.productWrapper}>
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            <img src={product.image} alt={product.title} className={styles.image} />
          </div>
        </div>

        <div className={styles.infoSection}>
          <span className={styles.category}>{product.category}</span>
          <h1 className={styles.title}>{product.title.toLowerCase()}</h1>
          
          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.round(product.rating?.rate || 0) ? "var(--accent)" : "none"} 
                  color="var(--accent)"
                />
              ))}
            </div>
            <span className={styles.ratingValue}>{product.rating?.rate || 0}</span>
          </div>

          <div className={styles.priceContainer}>
            <span className={styles.price}>{formattedPrice}</span>
            <span className={styles.installments}>ou 10x de {(product.price / 10).toFixed(2)}</span>
          </div>

          <p className={styles.description}>{product.description}</p>

          <div className={`${styles.actionRow} ${!isWishlistAvailable ? styles.actionRowSingle : ''}`}>
            <button 
              className={styles.buyButton}
              onClick={() => addItem(product)}
            >
              <ShoppingBag size={20} />
              <span>ADICIONAR</span>
              <span className={styles.buyButtonExtra}>AO CARRINHO</span>
            </button>

            {isWishlistAvailable && (
              <button
                className={`${styles.wishlistButton} ${wished ? styles.wishlistButtonActive : ''}`}
                onClick={() => toggleWishlist(product)}
                title={wished ? 'Remover da lista de desejos' : 'Adicionar a lista de desejos'}
              >
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
                <span className={styles.wishlistText}>
                  {wished ? 'REMOVER DA LISTA DE DESEJOS' : 'ADICIONAR A LISTA DE DESEJOS'}
                </span>
              </button>
            )}
          </div>

          <div className={styles.benefits}>
            <div className={styles.benefitItem}>
              <Truck size={18} />
              <span>Frete grátis para todo Brasil</span>
            </div>
            <div className={styles.benefitItem}>
              <ShieldCheck size={18} />
              <span>Produto 100% Original</span>
            </div>
            <div className={styles.benefitItem}>
              <RefreshCcw size={18} />
              <span>Devolução em até 7 dias</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
