import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de Login.
 * Realiza autenticação via e-mail/senha ou Google e gerencia o redirecionamento pós-login.
 */
export function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determina a rota de redirecionamento (origem antes de ser bloqueado pela ProtectedRoute ou home)
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  /**
   * Processa o login tradicional por e-mail e senha.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Inicia o fluxo de login social com Google via Popup.
   */
  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h2 style={{ margin: '10px 0 14px' }}>Entrar</h2>

      {error && (
        <div className="status statusError" style={{ marginBottom: 12 }}>
          {error?.message || 'Erro ao entrar'}
        </div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="label">E-mail</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="voce@exemplo.com"
          />
        </label>

        <label className="field">
          <span className="label">Senha</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>

        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {/* Separador visual para login social */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
          <span style={{ margin: '0 10px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>ou</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
        </div>

        <button 
          className="button secondary" 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" width="18" height="18" />
          Entrar com Google
        </button>

        {/* CTA para novos usuários */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          backgroundColor: 'var(--white)',
          borderRadius: '12px', 
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <p style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Novo por aqui?</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Crie sua conta para salvar seus endereços, acompanhar seus pedidos e finalizar suas compras com rapidez.
          </p>
          <Link to="/register" className="button secondary" style={{ width: '100%', display: 'block', textDecoration: 'none' }}>
            Criar minha conta agora
          </Link>
        </div>
      </form>
    </main>
  );
}
