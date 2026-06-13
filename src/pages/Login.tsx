import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, Chrome, UserPlus } from 'lucide-react';
import { getAuthErrorMessage } from '../utils/authErrorMessages';
import styles from './Login.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      setSuccess('E-mail confirmado com sucesso.\nAgora acesse sua conta para continuar.');
      navigate('/login', { replace: true });
      return;
    }

    if (searchParams.get('verifySent') === '1') {
      setSuccess('Cadastro realizado com sucesso.\nEnviamos um link de confirmação para o seu e-mail.\nDepois de confirmar, faça login manualmente.');
      navigate('/login', { replace: true });
      return;
    }

    if (searchParams.get('passwordReset') === '1') {
      setSuccess('Senha atualizada com sucesso.\nEntre usando sua nova senha.');
      navigate('/login', { replace: true });
      return;
    }

    if (searchParams.get('emailRecovered') === '1') {
      setSuccess('E-mail da conta recuperado.\nEntre novamente para continuar.');
      navigate('/login', { replace: true });
    }
  }, [navigate, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      const cred = await login(email, password);
      navigate(cred.user.emailVerified ? '/' : '/verify-email');
    } catch (err: any) {
      setError(getAuthErrorMessage(err, 'Falha ao acessar a conta.\nVerifique seus dados e tente novamente.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(getAuthErrorMessage(err, 'Falha ao entrar com Google.\nTente novamente em alguns instantes.'));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Informe seu e-mail para receber o link de recuperação.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setResetLoading(true);
      await resetPassword(cleanEmail);
      setSuccess('Enviamos um link de recuperação para o e-mail informado.');
    } catch (err: any) {
      setError(getAuthErrorMessage(err, 'Não foi possível enviar o e-mail de recuperação.\nTente novamente em alguns instantes.'));
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <LogIn size={24} />
          </div>
          <h1>Acesse sua conta</h1>
          <p>Sua beleza reunida em um só lugar.</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

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
            <div className={styles.passwordHelp}>
              <button
                type="button"
                className={styles.forgotPasswordBtn}
                onClick={handlePasswordReset}
                disabled={resetLoading || loading}
              >
                {resetLoading ? 'Enviando link...' : 'Recuperar senha'}
              </button>
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
          <span>Ainda não faz parte da BEAUTYGLAM?</span>
          <Link to="/register" className={styles.registerLink}>
            <UserPlus size={18} />
            Criar minha conta
          </Link>
        </div>
      </div>
    </div>
  );
}
