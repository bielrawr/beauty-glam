import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import styles from './OrderSuccess.module.css';

/**
 * Página de Sucesso do Pedido.
 * Exibe a confirmação de recebimento após a finalização bem-sucedida do pagamento.
 */
export function OrderSuccess() {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  /**
   * Esvazia o carrinho de compras assim que o usuário chega à tela de confirmação.
   */
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <CheckCircle size={80} color="#10b981" style={{ marginBottom: '1.5rem' }} />
        
        <h2 className={styles.title}>Pedido Recebido!</h2>
        <p className={styles.message}>
          Obrigado por comprar na <strong>BEAUTYGLAM</strong>. Seu pagamento foi processado e você receberá um e-mail com os detalhes da entrega em breve.
        </p>

        <div className={styles.actions}>
          <button 
            className={`button ${styles.homeButton}`} 
            onClick={() => navigate('/')}
          >
            <ShoppingBag size={20} /> Continuar Comprando
          </button>
          
          <Link to="/profile" className={styles.profileLink}>
            Ver meus pedidos <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
