import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import styles from './Header.module.css'; // Usaremos os estilos do header/global para o loader

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div style={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        backgroundColor: 'var(--background)'
      }}>
        <motion.div 
          style={{
            fontSize: '4rem',
            fontWeight: '900',
            color: 'var(--secondary)',
            letterSpacing: '-2px'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          B<span style={{ color: 'var(--primary)', fontWeight: '300' }}>G</span>
        </motion.div>
        <p style={{
          fontSize: '0.75rem',
          fontWeight: '900',
          color: 'var(--secondary)',
          letterSpacing: '3px',
          textTransform: 'uppercase'
        }}>
          VALIDANDO ACESSO...
        </p>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={16} color="var(--accent)" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
