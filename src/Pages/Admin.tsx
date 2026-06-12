import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoClaro from '../components/FondoViento';
import '../styles/Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role] = useState(() => localStorage.getItem('userRole') || 'tecnico');

  const [solicitudes, setSolicitudes] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('solicitudesReset') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [bienes] = useState<any[]>(() => {
    try {
      const guardados = localStorage.getItem('bienes_inamhi');
      return guardados ? JSON.parse(guardados) : [];
    } catch (e) {
      return [];
    }
  });

  const [mostrarNotif, setMostrarNotif] = useState(false);



  useEffect(() => {
    const manejarStorage = (e: StorageEvent) => {
      if (e.key === 'solicitudesReset') {
        try {
          setSolicitudes(JSON.parse(e.newValue || '[]'));
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', manejarStorage);

    const interval = setInterval(() => {
      try {
        const stored = JSON.parse(localStorage.getItem('solicitudesReset') || '[]');
        if (JSON.stringify(stored) !== JSON.stringify(solicitudes)) {
          setSolicitudes(stored);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', manejarStorage);
      clearInterval(interval);
    };
  }, [solicitudes]);

  const manejarAtenderRestablecimiento = (id: number, usuario: string) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas restablecer la contraseña para el usuario "${usuario}"?`);
    if (!confirmar) return;

    // Actualizar la contraseña provisional del usuario en la base de datos de usuarios
    try {
      const guardados = localStorage.getItem('usuarios_inamhi');
      if (guardados) {
        const lista = JSON.parse(guardados);
        const listaActualizada = lista.map((u: any) => {
          if (u.usuario.toLowerCase() === usuario.toLowerCase()) {
            return { ...u, password: 'Inamhi2026*' };
          }
          return u;
        });
        localStorage.setItem('usuarios_inamhi', JSON.stringify(listaActualizada));
      }
    } catch (e) {
      console.error("Error al actualizar la contraseña en la base de datos local:", e);
    }

    const filtradas = solicitudes.filter(sol => sol.id !== id);
    localStorage.setItem('solicitudesReset', JSON.stringify(filtradas));
    setSolicitudes(filtradas);

    alert(`🔑 Contraseña de "${usuario}" restablecida con éxito.\nLa nueva contraseña provisional es: "Inamhi2026*"`);
  };

  return (
    <div className="admin-layout light-theme">
      {/* Fondo de líneas animadas sutiles en tono claro */}
      <FondoClaro />

      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`admin-sidebar solid-panel ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo-inamhi.png" alt="INAMHI" />
          <button className="btn-close-sidebar" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            ✕
          </button>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item" onClick={() => navigate('/inventario')}>Inventario de Bienes</button>
          <button className="nav-item" onClick={() => navigate('/analitica')}>Analítica</button>
          {role === 'admin' && (
            <>
              <button className="nav-item" onClick={() => navigate('/lista-usuarios')}>Lista de Usuarios</button>
              <button className="nav-item" onClick={() => navigate('/creacion-usuarios')}>Usuarios</button>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">{role === 'admin' ? 'A' : 'T'}</div>
            <div className="admin-info">
              <span className="admin-name">{role === 'admin' ? 'Administrador' : 'Técnico'}</span>
              <span className="admin-role">{role === 'admin' ? 'Gestión Global' : 'Gestión de Bienes'}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={() => navigate('/')}>Cerrar Sesión</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header solid-panel">
          <div className="header-left">
            <button className="btn-toggle-sidebar" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
              ☰
            </button>
            <h2>Resumen del Sistema</h2>
          </div>
          <div className="header-actions">
            <input type="text" placeholder="Buscar código de bien..." className="search-bar" />
            {role === 'admin' && (
              <div className="btn-notificaciones-wrapper">
                <button 
                  className="btn-notificaciones" 
                  onClick={() => setMostrarNotif(!mostrarNotif)}
                  aria-label="Notificaciones"
                >
                  🔔
                  {solicitudes.length > 0 && (
                    <span className="notif-badge">{solicitudes.length}</span>
                  )}
                </button>

                {mostrarNotif && (
                  <div className="notif-dropdown solid-panel">
                    <div className="notif-dropdown-header">
                      <h4>Restablecer Contraseñas</h4>
                      {solicitudes.length > 0 && (
                        <span className="notif-count-label">{solicitudes.length} pendiente(s)</span>
                      )}
                    </div>
                    <div className="notif-dropdown-list">
                      {solicitudes.length === 0 ? (
                        <div className="notif-empty-state">
                          <span className="empty-icon">🎉</span>
                          <p>No hay solicitudes pendientes</p>
                        </div>
                      ) : (
                        solicitudes.map((sol) => (
                          <div key={sol.id} className="notif-item">
                            <div className="notif-item-icon">
                              {sol.rol === 'tecnico' ? '🛠️' : '🔍'}
                            </div>
                            <div className="notif-item-info">
                              <p className="notif-item-user">
                                <strong>{sol.usuario}</strong>
                              </p>
                              <span className="notif-item-role">
                                {sol.rol === 'tecnico' ? 'Técnico' : 'Consultor'}
                              </span>
                              <span className="notif-item-time">{sol.fecha}</span>
                            </div>
                            <button 
                              className="btn-notif-atender" 
                              onClick={() => manejarAtenderRestablecimiento(sol.id, sol.usuario)}
                            >
                              Atender
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <section className="admin-content">
          <div className="stats-grid">
            <div
              className="stat-card solid-panel"
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => navigate('/inventario')}
              title="Ver todos los bienes"
            >
              <h4>Total de Activos</h4>
              <p className="stat-value text-blue">{bienes.length.toLocaleString()}</p>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>Ver inventario →</span>
            </div>
            <div
              className="stat-card solid-panel"
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => navigate('/inventario?estado=bueno')}
              title="Ver bienes en buen estado"
            >
              <h4>Estado Bueno</h4>
              <p className="stat-value text-green">{bienes.filter(b => b.estado === 'bueno').length.toLocaleString()}</p>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>Ver buenos →</span>
            </div>
            <div
              className="stat-card solid-panel"
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => navigate('/inventario?estado=regular')}
              title="Ver bienes en estado regular"
            >
              <h4>Estado Regular</h4>
              <p className="stat-value text-orange">{bienes.filter(b => b.estado === 'regular').length.toLocaleString()}</p>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>Ver regulares →</span>
            </div>
            <div
              className="stat-card solid-panel"
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => navigate('/inventario?estado=malo')}
              title="Ver bienes en mal estado"
            >
              <h4>Estado Malo</h4>
              <p className="stat-value text-red">{bienes.filter(b => b.estado === 'malo').length.toLocaleString()}</p>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>Ver malos →</span>
            </div>
          </div>

          {role === 'admin' && solicitudes.length > 0 && (
            <div className="table-container solid-panel" style={{ borderLeft: '4px solid #ef4444', marginBottom: '25px', animation: 'fadeIn 0.3s ease-out' }}>
              <div className="table-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem', animation: 'ringBell 0.5s ease-in-out infinite alternate' }}>🔔</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b' }}>Solicitudes de Restablecimiento Pendientes</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Usuarios que han solicitado recuperar su contraseña</p>
                  </div>
                </div>
                <span className="badge badge-malo" style={{ background: '#fee2e2', color: '#ef4444', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
                  {solicitudes.length} Pendiente(s)
                </span>
              </div>
              
              <div className="solicitudes-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {solicitudes.map((sol) => (
                  <div 
                    key={sol.id} 
                    className="solicitud-row" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '14px 20px', 
                      background: '#f8fafc', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '1.4rem' }}>
                        {sol.rol === 'tecnico' ? '🛠️' : '🔍'}
                      </span>
                      <div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{sol.usuario}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          <span className={`badge-station-status ${sol.rol === 'tecnico' ? 'buena' : 'excelente'}`} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '20px', fontWeight: 600 }}>
                            {sol.rol === 'tecnico' ? 'Técnico' : 'Consultor'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Solicitado el {sol.fecha}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="btn-action" 
                      style={{ 
                        background: '#ef4444', 
                        color: '#ffffff', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(239,68,68,0.2)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.transform = 'none';
                      }}
                      onClick={() => manejarAtenderRestablecimiento(sol.id, sol.usuario)}
                    >
                      Aprobar y Restablecer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="table-container solid-panel">
            <div className="table-header">
              <h3>Últimos Bienes Registrados</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn-action"
                  style={{ background: '#f1f5f9', color: '#0369a1', border: '1px solid #bae6fd' }}
                  onClick={() => navigate('/inventario')}
                >
                  Ver todos
                </button>
                <button className="btn-action" onClick={() => navigate('/registro-bien')}>+ Nuevo Registro</button>
              </div>
            </div>
            <table className="bienes-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Custodio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bienes.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No hay bienes registrados.</td>
                  </tr>
                ) : (
                  bienes.slice(-3).reverse().map((bien, index) => (
                    <tr key={index}>
                      <td>{bien.codigoEsbye}</td>
                      <td>{bien.nombreBien}</td>
                      <td><span className={`badge badge-${bien.estado}`}>{bien.estado.charAt(0).toUpperCase() + bien.estado.slice(1)}</span></td>
                      <td>{bien.custodio}</td>
                      <td><button className="btn-edit" onClick={() => navigate('/inventario')}>Ver</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}