import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home as HomeIcon, ShoppingCart, User as UserIcon, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import styles from './Header.module.css';

/**
 * Componente de cabeçalho global da aplicação.
 * Contém a navegação principal, alternância de tema e resumo do carrinho.
 */
const Header = () => {
  const { user, profile, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [animateBadge, setAnimateBadge] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /**
   * Finaliza a sessão do usuário e fecha o modal de confirmação.
   */
  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  /**
   * Dispara uma animação visual no ícone do carrinho quando itens são adicionados.
   */
  useEffect(() => {
    if (totalItems === 0) return;
    
    setAnimateBadge(true);
    const timer = setTimeout(() => setAnimateBadge(false), 300);
    
    return () => clearTimeout(timer);
  }, [totalItems]);

  return (
    <header className={styles.header}>
      {/* Modal de confirmação de logout */}
      {showLogoutConfirm && (
        <div className="overlay">
          <div className="modal">
            <h3 style={{ marginBottom: '1rem', fontWeight: '800' }}>Deseja sair?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Você precisará entrar novamente para acessar seus pedidos e endereços salvos.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="button" style={{ flex: 1 }} onClick={handleLogout}>Sim, Sair</button>
              <button className="button secondary" style={{ flex: 1 }} onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <Link to="/" className={styles.logoLink} aria-label="Ir para Home">
        <h1 className={styles.logo}>
          VIBE<span>STORE</span>
        </h1>
      </Link>

      <nav className={styles.nav}>
        <button 
          onClick={toggleTheme} 
          className={styles.themeBtn} 
          title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          aria-label="Alternar Tema"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <Link to="/" className={styles.link} title="Home" aria-label="Home">
          <HomeIcon size={20} />
          <span className={styles.hideMobile}>Home</span>
        </Link>

        {user && (
          <Link to="/profile" className={styles.link} title="Minha Conta" aria-label="Minha Conta">
            <UserIcon size={20} />
            <span className={styles.hideMobile}>Minha Conta</span>
          </Link>
        )}

        <Link to="/cart" className={styles.link} title="Carrinho" aria-label="Carrinho">
          <div style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className={`${styles.badge} ${animateBadge ? styles.badgePop : ''}`}>
                {totalItems}
              </span>
            )}
          </div>
          <span className={styles.hideMobile}>Carrinho</span>
        </Link>

        {user ? (
          <div className={styles.userSection}>
            <span className={styles.email}>Olá, {(profile?.displayName || user.email?.split('@')[0] || '').split(' ')[0]}</span>
            <button onClick={() => setShowLogoutConfirm(true)} className={styles.logoutBtn} title="Sair" aria-label="Sair">
              <LogOut size={18} />
              <span className={styles.hideMobile}>Sair</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className={styles.link} title="Entrar" aria-label="Entrar">
            <LogIn size={20} />
            <span>Entrar</span>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
