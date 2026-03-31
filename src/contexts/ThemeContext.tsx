import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

/**
 * Interface que define as propriedades e métodos disponíveis no contexto de tema.
 */
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Provedor de Tema que gerencia a alternância entre os modos claro e escuro.
 * Persiste a escolha do usuário no localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('@vibestore:theme') as Theme;
    return stored || 'light';
  });

  /**
   * Atualiza o atributo data-theme no elemento raiz do documento e persiste a escolha.
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('@vibestore:theme', theme);
  }, [theme]);

  /**
   * Alterna entre os temas 'light' e 'dark'.
   */
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de tema.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
}
