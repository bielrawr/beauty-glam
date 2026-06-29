import { type FormEvent, useEffect, useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, Loader2, Edit3, Sparkles, Ticket, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppDialog, AppDialogVariant } from '../components/AppDialog';
import { createOrder } from '../services/orderService';
import { updateAddresses, updateProfileData } from '../services/userService';
import { getCPFValidationError, getPhoneValidationError, maskCEP, maskCPF, maskPhone, validateCPF, validatePhone } from '../utils/validators';
import { getProfileCompletion } from '../utils/profileCompletion';
import { Address } from '../types';
import styles from './Checkout.module.css';

initMercadoPago('TEST-0f329bbe-c54d-4117-8e61-bf09d0f590d8', { locale: 'pt-BR' });

type CheckoutDialog = {
  title: string;
  message: string;
  variant: AppDialogVariant;
  confirmLabel?: string;
  onConfirm?: () => void;
};

const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? '/_/backend' : 'http://localhost:3001')).replace(/\/$/, '');

type CheckoutAddress = Omit<Address, 'id'> & { id?: number };
type ProfileStep = 'personal' | 'address' | null;

const emptyAddress: CheckoutAddress = {
  street: '',
  number: '',
  city: '',
  state: '',
  zip: '',
  complement: '',
  type: 'Casa',
};

function isCompleteAddress(address?: Partial<Address> | null) {
  return Boolean(
    address?.zip?.trim() &&
    address?.street?.trim() &&
    address?.number?.trim() &&
    address?.city?.trim() &&
    address?.state?.trim()
  );
}

function hasAddressValue(address?: Partial<Address> | null) {
  return Boolean(
    address?.zip?.trim() ||
    address?.street?.trim() ||
    address?.number?.trim() ||
    address?.city?.trim() ||
    address?.state?.trim() ||
    address?.complement?.trim()
  );
}

function normalizeAddress(address: CheckoutAddress): Address {
  return {
    id: address.id ?? Date.now(),
    street: address.street.trim(),
    number: address.number.trim(),
    city: address.city.trim(),
    state: address.state.trim().toUpperCase(),
    zip: maskCEP(address.zip),
    complement: address.complement?.trim() || '',
    type: address.type?.trim() || 'Casa',
  };
}

