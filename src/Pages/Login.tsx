import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoNodos from '../components/FondoParticulas'; // Mantenemos tu fondo animado
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [credenciales, setCredenciales] = useState({
    usuario: '',
    password: ''
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setCredenciales({
      ...credenciales,
      [name]: value
    });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    console.log("Enviando credenciales:", credenciales);
    // Aquí irá tu lógica de autenticación (fetch/axios a tu backend)
  };

  return (
    <div className="login-container liquid-theme">
      {/* Fondo de partículas y luces atmosféricas */}
      <FondoNodos />
      <div className="ambient-light light-1"></div>
      <div className="ambient-light light-2"></div>
      
      <div className="login-content centered-wrapper">
        
        <div className="login-card liquid-glass">
          
          {/* Botón para volver al Inicio */}
          <button 
            type="button" 
            className="btn-back-home"
            onClick={() => navigate('/')}
            aria-label="Volver al inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span>Volver</span>
          </button>

          <div className="logo-container atmospheric-halo">
            <div className="ripple ripple-1"></div>
            <img 
              src="/logo-inamhi.png" 
              alt="INAMHI Logo" 
              className="inamhi-logo-liquid" 
            />
          </div>

          <h2 className="login-title">
            Iniciar <span className="text-gradient-aqua">Sesión</span>
          </h2>
          <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

          <form onSubmit={manejarEnvio} className="login-form">
            
            <div className="input-group">
              <label htmlFor="usuario">Usuario / Correo</label>
              <input 
                type="text" 
                id="usuario" 
                name="usuario" 
                placeholder="ejemplo@inamhi.gob.ec"
                value={credenciales.usuario}
                onChange={manejarCambio}
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input 
                  type={mostrarPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  placeholder="••••••••"
                  value={credenciales.password}
                  onChange={manejarCambio}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="btn-liquid btn-login">
              Acceder al Sistema
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}