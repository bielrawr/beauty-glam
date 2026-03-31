import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { getProductById } from '../services/productsApi';
import { useCart } from '../contexts/CartContext';
import { translateProduct } from '../utils/productTranslations';
import { Product } from '../types';
import styles from './ProductDetails.module.css';

/**
 * Página de Detalhes do Produto.
 * Exibe informações completas de um item selecionado, incluindo categoria, avaliações e descrição técnica.
 */
export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca os detalhes do produto pelo ID na API e aplica as traduções de campos.
   */
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getProductById(id);
        // Aplica a tradução ao produto recebido antes de salvar no estado
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
      <div className={styles.status}>
        <p>Carregando detalhes...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.status}>
        <p style={{ color: '#dc2626' }}>{error || 'Produto não encontrado.'}</p>
        <button className="button" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
          Voltar para a Home
        </button>
      </div>
    );
  }

  /**
   * Formata o preço de USD para BRL (cotação demonstrativa de 5.2).
   */
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price * 5.2);

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className={styles.productWrapper}>
        <div className={styles.imageContainer}>
          <img src={product.image} alt={product.title} className={styles.image} />
        </div>

        <div className={styles.info}>
          <span className={styles.category}>{product.category}</span>
          <h2 className={styles.title}>{product.title}</h2>
          
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={18} 
                  fill={i < Math.round(product.rating?.rate || 0) ? "currentColor" : "none"} 
                />
              ))}
            </div>
            <span className={styles.count}>({product.rating?.count} avaliações)</span>
          </div>

          <p className={styles.price}>{formattedPrice}</p>

          <h3 className={styles.descriptionTitle}>Descrição</h3>
          <p className={styles.description}>{product.description}</p>

          <button 
            className={`button ${styles.buyButton}`}
            onClick={() => addItem(product)}
          >
            <ShoppingCart size={20} style={{ marginRight: '10px' }} />
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
