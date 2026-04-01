import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Eraser } from 'lucide-react';
import styles from './Cart.module.css';

export function Cart() {
  const { cart, removeItem, setQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.items.length === 0) {
    return (
      <div className={`container ${styles.emptyCart}`}>
        <ShoppingBag size={80} strokeWidth={1} color="var(--secondary)" />
        <h2>Seu carrinho está vazio</h2>
        <p>Parece que você ainda não escolheu seus produtos de beleza favoritos.</p>
        <Link to="/" className={styles.backBtn}>
          <ArrowLeft size={18} /> Continuar Comprando
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.cartPage}`}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Seu Carrinho</h1>
        <button className={styles.clearCartBtn} onClick={clearCart}>
          <Eraser size={16} /> Esvaziar Carrinho
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.itemsList}>
          {cart.items.map((item) => (
            <div key={item.productId} className={styles.item}>
              <div className={styles.itemImage}>
                <img src={item.image} alt={item.title} />
              </div>
              
              <div className={styles.itemInfo}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemPrice}>R$ {item.price.toFixed(2)}</p>
                
                <div className={styles.controls}>
                  <div className={styles.quantity}>
                    <button 
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      title="Diminuir quantidade"
                    >
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      title="Aumentar quantidade"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button 
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.productId)}
                    title="Remover item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className={styles.itemSubtotal}>
                R$ {(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <aside className={styles.summary}>
          <div className={styles.summaryCard}>
            <h3>Resumo do Pedido</h3>
            
            <div className={styles.summaryLine}>
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            
            <div className={styles.summaryLine}>
              <span>Frete</span>
              <span className={styles.free}>Grátis</span>
            </div>
            
            <div className={`${styles.summaryLine} ${styles.totalLine}`}>
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            
            <button 
              className={styles.checkoutBtn}
              onClick={() => navigate('/checkout')}
            >
              Finalizar Compra
            </button>
            
            <Link to="/" className={styles.continueLink}>
              Continuar Comprando
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
