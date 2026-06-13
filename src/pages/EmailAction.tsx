import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  LockKeyhole,
  MailCheck,
  RefreshCcw,
} from 'lucide-react';
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  sendPasswordResetEmail,
  signOut,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import styles from './EmailAction.module.css';

type ActionStatus = 'loading' | 'success' | 'error' | 'passwordForm';

const REDIRECT_DELAY = 3600;

const passwordResetSettings = () => ({
  url: `${window.location.origin}/login?passwordReset=1`,
  handleCodeInApp: false,
});

function getSafeRedirect(continueUrl: string | null, fallback: string) {
  if (!continueUrl) return fallback;

  try {
    const parsed = new URL(continueUrl, window.location.origin);
    if (parsed.origin !== window.location.origin) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

function getFriendlyError(mode: string | null) {
  if (mode === 'resetPassword') {
    return 'Este link de recuperação expirou ou já foi usado.\nSolicite um novo link em "Esqueci a senha".';
  }

  if (mode === 'verifyEmail') {
    return 'Este link de confirmação expirou ou já foi usado.\nEntre na sua conta e reenvie o e-mail de confirmação.';
  }

  return 'Não foi possível concluir esta ação.\nVerifique se o link está completo ou solicite um novo e-mail.';
}

export function EmailAction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ActionStatus>('loading');
  const [title, setTitle] = useState('Confirmando sua solicitação');
  const [description, setDescription] = useState('Estamos validando o link enviado para o seu e-mail.');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');
  const continueUrl = searchParams.get('continueUrl');
  const loginRedirect = useMemo(
    () => getSafeRedirect(continueUrl, '/login?verified=1'),
    [continueUrl]
  );

  useEffect(() => {
    let redirectTimer: number | undefined;

    async function handleAction() {
      if (!mode || !actionCode) {
        setStatus('error');
        setTitle('Link inválido');
        setDescription('O link não contém as informações necessárias para concluir a confirmação.');
        return;
      }

      try {
        if (mode === 'verifyEmail') {
          await applyActionCode(auth, actionCode);
          await signOut(auth).catch(() => undefined);
          setStatus('success');
          setTitle('E-mail confirmado com sucesso');
          setDescription('Sua conta foi ativada.\nVocê será redirecionado para o login em alguns segundos.');
          redirectTimer = window.setTimeout(() => navigate(loginRedirect, { replace: true }), REDIRECT_DELAY);
          return;
        }

        if (mode === 'resetPassword') {
          const email = await verifyPasswordResetCode(auth, actionCode);
          setVerifiedEmail(email);
          setStatus('passwordForm');
          setTitle('Crie uma nova senha');
          setDescription('Digite uma senha segura para voltar a acessar sua conta.');
          return;
        }

        if (mode === 'recoverEmail') {
          const info = await checkActionCode(auth, actionCode);
          await applyActionCode(auth, actionCode);
          const restoredEmail = info.data.email;

          if (restoredEmail) {
            await sendPasswordResetEmail(auth, restoredEmail, passwordResetSettings()).catch(() => undefined);
          }

          await signOut(auth).catch(() => undefined);
          setStatus('success');
          setTitle('E-mail recuperado');
          setDescription('O e-mail da conta foi restaurado.\nPor segurança, você será redirecionado para o login.');
          redirectTimer = window.setTimeout(() => navigate('/login?emailRecovered=1', { replace: true }), REDIRECT_DELAY);
          return;
        }

        setStatus('error');
        setTitle('Ação não reconhecida');
        setDescription('Este tipo de link não é suportado pela aplicação.');
      } catch {
        setStatus('error');
        setTitle('Link expirado ou inválido');
        setDescription(getFriendlyError(mode));
      }
    }

    handleAction();

    return () => {
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [actionCode, loginRedirect, mode, navigate]);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!actionCode) return;

    if (newPassword.length < 8) {
      setFormError('Use pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('As senhas não conferem.');
      return;
    }

    try {
      setFormError('');
      setSubmitting(true);
      await confirmPasswordReset(auth, actionCode, newPassword);
      await signOut(auth).catch(() => undefined);
      setStatus('success');
      setTitle('Senha atualizada');
      setDescription('Sua senha foi redefinida.\nVocê será redirecionado para o login em alguns segundos.');
      window.setTimeout(() => navigate('/login?passwordReset=1', { replace: true }), REDIRECT_DELAY);
    } catch {
      setFormError('Não foi possível redefinir a senha.\nSolicite um novo link de recuperação.');
    } finally {
      setSubmitting(false);
    }
  }

  const icon = status === 'error'
    ? <AlertCircle size={30} />
    : status === 'passwordForm'
      ? <LockKeyhole size={30} />
      : status === 'success'
        ? <CheckCircle2 size={30} />
        : <RefreshCcw className={styles.spin} size={30} />;

  return (
    <main className={styles.container}>
      <section className={styles.card} aria-live="polite">
        <div className={`${styles.iconCircle} ${status === 'error' ? styles.errorIcon : ''}`}>
          {icon}
        </div>

        <span className={styles.kicker}>BEAUTYGLAM</span>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>

        {status === 'passwordForm' && (
          <form className={styles.form} onSubmit={handlePasswordSubmit}>
            {verifiedEmail && <p className={styles.emailHint}>{verifiedEmail}</p>}

            <label>
              Nova senha
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mínimo de 8 caracteres"
                required
              />
            </label>

            <label>
              Confirmar nova senha
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita a senha"
                required
              />
            </label>

            {formError && <div className={styles.inlineError}>{formError}</div>}

            <button className={styles.primaryBtn} type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        {status === 'success' && (
          <div className={styles.redirectNote}>
            Redirecionamento automático para o login.
          </div>
        )}

        {status === 'error' && (
          <Link to="/login" className={styles.primaryLink}>
            Voltar para o login
          </Link>
        )}

        {status === 'loading' && (
          <div className={styles.redirectNote}>
            Isso leva apenas alguns instantes.
          </div>
        )}

        {status !== 'error' && status !== 'passwordForm' && (
          <MailCheck className={styles.footerIcon} size={18} />
        )}
      </section>
    </main>
  );
}
