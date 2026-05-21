import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoClaro from '../components/FondoViento';
import '../styles/Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    localStorage.setItem('userRole', 'tecnico');
  }, []);

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

    const filtradas = solicitudes.filter(sol => sol.id !== id);
    localStorage.setItem('solicitudesReset', JSON.stringify(filtradas));
    setSolicitudes(filtradas);

    alert(`Contraseña de "${usuario}" restablecida con éxito.\nLa nueva contraseña provisional es: "Inamhi2026*"`);
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
          <button className="nav-item" onClick={() => navigate('/lista-usuarios')}>Lista de Ususarios</button>
          <button className="nav-item" onClick={() => navigate('/creacion-usuarios')}>Usuarios</button>
        </nav>
        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">A</div>
            <div className="admin-info">
              <span className="admin-name">Administrador</span>
              <span className="admin-role">Gestión de Bienes</span>
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