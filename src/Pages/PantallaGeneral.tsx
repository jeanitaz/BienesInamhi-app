import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoClaro from '../components/FondoViento';
import '../styles/PantallaGeneral.css';

interface Bien {
  codigoEsbye: string;
  nombreBien: string;
  marca: string;
  custodio: string;
  ubicacion: string;
  estado: 'operativo' | 'mantenimiento' | 'baja';
}

export default function PantallaGeneral() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [notificacion, setNotificacion] = useState<{ tipo: 'excel' | 'pdf'; mensaje: string } | null>(null);

  // Obtener el rol del usuario (por defecto 'consultor' si no está definido)
  const [role] = useState(() => localStorage.getItem('userRole') || 'consultor');

  const [bienes, setBienes] = useState<Bien[]>([
    {
      codigoEsbye: 'ESBYE-2026-041',
      nombreBien: 'Estación Meteorológica Automática',
      marca: 'Campbell Scientific',
      custodio: 'Ing. Carlos Mendoza',
      ubicacion: 'Estación Iñaquito - Quito',
      estado: 'operativo'
    },
    {
      codigoEsbye: 'ESBYE-2026-089',
      nombreBien: 'Pluviómetro Digital Autónomo',
      marca: 'Davis Instruments',
      custodio: 'Tec. Mariana Silva',
      ubicacion: 'Estación Izobamba',
      estado: 'operativo'
    },
    {
      codigoEsbye: 'ESBYE-2026-112',
      nombreBien: 'Anemómetro de Hélice y Veleta',
      marca: 'RM Young',
      custodio: 'Ing. Carlos Mendoza',
      ubicacion: 'Estación Tababela',
      estado: 'mantenimiento'
    },
    {
      codigoEsbye: 'ESBYE-2026-215',
      nombreBien: 'Barómetro Aneroide de Precisión',
      marca: 'Lufft',
      custodio: 'Dra. Elena Rostova',
      ubicacion: 'Laboratorio de Calibración',
      estado: 'operativo'
    },
    {
      codigoEsbye: 'ESBYE-2026-004',
      nombreBien: 'Laptop de Campo Rugerizada',
      marca: 'Panasonic Toughbook',
      custodio: 'Tec. Luis Narváez',
      ubicacion: 'Departamento de Mantenimiento',
      estado: 'baja'
    },
    {
      codigoEsbye: 'ESBYE-2026-302',
      nombreBien: 'Sensor de Radiación Solar (Piranómetro)',
      marca: 'Kipp & Zonen',
      custodio: 'Ing. Diana Paredes',
      ubicacion: 'Estación El Labrador',
      estado: 'operativo'
    },
    {
      codigoEsbye: 'ESBYE-2026-184',
      nombreBien: 'Termo-Higrómetro Digital Calibrable',
      marca: 'Rotronic',
      custodio: 'Tec. Mariana Silva',
      ubicacion: 'Estación Cotopaxi',
      estado: 'mantenimiento'
    }
  ]);

  const manejarBusqueda = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const simularDescarga = (tipo: 'excel' | 'pdf') => {
    setNotificacion({
      tipo,
      mensaje: `Preparando y compilando reporte en formato ${tipo.toUpperCase()}...`
    });

    setTimeout(() => {
      setNotificacion({
        tipo,
        mensaje: `¡Reporte ${tipo.toUpperCase()} descargado con éxito!`
      });
      setTimeout(() => {
        setNotificacion(null);
      }, 2500);
    }, 1500);
  };

  const eliminarBien = (codigo: string) => {
    if (confirm(`¿Está seguro de que desea dar de baja o eliminar el bien con código ${codigo}?`)) {
      setBienes((prev) => prev.filter((b) => b.codigoEsbye !== codigo));
    }
  };

  // Filtrado y búsqueda reactiva
  const bienesFiltrados = bienes.filter((bien) => {
    const cumpleEstado = filtroEstado === 'todos' || bien.estado === filtroEstado;
    const campoBusqueda = searchTerm.toLowerCase().trim();
    const cumpleBusqueda =
      bien.codigoEsbye.toLowerCase().includes(campoBusqueda) ||
      bien.nombreBien.toLowerCase().includes(campoBusqueda) ||
      bien.marca.toLowerCase().includes(campoBusqueda) ||
      bien.custodio.toLowerCase().includes(campoBusqueda) ||
      bien.ubicacion.toLowerCase().includes(campoBusqueda);

    return cumpleEstado && cumpleBusqueda;
  });

  return (
    <div className="pantalla-general-layout light-theme">
      {/* Fondo de líneas animadas sutiles en tono claro */}
      <FondoClaro />

      {/* Alerta flotante para descargas */}
      {notificacion && (
        <div className={`toast-notification notification-${notificacion.tipo}`}>
          <span className="toast-icon">
            {notificacion.tipo === 'excel' ? '📊' : '📄'}
          </span>
          <p>{notificacion.mensaje}</p>
        </div>
      )}

      <div className="pantalla-general-container">
        {/* Encabezado Principal */}
        <header className="pantalla-header solid-panel">
          <div className="header-left">
            <button 
              className="btn-back-dashboard" 
              onClick={() => navigate(role === 'tecnico' ? '/admin' : '/login')} 
              aria-label={role === 'tecnico' ? 'Volver a Dashboard' : 'Cerrar Sesión'}
              title={role === 'tecnico' ? 'Volver a Dashboard' : 'Cerrar Sesión'}
            >
              ←
            </button>
            <div className="header-titles">
              <h1>Inventario de Bienes</h1>
              <p>
                {role === 'tecnico' 
                  ? 'Consulta general, filtrado y auditoría de activos institucionales (Acceso Técnico)' 
                  : 'Consulta general y descarga de reportes autorizados (Acceso Consultor)'}
              </p>
            </div>
          </div>
          <div className="header-right">
            <img src="/logo-inamhi.png" alt="INAMHI" className="header-logo-inamhi" />
          </div>
        </header>

        {/* Panel de Control: Filtros y Acciones */}
        <section className="control-bar-panel solid-panel">
          <div className="control-search-row">
            {/* Búsqueda rápida */}
            <div className="search-box-wrapper">
              <span className="search-icon-lens">🔍</span>
              <input
                type="text"
                placeholder="Buscar por código ESBYE, bien, marca, custodio o ubicación..."
                value={searchTerm}
                onChange={manejarBusqueda}
                className="search-input-field"
              />
              {searchTerm && (
                <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
                  ✕
                </button>
              )}
            </div>

            {/* Nuevo Registro (Solo visible para técnicos) */}
            {role === 'tecnico' && (
              <button className="btn-action btn-new-register" onClick={() => navigate('/registro-bien')}>
                <span className="plus-icon">+</span> Nuevo Registro
              </button>
            )}
          </div>

          <div className="control-filter-export-row">
            {/* Filtros rápidos por estado */}
            <div className="filter-pill-group">
              <span className="filter-label">Estado:</span>
              <button
                className={`filter-pill ${filtroEstado === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltroEstado('todos')}
              >
                Todos
              </button>
              <button
                className={`filter-pill pill-operativo ${filtroEstado === 'operativo' ? 'active' : ''}`}
                onClick={() => setFiltroEstado('operativo')}
              >
                Operativo
              </button>
              <button
                className={`filter-pill pill-mantenimiento ${filtroEstado === 'mantenimiento' ? 'active' : ''}`}
                onClick={() => setFiltroEstado('mantenimiento')}
              >
                Mantenimiento
              </button>
              <button
                className={`filter-pill pill-baja ${filtroEstado === 'baja' ? 'active' : ''}`}
                onClick={() => setFiltroEstado('baja')}
              >
                Baja
              </button>
            </div>

            {/* Descarga de Reportes */}
            <div className="export-buttons-group">
              <span className="export-label">Reportes:</span>
              <button className="btn-export btn-excel" onClick={() => simularDescarga('excel')}>
                <span className="icon-excel">📊</span> Exportar Excel
              </button>
              <button className="btn-export btn-pdf" onClick={() => simularDescarga('pdf')}>
                <span className="icon-pdf">📄</span> Descargar PDF
              </button>
            </div>
          </div>
        </section>

        {/* Tabla de Inventario de Bienes */}
        <section className="table-wrapper-panel solid-panel">
          <div className="table-header-meta">
            <h3>Bienes Registrados</h3>
            <span className="results-count">
              Mostrando {bienesFiltrados.length} de {bienes.length} registros
            </span>
          </div>

          <div className="table-scroll-container">
            <table className="bienes-data-table">
              <thead>
                <tr>
                  <th>Código ESBYE</th>
                  <th>Nombre del Bien</th>
                  <th>Marca</th>
                  <th>Custodio</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  {role === 'tecnico' && <th className="text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {bienesFiltrados.length > 0 ? (
                  bienesFiltrados.map((bien) => (
                    <tr key={bien.codigoEsbye}>
                      <td className="font-bold text-blue-deep">{bien.codigoEsbye}</td>
                      <td className="font-medium text-dark">{bien.nombreBien}</td>
                      <td>{bien.marca}</td>
                      <td className="font-medium text-grey">{bien.custodio}</td>
                      <td className="text-grey-light">{bien.ubicacion}</td>
                      <td>
                        <span className={`badge-state badge-${bien.estado}`}>
                          {bien.estado === 'operativo' && '● Operativo'}
                          {bien.estado === 'mantenimiento' && '● Mantenimiento'}
                          {bien.estado === 'baja' && '● Baja / Dañado'}
                        </span>
                      </td>
                      {role === 'tecnico' && (
                        <td className="text-center">
                          <div className="action-buttons-cell">
                            <button
                              className="btn-table-action btn-edit-asset"
                              onClick={() => alert(`Editando bien ${bien.codigoEsbye}`)}
                              title="Editar registro"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-table-action btn-delete-asset"
                              onClick={() => eliminarBien(bien.codigoEsbye)}
                              title="Dar de baja bien"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={role === 'tecnico' ? 7 : 6} className="no-data-cell">
                      <div className="no-data-wrapper">
                        <span className="no-data-icon">🔍</span>
                        <p className="no-data-text">No se encontraron bienes que coincidan con la búsqueda o filtro.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
