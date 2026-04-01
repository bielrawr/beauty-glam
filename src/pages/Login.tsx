import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react';
import styles from './Login.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Falha ao acessar a conta.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Falha ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <LogIn size={24} />
          </div>
          <h1>Boas-vindas de Volta</h1>
          <p>Entre para gerenciar seus favoritos e pedidos</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
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
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Entrando...' : 'Acessar Conta'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        <button 
          type="button" 
          className={styles.googleBtn} 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <Chrome size={20} />
          Entrar com Google
        </button>

        <div className={styles.footer}>
          <span>Ainda não tem conta?</span>
          <Link to="/register" className={styles.registerLink}>
            Criar conta gratuita
          </Link>
        </div>
      </div>
    </div>
  );
}
