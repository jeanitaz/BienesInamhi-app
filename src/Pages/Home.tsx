import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import FondoNodos from '../components/FondoParticulas';
import FondoClaro from '../components/FondoViento';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className={`home-container ${theme === 'dark' ? 'liquid-theme' : 'light-theme'}`}>
      {/* Fondo adaptativo según el tema */}
      {theme === 'dark' ? <FondoNodos /> : <FondoClaro />}
      
      {/* Círculos de luz difuminada en el fondo para dar volumen atmosférico */}
      <div className="ambient-light light-1"></div>
      <div className="ambient-light light-2"></div>
      
      <div className="home-content centered-wrapper">
        
        <div className="welcome-card liquid-glass">
          
          {/* Contenedor del Logo con brillo corporativo */}
          <div className="logo-container logo-layout">
            <img 
              src="/logo.png" 
              alt="INAMHI Logo" 
              className="inamhi-logo-liquid" 
            />
          </div>

          <h1 className="main-title fluid-title">
            GESTIÓN DE <span className="text-gradient-aqua">BIENES</span>
          </h1>

          <p className="subtitle liquid-subtitle">
            Plataforma para el control, inventario y auditoría de los<br />
            activos institucionales.
          </p>

          <button className="btn-ingresar btn-liquid" onClick={() => navigate('/login')}>
            Ingresar al Sistema
          </button>

          <footer className="card-footer liquid-footer">
            © 2026 INAMHI - Instituto Nacional de Meteorología e Hidrología
          </footer>
        </div>

      </div>
    </div>
  );
}