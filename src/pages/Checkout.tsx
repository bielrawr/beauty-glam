import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, Loader2 } from 'lucide-react';
import { createOrder } from '../services/orderService';
import styles from './Checkout.module.css';

initMercadoPago('TEST-0f329bbe-c54d-4117-8e61-bf09d0f590d8', { locale: 'pt-BR' });

export function Checkout() {
  const { cart, totalPrice } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAddress = profile?.addresses?.[0];

  const brl = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handleFinalizeOrder = async () => {
    if (!user) return;
    
    if (!selectedAddress) {
      alert("Por favor, cadastre um endereço no seu perfil antes de finalizar a compra.");
      navigate('/profile');
      return;
    }
    
    setIsProcessing(true);
    try {
      await createOrder({
        userId: user.uid,
        items: cart.items,
        totalPrice: totalPrice,
        status: 'pending', 
        address: selectedAddress
      });

      const response = await fetch('http://localhost:3001/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(i => ({
            title: i.title,
            unit_price: Number(i.price.toFixed(2)),
            quantity: i.quantity,
            currency_id: 'BRL'
          }))
        })
      });

      if (!response.ok) throw new Error("Erro no servidor de pagamento.");

      const data = await response.json();
      if (data.id) {
        setPreferenceId(data.id);
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      alert("Erro ao conectar com o servidor de pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (cart.items.length === 0 && !isProcessing) {
      navigate('/');
    }
  }, [cart, navigate, isProcessing]);

  return (
    <main className={styles.container}>
      <button onClick={() => navigate('/cart')} className={styles.backButton}>
        <ArrowLeft size={16} /> VOLTAR AO CARRINHO
      </button>

      <h2 className={styles.title}>CHECKOUT</h2>

      <div className={styles.layout}>
        <div className={styles.columnLeft}>
          <section className={styles.section}>
            <h3 className={styles.sectionHeader}>
              <MapPin size={20} /> ENDEREÇO DE ENTREGA
            </h3>
            {selectedAddress ? (
              <div className={styles.addressDetails}>
                <p><strong>{selectedAddress.street}, {selectedAddress.number}</strong></p>
                <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zip}</p>
                {selectedAddress.complement && <p className={styles.complement}>{selectedAddress.complement}</p>}
              </div>
            ) : (
              <div className={styles.addressError}>
                Nenhum endereço cadastrado. Vá ao seu perfil para continuar.
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionHeader}>
              <CreditCard size={20} /> PAGAMENTO
            </h3>
            
            <div className={styles.paymentContainer}>
              <p className={styles.paymentInfo}>
                Sua transação é segura e processada via Mercado Pago.
              </p>
              
              {preferenceId ? (
                <div className={styles.mercadopagoContainer}>
                  <Wallet initialization={{ preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
                </div>
              ) : (
                <button 
                  className={styles.payButtonMP}
                  onClick={handleFinalizeOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className={styles.spinner} size={20} />
                  ) : (
                    <>
                      <img 
                        src="https://www.mercadopago.com/instore/merchant/bundle/assets/mp-logo.svg" 
                        alt="MP" 
                      />
                      FINALIZAR E PAGAR
                    </>
                  )}
                </button>
              )}
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <h3 className={styles.sectionHeader} style={{ color: 'white' }}>
            <ShoppingBag size={20} /> RESUMO
          </h3>
          
          <div className={styles.orderList}>
            {cart.items.map(item => (
              <div key={item.productId} className={styles.orderItem}>
                <img src={item.image} alt={item.title} className={styles.itemImage} />
                <div className={styles.itemInfo}>
                  <p>{item.title}</p>
                  <span>{item.quantity}x {brl.format(item.price)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{brl.format(totalPrice)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Entrega</span>
            <span className={styles.free}>Grátis</span>
          </div>
          <div className={styles.totalRow}>
            <span>TOTAL</span>
            <strong>{brl.format(totalPrice)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
