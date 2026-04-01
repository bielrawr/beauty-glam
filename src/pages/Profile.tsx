import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfileData, updateAddresses } from '../services/userService';
import { getUserOrders } from '../services/orderService';
import { validateCPF, maskCPF, maskCEP } from '../utils/validators';
import { Order } from '../types';
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

export function Profile() {
  const { user, profile, refreshProfile, changeEmail, changePassword, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('data');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.phone || '',
    phone2: profile?.phone2 || '',
    cpf: profile?.cpf || '',
    birthDate: profile?.birthDate || '',
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
  const [currentAddress, setCurrentAddress] = useState({
    id: null as number | null, street: '', city: '', state: '', zip: '', type: 'Casa', number: '', complement: ''
  });

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
    if (formData.cpf && !validateCPF(formData.cpf)) {
      setMessage({ type: 'error', text: 'CPF inválido.' });
      return;
    }
    setLoading(true);
    try {
      await updateProfileData(user.uid, formData);
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
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar segurança.' });
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

    let updated;
    if (isEditingAddress && currentAddress.id) {
      updated = addresses.map(a => a.id === currentAddress.id ? { ...currentAddress } : a);
    } else {
      updated = [...addresses, { ...currentAddress, id: Date.now() }];
    }

    try {
      await updateAddresses(user.uid, updated);
      setAddresses(updated);
      await refreshProfile();
      setShowAddressForm(false);
      setIsEditingAddress(false);
      setCurrentAddress({ id: null, street: '', city: '', state: '', zip: '', type: 'Casa', number: '', complement: '' });
    } catch (err) {
      alert("Erro ao salvar endereço.");
    }
  };

  const handleEditClick = (address: any) => {
    setCurrentAddress({ ...address });
    setIsEditingAddress(true);
    setShowAddressForm(true);
  };

  const removeAddress = async (id: number) => {
    if (!user) return;
    if (window.confirm("Excluir este endereço?")) {
      const updated = addresses.filter(a => a.id !== id);
      await updateAddresses(user.uid, updated);
      setAddresses(updated);
      await refreshProfile();
    }
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
          <form onSubmit={handleUpdateProfile}>
            <h3 className={styles.sectionTitle}>Dados Pessoais</h3>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <span className={styles.label}>Nome Completo <Required /></span>
                <input className={styles.input} value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} required />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>CPF <Required /></span>
                <input className={styles.input} value={maskCPF(formData.cpf)} onChange={e => setFormData({...formData, cpf: e.target.value})} maxLength={14} required />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Nascimento <Required /></span>
                <input className={styles.input} type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} required />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Meus Endereços</h3>
              {!showAddressForm && (
                <button className={styles.addBtn} onClick={() => {
                  setIsEditingAddress(false);
                  setCurrentAddress({ id: null, street: '', city: '', state: '', zip: '', type: 'Casa', number: '', complement: '' });
                  setShowAddressForm(true);
                }}>
                  <Plus size={18} /> Adicionar Novo
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleSaveAddress} style={{ marginBottom: '4rem', padding: '2rem', border: '1px solid var(--border)' }}>
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
              <button type="button" onClick={() => {
                if (window.confirm("ATENÇÃO: Deseja realmente excluir sua conta?")) deleteAccount();
              }} className={styles.deleteBtn}>
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
  );
}
