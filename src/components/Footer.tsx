import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandSection}>
          <h2>B<span>G</span></h2>
          <p>
            BEAUTYGLAM é uma boutique de cosméticos de luxo, dedicada a trazer as 
            melhores tendências internacionais com qualidade inquestionável e 
            experiência de compra editorial.
          </p>
        </div>

        <div>
          <h4 className={styles.sectionTitle}>Explore</h4>
          <ul className={styles.links}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/profile">Minha Conta</Link></li>
            <li><Link to="/cart">Carrinho</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.sectionTitle}>Contatos</h4>
          <ul className={styles.links}>
            <li><a href="mailto:contato@beautyglam.com"><Mail size={16} /> contato@beautyglam.com</a></li>
            <li><span><Phone size={16} /> (11) 99999-9999</span></li>
            <li><span><MapPin size={16} /> Av. Paulista, 1000 - SP</span></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.sectionTitle}>Siga-nos</h4>
          <ul className={styles.links}>
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a></li>
            <li><a href="https://facebook.com" target="_blank" rel="noreferrer"><Facebook size={16} /> Facebook</a></li>
            <li><a href="https://youtube.com" target="_blank" rel="noreferrer"><Youtube size={16} /> Youtube</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; 2024 BEAUTYGLAM COSMETICS LTDA. CNPJ 00.000.000/0001-00</p>
        <p>Todos os direitos reservados</p>
      </div>
    </footer>
  );
}
