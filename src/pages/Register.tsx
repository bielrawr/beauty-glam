import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Check, X } from 'lucide-react';
import styles from './Register.module.css';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para validação em tempo real
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  const navigate = useNavigate();
  const { register } = useAuth();

  // Efeito para validar a senha em tempo real
  useEffect(() => {
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(requirements).every(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isPasswordValid) {
      return setError('A senha não atende a todos os requisitos.');
    }

    if (password !== confirmPassword) {
      return setError('As senhas não coincidem.');
    }

    try {
      setError('');
      setLoading(true);
      await register(email, password, displayName);
      navigate('/');
    } catch (err) {
      setError('Falha ao criar conta. Verifique os dados ou tente outro e-mail.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <UserPlus size={24} />
          </div>
          <h1>Criar sua Conta</h1>
          <p>Junte-se à nossa comunidade de beleza</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Nome Completo</label>
            <div className={styles.inputWrapper}>
              <User size={18} />
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Insira o seu nome"
                required 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>E-mail</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="seu@email.com"
                required 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Senha</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Crie uma senha forte"
                required 
              />
            </div>
            
            {/* Requisitos de Senha em Tempo Real */}
            <div className={styles.requirementsList}>
              <div className={requirements.length ? styles.met : styles.unmet}>
                {requirements.length ? <Check size={12} /> : <X size={12} />} 
                Mínimo 8 caracteres
              </div>
              <div className={requirements.uppercase ? styles.met : styles.unmet}>
                {requirements.uppercase ? <Check size={12} /> : <X size={12} />} 
                Uma letra maiúscula
              </div>
              <div className={requirements.lowercase ? styles.met : styles.unmet}>
                {requirements.lowercase ? <Check size={12} /> : <X size={12} />} 
                Uma letra minúscula
              </div>
              <div className={requirements.number ? styles.met : styles.unmet}>
                {requirements.number ? <Check size={12} /> : <X size={12} />} 
                Um número
              </div>
              <div className={requirements.symbol ? styles.met : styles.unmet}>
                {requirements.symbol ? <Check size={12} /> : <X size={12} />} 
                Um símbolo (@, #, $, etc)
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Confirmar Senha</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} />
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Repita sua senha"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading || !isPasswordValid}
          >
            {loading ? 'Criando Conta...' : 'Cadastrar Agora'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>Já tem uma conta?</span>
          <Link to="/login" className={styles.loginLink}>
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