export function Checkout() {
  const { cart, totalPrice } = useCart();
  const { user, profile, loadingAuth, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialog, setDialog] = useState<CheckoutDialog | null>(null);
  const [profileStep, setProfileStep] = useState<ProfileStep>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFlowError, setProfileFlowError] = useState('');
  const [resumeCheckoutAfterProfile, setResumeCheckoutAfterProfile] = useState(false);
  const [personalTouched, setPersonalTouched] = useState({ phone: false, cpf: false });
  const [personalDraft, setPersonalDraft] = useState({
    displayName: '',
    phone: '',
    cpf: '',
    birthDate: '',
  });
  const [profileAddressDraft, setProfileAddressDraft] = useState<CheckoutAddress>(emptyAddress);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState<CheckoutAddress>(emptyAddress);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const savedAddresses = (profile?.addresses || []).filter(isCompleteAddress);
  const preferredProfileAddress = savedAddresses[0] || null;
  const selectedSavedAddress = savedAddresses.find(address => address.id === selectedAddressId) || preferredProfileAddress;
  const personalFieldErrors = {
    phone: personalTouched.phone ? getPhoneValidationError(personalDraft.phone) : '',
    cpf: personalTouched.cpf ? getCPFValidationError(personalDraft.cpf) : '',
  };

  useEffect(() => {
    if (profileStep === 'personal') return;

    setPersonalDraft({
      displayName: profile?.displayName || user?.displayName || '',
      phone: profile?.phone || '',
      cpf: profile?.cpf || '',
      birthDate: profile?.birthDate || '',
    });
  }, [profile, profileStep, user?.displayName]);

  useEffect(() => {
    if (!preferredProfileAddress) return;

    setDeliveryAddress(preferredProfileAddress);
    setSelectedAddressId(preferredProfileAddress.id);
    if (profileStep !== 'address') {
      setProfileAddressDraft(preferredProfileAddress);
    }
  }, [preferredProfileAddress, profileStep]);

  const applyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    
    const coupons: Record<string, { type: 'percentage' | 'fixed', value: number }> = {
      'BEAUTY10': { type: 'percentage', value: 0.10 },
      'WELCOME20': { type: 'percentage', value: 0.20 },
      'GLOW15': { type: 'percentage', value: 0.15 },
      'SAVE50': { type: 'fixed', value: 50 },
      'FIRSTOFF': { type: 'fixed', value: 30 }
    };

    if (code === '') {
      setDiscount(0);
      setCouponError('');
      return;
    }

    const coupon = coupons[code];

    if (coupon) {
      if (coupon.type === 'percentage') {
        setDiscount(totalPrice * coupon.value);
      } else {
        setDiscount(Math.min(coupon.value, totalPrice));
      }
      setCouponError('');
    } else {
      setDiscount(0);
      setCouponError('CUPOM INVÁLIDO');
    }
  };

  const finalTotal = totalPrice - discount;
  const profileCompletion = getProfileCompletion(profile);
  const hasSavedAddress = savedAddresses.length > 0;

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

  const lookupCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return null;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      if (data.erro) return null;

      return {
        street: data.logradouro || '',
        city: data.localidade || '',
        state: data.uf || '',
        zip: maskCEP(cleanCEP),
      };
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      return null;
    }
  };

  const searchProfileCEP = async (cep: string) => {
    const address = await lookupCEP(cep);
    if (!address) return;

    setProfileAddressDraft(prev => ({
      ...prev,
      street: address.street || prev.street,
      city: address.city || prev.city,
      state: address.state || prev.state,
      zip: address.zip,
    }));
  };

  const openPersonalModal = (shouldResumeCheckout = false) => {
    setPersonalDraft({
      displayName: profile?.displayName || user?.displayName || '',
      phone: profile?.phone || '',
      cpf: profile?.cpf || '',
      birthDate: profile?.birthDate || '',
    });
    setPersonalTouched({ phone: false, cpf: false });
    setResumeCheckoutAfterProfile(shouldResumeCheckout);
    setProfileFlowError('');
    setProfileStep('personal');
  };

  const openAddressModal = (shouldResumeCheckout = false) => {
    setProfileAddressDraft(selectedSavedAddress || (hasAddressValue(deliveryAddress) ? deliveryAddress : emptyAddress));
    setResumeCheckoutAfterProfile(shouldResumeCheckout);
    setProfileFlowError('');
    setProfileStep('address');
  };

  const handleSelectSavedAddress = (addressId: number) => {
    const address = savedAddresses.find(savedAddress => savedAddress.id === addressId);
    if (!address) return;

    setSelectedAddressId(address.id);
    setDeliveryAddress(address);
  };

  const closeProfileModal = () => {
    if (profileSaving) return;

    setProfileStep(null);
    setProfileFlowError('');
    setResumeCheckoutAfterProfile(false);
  };

  const startPayment = async (addressOverride = deliveryAddress) => {
    if (!user) return;
    
    setIsProcessing(true);
    setPreferenceId(null);

    const orderAddress = normalizeAddress(addressOverride);

    try {
      await createOrder({
        userId: user.uid,
        items: cart.items,
        totalPrice: finalTotal,
        status: 'pending', 
        address: orderAddress,
      });

      const response = await fetch(`${BACKEND_BASE_URL}/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(i => ({
            title: i.title,
            unit_price: Number(i.price.toFixed(2)),
            quantity: i.quantity,
            currency_id: 'BRL'
          })),
        })
      });

      if (!response.ok) throw new Error("Erro no servidor.");
      const data = await response.json();
      if (data.id) setPreferenceId(data.id);
    } catch (error) {
      console.error(error);
      setDialog({
        title: 'Pagamento indisponível',
        message: 'Não foi possível conectar com o Mercado Pago.\nTente novamente em alguns instantes.',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizeOrder = async () => {
    if (!user) return;

    if (!profileCompletion.isComplete && profileCompletion.targetTab === 'data') {
      openPersonalModal(true);
      return;
    }

    if (!hasSavedAddress) {
      openAddressModal(true);
      return;
    }

    const checkoutAddress = isCompleteAddress(deliveryAddress) ? deliveryAddress : selectedSavedAddress;
    if (!checkoutAddress) {
      openAddressModal(true);
      return;
    }
    
    await startPayment(checkoutAddress);
  };

  const handleSavePersonalData = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const updatedPersonalData = {
      displayName: personalDraft.displayName.trim(),
      phone: maskPhone(personalDraft.phone),
      cpf: maskCPF(personalDraft.cpf),
      birthDate: personalDraft.birthDate,
    };

    if (!updatedPersonalData.displayName || !updatedPersonalData.phone || !updatedPersonalData.cpf || !updatedPersonalData.birthDate) {
      setPersonalTouched({ phone: true, cpf: true });
      setProfileFlowError('Preencha nome completo, celular, CPF e data de nascimento.\nEsses dados são obrigatórios para continuar.');
      return;
    }

    if (!validateCPF(updatedPersonalData.cpf)) {
      setPersonalTouched(prev => ({ ...prev, cpf: true }));
      setProfileFlowError('');
      return;
    }

    if (!validatePhone(updatedPersonalData.phone)) {
      setPersonalTouched(prev => ({ ...prev, phone: true }));
      setProfileFlowError('');
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfileData(user.uid, updatedPersonalData);
      await refreshProfile();
      setProfileFlowError('');

      if (hasSavedAddress) {
        setProfileStep(null);
        if (resumeCheckoutAfterProfile) {
          setResumeCheckoutAfterProfile(false);
          await startPayment(selectedSavedAddress || deliveryAddress);
        } else {
          setDialog({
            title: 'Dados atualizados',
            message: 'Seus dados pessoais foram salvos com sucesso.',
            variant: 'success',
          });
        }
        return;
      }

      setProfileAddressDraft(emptyAddress);
      setProfileStep('address');
    } catch (error) {
      console.error(error);
      setProfileFlowError('Não foi possível salvar seus dados.\nTente novamente em alguns instantes.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveProfileAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (!isCompleteAddress(profileAddressDraft)) {
      setProfileFlowError('Preencha CEP, rua, número, cidade e estado.\nO complemento é opcional.');
      return;
    }

    const addressToSave = normalizeAddress(profileAddressDraft);
    const addressesWithoutCurrent = (profile?.addresses || []).filter(address => address.id !== addressToSave.id);
    const updatedAddresses = [addressToSave, ...addressesWithoutCurrent];

    setProfileSaving(true);
    try {
      await updateAddresses(user.uid, updatedAddresses);
      setDeliveryAddress(addressToSave);
      setSelectedAddressId(addressToSave.id);
      await refreshProfile();
      setProfileStep(null);
      setProfileFlowError('');

      if (resumeCheckoutAfterProfile) {
        setResumeCheckoutAfterProfile(false);
        await startPayment(addressToSave);
        return;
      }

      setDialog({
        title: 'Endereço salvo',
        message: 'Seu endereço de entrega foi salvo com sucesso.',
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      setProfileFlowError('Não foi possível salvar o endereço.\nTente novamente em alguns instantes.');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <main className={styles.container}>
      {dialog && (
        <AppDialog
          open={!!dialog}
          title={dialog.title}
          message={dialog.message}
          variant={dialog.variant}
          confirmLabel={dialog.confirmLabel}
          onConfirm={() => {
            dialog.onConfirm?.();
            setDialog(null);
          }}
        />
      )}

      {profileStep && (
        <div className={styles.profileModalOverlay} role="dialog" aria-modal="true" aria-labelledby="checkout-profile-title">
          <motion.div
            className={styles.profileModal}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className={styles.profileModalClose}
              onClick={closeProfileModal}
              disabled={profileSaving}
              aria-label="Fechar modal"
            >
              <X size={18} />
            </button>

            {profileStep === 'personal' ? (
              <form className={styles.profileForm} onSubmit={handleSavePersonalData} noValidate>
                <span className={styles.profileModalKicker}>Etapa 1 de 2</span>
                <h3 id="checkout-profile-title">Complete seus dados</h3>
                <p className={styles.profileModalDescription}>
                  Informe nome, celular, CPF e nascimento para identificarmos o pedido antes do pagamento.
                </p>

                <div className={styles.profileFormGrid}>
                  <label className={`${styles.profileField} ${styles.profileFull}`}>
                    <span>Nome completo</span>
                    <input
                      value={personalDraft.displayName}
                      onChange={event => setPersonalDraft({ ...personalDraft, displayName: event.target.value })}
                      autoComplete="name"
                    />
                  </label>

                  <label className={`${styles.profileField} ${styles.profileFull}`}>
                    <span>Telefone celular</span>
                    <input
                      className={personalFieldErrors.phone ? styles.inputInvalid : undefined}
                      value={maskPhone(personalDraft.phone)}
                      onBlur={() => setPersonalTouched(prev => ({ ...prev, phone: true }))}
                      onChange={event => {
                        setPersonalTouched(prev => ({ ...prev, phone: true }));
                        setPersonalDraft({ ...personalDraft, phone: maskPhone(event.target.value) });
                      }}
                      inputMode="numeric"
                      maxLength={15}
                      autoComplete="tel"
                    />
                    {personalFieldErrors.phone && <small className={styles.fieldError}>{personalFieldErrors.phone}</small>}
                  </label>

                  <label className={styles.profileField}>
                    <span>CPF</span>
                    <input
                      className={personalFieldErrors.cpf ? styles.inputInvalid : undefined}
                      value={maskCPF(personalDraft.cpf)}
                      onBlur={() => setPersonalTouched(prev => ({ ...prev, cpf: true }))}
                      onChange={event => {
                        setPersonalTouched(prev => ({ ...prev, cpf: true }));
                        setPersonalDraft({ ...personalDraft, cpf: maskCPF(event.target.value) });
                      }}
                      inputMode="numeric"
                      maxLength={14}
                      autoComplete="off"
                    />
                    {personalFieldErrors.cpf && <small className={styles.fieldError}>{personalFieldErrors.cpf}</small>}
                  </label>

                  <label className={styles.profileField}>
                    <span>Data de nascimento</span>
                    <input
                      type="date"
                      value={personalDraft.birthDate}
                      onChange={event => setPersonalDraft({ ...personalDraft, birthDate: event.target.value })}
                    />
                  </label>
                </div>

                {profileFlowError && <p className={styles.profileFlowError}>{profileFlowError}</p>}

                <div className={styles.profileModalActions}>
                  <button type="button" className={styles.profileCancelBtn} onClick={closeProfileModal} disabled={profileSaving}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.profileSubmitBtn} disabled={profileSaving}>
                    {profileSaving ? 'Salvando...' : 'Salvar e continuar'}
                  </button>
                </div>
              </form>
            ) : (
              <form className={styles.profileForm} onSubmit={handleSaveProfileAddress} noValidate>
                <span className={styles.profileModalKicker}>Etapa 2 de 2</span>
                <h3 id="checkout-profile-title">Endereço de entrega</h3>
                <p className={styles.profileModalDescription}>
                  Informe onde o pedido será entregue. O endereço ficará salvo para suas próximas compras.
                </p>

                <div className={styles.profileFormGrid}>
                  <label className={styles.profileField}>
                    <span>CEP</span>
                    <input
                      value={maskCEP(profileAddressDraft.zip)}
                      onChange={event => {
                        const value = event.target.value;
                        setProfileAddressDraft({ ...profileAddressDraft, zip: maskCEP(value) });
                        if (value.replace(/\D/g, '').length === 8) void searchProfileCEP(value);
                      }}
                      inputMode="numeric"
                      maxLength={9}
                      autoComplete="postal-code"
                    />
                  </label>

                  <label className={`${styles.profileField} ${styles.profileFull}`}>
                    <span>Rua</span>
                    <input
                      value={profileAddressDraft.street}
                      onChange={event => setProfileAddressDraft({ ...profileAddressDraft, street: event.target.value })}
                      autoComplete="address-line1"
                    />
                  </label>

                  <label className={styles.profileField}>
                    <span>Número</span>
                    <input
                      value={profileAddressDraft.number}
                      onChange={event => setProfileAddressDraft({ ...profileAddressDraft, number: event.target.value })}
                      autoComplete="address-line2"
                    />
                  </label>

                  <label className={styles.profileField}>
                    <span>Complemento</span>
                    <input
                      value={profileAddressDraft.complement}
                      onChange={event => setProfileAddressDraft({ ...profileAddressDraft, complement: event.target.value })}
                      placeholder="Apto, bloco..."
                    />
                  </label>

                  <label className={styles.profileField}>
                    <span>Cidade</span>
                    <input
                      value={profileAddressDraft.city}
                      onChange={event => setProfileAddressDraft({ ...profileAddressDraft, city: event.target.value })}
                      autoComplete="address-level2"
                    />
                  </label>

                  <label className={styles.profileField}>
                    <span>Estado</span>
                    <input
                      value={profileAddressDraft.state}
                      onChange={event => setProfileAddressDraft({ ...profileAddressDraft, state: event.target.value.toUpperCase().slice(0, 2) })}
                      maxLength={2}
                      autoComplete="address-level1"
                    />
                  </label>

                  <label className={styles.profileField}>
                    <span>Tipo</span>
                    <select
                      value={profileAddressDraft.type}
                      onChange={event => setProfileAddressDraft({ ...profileAddressDraft, type: event.target.value })}
                    >
                      <option>Casa</option>
                      <option>Trabalho</option>
                      <option>Outro</option>
                    </select>
                  </label>
                </div>

                {profileFlowError && <p className={styles.profileFlowError}>{profileFlowError}</p>}

                <div className={styles.profileModalActions}>
                  <button type="button" className={styles.profileCancelBtn} onClick={closeProfileModal} disabled={profileSaving}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.profileSubmitBtn} disabled={profileSaving}>
                    {profileSaving ? 'Salvando...' : 'Salvar endereço'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      <div className={styles.centeredLayout}>
        <button onClick={() => navigate('/cart')} className={styles.backButton}>
          <ArrowLeft size={16} /> VOLTAR AO CARRINHO
        </button>

        <h2 className={styles.title}>FINALIZAR COMPRA</h2>

        <section className={`${styles.section} ${styles.itemsSection}`}>
          <h3 className={`${styles.sectionHeader} ${styles.itemsHeader}`}>
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

        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h3 className={styles.sectionHeader}>
              <MapPin size={20} /> ENDEREÇO DE ENTREGA
            </h3>
            {selectedSavedAddress && (
              <button className={styles.editBtn} onClick={() => openAddressModal(false)}>
                <Edit3 size={14} /> EDITAR
              </button>
            )}
          </div>

          {selectedSavedAddress ? (
            <div className={styles.addressSummary}>
              <div className={styles.addressDetails}>
                <span className={styles.addressType}>{selectedSavedAddress.type || 'Entrega'}</span>
                <p><strong>{selectedSavedAddress.street}, {selectedSavedAddress.number}</strong></p>
                <p>{selectedSavedAddress.city}, {selectedSavedAddress.state} - {selectedSavedAddress.zip}</p>
                {selectedSavedAddress.complement && <p>{selectedSavedAddress.complement}</p>}
              </div>

              <div className={styles.addressControls}>
                {savedAddresses.length > 1 && (
                  <label className={styles.addressSelectLabel}>
                    <span>Trocar por endereço salvo</span>
                    <select
                      className={styles.addressSelect}
                      value={selectedSavedAddress.id}
                      onChange={event => handleSelectSavedAddress(Number(event.target.value))}
                    >
                      {savedAddresses.map(address => (
                        <option key={address.id} value={address.id}>
                          {address.type || 'Endereço'} - {address.street}, {address.number}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <div className={styles.addressActionsRow}>
                  <button type="button" className={styles.secondaryAddressBtn} onClick={() => openAddressModal(false)}>
                    Editar endereço
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryAddressBtn}
                    onClick={() => {
                      setProfileAddressDraft(emptyAddress);
                      setResumeCheckoutAfterProfile(false);
                      setProfileFlowError('');
                      setProfileStep('address');
                    }}
                  >
                    Adicionar outro
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.addressEmptyState}>
              <strong>Endereço pendente</strong>
              <p>Ao finalizar o pedido, abriremos um formulário rápido para cadastrar o endereço de entrega.</p>
            </div>
          )}
        </section>

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
                    customization={{
                      theme: 'dark',
                      customStyle: { buttonBackground: 'black', borderRadius: '0px' },
                    }} 
                  />
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
