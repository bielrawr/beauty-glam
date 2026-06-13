import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Product, WishlistItem } from '../types';
import { decodeWishlistShare } from '../utils/wishlistShare';
import styles from './Wishlist.module.css';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function wishlistItemToProduct(item: WishlistItem): Product {
  return {
    id: item.productId,
    title: item.title,
    price: item.price,
    image: item.image,
    description: item.description,
    category: item.category,
  };
}

export function SharedWishlist() {
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const sharedItems = decodeWishlistShare(searchParams.get('data'));

  if (sharedItems.length === 0) {
    return (
      <div className={`container ${styles.emptyWishlist}`}>
        <div className={styles.emptyIcon}>
          <Heart size={44} strokeWidth={1.5} />
        </div>
        <h2>Lista compartilhada indisponível</h2>
        <p>O link pode estar incompleto ou a lista compartilhada não possui produtos.</p>
        <Link to="/" className={styles.backBtn}>
          <ArrowLeft size={18} /> Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.wishlistPage}`}>
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <span className={styles.kicker}>Favoritos compartilhados</span>
          <h1 className={styles.pageTitle}>Lista de Desejos</h1>
          <p className={styles.headerLead}>Produtos selecionados para você conhecer e adicionar ao carrinho.</p>
        </div>
        <Link to="/" className={styles.shareBtn}>
          <ArrowLeft size={16} /> Ver loja
        </Link>
      </div>

      <div className={styles.itemsGrid}>
        {sharedItems.map((item) => (
          <article key={item.productId} className={styles.itemCard}>
            <Link to={`/product/${item.productId}`} className={styles.imageBox}>
              <img src={item.image} alt={item.title} />
            </Link>

            <div className={styles.itemInfo}>
              <span className={styles.category}>{item.category}</span>
              <Link to={`/product/${item.productId}`} className={styles.itemTitle}>
                {item.title.toLowerCase()}
              </Link>
              <p className={styles.itemPrice}>{brl.format(item.price)}</p>
            </div>

            <div className={`${styles.actions} ${styles.singleAction}`}>
              <button
                className={styles.addBtn}
                onClick={() => addItem(wishlistItemToProduct(item))}
                aria-label={`Adicionar ${item.title} ao carrinho`}
              >
                <ShoppingBag size={16} /> <span>Adicionar</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
