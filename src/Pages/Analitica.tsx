import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoClaro from '../components/FondoViento';
import '../styles/Analitica.css';

interface Estacion {
  id: string;
  nombre: string;
  region: 'Sierra' | 'Costa' | 'Oriente' | 'Galápagos';
  activos: number;
  operativos: number;
  mantenimiento: number;
  baja: number;
  salud: number; // Porcentaje de salud general de los activos
  coordenadas: { x: number; y: number }; // Para colocar pines en el mapa SVG
}

export default function Analitica() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string>('inaquito');

  // Asegurar que el rol esté fijado en el técnico para fines de simulación
  useEffect(() => {
    localStorage.setItem('userRole', 'tecnico');
  }, []);

  // Simulación de recarga de datos con efecto de animación
  const recargarEstadisticas = () => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
    }, 1000);
  };

  // Cargar bienes desde localStorage
  const bienes: any[] = (() => {
    try {
      const guardados = localStorage.getItem('bienes_inamhi');
      return guardados ? JSON.parse(guardados) : [];
    } catch (e) {
      return [];
    }
  })();

  const totalActivos = bienes.length;
  const operativos = bienes.filter(b => b.estado === 'bueno').length;
  const mantenimiento = bienes.filter(b => b.estado === 'regular').length;
  const bajas = bienes.filter(b => b.estado === 'malo').length;

  const pctOperatividad = totalActivos ? (operativos / totalActivos * 100).toFixed(1) : '0.0';

  // Base de datos dinámica de estaciones
  const ubicacionesUnicas = Array.from(new Set(bienes.map(b => b.ubicacion)));
  const coordenadasFijas: Record<string, {x: number, y: number}> = {
    'Estación Iñaquito - Quito': { x: 230, y: 120 },
    'Estación Tababela': { x: 260, y: 130 },
    'Estación Izobamba': { x: 220, y: 150 },
    'Estación Guayaquil Aeropuerto': { x: 120, y: 220 },
    'Estación Cuenca El Labrador': { x: 200, y: 280 },
    'Estación Cotopaxi': { x: 240, y: 180 },
    'Laboratorio de Calibración': { x: 250, y: 125 },
    'Estación El Labrador': { x: 230, y: 140 },
    'Bodega Central INAMHI': { x: 235, y: 135 },
    'Departamento de Mantenimiento': { x: 235, y: 145 },
  };

  const estaciones: Estacion[] = ubicacionesUnicas.map((ub, idx) => {
    const bienesEst = bienes.filter(b => b.ubicacion === ub);
    const estTotal = bienesEst.length;
    const estOp = bienesEst.filter(b => b.estado === 'bueno').length;
    const estMant = bienesEst.filter(b => b.estado === 'regular').length;
    const estBaja = bienesEst.filter(b => b.estado === 'malo').length;
    const salud = estTotal ? Math.round((estOp / estTotal) * 100) : 0;
    const coords = coordenadasFijas[ub] || { x: 50 + ((idx * 30) % 200), y: 50 + ((idx * 40) % 200) };

    return {
      id: ub.replace(/\s+/g, '-').toLowerCase() + '-' + idx,
      nombre: ub,
      region: 'Sierra', // Por defecto para nuevas; si necesitas puedes expandir logica
      activos: estTotal,
      operativos: estOp,
      mantenimiento: estMant,
      baja: estBaja,
      salud,
      coordenadas: coords
    };
  });

  const estacionSeleccionada = estaciones.find(est => est.id === selectedStationId) || estaciones[0] || null;

  // Datos para los Gráficos SVG
  // 1. Gráfico de Donut: Distribución de Estado de Bienes
  const donutData = [
    { label: 'Operativo', valor: operativos, porcentaje: totalActivos ? parseFloat((operativos / totalActivos * 100).toFixed(1)) : 0, color: '#10b981', hoverColor: '#059669' },
    { label: 'Mantenimiento', valor: mantenimiento, porcentaje: totalActivos ? parseFloat((mantenimiento / totalActivos * 100).toFixed(1)) : 0, color: '#f59e0b', hoverColor: '#d97706' },
    { label: 'Baja / Dañado', valor: bajas, porcentaje: totalActivos ? parseFloat((bajas / totalActivos * 100).toFixed(1)) : 0, color: '#ef4444', hoverColor: '#dc2626' }
  ];

  // Cálculo acumulativo para los arcos del Donut SVG (circunferencia r=40 es ~251.3)
  const radioDonut = 40;
  const circunferenciaDonut = 2 * Math.PI * radioDonut;
  let acumuladorPorcentaje = 0;

  // 2. Gráfico de Barras: Activos por Categoría
  const categorizar = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('meteorol') || n.includes('pluviómetro') || n.includes('anemómetro') || n.includes('barómetro') || n.includes('term')) return 'Instrumental';
    if (n.includes('sensor') || n.includes('radiación')) return 'Sensores';
    if (n.includes('laptop') || n.includes('pc') || n.includes('computador')) return 'Cómputo';
    return 'Otros';
  };

  const conteoCat = { Instrumental: 0, Sensores: 0, Cómputo: 0, Otros: 0 };
  bienes.forEach(b => {
    const cat = categorizar(b.nombreBien) as keyof typeof conteoCat;
    conteoCat[cat]++;
  })

  /*
  // 3. Gráfico de Tendencia Histórica: Registro de Activos (2021 - 2026)
  const tendenciaData = [
    { año: '2021', activos: 1200, coordX: 40, coordY: 130 },
    { año: '2022', activos: 1500, coordX: 90, coordY: 110 },
    { año: '2023', activos: 1800, coordX: 140, coordY: 90 },
    { año: '2024', activos: 2100, coordX: 190, coordY: 70 },
    { año: '2025', activos: 2300, coordX: 240, coordY: 55 },
    { año: '2026', activos: 2450, coordX: 290, coordY: 40 }
  ];

  // Generar cadena del path para la línea de tendencia
  const linePathD = tendenciaData.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.coordX} ${pt.coordY}` : `${acc} L ${pt.coordX} ${pt.coordY}`),
    ''
  );

  // Generar cadena del path de área sombreada abajo de la línea
  const areaPathD = `${linePathD} L 290 160 L 40 160 Z`;
  */



  return (
    <div className="analitica-layout light-theme">
      {/* Fondo de viento dinámico claro */}
      <FondoClaro />

      {/* Overlay para menú móvil */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR (Estilo Corporativo INAMHI) */}
      <aside className={`admin-sidebar solid-panel ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo-inamhi.png" alt="INAMHI" />
          <button className="btn-close-sidebar" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            ✕
          </button>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/admin')}>Dashboard</button>
          <button className="nav-item" onClick={() => navigate('/inventario')}>Inventario de Bienes</button>
          <button className="nav-item active">Analitica</button>
          <button className="nav-item" onClick={() => alert('Generando informe de reportes consolidado...')}>Reportes</button>
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="analitica-main">
        {/* Encabezado */}
        <header className="analitica-header solid-panel">
          <div className="header-left">
            <button className="btn-toggle-sidebar" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
              ☰
            </button>
            <h2>Panel Analítico de Activos</h2>
          </div>
          <div className="header-actions">
            <button 
              className={`btn-refresh ${spinning ? 'spinning' : ''}`} 
              onClick={recargarEstadisticas}
              disabled={spinning}
            >
              <span className="refresh-icon">🔄</span>
              <span>{spinning ? 'Actualizando...' : 'Actualizar Datos'}</span>
            </button>
          </div>
        </header>

        {/* Métrica KPI Cards */}
        <section className="kpis-grid">
          <div className="analytic-panel kpi-card">
            <div className="kpi-header">
              <h4>Total Activos</h4>
              <span className="kpi-icon">📊</span>
            </div>
            <div className="kpi-body">
              <p className="kpi-value">{totalActivos.toLocaleString()}</p>
              <span className="kpi-indicator indicator-up" style={{ opacity: 0 }}>
                -
              </span>
            </div>
          </div>

          <div className="analytic-panel kpi-card">
            <div className="kpi-header">
              <h4>Buenos</h4>
              <span className="kpi-icon">⚙️</span>
            </div>
            <div className="kpi-body">
              <p className="kpi-value">{pctOperatividad}%</p>
              <div className="kpi-mini-chart">
                <svg width="45" height="45" viewBox="0 0 36 36">
                  <path
                    className="donut-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3.5"
                  />
                  <path
                    className="donut-fill"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeDasharray={`${pctOperatividad}, 100`}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="analytic-panel kpi-card">
            <div className="kpi-header">
              <h4>Regulares</h4>
              <span className="kpi-icon">🛠️</span>
            </div>
            <div className="kpi-body">
              <p className="kpi-value">{mantenimiento.toLocaleString()}</p>
              <span className="kpi-indicator indicator-down" style={{ opacity: 0 }}>
                -
              </span>
            </div>
          </div>

          <div className="analytic-panel kpi-card">
            <div className="kpi-header">
              <h4>Malos</h4>
              <span className="kpi-icon">🗑️</span>
            </div>
            <div className="kpi-body">
              <p className="kpi-value">{bajas.toLocaleString()}</p>
              <span className="kpi-indicator indicator-up" style={{ opacity: 0 }}>
                -
              </span>
            </div>
          </div>
        </section>

        {/* Sección de Gráficos Superiores */}
        <section className="analytics-dashboard-grid">

          {/* Gráfico 2: Distribución en Donut */}
          <div className="analytic-panel chart-card">
            <div className="chart-card-header">
              <h3>Estado General de Inventario</h3>
              <span className="kpi-icon">🔄</span>
            </div>
            <p className="chart-card-subtitle">Porcentaje de operatividad actual del sistema</p>
            <div className="chart-container">
              {/* SVG Donut */}
              <svg width="180" height="180" viewBox="0 0 100 100" className="donut-svg">
                {donutData.map((slice, index) => {
                  const dashArray = (slice.porcentaje / 100) * circunferenciaDonut;
                  const dashOffset = circunferenciaDonut - (acumuladorPorcentaje / 100) * circunferenciaDonut;
                  acumuladorPorcentaje += slice.porcentaje;

                  return (
                    <circle
                      key={slice.label}
                      cx="50"
                      cy="50"
                      r={radioDonut}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="20"
                      strokeDasharray={`${dashArray} ${circunferenciaDonut}`}
                      strokeDashoffset={dashOffset}
                      className={`donut-segment ${activeDonutIndex === index ? 'active' : ''}`}
                      onMouseEnter={() => setActiveDonutIndex(index)}
                      onMouseLeave={() => setActiveDonutIndex(null)}
                      style={{
                        stroke: activeDonutIndex === index ? slice.hoverColor : slice.color
                      }}
                    />
                  );
                })}
              </svg>

              {/* Texto en el Centro del Donut */}
              <div className="donut-center-text" style={{ position: 'absolute' }}>
                <span className="donut-center-val">
                  {activeDonutIndex !== null ? `${donutData[activeDonutIndex].porcentaje}%` : '85.7%'}
                </span>
                <span className="donut-center-lbl">
                  {activeDonutIndex !== null ? donutData[activeDonutIndex].label : 'Operativos'}
                </span>
              </div>

              {/* Leyenda Interactiva */}
              <div className="donut-legend">
                {donutData.map((slice, index) => (
                  <div
                    key={slice.label}
                    className={`legend-item ${activeDonutIndex === index ? 'active' : ''}`}
                    onMouseEnter={() => setActiveDonutIndex(index)}
                    onMouseLeave={() => setActiveDonutIndex(null)}
                  >
                    <span className="legend-color" style={{ backgroundColor: slice.color }}></span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{slice.label}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {slice.valor} ({slice.porcentaje}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sección Inferior: Mapa y Tabla */}
        <section className="second-dashboard-grid">
          {/* Mapa SVG de Estaciones INAMHI */}
          <div className="analytic-panel map-card">
            <div className="chart-card-header">
              <h3>Mapa de Estaciones de los Bienes</h3>
              <span className="kpi-icon">📍</span>
            </div>
            <p className="chart-card-subtitle">Ubicación de los departamentos y bodegas del INAMHI</p>

            <div className="ecuador-map-container">
              {/* Dibujo SVG de Ecuador de Alta Aesthetica y Estructurado */}
              <svg viewBox="0 0 350 350" className="map-svg">
                <defs>
                  {/* Patrón de Rejilla Tecnológica para Fondo */}
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Cuadrículas de fondo premium */}
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Silueta simplificada de las 4 regiones principales de Ecuador */}
                {/* Región Costa (Luz Azul Aqua) */}
                <path
                  d="M 50 80 Q 80 100 100 130 T 120 180 T 110 240 T 130 300 L 90 320 Q 70 280 60 250 T 40 210 T 50 150 Z"
                  fill="#e0f2fe"
                  stroke="#bae6fd"
                  strokeWidth="2"
                  className="map-province-path"
                >
                  <title>Región Costa</title>
                </path>

                {/* Región Sierra (Azul Intermedio) */}
                <path
                  d="M 100 130 Q 150 110 170 140 T 210 180 T 230 240 T 210 300 L 130 300 Q 110 240 120 180 Z"
                  fill="#bae6fd"
                  stroke="#7dd3fc"
                  strokeWidth="2"
                  className="map-province-path"
                >
                  <title>Región Sierra</title>
                </path>

      


                {/* Pines de Estaciones Meteorológicas */}
                {estaciones.map((est) => (
                  <g
                    key={est.id}
                    className={`map-pin-group ${selectedStationId === est.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStationId(est.id)}
                  >
                    <circle cx={est.coordenadas.x} cy={est.coordenadas.y} r="12" className="map-pin-pulse" />
                    <circle cx={est.coordenadas.x} cy={est.coordenadas.y} r="6" className="map-pin-core" />
                  </g>
                ))}
              </svg>

              {/* Panel Flotante de Información de la Estaci<n */}
              {estacionSeleccionada && (
                <div className="station-floating-panel">
                  <h4>{estacionSeleccionada.nombre}</h4>
                  <div className="station-stats-row">
                    <div className="station-stat-item">
                      <span>Total Activos:</span>
                      <strong>{estacionSeleccionada.activos}</strong>
                    </div>
                    <div className="station-stat-item">
                      <span>Buenos:</span>
                      <strong style={{ color: '#16a34a' }}>{estacionSeleccionada.operativos}</strong>
                    </div>
                    <div className="station-stat-item">
                      <span>Regulares:</span>
                      <strong style={{ color: '#d97706' }}>{estacionSeleccionada.mantenimiento}</strong>
                    </div>
                    <div className="station-stat-item">
                      <span>Malos:</span>
                      <strong style={{ color: '#ef4444' }}>{estacionSeleccionada.baja}</strong>
                    </div>
                  
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => navigate(`/inventario?ubicacion=${encodeURIComponent(estacionSeleccionada.nombre.replace('Estación ', ''))}`)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        💾 Ver Bienes de esta Estación →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Leyenda del Mapa */}
              <div className="map-legend">
                <div className="map-legend-item">
                  <span className="map-legend-dot" style={{ backgroundColor: '#0284c7' }}></span>
                  <span>Estación Meteorológica</span>
                </div>
                <div className="map-legend-item">
                  <span className="map-legend-dot" style={{ backgroundColor: '#16a34a' }}></span>
                  <span>Estación Seleccionada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Rendimiento y Salud de las Estaciones */}
          <div className="analytic-panel table-card">
            <div className="chart-card-header">
              <h3>Eficiencia por Estaciones</h3>
              <span className="kpi-icon">⚙️</span>
            </div>
            <p className="chart-card-subtitle">Lista comparativa de rendimiento técnico regional</p>

            <div className="table-responsive-wrapper">
              <table className="efficiency-table">
                <thead>
                  <tr>
                    <th>Estación</th>
                    <th>Bienes</th>
                    <th>Estado de Salud</th>
                  </tr>
                </thead>
                <tbody>
                  {estaciones.map((est) => {
                    // Determinar rango de salud para el estilo visual
                    let saludClass = 'buena';
                    let saludText = 'Buena';
                    if (est.salud >= 92) {
                      saludClass = 'excelente';
                      saludText = 'Excelente';
                    } else if (est.salud < 80) {
                      saludClass = 'critica';
                      saludText = 'Crítica';
                    }

                    return (
                      <tr
                        key={est.id}
                        style={{
                          backgroundColor: selectedStationId === est.id ? 'rgba(224, 242, 254, 0.4)' : 'transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedStationId(est.id)}
                        title={`Ver bienes de ${est.nombre}`}
                      >
                        <td
                          className="station-name-td"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {est.nombre.replace('Estación ', '')}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/inventario?ubicacion=${encodeURIComponent(est.nombre.replace('Estación ', ''))}`);
                            }}
                            title="Ver bienes de esta estación en inventario"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0ea5e9',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#e0f2fe')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            ↗️
                          </button>
                        </td>
                        <td>{est.activos}</td>
                        <td>
                          <div className="health-bar-container">
                            <div className="health-bar-bg">
                              <div
                                className={`health-bar-fill ${saludClass}`}
                                style={{ width: `${est.salud}%` }}
                              ></div>
                            </div>
                            <span className="health-percentage">{est.salud}%</span>
                            <span className={`badge-station-status ${saludClass}`} style={{ marginLeft: '5px' }}>
                              {saludText}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {/* Espaciador inferior para garantizar visibilidad en scroll completo */}
        <div style={{ height: '40px', width: '100%', flexShrink: 0 }} />
      </main>
    </div>
  );
}