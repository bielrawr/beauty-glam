import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut, MailCheck, RefreshCcw, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAuthErrorMessage } from '../utils/authErrorMessages';
import styles from './VerifyEmail.module.css';

export function VerifyEmail() {
  const { user, sendVerificationEmail, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user?.emailVerified) return;

    const finishVerifiedSession = async () => {
      await logout();
      navigate('/login?verified=1', { replace: true });
    };

    void finishVerifiedSession();
  }, [logout, navigate, user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleResend = async () => {
    try {
      setError('');
      setMessage('');
      setSending(true);
      await sendVerificationEmail();
      setMessage('Enviamos um novo link de confirmação para o seu e-mail.');
    } catch (err: any) {
      setError(getAuthErrorMessage(err, 'Não foi possível reenviar o e-mail de confirmação.\nTente novamente em alguns instantes.'));
    } finally {
      setSending(false);
    }
  };

  const handleCheck = async () => {
    try {
      setError('');
      setMessage('');
      setChecking(true);
      const refreshedUser = await refreshUser();

      if (refreshedUser?.emailVerified) {
        await logout();
        navigate('/login?verified=1', { replace: true });
        return;
      }

      setError('Ainda não encontramos a confirmação.\nConfira sua caixa de entrada e tente novamente.');
    } catch (err: any) {
      setError(getAuthErrorMessage(err, 'Não foi possível verificar o status do e-mail.\nTente novamente em alguns instantes.'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <div className={styles.iconCircle}>
          <MailCheck size={28} />
        </div>

        <span className={styles.kicker}>Confirmação necessária</span>
        <h1>Verifique seu e-mail</h1>
        <p className={styles.description}>
          Enviamos um link de confirmação para <strong>{user.email}</strong>.
          <br />
          Ao clicar no botão do e-mail, sua conta será ativada.
          <br />
          Depois disso, volte ao login e acesse manualmente com e-mail e senha.
        </p>

        {message && <div className={styles.message}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={handleCheck} disabled={checking || sending}>
            {checking ? <RefreshCcw className={styles.spin} size={18} /> : <CheckCircle2 size={18} />}
            {checking ? 'Verificando...' : 'Já confirmei, ir ao login'}
          </button>

          <button className={styles.secondaryBtn} onClick={handleResend} disabled={sending || checking}>
            {sending ? <RefreshCcw className={styles.spin} size={18} /> : <Send size={18} />}
            {sending ? 'Reenviando...' : 'Reenviar e-mail'}
          </button>
        </div>

        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={16} /> Sair desta conta
        </button>

        <Link to="/" className={styles.homeLink}>Voltar para a vitrine</Link>
      </section>
    </main>
  );
}
