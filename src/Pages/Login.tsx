import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoNodos from '../components/FondoParticulas';
import FondoClaro from '../components/FondoViento';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [tipoAcceso, setTipoAcceso] = useState<'tecnico' | 'consultor'>('tecnico');
  const [credenciales, setCredenciales] = useState({
    usuario: '',
    password: ''
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [ingresando, setIngresando] = useState(false);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredenciales((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const cambiarAcceso = (tipo: 'tecnico' | 'consultor') => {
    setTipoAcceso(tipo);
    setCredenciales({ usuario: '', password: '' });
  };

  const manejarEnvio = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIngresando(true);
    console.log(`Iniciando sesión como ${tipoAcceso}:`, credenciales);

    // Simulación de acceso e ingreso
    setTimeout(() => {
      setIngresando(false);
      if (tipoAcceso === 'tecnico') {
        navigate('/admin');
      } else {
        navigate('/inventario');
      }
    }, 1200);
  };

  return (
    <div className={`login-container ${tipoAcceso === 'tecnico' ? 'liquid-theme' : 'light-theme'}`}>
      {/* Fondo y luces dinámicas según el rol */}
      {tipoAcceso === 'tecnico' ? (
        <>
          <FondoNodos />
          <div className="ambient-light light-1"></div>
          <div className="ambient-light light-2"></div>
        </>
      ) : (
        <>
          <FondoClaro />
          <div className="ambient-light light-1-clear"></div>
          <div className="ambient-light light-2-clear"></div>
        </>
      )}

      <div className="login-content centered-wrapper">
        <div className="login-card liquid-glass">
          {/* Botón para volver al Inicio */}
          <button
            type="button"
            className="btn-back-home"
            onClick={() => navigate('/')}
            aria-label="Volver al inicio"
            disabled={ingresando}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span>Volver</span>
          </button>

          <div className="logo-container logo-layout">
            <img
              src="/logo-inamhi.png"
              alt="INAMHI Logo"
              className="inamhi-logo-liquid"
            />
          </div>

          <h2 className="login-title">
            Iniciar <span className="text-gradient-aqua">Sesión</span>
          </h2>

          {/* Selector de Pestañas (Tabs) de Acceso */}
          <div className="login-tabs-bar">
            <button
              type="button"
              className={`login-tab-btn ${tipoAcceso === 'tecnico' ? 'active' : ''}`}
              onClick={() => cambiarAcceso('tecnico')}
              disabled={ingresando}
            >
              🛠️ Técnico
            </button>
            <button
              type="button"
              className={`login-tab-btn ${tipoAcceso === 'consultor' ? 'active' : ''}`}
              onClick={() => cambiarAcceso('consultor')}
              disabled={ingresando}
            >
              🔍 Consultor
            </button>
          </div>

          <p className="login-subtitle">
            {tipoAcceso === 'tecnico'
              ? 'Acceso Técnico - Gestión de Inventario'
              : 'Acceso Consultor - Solo Lectura y Reportes'}
          </p>

          <form onSubmit={manejarEnvio} className="login-form">
            <div className="input-group">
              <label htmlFor="usuario">
                {tipoAcceso === 'tecnico' ? 'Usuario Técnico' : 'Usuario Consultor'}
              </label>
              <input
                type="text"
                id="usuario"
                name="usuario"
                placeholder={
                  tipoAcceso === 'tecnico'
                    ? 'ej. tecnico.perez'
                    : 'ej. consultor.silva'
                }
                value={credenciales.usuario}
                onChange={manejarCambio}
                required
                disabled={ingresando}
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
                  disabled={ingresando}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={ingresando}
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

            <button type="submit" className="btn-liquid btn-login" disabled={ingresando}>
              {ingresando ? (
                <span className="login-spinner">🔄 Ingresando...</span>
              ) : (
                `Acceder como ${tipoAcceso === 'tecnico' ? 'Técnico' : 'Consultor'}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}