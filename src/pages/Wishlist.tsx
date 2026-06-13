import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Eraser, Heart, Share2, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Product, WishlistItem } from '../types';
import { encodeWishlistShare } from '../utils/wishlistShare';
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

export function Wishlist() {
  const { addItem } = useCart();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [shareFeedback, setShareFeedback] = useState('');
  const totalItemsLabel = `${wishlist.items.length} ${wishlist.items.length === 1 ? 'produto salvo' : 'produtos salvos'}`;

  const handleShareWishlist = async () => {
    const sharedData = encodeWishlistShare(wishlist.items);
    const shareUrl = `${window.location.origin}/wishlist/shared?data=${sharedData}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback('Link copiado');
    } catch {
      setShareFeedback(shareUrl);
    }
  };

  if (wishlist.items.length === 0) {
    return (
      <div className={`container ${styles.emptyWishlist}`}>
        <div className={styles.emptyIcon}>
          <Heart size={44} strokeWidth={1.5} />
        </div>
        <h2>Sua lista de desejos está vazia</h2>
        <p>Salve seus produtos favoritos para encontrar tudo rapidinho depois.</p>
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
          <span className={styles.kicker}>Favoritos</span>
          <h1 className={styles.pageTitle}>Lista de Desejos</h1>
          <p className={styles.headerLead}>{totalItemsLabel} para você comparar, compartilhar ou comprar depois.</p>
        </div>
        <div className={styles.headerActions}>
          {shareFeedback && (
            <span className={styles.shareFeedback} aria-live="polite">
              <Check size={14} /> {shareFeedback}
            </span>
          )}
          <button className={styles.shareBtn} onClick={handleShareWishlist} aria-label="Compartilhar lista de desejos">
            <Share2 size={16} /> Compartilhar
          </button>
          <button className={styles.clearBtn} onClick={clearWishlist} aria-label="Limpar lista de desejos">
            <Eraser size={16} /> Limpar lista
          </button>
        </div>
      </div>

      <div className={styles.itemsGrid}>
        {wishlist.items.map((item) => (
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

            <div className={styles.actions}>
              <button
                className={styles.addBtn}
                onClick={() => addItem(wishlistItemToProduct(item))}
                aria-label={`Adicionar ${item.title} ao carrinho`}
              >
                <ShoppingBag size={16} /> <span>Adicionar</span>
              </button>
              <button
                className={styles.removeBtn}
                onClick={() => removeFromWishlist(item.productId)}
                aria-label={`Remover ${item.title} da lista de desejos`}
                title="Remover da lista"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
