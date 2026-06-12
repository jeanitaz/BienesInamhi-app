import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoNodos from '../components/FondoParticulas';
import FondoEstrellas from '../components/FondoEstrellas';
import FondoClaro from '../components/FondoViento';
import { useTheme } from '../components/ThemeContext';
import '../styles/ContraUsu.css';

export default function ContraUsu() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [usuario, setUsuario] = useState('');
  const [tipoAcceso, setTipoAcceso] = useState<'tecnico' | 'consultor'>('tecnico');
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const usuarioSol = usuario.trim();
    if (!usuarioSol) {
      setErrorMsg("⚠️ Por favor, ingresa tu usuario o correo electrónico.");
      return;
    }

    const solicitudesPrevias = JSON.parse(localStorage.getItem('solicitudesReset') || '[]');
    
    // Evitar duplicidades de solicitudes pendientes
    const existe = solicitudesPrevias.some(
      (sol: any) => sol.usuario.toLowerCase() === usuarioSol.toLowerCase()
    );

    if (existe) {
      setErrorMsg(`⚠️ Ya existe una solicitud pendiente de restablecimiento para "${usuarioSol}".`);
      return;
    }

    const nuevaSolicitud = {
      id: Date.now(),
      usuario: usuarioSol,
      rol: tipoAcceso,
      fecha: new Date().toLocaleString()
    };

    localStorage.setItem('solicitudesReset', JSON.stringify([...solicitudesPrevias, nuevaSolicitud]));
    setEnviado(true);
  };

  return (
    <div className={`contra-container ${theme === 'dark' ? (tipoAcceso === 'tecnico' ? 'liquid-theme' : 'consultor-theme') : 'light-theme'}`}>
      {/* Fondos dinámicos según el tipo de acceso y tema */}
      {theme === 'dark' ? (
        tipoAcceso === 'tecnico' ? (
          <>
            <FondoNodos />
            <div className="ambient-light light-1"></div>
            <div className="ambient-light light-2"></div>
          </>
        ) : (
          <>
            <FondoEstrellas />
            <div className="ambient-light light-1-consultor"></div>
            <div className="ambient-light light-2-consultor"></div>
          </>
        )
      ) : (
        <>
          <FondoClaro />
          <div className="ambient-light light-1" style={{ opacity: 0.15 }}></div>
          <div className="ambient-light light-2" style={{ opacity: 0.15 }}></div>
        </>
      )}

      <div className="contra-content centered-wrapper">
        <div className="contra-card liquid-glass">
          {/* Botón Volver al Login */}
          <button
            type="button"
            className="btn-back-home"
            onClick={() => navigate('/login')}
            aria-label="Volver al login"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
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

          {!enviado ? (
            <>
              <h2 className="contra-title">
                Recuperar <span className="text-gradient-aqua">Contraseña</span>
              </h2>
              <p className="contra-subtitle">
                Solicita el restablecimiento de tus credenciales de acceso al sistema.
              </p>

              {errorMsg && (
                <div className="contra-error-alert">
                  <p>{errorMsg}</p>
                </div>
              )}

              <form onSubmit={manejarEnvio} className="contra-form">
                {/* Selector de Pestañas (Tabs) de Acceso */}
                <div className="login-tabs-bar">
                  <button
                    type="button"
                    className={`login-tab-btn ${tipoAcceso === 'tecnico' ? 'active' : ''}`}
                    onClick={() => setTipoAcceso('tecnico')}
                  >
                    🛠️ Técnico
                  </button>
                  <button
                    type="button"
                    className={`login-tab-btn ${tipoAcceso === 'consultor' ? 'active' : ''}`}
                    onClick={() => setTipoAcceso('consultor')}
                  >
                    🔍 Consultor
                  </button>
                </div>

                <div className="input-group">
                  <label htmlFor="usuario-sol">
                    {tipoAcceso === 'tecnico' ? 'Usuario Técnico o Correo' : 'Usuario Consultor'}
                  </label>
                  <input
                    type="text"
                    id="usuario-sol"
                    placeholder={
                      tipoAcceso === 'tecnico'
                        ? 'ej. admin@inamhi.gob.ec o técnico'
                        : 'ej. consultor.silva'
                    }
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                  />
                </div>

                <div className="contra-info-note">
                  <span className="info-icon">ℹ️</span>
                  <p>
                    Tu solicitud se enviará de inmediato al panel del Administrador Central para autorizar el restablecimiento.
                  </p>
                </div>

                <button type="submit" className="btn-liquid btn-submit">
                  Enviar Solicitud de Cambio
                </button>
              </form>
            </>
          ) : (
            <div className="contra-success-state">
              <div className="success-icon-wrapper">
                <div className="success-pulse"></div>
                <span className="success-icon">✔️</span>
              </div>
              <h2 className="contra-title">¡Solicitud <span className="text-gradient-aqua">Enviada</span>!</h2>
              <p className="contra-success-text">
                Se ha enviado una notificación pendiente de aprobación al Administrador del sistema para:
              </p>
              <div className="user-success-badge">
                <span className="user-success-role">
                  {tipoAcceso === 'tecnico' ? '🛠️ Técnico' : '🔍 Consultor'}
                </span>
                <span className="user-success-name">{usuario}</span>
              </div>
              <p className="contra-success-footer-note">
                Por favor, comunícate con el Administrador Central para que apruebe tu restablecimiento desde su bandeja de notificaciones.
              </p>
              <button 
                type="button" 
                className="btn-liquid btn-submit"
                onClick={() => navigate('/login')}
              >
                Volver al Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
