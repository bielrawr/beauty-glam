import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Configuração visual da animação de transição de página.
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
};

/**
 * Configuração técnica do tempo e suavidade da transição.
 */
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

/**
 * Wrapper de componente para aplicar animações de entrada e saída suaves entre as trocas de rotas.
 */
export const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};
