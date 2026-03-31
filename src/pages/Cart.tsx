import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Utilitário para formatação de moeda em Real Brasileiro (BRL).
 */
const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Página do Carrinho de Compras.
 * Permite visualizar itens, alterar quantidades, remover produtos e prosseguir para o checkout.
 */
export function Cart() {
  const { cart, totalItems, totalPrice, setQuantity, removeItem, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  /**
   * Gerencia o fluxo de finalização de compra, redirecionando para login se necessário.
   */
  const handleCheckout = () => {
    if (!user) {
      // Redireciona para o login, preservando o destino final do checkout no estado da navegação
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ margin: '10px 0 14px' }}>Carrinho</h2>
        <Link to="/" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Voltar para Loja</Link>
      </div>

      {cart.items.length === 0 ? (
        <div className="status">Seu carrinho está vazio.</div>
      ) : (
        <>
          <div className="status" style={{ marginBottom: 14 }}>
            <strong>{totalItems}</strong> item(ns) —{' '}
            <strong>{brl.format(totalPrice * 5.2)}</strong>
          </div>

          {/* Alerta informativo para usuários não logados */}
          {!user && (
            <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bfdbfe', fontSize: '0.9rem', color: '#1e40af' }}>
              ℹ️ Você está comprando como <strong>visitante</strong>. Para finalizar o pedido, será necessário entrar ou criar uma conta.
            </div>
          )}

          <div className="cartList">
            {cart.items.map((item) => (
              <div className="cartRow" key={item.productId}>
                <img
                  src={item.image}
                  alt={item.title}
                  width={54}
                  height={54}
                  style={{ objectFit: 'contain' }}
                />

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="cartTitle" title={item.title}>
                    {item.title}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--text-muted)', 
                    marginBottom: '4px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.2'
                  }}>
                    {item.description}
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{brl.format(item.price * 5.2)}</div>
                </div>

                <div className="cartActions">
                  <button
                    className="iconButton"
                    onClick={() =>
                      setQuantity(item.productId, Math.max(0, item.quantity - 1))
                    }
                    aria-label="Diminuir"
                  >
                    -
                  </button>
                  <span style={{ width: 28, textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    className="iconButton"
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    aria-label="Aumentar"
                  >
                    +
                  </button>

                  <button
                    className="linkDanger"
                    onClick={() => removeItem(item.productId)}
                  >
                    remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button className="button" style={{ flex: 1, minWidth: '200px' }} onClick={handleCheckout}>
              {user ? 'Ir para o Pagamento' : 'Entrar para Finalizar'}
            </button>
            <button className="button secondary" onClick={clearCart}>
              Limpar carrinho
            </button>
          </div>
        </>
      )}
    </main>
  );
}
