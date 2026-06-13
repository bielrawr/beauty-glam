import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppDialog, AppDialogVariant } from '../components/AppDialog';
import { updateProfileData, updateAddresses } from '../services/userService';
import { getUserOrders } from '../services/orderService';
import { getCPFValidationError, getPhoneValidationError, validateCPF, validatePhone, maskCPF, maskPhone, maskCEP } from '../utils/validators';
import { getAuthErrorMessage } from '../utils/authErrorMessages';
import { Address, Order } from '../types';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  User, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3 
} from 'lucide-react';
import styles from './Profile.module.css';

type ProfileDialog = {
  title: string;
  message: string;
  variant: AppDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
};

export function Profile() {
  const { user, profile, refreshProfile, changeEmail, changePassword, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('data');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [dialog, setDialog] = useState<ProfileDialog | null>(null);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.phone || '',
    phone2: profile?.phone2 || '',
    cpf: profile?.cpf || '',
    birthDate: profile?.birthDate || '',
  });
  const [fieldTouched, setFieldTouched] = useState({
    cpf: false,
    phone: false,
    phone2: false,
  });

  const [securityData, setSecurityData] = useState({
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  
  const [addresses, setAddresses] = useState(profile?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  type DraftAddress = Omit<Address, 'id'> & { id: number | null };
  const emptyAddress: DraftAddress = {
    id: null,
    street: '',
    city: '',
    state: '',
    zip: '',
    type: 'Casa',
    number: '',
    complement: '',
  };
  const [currentAddress, setCurrentAddress] = useState<DraftAddress>(emptyAddress);
  const fieldErrors = {
    cpf: fieldTouched.cpf ? getCPFValidationError(formData.cpf) : '',
    phone: fieldTouched.phone ? getPhoneValidationError(formData.phone) : '',
    phone2: fieldTouched.phone2 ? getPhoneValidationError(formData.phone2, 'Celular alternativo') : '',
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        phone2: profile.phone2 || '',
        cpf: profile.cpf || '',
        birthDate: profile.birthDate || '',
      });
      setAddresses(profile.addresses || []);
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      loadOrders();
    }
  }, [activeTab, user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await getUserOrders(user.uid);
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedProfileData = {
      ...formData,
      displayName: formData.displayName.trim(),
      cpf: maskCPF(formData.cpf),
      phone: maskPhone(formData.phone),
      phone2: formData.phone2 ? maskPhone(formData.phone2) : '',
    };

    if (!updatedProfileData.displayName || !updatedProfileData.cpf || !updatedProfileData.birthDate || !updatedProfileData.phone) {
      setFieldTouched({ cpf: true, phone: true, phone2: Boolean(updatedProfileData.phone2) });
      setMessage({ type: 'error', text: 'Preencha nome completo, celular, CPF e data de nascimento.\nEsses dados são obrigatórios.' });
      return;
    }
    if (!validateCPF(updatedProfileData.cpf)) {
      setFieldTouched(prev => ({ ...prev, cpf: true }));
      setMessage(null);
      return;
    }
    if (!validatePhone(updatedProfileData.phone)) {
      setFieldTouched(prev => ({ ...prev, phone: true }));
      setMessage(null);
      return;
    }
    if (updatedProfileData.phone2 && !validatePhone(updatedProfileData.phone2)) {
      setFieldTouched(prev => ({ ...prev, phone2: true }));
      setMessage(null);
      return;
    }
    setLoading(true);
    try {
      await updateProfileData(user.uid, updatedProfileData);
      await refreshProfile();
      setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao atualizar dados.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.password && securityData.password !== securityData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    setLoading(true);
    try {
      if (securityData.email !== user?.email) await changeEmail(securityData.email);
      if (securityData.password) await changePassword(securityData.password);
      setMessage({ type: 'success', text: 'Credenciais atualizadas!' });
      setSecurityData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setMessage({ type: 'error', text: getAuthErrorMessage(err, 'Erro ao atualizar segurança.\nTente novamente em alguns instantes.') });
    } finally {
      setLoading(false);
    }
  };

  const searchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;
    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setCurrentAddress(prev => ({
          ...prev,
          street: data.logradouro || '',
          city: data.localidade,
          state: data.uf,
          zip: maskCEP(cleanCEP)
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCepLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const addressToSave: Address = {
      ...currentAddress,
      id: currentAddress.id ?? Date.now(),
    };

    let updated: Address[];
    if (isEditingAddress && currentAddress.id !== null) {
      updated = addresses.map(a => a.id === currentAddress.id ? addressToSave : a);
    } else {
      updated = [...addresses, addressToSave];
    }

    try {
      await updateAddresses(user.uid, updated);
      setAddresses(updated);
      await refreshProfile();
      setShowAddressForm(false);
      setIsEditingAddress(false);
      setCurrentAddress(emptyAddress);
    } catch {
      setDialog({
        title: 'Endereço não salvo',
        message: 'Não foi possível salvar o endereço.\nTente novamente em alguns instantes.',
        variant: 'error',
      });
    }
  };

  const handleEditClick = (address: Address) => {
    setCurrentAddress({ ...address });
    setIsEditingAddress(true);
    setShowAddressForm(true);
  };

  const removeAddress = async (id: number) => {
    if (!user) return;
    setDialog({
      title: 'Excluir endereço?',
      message: 'Esta ação remove o endereço do seu perfil.\nVocê poderá cadastrar outro depois.',
      variant: 'danger',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        const updated = addresses.filter(a => a.id !== id);
        await updateAddresses(user.uid, updated);
        setAddresses(updated);
        await refreshProfile();
      },
    });
  };

  const handleDeleteAccountClick = () => {
    setDialog({
      title: 'Excluir conta?',
      message: 'Esta ação é permanente.\nSeus dados e histórico de pedidos serão removidos.',
      variant: 'danger',
      confirmLabel: 'Excluir conta',
      cancelLabel: 'Cancelar',
      onConfirm: deleteAccount,
    });
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'paid': return { label: 'PAGO', color: '#10b981', icon: <CheckCircle2 size={14} /> };
      case 'shipped': return { label: 'ENVIADO', color: '#3b82f6', icon: <Truck size={14} /> };
      case 'delivered': return { label: 'ENTREGUE', color: '#059669', icon: <Package size={14} /> };
      default: return { label: 'PENDENTE', color: '#f59e0b', icon: <Clock size={14} /> };
    }
  };

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const Required = () => <span className={styles.required}>*</span>;

  return (
    <>
      {dialog && (
        <AppDialog
          open={!!dialog}
          title={dialog.title}
          message={dialog.message}
          variant={dialog.variant}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            const action = dialog.onConfirm;
            setDialog(null);
            void action?.();
          }}
        />
      )}

      <div className={styles.container}>
      <header className={styles.header}>
        <h2>Minha Conta</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p>Olá, {profile?.displayName?.split(' ')[0] || 'usuário'}.</p>
          {profile?.customerId && (
            <span style={{ 
              fontSize: '0.7rem', 
              backgroundColor: 'var(--secondary)', 
              padding: '4px 12px', 
              fontWeight: '900',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ID CLIENTE: {profile.customerId.replace('VIBE-', 'BG-')}
            </span>
          )}
        </div>
      </header>

      <nav className={styles.tabs}>
        <button onClick={() => setActiveTab('data')} className={`${styles.tabButton} ${activeTab === 'data' ? styles.tabButtonActive : ''}`}>
          PERFIL
        </button>
        <button onClick={() => setActiveTab('orders')} className={`${styles.tabButton} ${activeTab === 'orders' ? styles.tabButtonActive : ''}`}>
          PEDIDOS
        </button>
        <button onClick={() => setActiveTab('addresses')} className={`${styles.tabButton} ${activeTab === 'addresses' ? styles.tabButtonActive : ''}`}>
          ENDEREÇOS
        </button>
        <button onClick={() => setActiveTab('security')} className={`${styles.tabButton} ${activeTab === 'security' ? styles.tabButtonActive : ''}`}>
          SEGURANÇA
        </button>
      </nav>

      <div className={styles.card}>
        {message && (
          <div className={styles.messageRow} style={{ color: message.type === 'error' ? 'var(--error)' : 'var(--success)' }}>
            {message.text}
          </div>
        )}

        {activeTab === 'data' && (
          <form onSubmit={handleUpdateProfile} noValidate>
            <h3 className={styles.sectionTitle}>Dados Pessoais</h3>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <span className={styles.label}>Nome Completo <Required /></span>
                <input className={styles.input} value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} required />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>CPF <Required /></span>
                <input
                  className={`${styles.input} ${fieldErrors.cpf ? styles.inputInvalid : ''}`}
                  value={maskCPF(formData.cpf)}
                  onBlur={() => setFieldTouched(prev => ({ ...prev, cpf: true }))}
                  onChange={e => {
                    setFieldTouched(prev => ({ ...prev, cpf: true }));
                    setFormData({...formData, cpf: maskCPF(e.target.value)});
                  }}
                  maxLength={14}
                  required
                />
                {fieldErrors.cpf && <small className={styles.fieldError}>{fieldErrors.cpf}</small>}
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Nascimento <Required /></span>
                <input className={styles.input} type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} required />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Celular <Required /></span>
                <input
                  className={`${styles.input} ${fieldErrors.phone ? styles.inputInvalid : ''}`}
                  value={maskPhone(formData.phone)}
                  onBlur={() => setFieldTouched(prev => ({ ...prev, phone: true }))}
                  onChange={e => {
                    setFieldTouched(prev => ({ ...prev, phone: true }));
                    setFormData({...formData, phone: maskPhone(e.target.value)});
                  }}
                  inputMode="numeric"
                  maxLength={15}
                  required
                />
                {fieldErrors.phone && <small className={styles.fieldError}>{fieldErrors.phone}</small>}
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Celular alternativo</span>
                <input
                  className={`${styles.input} ${fieldErrors.phone2 ? styles.inputInvalid : ''}`}
                  value={maskPhone(formData.phone2)}
                  onBlur={() => setFieldTouched(prev => ({ ...prev, phone2: true }))}
                  onChange={e => {
                    setFieldTouched(prev => ({ ...prev, phone2: true }));
                    setFormData({...formData, phone2: maskPhone(e.target.value)});
                  }}
                  inputMode="numeric"
                  maxLength={15}
                />
                {fieldErrors.phone2 && <small className={styles.fieldError}>{fieldErrors.phone2}</small>}
              </div>
            </div>
            <button className={styles.saveButton} type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        )}

        {activeTab === 'orders' && (
          <div className={styles.ordersList}>
            <h3 className={styles.sectionTitle}>Histórico de Compras</h3>
            {loadingOrders ? <p>Carregando seus pedidos...</p> : orders.length === 0 ? (
              <div className={styles.emptyState}>Nenhuma compra encontrada.</div>
            ) : (
              orders.map(order => {
                const status = getStatusInfo(order.status);
                return (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <span>PEDIDO</span>
                        <p>#{order.id?.slice(-8).toUpperCase()}</p>
                      </div>
                      <div className={styles.orderStatus} style={{ color: status.color }}>
                        {status.icon} {status.label}
                      </div>
                      <div>
                        <span>VALOR TOTAL</span>
                        <p>{brl.format(order.totalPrice)}</p>
                      </div>
                    </div>
                    <div className={styles.orderItems}>
                      {order.items.map((item, i) => (
                        <div key={i} className={styles.orderItemSimple}>
                          <img src={item.image} alt={item.title} />
                          <div>
                            <p>{item.title}</p>
                            <span>Qtd: {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Meus Endereços</h3>
              {!showAddressForm && (
                <button className={styles.addBtn} onClick={() => {
                  setIsEditingAddress(false);
                  setCurrentAddress(emptyAddress);
                  setShowAddressForm(true);
                }}>
                  <Plus size={18} /> Adicionar Novo
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className={styles.addressForm}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <span className={styles.label}>CEP <Required /></span>
                    <input 
                      className={styles.input} 
                      value={maskCEP(currentAddress.zip)} 
                      onChange={e => {
                        const val = e.target.value;
                        setCurrentAddress({...currentAddress, zip: val});
                        if (val.replace(/\D/g, '').length === 8) searchCEP(val);
                      }} 
                      maxLength={9} 
                      required 
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <span className={styles.label}>Rua <Required /></span>
                    <input className={styles.input} value={currentAddress.street} onChange={e => setCurrentAddress({...currentAddress, street: e.target.value})} required />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Número <Required /></span>
                    <input className={styles.input} value={currentAddress.number} onChange={e => setCurrentAddress({...currentAddress, number: e.target.value})} required />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Complemento</span>
                    <input className={styles.input} value={currentAddress.complement} onChange={e => setCurrentAddress({...currentAddress, complement: e.target.value})} placeholder="Apto, Bloco..." />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Cidade <Required /></span>
                    <input className={styles.input} value={currentAddress.city} onChange={e => setCurrentAddress({...currentAddress, city: e.target.value})} required />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Estado <Required /></span>
                    <input className={styles.input} value={currentAddress.state} onChange={e => setCurrentAddress({...currentAddress, state: e.target.value})} required />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Tipo <Required /></span>
                    <select className={styles.input} value={currentAddress.type} onChange={e => setCurrentAddress({...currentAddress, type: e.target.value})}>
                      <option>Casa</option>
                      <option>Trabalho</option>
                    </select>
                  </div>
                </div>
                <div className={styles.buttonGroup}>
                  <button className={styles.saveButton} type="submit">
                    {isEditingAddress ? 'Atualizar Endereço' : 'Salvar Endereço'}
                  </button>
                  <button className={styles.cancelBtn} type="button" onClick={() => setShowAddressForm(false)}>Cancelar</button>
                </div>
              </form>
            )}

            <div className={styles.addressGrid}>
              {addresses.map(addr => (
                <div key={addr.id} className={styles.addressCard}>
                  <div className={styles.addressInfo}>
                    <span className={styles.addressTag}>{addr.type}</span>
                    <h4>{addr.street}, {addr.number}</h4>
                    <p>{addr.city} - {addr.state} | {addr.zip}</p>
                    {addr.complement && <p>{addr.complement}</p>}
                  </div>
                  <div className={styles.addressActions}>
                    <button onClick={() => handleEditClick(addr)} className={styles.editAddressBtn}>
                      <Edit3 size={14} /> Alterar
                    </button>
                    <button onClick={() => removeAddress(addr.id)} className={styles.removeBtn}>
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleSecurityUpdate}>
            <h3 className={styles.sectionTitle}>Segurança da Conta</h3>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <span className={styles.label}>E-mail da Conta <Required /></span>
                <input className={styles.input} type="email" value={securityData.email} onChange={e => setSecurityData({...securityData, email: e.target.value})} required />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Nova Senha</span>
                <input className={styles.input} type="password" value={securityData.password} onChange={e => setSecurityData({...securityData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Confirmar Nova Senha</span>
                <input className={styles.input} type="password" value={securityData.confirmPassword} onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})} placeholder="••••••••" />
              </div>
            </div>

            <div className={styles.dangerZone}>
              <h4>Zona de Perigo</h4>
              <p>Ao excluir sua conta, todos os seus dados e histórico de pedidos serão removidos permanentemente.</p>
              <button type="button" onClick={handleDeleteAccountClick} className={styles.deleteBtn}>
                Excluir Conta Permanentemente
              </button>
            </div>

            <button className={styles.saveButton} type="submit" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Credenciais'}
            </button>
          </form>
        )}
      </div>
      </div>
    </>
  );
}
