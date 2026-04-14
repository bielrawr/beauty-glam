import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, profile, logout, loadingAuth } = useAuth();
  const { cart } = useCart();
  const { searchQuery, setSearchQuery } = useProducts();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isHomePage) {
      navigate('/');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.container}`}>
          {/* Logo Sempre à Esquerda */}
          <Link 
            to="/" 
            className={styles.logo} 
            onClick={handleLogoClick}
          >
            BEAUTY<span>GLAM</span>
          </Link>

          {/* Busca Centralizada (Apenas na Home) */}
          {isHomePage ? (
            <nav className={styles.nav}>
              <div className={styles.searchBar}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar maquiagem..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button onClick={clearSearch} className={styles.clearSearchBtn}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </nav>
          ) : (
            <div className={styles.nav} /> // Espaçador para manter o alinhamento
          )}

          {/* Ações Sempre à Direita */}
          <div className={styles.actions}>
            <div className={styles.authWrapper}>
              {loadingAuth ? (
                null // Mantém vazio durante o check inicial do Firebase
              ) : user ? (
                <div className={styles.userSession}>
                  <Link to="/profile" className={styles.profileLink}>
                    <User size={18} />
                    <span className={styles.userName}>
                      {/* Saudação: Olá, Nome (Perfil > Auth > E-mail) */}
                      Olá, {(profile?.displayName?.split(' ')[0] || 
                             user.displayName?.split(' ')[0] || 
                             user.email?.split('@')[0] || 
                             'Conta').charAt(0).toUpperCase() + 
                             (profile?.displayName?.split(' ')[0] || 
                             user.displayName?.split(' ')[0] || 
                             user.email?.split('@')[0] || 
                             'Conta').slice(1).toLowerCase()}.
                    </span>
                  </Link>                  <div className={styles.dividerVertical} />
                  <button 
                    onClick={() => setShowLogoutModal(true)} 
                    className={styles.logoutBtn} 
                    title="Sair"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className={styles.loginBtn}>
                  Login
                </Link>
              )}
            </div>

            <Link to="/cart" className={styles.cartButton}>
              <ShoppingCart size={22} />
              <AnimatePresence mode="wait">
                {totalItems > 0 && (
                  <motion.span 
                    key={totalItems}
                    className={styles.badge}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>
      </header>

      {/* Modal de Confirmação de Logout */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <AlertTriangle size={24} color="var(--primary)" />
              <h2>Confirmar Saída</h2>
            </div>
            <p>Você tem certeza que deseja encerrar sua sessão na BeautyGlam?</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setShowLogoutModal(false)}
              >
                Continuar Comprando
              </button>
              <button 
                className={styles.confirmBtn} 
                onClick={handleLogout}
              >
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
