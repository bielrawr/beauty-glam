import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const isNew = product.id % 8 === 0;

  return (
    <motion.div 
      className={styles.card}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`} className={styles.link}>
        <div className={styles.imageContainer}>
          {isNew && <span className={styles.badge}>NEW</span>}
          
          <img src={product.image} alt={product.title} className={styles.image} />
          
          {product.rating && product.rating.rate > 0 && (
            <div className={styles.rating}>
              <Star size={10} fill="var(--accent)" color="var(--accent)" />
              <span>{product.rating.rate}</span>
            </div>
          )}

          <button 
            type="button"
            className={styles.quickAdd} 
            onClick={handleAddToCart}
          >
            <ShoppingBag size={14} />
            ADICIONAR AO CARRINHO
          </button>
        </div>
        
        <div className={styles.content}>
          <span className={styles.category}>{product.category}</span>
          <h3 className={styles.title}>{product.title.toLowerCase()}</h3>
          
          <div className={styles.priceContainer}>
            <span className={styles.currency}>R$</span>
            <span className={styles.price}>{product.price.toFixed(2)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
