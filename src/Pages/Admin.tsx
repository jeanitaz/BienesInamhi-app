import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoClaro from '../components/FondoViento';
import '../styles/Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('userRole', 'tecnico');
  }, []);

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
          <button className="nav-item">Ingresos / Salidas</button>
          <button className="nav-item">Reportes</button>
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
          <button className="btn-logout">Cerrar Sesión</button>
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
            <button className="btn-notificaciones">🔔</button>
          </div>
        </header>

        <section className="admin-content">
          <div className="stats-grid">
            <div className="stat-card solid-panel">
              <h4>Total de Activos</h4>
              <p className="stat-value text-blue">2,450</p>
            </div>
            <div className="stat-card solid-panel">
              <h4>Equipos Operativos</h4>
              <p className="stat-value text-green">2,100</p>
            </div>
            <div className="stat-card solid-panel">
              <h4>En Mantenimiento</h4>
              <p className="stat-value text-orange">45</p>
            </div>
            <div className="stat-card solid-panel">
              <h4>Bajas / Dañados</h4>
              <p className="stat-value text-red">12</p>
            </div>
          </div>

          <div className="table-container solid-panel">
            <div className="table-header">
              <h3>Últimos Bienes Registrados</h3>
              <button className="btn-action" onClick={() => navigate('/registro-bien')}>+ Nuevo Registro</button>
            </div>
            <table className="bienes-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Fecha Ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>INV-2026-001</td>
                  <td>Estación Meteorológica Portátil</td>
                  <td><span className="badge badge-operativo">Operativo</span></td>
                  <td>20/05/2026</td>
                  <td><button className="btn-edit">Editar</button></td>
                </tr>
                <tr>
                  <td>INV-2026-002</td>
                  <td>Laptop Asus TUF Gaming F17</td>
                  <td><span className="badge badge-mantenimiento">Mantenimiento</span></td>
                  <td>18/05/2026</td>
                  <td><button className="btn-edit">Editar</button></td>
                </tr>
                <tr>
                  <td>INV-2026-003</td>
                  <td>Pluviómetro Digital</td>
                  <td><span className="badge badge-operativo">Operativo</span></td>
                  <td>15/05/2026</td>
                  <td><button className="btn-edit">Editar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}