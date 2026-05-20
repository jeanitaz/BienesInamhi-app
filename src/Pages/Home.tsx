import { useNavigate } from 'react-router-dom';
import FondoNodos from '../components/FondoParticulas'; // Tu fondo animado elegido
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container liquid-theme">
      {/* Fondo de partículas */}
      <FondoNodos />
      
      {/* Círculos de luz difuminada en el fondo para dar volumen atmosférico */}
      <div className="ambient-light light-1"></div>
      <div className="ambient-light light-2"></div>
      
      <div className="home-content centered-wrapper">
        
        <div className="welcome-card liquid-glass">
          
          {/* Anillos de agua concéntricos suaves detrás del logo */}
          <div className="logo-container atmospheric-halo">
            <div className="ripple ripple-1"></div>
            <div className="ripple ripple-2"></div>
            <img 
              src="/logo-inamhi.png" 
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