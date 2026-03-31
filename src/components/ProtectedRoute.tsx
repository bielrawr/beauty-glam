import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente de alta ordem para proteção de rotas privadas.
 * Redireciona usuários não autenticados para a página de login,
 * preservando a rota de origem para redirecionamento pós-login.
 */
export function ProtectedRoute({ children }) {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

  /**
   * Exibe uma tela de carregamento enquanto o estado de autenticação está sendo verificado.
   */
  if (loadingAuth) {
    return <div className="container"><div className="status">Carregando...</div></div>;
  }

  /**
   * Redireciona para o login se não houver usuário logado.
   */
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
