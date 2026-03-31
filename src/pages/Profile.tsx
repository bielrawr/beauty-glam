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
  Info 
} from 'lucide-react';
import styles from './Profile.module.css';

/**
 * Página de Perfil do Usuário.
 * Centraliza o gerenciamento de dados pessoais, endereços, histórico de pedidos e segurança da conta.
 */
export function Profile() {
  const { user, profile, refreshProfile, changeEmail, changePassword, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('data');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Estados dos formulários de dados pessoais
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.phone || '',
    phone2: profile?.phone2 || '',
    cpf: profile?.cpf || '',
    birthDate: profile?.birthDate || '',
  });

  // Estados dos formulários de segurança (credenciais)
  const [securityData, setSecurityData] = useState({
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  
  // Estados para gerenciamento de endereços
  const [addresses, setAddresses] = useState(profile?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    street: '', city: '', state: '', zip: '', type: 'Casa', number: '', complement: ''
  });

  /**
   * Sincroniza os estados locais quando os dados do perfil carregados via contexto mudam.
   */
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

  /**
   * Carrega o histórico de pedidos somente quando a aba correspondente é ativada.
   */
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      loadOrders();
    }
  }, [activeTab, user]);

  /**
   * Busca os pedidos do usuário no Firestore.
   */
  const loadOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await getUserOrders(user.uid);
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar histórico de pedidos:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  /**
   * Processa a atualização dos dados cadastrais (CPF, Nome, Nascimento, Telefone).
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validações de campos obrigatórios
    if (!formData.cpf) {
      setMessage({ type: 'error', text: 'O preenchimento do CPF é obrigatório.' });
      return;
    }
    if (!validateCPF(formData.cpf)) {
      setMessage({ type: 'error', text: 'CPF inválido. Verifique os números.' });
      return;
    }
    if (!formData.birthDate) {
      setMessage({ type: 'error', text: 'A data de nascimento é obrigatória.' });
      return;
    }
    if (!formData.phone && !formData.phone2) {
      setMessage({ type: 'error', text: 'Informe pelo menos um número de telefone para contato.' });
      return;
    }

    setLoading(true);
    try {
      await updateProfileData(user.uid, formData);
      await refreshProfile();
      setMessage({ type: 'success', text: 'Seus dados foram atualizados!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processa mudanças de e-mail e senha.
   */
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
      setMessage({ type: 'success', text: 'Dados de segurança atualizados!' });
      setSecurityData({ ...securityData, password: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aciona o fluxo de exclusão permanente de conta com confirmação.
   */
  const handleDeleteAccount = async () => {
    if (window.confirm("ATENÇÃO: Esta ação é permanente e apagará todos os seus dados e pedidos. Deseja continuar?")) {
      try {
        await deleteAccount();
        alert("Sua conta foi excluída com sucesso.");
      } catch (err: any) {
        alert(err.message || "Erro ao excluir conta.");
      }
    }
  };

  /**
   * Integração com API ViaCEP para preenchimento automático de endereços.
   */
  const searchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        alert("CEP não encontrado");
      } else {
        setCurrentAddress(prev => ({
          ...prev,
          street: data.logradouro || '',
          city: data.localidade,
          state: data.uf,
          zip: maskCEP(cleanCEP)
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setCepLoading(false);
    }
  };

  /**
   * Salva um novo endereço na lista do perfil do usuário.
   */
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = [...addresses, { ...currentAddress, id: Date.now() }];
    try {
      await updateAddresses(user.uid, updated);
      setAddresses(updated);
      await refreshProfile();
      setShowAddressForm(false);
      setCurrentAddress({ street: '', city: '', state: '', zip: '', type: 'Casa', number: '', complement: '' });
    } catch (err) {
      alert("Erro ao salvar endereço");
    }
  };

  /**
   * Remove um endereço específico da lista.
   */
  const removeAddress = async (id: number) => {
    if (!user) return;
    if (window.confirm("Deseja excluir este endereço?")) {
      const updated = addresses.filter(a => a.id !== id);
      await updateAddresses(user.uid, updated);
      setAddresses(updated);
      await refreshProfile();
    }
  };

  /**
   * Retorna os labels e estilos visuais conforme o status do pedido.
   */
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'paid': return { label: 'Pago', color: '#10b981', icon: <CheckCircle2 size={16} /> };
      case 'shipped': return { label: 'Enviado', color: '#3b82f6', icon: <Truck size={16} /> };
      case 'delivered': return { label: 'Entregue', color: '#059669', icon: <Package size={16} /> };
      case 'pending': return { label: 'Pendente', color: '#f59e0b', icon: <Clock size={16} /> };
      default: return { label: status, color: '#6b7280', icon: <Clock size={16} /> };
    }
  };

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const Required = () => <span className={styles.required}>*</span>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Minha Conta</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p>Bem-vindo ao seu painel pessoal, {profile?.displayName?.split(' ')[0] || 'usuário'}.</p>
          {profile?.customerId && (
            <span style={{ 
              fontSize: '0.8rem', 
              backgroundColor: '#f1f5f9', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontWeight: '700',
              color: '#64748b',
              border: '1px solid #e2e8f0'
            }}>
              ID: {profile.customerId}
            </span>
          )}
        </div>
      </header>

      <nav className={styles.tabs}>
        <button 
          onClick={() => setActiveTab('data')} 
          className={`${styles.tabButton} ${activeTab === 'data' ? styles.tabButtonActive : ''}`}
        >
          <User size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Perfil
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`${styles.tabButton} ${activeTab === 'orders' ? styles.tabButtonActive : ''}`}
        >
          <Package size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Meus Pedidos
        </button>
        <button 
          onClick={() => setActiveTab('addresses')} 
          className={`${styles.tabButton} ${activeTab === 'addresses' ? styles.tabButtonActive : ''}`}
        >
          <MapPin size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Endereços
        </button>
        <button 
          onClick={() => setActiveTab('security')} 
          className={`${styles.tabButton} ${activeTab === 'security' ? styles.tabButtonActive : ''}`}
        >
          <ShieldCheck size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Segurança
        </button>
      </nav>

      <div className={styles.card}>
        {message && (
          <div className={`status ${message.type === 'error' ? 'statusError' : ''}`} style={{ marginBottom: '2rem' }}>
            {message.type === 'error' ? '🚫 ' : '✅ '} {message.text}
          </div>
        )}

        {activeTab === 'data' && (
          <form onSubmit={handleUpdateProfile}>
            <h3 className={styles.sectionTitle}><User size={20} /> Dados Pessoais</h3>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <span className={styles.label}>Nome Completo <Required /></span>
                <input 
                  className={styles.input} 
                  value={formData.displayName} 
                  onChange={e => setFormData({...formData, displayName: e.target.value})} 
                  required 
                  placeholder="Seu nome completo" 
                />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>CPF <Required /></span>
                <input 
                  className={`${styles.input} ${formData.cpf && !validateCPF(formData.cpf) ? styles.inputError : ''}`} 
                  value={maskCPF(formData.cpf)} 
                  onChange={e => setFormData({...formData, cpf: e.target.value})} 
                  placeholder="000.000.000-00" 
                  maxLength={14} 
                  required
                />
                {formData.cpf && !validateCPF(formData.cpf) && (
                  <span style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px' }}>CPF inválido</span>
                )}
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Data de Nascimento <Required /></span>
                <input 
                  className={styles.input} 
                  type="date" 
                  value={formData.birthDate} 
                  onChange={e => setFormData({...formData, birthDate: e.target.value})} 
                  required
                />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Celular 1 <Required /></span>
                <input 
                  className={styles.input} 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="(00) 00000-0000" 
                />
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Celular 2</span>
                <input 
                  className={styles.input} 
                  value={formData.phone2} 
                  onChange={e => setFormData({...formData, phone2: e.target.value})} 
                  placeholder="(00) 00000-0000" 
                />
              </div>
              <div className={styles.fullWidth} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={14} /> Informe pelo menos um número de celular para contato.
              </div>
            </div>
            <button className={`button ${styles.saveButton}`} type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        )}

        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 className={styles.sectionTitle}><Package size={20} /> Histórico de Compras</h3>
            {loadingOrders ? <p>Carregando seus pedidos...</p> : orders.length === 0 ? (
              <div className={styles.emptyState}>Você ainda não realizou nenhuma compra.</div>
            ) : (
              orders.map(order => {
                const status = getStatusInfo(order.status);
                return (
                  <div key={order.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--text-muted)' }}>PEDIDO</span><p style={{ fontWeight: '700', margin: 0 }}>#{order.id?.slice(-8).toUpperCase()}</p></div>
                      <div style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--text-muted)' }}>TOTAL</span><p style={{ fontWeight: '700', margin: 0 }}>{brl.format(order.totalPrice)}</p></div>
                      <div style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: `${status.color}15`, color: status.color, fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>{status.icon} {status.label}</div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 0' }}>
                          <img src={item.image} alt={item.title} width={45} height={45} style={{ objectFit: 'contain' }} />
                          <div style={{ flex: 1, fontSize: '0.9rem' }}>
                            <p style={{ margin: 0, fontWeight: '600' }}>{item.title}</p>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qtd: {item.quantity}</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}><MapPin size={20} /> Meus Endereços</h3>
              {!showAddressForm && (
                <button className="button" onClick={() => setShowAddressForm(true)}>
                  <Plus size={18} style={{ marginRight: 4 }} /> Adicionar
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} style={{ marginBottom: '3rem', backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <span className={styles.label}>CEP <Required /></span>
                    <input 
                      className={styles.input} 
                      required 
                      value={maskCEP(currentAddress.zip)} 
                      onChange={e => {
                        const val = e.target.value;
                        setCurrentAddress({...currentAddress, zip: val});
                        if (val.replace(/\D/g, '').length === 8) searchCEP(val);
                      }} 
                      placeholder="00000-000" 
                      maxLength={9} 
                    />
                    {cepLoading && <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Buscando...</span>}
                  </div>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <span className={styles.label}>Rua <Required /></span>
                    <input className={styles.input} required value={currentAddress.street} onChange={e => setCurrentAddress({...currentAddress, street: e.target.value})} placeholder="Nome da rua" />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Número <Required /></span>
                    <input className={styles.input} required value={currentAddress.number} onChange={e => setCurrentAddress({...currentAddress, number: e.target.value})} placeholder="123" />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Complemento</span>
                    <input className={styles.input} value={currentAddress.complement} onChange={e => setCurrentAddress({...currentAddress, complement: e.target.value})} placeholder="Apto, Bloco..." />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Cidade <Required /></span>
                    <input className={`${styles.input} ${styles.inputReadOnly}`} required value={currentAddress.city} readOnly />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Estado <Required /></span>
                    <input className={`${styles.input} ${styles.inputReadOnly}`} required value={currentAddress.state} readOnly />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Tipo <Required /></span>
                    <select className={styles.input} value={currentAddress.type} onChange={e => setCurrentAddress({...currentAddress, type: e.target.value})}>
                      <option>Casa</option>
                      <option>Trabalho</option>
                      <option>Entrega</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button className="button" type="submit">Salvar Endereço</button>
                  <button className="button secondary" type="button" onClick={() => setShowAddressForm(false)}>Cancelar</button>
                </div>
              </form>
            )}

            <div className={styles.addressGrid}>
              {addresses.length === 0 ? (
                <div className={`${styles.emptyState} ${styles.fullWidth}`}>Nenhum endereço cadastrado.</div>
              ) : (
                addresses.map(addr => (
                  <div key={addr.id} className={styles.addressCard}>
                    <div className={styles.addressInfo}>
                      <span className={styles.addressTag}>{addr.type}</span>
                      <h4>{addr.street}, {addr.number}</h4>
                      <p>{addr.city} - {addr.state}</p>
                      <p>CEP: {addr.zip}</p>
                      {addr.complement && <p>{addr.complement}</p>}
                    </div>
                    <button onClick={() => removeAddress(addr.id)} className={styles.removeBtn}>
                      <Trash2 size={16} /> Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleSecurityUpdate}>
            <h3 className={styles.sectionTitle}><ShieldCheck size={20} /> Segurança da Conta</h3>
            <div style={{ backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '12px', border: '1px solid #ffedd5', color: '#9a3412', fontSize: '0.9rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem' }}>
              <Info size={20} style={{ flexShrink: 0 }} />
              <span>Por segurança, para alterar seu e-mail ou senha, você precisa ter feito login recentemente (nos últimos 5 minutos).</span>
            </div>
            
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <span className={styles.label}>E-mail da Conta <span className={styles.required}>*</span></span>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', borderTop: '1px solid #fee2e2', paddingTop: '2rem' }}>
              <div style={{ maxWidth: '60%' }}>
                <h4 style={{ color: '#dc2626', marginBottom: '4px' }}>Zona de Perigo</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ao excluir sua conta, todos os seus dados de perfil e histórico serão removidos permanentemente.</p>
              </div>
              <button 
                type="button" 
                onClick={handleDeleteAccount}
                style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                Excluir Conta
              </button>
            </div>

            <button className={`button ${styles.saveButton}`} type="submit" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Credenciais'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
