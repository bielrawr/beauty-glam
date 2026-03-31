import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de Cadastro de Novos Usuários.
 * Gerencia a criação de conta com validação de força de senha em tempo real.
 */
export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  /**
   * Critérios de segurança para uma senha forte.
   */
  const passwordCriteria = [
    { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
    { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
    { label: 'Um símbolo (!@#$...)', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];

  /**
   * Verifica se todos os critérios de senha foram atendidos.
   */
  const allCriteriaMet = passwordCriteria.every(c => c.test(password));

  /**
   * Processa a submissão do formulário de registro.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!allCriteriaMet) {
      setError({ message: "Sua senha ainda não atende a todos os requisitos de segurança." });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(email, password, displayName);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h2 style={{ margin: '10px 0 14px' }}>Criar conta</h2>

      {error && (
        <div className="status statusError" style={{ marginBottom: 12 }}>
          {error?.message || 'Erro ao criar conta'}
        </div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="label">Nome Completo</span>
          <input
            className="input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Seu nome completo"
          />
        </label>

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
            autoComplete="new-password"
            placeholder="Digite uma senha forte"
            style={{ marginBottom: '8px' }}
          />
          
          {/* Indicador visual de requisitos de senha */}
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '12px', 
            borderRadius: '6px', 
            border: '1px solid #e2e8f0',
            fontSize: '0.8rem'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>Requisitos de segurança:</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
              {passwordCriteria.map((criterion, index) => {
                const isMet = criterion.test(password);
                return (
                  <li key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: isMet ? '#10b981' : (password.length > 0 ? '#ef4444' : '#94a3b8'),
                    transition: 'color 0.2s ease'
                  }}>
                    <span style={{ fontSize: '1rem' }}>{isMet ? '●' : '○'}</span>
                    {criterion.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </label>

        <button 
          className="button" 
          type="submit" 
          disabled={loading || (password.length > 0 && !allCriteriaMet)}
          style={{ marginTop: '10px' }}
        >
          {loading ? 'Criando...' : 'Criar minha conta'}
        </button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Já é nosso cliente? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '700', textDecoration: 'none' }}>Fazer Login</Link>
          </p>
        </div>
      </form>
    </main>
  );
}
