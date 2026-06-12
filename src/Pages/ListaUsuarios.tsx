import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoNodos from '../components/FondoParticulas';
import FondoClaro from '../components/FondoViento';
import { useTheme } from '../components/ThemeContext';
import '../styles/ListaUsuarios.css'; // Importación de la hoja de estilos dedicada premium

export default function ListaUsuarios() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [usuariosLista, setUsuariosLista] = useState<any[]>([]);

  // Estados para el modal de cambio de contraseña
  const [modalUser, setModalUser] = useState<any | null>(null);
  const [nuevaContra, setNuevaContra] = useState('');
  const [confirmarContra, setConfirmarContra] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const guardados = localStorage.getItem('usuarios_inamhi');
      if (guardados) {
        setUsuariosLista(JSON.parse(guardados));
      }
    } catch (e) {}
  }, []);

  const abrirModalContra = (u: any) => {
    setModalUser(u);
    setNuevaContra('');
    setConfirmarContra('');
    setModalError(null);
  };

  const guardarNuevaContra = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (nuevaContra.length < 4) {
      setModalError("⚠️ La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (nuevaContra !== confirmarContra) {
      setModalError("⚠️ Las contraseñas no coinciden.");
      return;
    }

    try {
      const updated = usuariosLista.map(u => {
        if (u.id === modalUser.id) {
          return { ...u, password: nuevaContra };
        }
        return u;
      });

      localStorage.setItem('usuarios_inamhi', JSON.stringify(updated));
      setUsuariosLista(updated);
      setModalUser(null);
      alert(`🔑 Contraseña de "${modalUser.nombreCompleto}" actualizada con éxito.`);
    } catch (err) {
      console.error(err);
      setModalError("⚠️ Error al guardar los cambios.");
    }
  };

  const borrarUsuario = (id: number, nombreCompleto: string) => {
    const confirmar = window.confirm(`⚠️ ¿Estás seguro de que deseas eliminar permanentemente al usuario "${nombreCompleto}"?`);
    if (!confirmar) return;

    try {
      const filtrados = usuariosLista.filter(u => u.id !== id);
      localStorage.setItem('usuarios_inamhi', JSON.stringify(filtrados));
      setUsuariosLista(filtrados);
      alert(`🗑️ El usuario "${nombreCompleto}" ha sido eliminado exitosamente.`);
    } catch (err) {
      console.error(err);
      alert("⚠️ Error al intentar eliminar el usuario.");
    }
  };

  return (
    <div className={`usuarios-list-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {theme === 'dark' ? <FondoNodos /> : <FondoClaro />}
      <div className="ambient-light light-1" style={theme === 'light' ? { opacity: 0.15 } : undefined}></div>
      <div className="ambient-light light-2" style={theme === 'light' ? { opacity: 0.15 } : undefined}></div>

      <div className="centered-wrapper" style={{ maxWidth: '1000px' }}>
        <div className="listado-card liquid-glass">
          {/* Botón para volver al Dashboard */}
          <button
            type="button"
            className="btn-back-admin"
            onClick={() => navigate('/admin')}
            aria-label="Volver al panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span>Volver</span>
          </button>

          <div className="logo-container logo-layout">
            <h1 className="main-title text-gradient-aqua">Listado de Usuarios</h1>
            <p className="subtitle">Visualiza y gestiona los accesos al sistema</p>
          </div>

          <div className="usuarios-grid">
            {/* Column 1: Técnicos */}
            <div className="role-section role-tecnico">
              <h3 className="role-section-title">
                <span>🛠️</span> Técnicos Autorizados
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {usuariosLista.filter(u => u.rol === 'tecnico').length === 0 && (
                  <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>No hay técnicos registrados.</p>
                )}
                {usuariosLista.filter(u => u.rol === 'tecnico').map(u => (
                  <div key={u.id} className="user-capsule-card">
                    <div className="user-card-details">
                      <span className="user-card-fullname">{u.nombreCompleto}</span>
                      <span className="user-card-username">
                        <strong>Usuario:</strong> {u.usuario}
                      </span>
                    </div>
                    <div className="user-card-actions">
                      <span className={`pulse-badge ${u.activo ? 'activo' : 'inactivo'}`}>
                        <span className="pulse-dot"></span>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button 
                          onClick={() => abrirModalContra(u)} 
                          className="btn-reset-key"
                        >
                          🔑 Reset
                        </button>
                        <button 
                          onClick={() => borrarUsuario(u.id, u.nombreCompleto)} 
                          className="btn-delete-user"
                        >
                          🗑️ Borrar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Consultores */}
            <div className="role-section role-consultor">
              <h3 className="role-section-title">
                <span>🔍</span> Consultores de Lectura
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {usuariosLista.filter(u => u.rol === 'consultor').length === 0 && (
                  <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>No hay consultores registrados.</p>
                )}
                {usuariosLista.filter(u => u.rol === 'consultor').map(u => (
                  <div key={u.id} className="user-capsule-card">
                    <div className="user-card-details">
                      <span className="user-card-fullname">{u.nombreCompleto}</span>
                      <span className="user-card-username">
                        <strong>Usuario:</strong> {u.usuario}
                      </span>
                    </div>
                    <div className="user-card-actions">
                      <span className={`pulse-badge ${u.activo ? 'activo' : 'inactivo'}`}>
                        <span className="pulse-dot"></span>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button 
                          onClick={() => abrirModalContra(u)} 
                          className="btn-reset-key"
                        >
                          🔑 Reset
                        </button>
                        <button 
                          onClick={() => borrarUsuario(u.id, u.nombreCompleto)} 
                          className="btn-delete-user"
                        >
                          🗑️ Borrar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Cambiar Contraseña */}
      {modalUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="creacion-usuarios-card liquid-glass" style={{ width: '400px', padding: '35px', border: '1px solid rgba(255, 255, 255, 0.25)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', margin: 0, minHeight: 'auto' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>
              🔑 Resetear Contraseña
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>
              Establecer nueva contraseña para: <br /><strong>{modalUser.nombreCompleto}</strong>
            </p>

            {modalError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 500, textAlign: 'left' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={guardarNuevaContra} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <div className="input-group">
                <label style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px', textAlign: 'left' }}>Nueva Contraseña</label>
                <input
                  type="password"
                  value={nuevaContra}
                  onChange={(e) => setNuevaContra(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div className="input-group">
                <label style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px', textAlign: 'left' }}>Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmarContra}
                  onChange={(e) => setConfirmarContra(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '15px', width: '100%' }}>
                <button
                  type="button"
                  onClick={() => setModalUser(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '50px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '50px', background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(14,165,233,0.3)', transition: 'all 0.2s' }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
