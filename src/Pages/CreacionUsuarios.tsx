import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoNodos from '../components/FondoParticulas';
import '../styles/CreacionUsuarios.css';

export default function CreacionUsuarios() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    usuario: '',
    password: '',
    rol: 'consultor', // 'tecnico' | 'consultor'
    activo: true
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const seleccionarRol = (rol: 'tecnico' | 'consultor') => {
    setFormData((prev) => ({
      ...prev,
      rol
    }));
  };

  const alternarEstado = () => {
    setFormData((prev) => ({
      ...prev,
      activo: !prev.activo
    }));
  };

  const manejarEnvio = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlerta(null);

    // Validaciones básicas
    if (formData.nombreCompleto.trim().length < 3) {
      setAlerta({
        tipo: 'error',
        mensaje: 'El nombre completo debe tener al menos 3 caracteres.'
      });
      return;
    }
    if (formData.usuario.trim().length < 4) {
      setAlerta({
        tipo: 'error',
        mensaje: 'El nombre de usuario debe tener al menos 4 caracteres.'
      });
      return;
    }
    if (formData.password.length < 6) {
      setAlerta({
        tipo: 'error',
        mensaje: 'La contraseña debe tener al menos 6 caracteres.'
      });
      return;
    }

    setCargando(true);
    console.log('Registrando nuevo usuario:', formData);

    // Simulación de guardado
    setTimeout(() => {
      setCargando(false);
      setAlerta({
        tipo: 'success',
        mensaje: '¡Usuario creado y registrado exitosamente en el sistema!'
      });

      // Redirigir al Dashboard de administración tras un breve retardo
      setTimeout(() => {
        navigate('/admin');
      }, 2500);
    }, 1500);
  };

  return (
    <div className="creacion-usuarios-container liquid-theme">
      {/* Fondo de partículas animado y luces ambientales */}
      <FondoNodos />
      <div className="ambient-light light-1"></div>
      <div className="ambient-light light-2"></div>

      <div className="centered-wrapper">
        <div className="creacion-usuarios-card liquid-glass">
          {/* Botón para volver al Dashboard */}
          <button
            type="button"
            className="btn-back-admin"
            onClick={() => navigate('/admin')}
            aria-label="Volver al panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span>Volver</span>
          </button>

          <div className="logo-container logo-layout">
            <img src="/logo-inamhi.png" alt="INAMHI" className="inamhi-logo-liquid" />
          </div>

          <h2 className="card-title">
            Registro de <span className="text-gradient-aqua">Usuarios</span>
          </h2>
          <p className="card-subtitle">Asigna credenciales y define privilegios de acceso</p>

          {/* Banner de alertas animado */}
          {alerta && (
            <div className={`alert-banner alert-${alerta.tipo}`}>
              <div className="alert-icon">
                {alerta.tipo === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                )}
              </div>
              <p className="alert-message">{alerta.mensaje}</p>
            </div>
          )}

          <form onSubmit={manejarEnvio} className="usuarios-form">
            {/* Campo: Nombres Completos */}
            <div className="input-group">
              <label htmlFor="nombreCompleto">Nombre Completo</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="nombreCompleto"
                  name="nombreCompleto"
                  placeholder="Ej. Juan Pérez Delgado"
                  value={formData.nombreCompleto}
                  onChange={manejarCambio}
                  required
                  disabled={cargando}
                />
              </div>
            </div>

            {/* Campo: Nombre de Usuario */}
            <div className="input-group">
              <label htmlFor="usuario">Usuario</label>
              <div className="input-with-icon">
                <span className="input-icon">🔑</span>
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  placeholder="Ej. jperez"
                  value={formData.usuario}
                  onChange={manejarCambio}
                  required
                  disabled={cargando}
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="input-group">
              <label htmlFor="password">Contraseña de Acceso</label>
              <div className="password-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={manejarCambio}
                  required
                  disabled={cargando}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  disabled={cargando}
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

            {/* Campo: Rol de Usuario */}
            <div className="input-group">
              <label>Rol del Usuario</label>
              <div className="roles-grid">
                <div
                  className={`role-card ${formData.rol === 'tecnico' ? 'active' : ''}`}
                  onClick={() => !cargando && seleccionarRol('tecnico')}
                >
                  <div className="role-icon-wrapper">🛠️</div>
                  <div className="role-details">
                    <span className="role-title">Técnico</span>
                    <span className="role-desc">Edición y registro de bienes</span>
                  </div>
                  <div className="role-radio-bullet"></div>
                </div>

                <div
                  className={`role-card ${formData.rol === 'consultor' ? 'active' : ''}`}
                  onClick={() => !cargando && seleccionarRol('consultor')}
                >
                  <div className="role-icon-wrapper">🔍</div>
                  <div className="role-details">
                    <span className="role-title">Consultor</span>
                    <span className="role-desc">Acceso de lectura y reportes</span>
                  </div>
                  <div className="role-radio-bullet"></div>
                </div>
              </div>
            </div>

            {/* Campo: Estado del Usuario (Activo/Inactivo) */}
            <div className="input-group toggle-group">
              <div className="toggle-label-wrapper">
                <span className="toggle-main-label">Estado Inicial</span>
                <span className="toggle-sub-label">
                  El usuario estará {formData.activo ? 'activo para iniciar sesión' : 'bloqueado temporalmente'}
                </span>
              </div>
              <div
                className={`custom-toggle-switch ${formData.activo ? 'activo' : 'inactivo'}`}
                onClick={() => !cargando && alternarEstado()}
              >
                <div className="toggle-thumb"></div>
                <span className="toggle-text">{formData.activo ? 'ACTIVO' : 'INACTIVO'}</span>
              </div>
            </div>

            {/* Acciones del Formulario */}
            <div className="form-actions-row">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/admin')}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-liquid btn-submit" disabled={cargando}>
                {cargando ? (
                  <div className="spinner-wrapper">
                    <span className="spinner-icon">🔄</span>
                    <span>Registrando...</span>
                  </div>
                ) : (
                  'Registrar Usuario'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
