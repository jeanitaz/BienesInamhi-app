import { useNavigate } from 'react-router-dom';
import FondoNodos from '../components/FondoParticulas';
import '../styles/NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      {/* Fondo de red de nodos dinámico */}
      <FondoNodos />

      {/* Luces ambientales tormenta */}
      <div className="ambient-light light-1"></div>
      <div className="ambient-light light-2"></div>

      <div className="contra-content centered-wrapper">
        <div className="notfound-card liquid-glass">
          
          {/* Logo 404 con Lámpara de Lava Animada */}
          <div className="lava-logo-wrapper">
            <span className="lamp-number">4</span>
            <div className="lava-lamp-container">
              <svg viewBox="0 0 120 220" className="lava-lamp-svg">
                <defs>
                  {/* El Filtro Gooey (Lava Orgánica) */}
                  <filter id="gooey">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
                  </filter>
                  
                  {/* Gradiente para el líquido de lava */}
                  <linearGradient id="lava-grad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ff007f" />
                    <stop offset="50%" stopColor="#bc13fe" />
                    <stop offset="100%" stopColor="#ff5e62" />
                  </linearGradient>

                  {/* Gradiente metálico de la base y tapa */}
                  <linearGradient id="metal-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* Cuerpo de Vidrio de la Lámpara (Fondo translúcido) */}
                <path 
                  d="M 30 40 Q 15 100 20 170 Q 20 180 30 180 L 90 180 Q 100 180 100 170 Q 105 100 90 40 Z" 
                  fill="rgba(255, 255, 255, 0.02)" 
                  stroke="rgba(255, 255, 255, 0.12)" 
                  strokeWidth="1.5"
                />

                {/* Área de Líquido con Filtro Gooey */}
                <g filter="url(#gooey)">
                  {/* Base de líquido constante en el fondo */}
                  <ellipse cx="60" cy="175" rx="38" ry="12" fill="url(#lava-grad)" />
                  
                  {/* Cúpula de líquido constante arriba */}
                  <ellipse cx="60" cy="45" rx="28" ry="10" fill="url(#lava-grad)" />
                  
                  {/* Gotas/Blobs flotantes de lava */}
                  <circle className="blob blob-1" cx="60" cy="160" r="14" fill="url(#lava-grad)" />
                  <circle className="blob blob-2" cx="50" cy="150" r="12" fill="url(#lava-grad)" />
                  <circle className="blob blob-3" cx="70" cy="90" r="10" fill="url(#lava-grad)" />
                  <circle className="blob blob-4" cx="55" cy="65" r="9" fill="url(#lava-grad)" />
                  <circle className="blob blob-5" cx="65" cy="130" r="8" fill="url(#lava-grad)" />
                </g>

                {/* Tapa Superior Metálica */}
                <path d="M 30 40 L 90 40 L 80 15 L 40 15 Z" fill="url(#metal-grad)" />
                
                {/* Base Metálica Inferior */}
                <path d="M 28 178 L 92 178 L 98 210 L 22 210 Z" fill="url(#metal-grad)" />
                <rect x="25" y="176" width="70" height="6" rx="2" fill="rgba(255, 255, 255, 0.1)" />
              </svg>
            </div>
            <span className="lamp-number">4</span>
          </div>

          <h2 className="notfound-title">Estación Fuera de Cobertura</h2>
          <p className="notfound-text">
            La ruta de navegación que buscas no está disponible en nuestros satélites meteorológicos o no posees las credenciales necesarias para acceder a esta estación de datos.
          </p>

          <div className="notfound-warning-box">
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <p>
              <strong>Acceso Restringido:</strong> Si eres miembro del equipo técnico de INAMHI, por favor inicia sesión con tu cuenta autorizada para desbloquear esta sección.
            </p>
          </div>

          <button 
            type="button" 
            className="btn-liquid" 
            style={{ width: '100%', maxWidth: '240px' }}
            onClick={() => navigate('/login')}
          >
            Volver a la Base (Login)
          </button>
        </div>
      </div>
    </div>
  );
}
