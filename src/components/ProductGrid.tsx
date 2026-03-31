import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
}

/**
 * Variantes de animação para o container do grid, utilizando efeito de escalonamento (stagger).
 */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

/**
 * Variantes de animação para cada item individual do grid.
 */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

/**
 * Grid responsivo que organiza e anima a exibição da lista de cartões de produtos.
 */
const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <motion.div 
      className={styles.grid}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
