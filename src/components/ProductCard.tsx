import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

/**
 * Componente de cartão para exibição resumida de um produto.
 * Apresenta imagem, título, preço formatado e botão de compra rápida.
 */
const ProductCard = ({ product }: ProductCardProps) => {
  const { title, price, image, id } = product;
  const { addItem } = useCart();

  /**
   * Formata o preço de USD para BRL (usando uma cotação estática de 5.2 para fins de demonstração).
   */
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price * 5.2);

  return (
    <article className={styles.card}>
      <Link to={`/product/${id}`} className={styles.linkWrapper}>
        <div className={styles.imageContainer}>
          <img src={image} alt={title} className={styles.image} />
        </div>

        <div className={styles.info}>
          <h3 className={styles.title} title={title}>
            {title}
          </h3>
          <p className={styles.price}>{formattedPrice}</p>
        </div>
      </Link>

      <button 
        className={styles.button} 
        onClick={(e) => {
          e.preventDefault(); // Impede a navegação para a página de detalhes ao clicar no botão
          addItem(product);
        }}
      >
        Adicionar ao Carrinho
      </button>
    </article>
  );
};

export default ProductCard;
