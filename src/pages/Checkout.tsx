import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, Loader2, Edit3, Sparkles, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { createOrder } from '../services/orderService';
import { maskCEP } from '../utils/validators';
import styles from './Checkout.module.css';

initMercadoPago('TEST-0f329bbe-c54d-4117-8e61-bf09d0f590d8', { locale: 'pt-BR' });

export function Checkout() {
  const { cart, totalPrice } = useCart();
  const { user, profile, loadingAuth } = useAuth();
  const navigate = useNavigate();
  
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Estados para Cupom
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '', number: '', city: '', state: '', zip: '', complement: ''
  });

  useEffect(() => {
    if (profile?.addresses?.[0]) {
      setDeliveryAddress({
        street: profile.addresses[0].street,
        number: profile.addresses[0].number,
        city: profile.addresses[0].city,
        state: profile.addresses[0].state,
        zip: profile.addresses[0].zip,
        complement: profile.addresses[0].complement || ''
      });
    }
  }, [profile]);

  const applyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (code === 'BEAUTY10') {
      setDiscount(totalPrice * 0.1);
      setCouponError('');
    } else if (code === '') {
      setDiscount(0);
      setCouponError('');
    } else {
      setDiscount(0);
      setCouponError('CUPOM INVÁLIDO');
    }
  };

  const finalTotal = totalPrice - discount;

  if (loadingAuth) {
    return (
      <div className={styles.luxuryLoader}>
        <motion.div 
          className={styles.loaderLogo}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          B<span>G</span>
        </motion.div>
        <p>PREPARANDO SUA EXPERIÊNCIA...</p>
        <Sparkles size={16} className={styles.sparkleIcon} />
      </div>
    );
  }

  const brl = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const searchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setDeliveryAddress(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
          zip: maskCEP(cleanCEP)
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleFinalizeOrder = async () => {
    if (!user) return;
    if (!deliveryAddress.street || !deliveryAddress.number || !deliveryAddress.zip) {
      alert("Por favor, preencha os dados de endereço corretamente.");
      setIsEditingAddress(true);
      return;
    }
    
    setIsProcessing(true);
    setPreferenceId(null);

    try {
      await createOrder({
        userId: user.uid,
        items: cart.items,
        totalPrice: finalTotal,
        status: 'pending', 
        address: deliveryAddress as any
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
          })),
          // Se o mercado pago permitir passar o desconto total, poderíamos adicionar aqui
          // Mas para simplificar, passaremos o total calculado
        })
      });

      if (!response.ok) throw new Error("Erro no servidor.");
      const data = await response.json();
      if (data.id) setPreferenceId(data.id);
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o Mercado Pago.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.centeredLayout}>
        <button onClick={() => navigate('/cart')} className={styles.backButton}>
          <ArrowLeft size={16} /> VOLTAR AO CARRINHO
        </button>

        <h2 className={styles.title}>FINALIZAR COMPRA</h2>

        {/* 1. SEUS ITENS */}
        <section className={styles.section}>
          <h3 className={styles.sectionHeader}>
            <ShoppingBag size={20} /> SEUS ITENS
          </h3>
          <div className={styles.orderListSimple}>
            {cart.items.map(item => (
              <div key={item.productId} className={styles.orderItemRow}>
                <img src={item.image} alt={item.title} />
                <div className={styles.orderItemInfo}>
                  <p>{item.title}</p>
                  <span>{item.quantity}x {brl.format(item.price)}</span>
                </div>
                <strong>{brl.format(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>

          {/* Campo de Cupom */}
          <div className={styles.couponWrapper}>
            <div className={styles.couponInput}>
              <Ticket size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="CUPOM DE DESCONTO" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button onClick={applyCoupon}>APLICAR</button>
            </div>
            {couponError && <span className={styles.couponError}>{couponError}</span>}
            {discount > 0 && <span className={styles.couponSuccess}>CUPOM APLICADO COM SUCESSO!</span>}
          </div>
        </section>

        {/* 2. ENDEREÇO DE ENTREGA */}
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h3 className={styles.sectionHeader}>
              <MapPin size={20} /> ENDEREÇO DE ENTREGA
            </h3>
            {!isEditingAddress && deliveryAddress.street && (
              <button className={styles.editBtn} onClick={() => setIsEditingAddress(true)}>
                <Edit3 size={14} /> ALTERAR
              </button>
            )}
          </div>

          {isEditingAddress || !deliveryAddress.street ? (
            <div className={styles.addressForm}>
              <div className={styles.inputGrid}>
                <input 
                  placeholder="CEP" 
                  value={deliveryAddress.zip} 
                  onChange={e => {
                    const val = e.target.value;
                    setDeliveryAddress({...deliveryAddress, zip: maskCEP(val)});
                    if (val.replace(/\D/g, '').length === 8) searchCEP(val);
                  }} 
                />
                <input placeholder="Rua" value={deliveryAddress.street} onChange={e => setDeliveryAddress({...deliveryAddress, street: e.target.value})} />
                <input placeholder="Número" value={deliveryAddress.number} onChange={e => setDeliveryAddress({...deliveryAddress, number: e.target.value})} />
                <input placeholder="Complemento" value={deliveryAddress.complement} onChange={e => setDeliveryAddress({...deliveryAddress, complement: e.target.value})} />
                <input placeholder="Cidade" value={deliveryAddress.city} onChange={e => setDeliveryAddress({...deliveryAddress, city: e.target.value})} />
                <input placeholder="Estado" value={deliveryAddress.state} onChange={e => setDeliveryAddress({...deliveryAddress, state: e.target.value})} />
              </div>
              <button className={styles.saveAddressBtn} onClick={() => setIsEditingAddress(false)}>CONFIRMAR ENDEREÇO</button>
            </div>
          ) : (
            <div className={styles.addressDetails}>
              <p><strong>{deliveryAddress.street}, {deliveryAddress.number}</strong></p>
              <p>{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.zip}</p>
              {deliveryAddress.complement && <p>{deliveryAddress.complement}</p>}
            </div>
          )}
        </section>

        {/* 3. PAGAMENTO E TOTAL */}
        <section className={styles.section}>
          <h3 className={styles.sectionHeader}>
            <CreditCard size={20} /> PAGAMENTO
          </h3>
          
          <div className={styles.paymentContainer}>
            <div className={styles.internalSummary}>
              <div className={styles.summaryLineRow}>
                <span>Subtotal</span>
                <span>{brl.format(totalPrice)}</span>
              </div>
              {discount > 0 && (
                <div className={styles.summaryLineRow}>
                  <span>Desconto (CUPOM)</span>
                  <span style={{ color: 'var(--success)' }}>-{brl.format(discount)}</span>
                </div>
              )}
              <div className={styles.summaryLineRow}>
                <span>Frete</span>
                <span style={{ color: 'var(--primary)' }}>GRÁTIS</span>
              </div>
              <div className={styles.totalFinalRow}>
                <span>TOTAL A PAGAR</span>
                <strong>{brl.format(finalTotal)}</strong>
              </div>
            </div>
            
            <div className={styles.finalAction}>
              {preferenceId ? (
                <div key={preferenceId} className={styles.mercadopagoContainer}>
                  <Wallet 
                    initialization={{ preferenceId }} 
                    customization={{ visual: { buttonBackground: 'black', borderRadius: '0px' } }} 
                  />
                </div>
              ) : (
                <button 
                  className={styles.payButtonMP}
                  onClick={handleFinalizeOrder}
                  disabled={isProcessing || isEditingAddress}
                >
                  {isProcessing ? (
                    <Loader2 className={styles.spinner} size={20} />
                  ) : (
                    "FINALIZAR PEDIDO"
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
