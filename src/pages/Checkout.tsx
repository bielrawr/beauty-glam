import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, Loader2 } from 'lucide-react';
import { createOrder } from '../services/orderService';
import styles from './Checkout.module.css';

/**
 * Inicialização do SDK do Mercado Pago.
 * SUBSTITUA PELA SUA PUBLIC KEY DA SANDBOX EM PRODUÇÃO.
 */
initMercadoPago('TEST-0f329bbe-c54d-4117-8e61-bf09d0f590d8', { locale: 'pt-BR' });

/**
 * Página de Checkout.
 * Gerencia a seleção de endereço, resumo do pedido e integração com o checkout do Mercado Pago.
 */
export function Checkout() {
  const { cart, totalPrice, totalItems } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Seleciona o primeiro endereço cadastrado como padrão para a entrega
  const selectedAddress = profile?.addresses?.[0];

  const brl = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  /**
   * Inicia o processo de criação do pedido e gera a preferência de pagamento.
   */
  const handleFinalizeOrder = async () => {
    if (!user) return;
    
    // Validação de endereço obrigatório
    if (!selectedAddress) {
      alert("Por favor, cadastre um endereço no seu perfil antes de finalizar a compra.");
      navigate('/profile');
      return;
    }
    
    setIsProcessing(true);
    try {
      // 1. Cria o registro do pedido no Firestore
      await createOrder({
        userId: user.uid,
        items: cart.items,
        totalPrice: totalPrice * 5.2,
        status: 'pending', 
        address: selectedAddress
      });

      // 2. Solicita a criação da preferência ao backend Node.js
      const response = await fetch('http://localhost:3001/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(i => ({
            title: i.title,
            unit_price: Number((i.price * 5.2).toFixed(2)),
            quantity: i.quantity,
            currency_id: 'BRL'
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Erro desconhecido");
      }

      const data = await response.json();
      if (data.id) {
        setPreferenceId(data.id);
      } else {
        throw new Error("ID não retornado pelo servidor");
      }

    } catch (error) {
      console.error("Erro no processo de checkout:", error);
      alert("Erro ao conectar com o servidor de pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Redireciona para a home se o carrinho for esvaziado manualmente durante o checkout.
   */
  useEffect(() => {
    if (cart.items.length === 0 && !isProcessing) {
      navigate('/');
    }
  }, [cart, navigate, isProcessing]);

  return (
    <main className={styles.container}>
      <button onClick={() => navigate('/cart')} className={styles.backButton}>
        <ArrowLeft size={20} /> Voltar ao Carrinho
      </button>

      <h2 className={styles.title}>Finalizar Compra</h2>

      <div className={styles.layout}>
        
        <div className={styles.columnLeft}>
          
          <section className={styles.section}>
            <h3 className={styles.sectionHeader}>
              <MapPin size={20} color="var(--primary-color)" /> Endereço de Entrega
            </h3>
            {selectedAddress ? (
              <div className={styles.addressDetails}>
                <p><strong>{selectedAddress.street}, {selectedAddress.number}</strong></p>
                <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zip}</p>
                {selectedAddress.complement && <p style={{ color: 'var(--text-muted)' }}>{selectedAddress.complement}</p>}
              </div>
            ) : (
              <div className={styles.addressError}>
                Nenhum endereço cadastrado. Vá ao seu perfil para adicionar antes de pagar.
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionHeader}>
              <CreditCard size={20} color="var(--primary-color)" /> Pagamento
            </h3>
            
            <div style={{ marginTop: '1rem' }}>
              <p className={styles.paymentInfo}>
                Pagamento processado com segurança pelo Mercado Pago.
              </p>
              
              {/* Exibe o botão do Mercado Pago somente após gerar a preferência */}
              {preferenceId ? (
                <Wallet initialization={{ preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
              ) : (
                <button 
                  className={styles.payButtonMP}
                  onClick={handleFinalizeOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <> <Loader2 className="animate-spin" size={20} /> Processando... </>
                  ) : (
                    <>
                      <img 
                        src="https://imgmp.mlstatic.com/resources/frontend/commons/v1/mp-logo.svg" 
                        alt="Logo Mercado Pago" 
                        height="24" 
                      />
                      Pagar com Mercado Pago
                    </>
                  )}
                </button>
              )}
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <h3 className={styles.sectionHeader}>
            <ShoppingBag size={20} color="var(--primary-color)" /> Resumo do Pedido
          </h3>
          
          <div className={styles.orderList}>
            {cart.items.map(item => (
              <div key={item.productId} className={styles.orderItem}>
                <img src={item.image} alt={item.title} width={40} height={40} className={styles.itemImage} />
                <div className={styles.itemInfo}>
                  <p>{item.title}</p>
                  <span>{item.quantity}x {brl.format(item.price * 5.2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{brl.format(totalPrice * 5.2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Frete</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>Grátis</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total</span>
            <strong>{brl.format(totalPrice * 5.2)}</strong>
          </div>
        </aside>

      </div>
    </main>
  );
}
