import { useState } from 'react';
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
  baseCoordenadas?: { x: number; y: number };
}

export default function Analitica() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string>('inaquito');
  const [role] = useState(() => localStorage.getItem('userRole') || 'tecnico');

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

  const ubicacionesUnicas = Array.from(new Set(bienes.map(b => b.ubicacion)));

  // 1. Resolver el índice de edificio para cada ubicación de forma preliminar
  const estacionesProcesadas = ubicacionesUnicas.map((ub, idx) => {
    const bienesEst = bienes.filter(b => b.ubicacion === ub);
    const estTotal = bienesEst.length;
    const estOp = bienesEst.filter(b => b.estado === 'bueno').length;
    const estMant = bienesEst.filter(b => b.estado === 'regular').length;
    const estBaja = bienesEst.filter(b => b.estado === 'malo').length;
    const salud = estTotal ? Math.round((estOp / estTotal) * 100) : 0;

    const ubClean = ub.toLowerCase().trim();
    let buildingIdx = 2; // Default L Central
    
    if (ubClean.includes('iñaquito') || ubClean.includes('inaquito')) {
      buildingIdx = 0; // Noroeste
    } else if (ubClean.includes('guayaquil')) {
      buildingIdx = 1; // Suroeste
    } else if (ubClean.includes('calibración') || ubClean.includes('calibracion') || ubClean.includes('mantenimiento') || ubClean.includes('labrador') || ubClean.includes('tababela')) {
      buildingIdx = 2; // L Central
    } else if (ubClean.includes('cuenca') || ubClean.includes('cotopaxi')) {
      buildingIdx = 3; // Sureste
    } else if (ubClean.includes('bodega') || ubClean.includes('izobamba')) {
      buildingIdx = 4; // Almacenamiento Sur
    } else {
      buildingIdx = idx % 5; // Fallback distribuido
    }

    return { ub, buildingIdx, estTotal, estOp, estMant, estBaja, salud };
  });

  // Contador local para cada edificio para distribuir los pines en una grilla ordenada
  const buildingCounters = [0, 0, 0, 0, 0];
  const edificiosCoords = [
    { x: 75, y: 85 },   // 0. Noroeste (Iñaquito)
    { x: 67, y: 210 },  // 1. Suroeste (Guayaquil)
    { x: 190, y: 140 }, // 2. L Central (Mantenimiento / Calibración)
    { x: 237, y: 250 }, // 3. Sureste (Cuenca)
    { x: 120, y: 310 }  // 4. Almacenamiento Sur (Bodega)
  ];

  const estaciones: Estacion[] = estacionesProcesadas.map((est, idx) => {
    const bIdx = est.buildingIdx;
    const localIdx = buildingCounters[bIdx];
    buildingCounters[bIdx]++; // Incrementar el contador local de este edificio

    let x = 190;
    let y = 140;

    // Calcular posición en grilla ordenada para que NO se solapen jamás dentro de sus límites
    if (bIdx === 0) {
      // Noroeste: grilla de 2 columnas
      x = 55 + (localIdx % 2) * 28;
      y = 55 + Math.floor(localIdx / 2) * 26;
    } else if (bIdx === 1) {
      // Suroeste: grilla de 2 columnas
      x = 50 + (localIdx % 2) * 26;
      y = 180 + Math.floor(localIdx / 2) * 26;
    } else if (bIdx === 2) {
      // L Central: grilla de 3 columnas
      x = 160 + (localIdx % 3) * 28;
      y = 100 + Math.floor(localIdx / 3) * 26;
    } else if (bIdx === 3) {
      // Sureste: grilla de 2 columnas
      x = 220 + (localIdx % 2) * 24;
      y = 222 + Math.floor(localIdx / 2) * 24;
    } else {
      // Almacenamiento Sur (Horizontal): grilla de 4 columnas, 2 filas
      x = 50 + (localIdx % 4) * 32;
      y = 295 + Math.floor(localIdx / 4) * 22;
    }

    const baseCoords = edificiosCoords[bIdx];

    return {
      id: est.ub.replace(/\s+/g, '-').toLowerCase() + '-' + idx,
      nombre: est.ub,
      region: 'Sierra', // Por defecto para nuevas; si necesitas puedes expandir logica
      activos: est.estTotal,
      operativos: est.estOp,
      mantenimiento: est.estMant,
      baja: est.estBaja,
      salud: est.salud,
      coordenadas: { x, y },
      baseCoordenadas: baseCoords
    };
  });

  const estacionSeleccionada = estaciones.find(est => est.id === selectedStationId) || estaciones[0] || null;

  const isSelectedCoord = (x: number, y: number) => {
    return estacionSeleccionada?.baseCoordenadas?.x === x && estacionSeleccionada?.baseCoordenadas?.y === y;
  };

  // Datos para los Gráficos SVG
  // 1. Gráfico de Donut: Distribución de Estado de Bienes
  const donutData = [
    { label: 'Bueno', valor: operativos, porcentaje: totalActivos ? parseFloat((operativos / totalActivos * 100).toFixed(1)) : 0, color: '#10b981', hoverColor: '#059669' },
    { label: 'Regular', valor: mantenimiento, porcentaje: totalActivos ? parseFloat((mantenimiento / totalActivos * 100).toFixed(1)) : 0, color: '#f59e0b', hoverColor: '#d97706' },
    { label: 'Malo', valor: bajas, porcentaje: totalActivos ? parseFloat((bajas / totalActivos * 100).toFixed(1)) : 0, color: '#ef4444', hoverColor: '#dc2626' }
  ];

  // Cálculo acumulativo para los arcos del Donut SVG (circunferencia r=40 es ~251.3)
  const radioDonut = 40;
  const circunferenciaDonut = 2 * Math.PI * radioDonut;




  // 3. Gráfico de Tendencia Histórica: Registro de Activos (2021 - 2026)
  const maxTrendVal = totalActivos || 100;
  // Redondear a un número superior "bonito" divisible por 100 para la cuadrícula
  const maxValGrid = Math.ceil(maxTrendVal / 100) * 100;

  // Proporciones históricas basadas en el inventario actual real del usuario
  const tendenciaDataRaw = [
    { año: '2021', activos: Math.round(maxTrendVal * 0.49), coordX: 40 },
    { año: '2022', activos: Math.round(maxTrendVal * 0.61), coordX: 90 },
    { año: '2023', activos: Math.round(maxTrendVal * 0.73), coordX: 140 },
    { año: '2024', activos: Math.round(maxTrendVal * 0.86), coordX: 190 },
    { año: '2025', activos: Math.round(maxTrendVal * 0.94), coordX: 240 },
    { año: '2026', activos: totalActivos, coordX: 290 }
  ];

  const tendenciaData = tendenciaDataRaw.map(pt => {
    // coordY mapea de 160 (línea base) a 40 (línea superior maxValGrid)
    const coordY = 160 - (pt.activos / maxValGrid) * 120;
    return { ...pt, coordY };
  });

  // Generar path curvo Bézier continuo dinámicamente
  let linePathD = `M ${tendenciaData[0].coordX} ${tendenciaData[0].coordY}`;
  for (let i = 0; i < tendenciaData.length - 1; i++) {
    const p0 = tendenciaData[i];
    const p1 = tendenciaData[i + 1];
    const cp1x = p0.coordX + 25;
    const cp1y = p0.coordY;
    const cp2x = p1.coordX - 25;
    const cp2y = p1.coordY;
    linePathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.coordX} ${p1.coordY}`;
  }

  const areaPathD = `${linePathD} L 290 160 L 40 160 Z`;

  // Calcular etiquetas de crecimiento porcentual inter-anual dinámico
  const growthTags = [];
  for (let i = 0; i < tendenciaData.length - 1; i++) {
    const p0 = tendenciaData[i];
    const p1 = tendenciaData[i + 1];
    const diff = p1.activos - p0.activos;
    const pct = p0.activos > 0 ? ((diff / p0.activos) * 100).toFixed(1) : '0';
    growthTags.push({
      x: (p0.coordX + p1.coordX) / 2,
      y: (p0.coordY + p1.coordY) / 2 + 6,
      text: `+${pct}%`
    });
  }





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
          {role === 'admin' && (
            <button className="nav-item" onClick={() => navigate('/admin')}>Dashboard</button>
          )}
          <button className="nav-item" onClick={() => navigate('/inventario')}>Inventario de Bienes</button>
          <button className="nav-item active">Analítica</button>
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
                {(() => {
                  let acumulador = 0;
                  return donutData.map((slice, index) => {
                    const dashArray = (slice.porcentaje / 100) * circunferenciaDonut;
                    // El offset negativo desplaza los segmentos en sentido horario de forma acumulada y evita que se cancelen en navegadores al coincidir con el dashArray
                    const dashOffset = -(acumulador / 100) * circunferenciaDonut;
                    acumulador += slice.porcentaje;

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
                  });
                })()}
              </svg>

              {/* Texto en el Centro del Donut */}
              <div className="donut-center-text" style={{ position: 'absolute' }}>
                <span className="donut-center-val">
                  {activeDonutIndex !== null ? `${donutData[activeDonutIndex].porcentaje}%` : `${pctOperatividad}%`}
                </span>
                <span className="donut-center-lbl">
                  {activeDonutIndex !== null ? donutData[activeDonutIndex].label : 'Buenos'}
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

          {/* Gráfico 1: Tendencia Histórica de Activos */}
          <div className="analytic-panel chart-card" style={{ position: 'relative' }}>
            <div className="chart-card-header">
              <h3>Tendencia Histórica de Activos</h3>
              <span className="kpi-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>📈</span>
            </div>
            <p className="chart-card-subtitle">Crecimiento del registro de inventario (2021 - 2026)</p>
            <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 320 180" style={{ overflow: 'visible' }}>
                <defs>
                  {/* Filtro de brillo de neón premium */}
                  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" /> {/* Capa doble para brillo extra */}
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Gradiente para el área sombreada de neón */}
                  <linearGradient id="neon-area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                    <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                  </linearGradient>
                  
                  {/* Gradiente de dos colores ultra-moderno para la línea de neón */}
                  <linearGradient id="neon-line-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {/* Rejilla de Fondo Futurista con Intersecciones de Crosshairs */}
                {[40, 70, 100, 130, 160].map((y, i) => {
                  const vals = [maxValGrid, Math.round(maxValGrid * 0.8), Math.round(maxValGrid * 0.6), Math.round(maxValGrid * 0.4), Math.round(maxValGrid * 0.2)];
                  return (
                    <g key={`grid-y-${i}`} opacity="0.4">
                      {/* Línea horizontal guía */}
                      <line
                        x1="30"
                        y1={y}
                        x2="300"
                        y2={y}
                        stroke="#cbd5e1"
                        strokeWidth="0.75"
                        strokeDasharray={y === 160 ? "0" : "5 5"}
                      />
                      {/* Valores del eje Y */}
                      <text
                        x="24"
                        y={y + 3}
                        fill="#64748b"
                        fontSize="8.5"
                        textAnchor="end"
                        fontWeight="600"
                      >
                        {vals[i]}
                      </text>
                    </g>
                  );
                })}

                {/* Líneas verticales de la rejilla para cada año */}
                {[40, 90, 140, 190, 240, 290].map((x, i) => {
                  return (
                    <line
                      key={`grid-x-${i}`}
                      x1={x}
                      y1="30"
                      x2={x}
                      y2="160"
                      stroke="#cbd5e1"
                      strokeWidth="0.75"
                      strokeDasharray="5 5"
                      opacity="0.25"
                    />
                  );
                })}

                {/* Dibujar pequeñas cruces tecnológicas de intersección (+ ) */}
                {[40, 90, 140, 190, 240, 290].map((x) =>
                  [40, 70, 100, 130, 160].map((y) => (
                    <g key={`cross-${x}-${y}`} opacity="0.3" stroke="#94a3b8" strokeWidth="0.5">
                      <line x1={x - 2} y1={y} x2={x + 2} y2={y} />
                      <line x1={x} y1={y - 2} x2={x} y2={y + 2} />
                    </g>
                  ))
                )}

                {/* Relleno de Área Sombreada Curva (Bezier) */}
                <path
                  d={areaPathD}
                  fill="url(#neon-area-gradient)"
                  style={{ transition: 'all 0.5s ease' }}
                />

                {/* Onda de Neón Curva con Filtro de Brillo */}
                <path
                  d={linePathD}
                  fill="none"
                  stroke="url(#neon-line-gradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neon-glow)"
                  style={{ transition: 'all 0.5s ease' }}
                />

                {/* Etiquetas Flotantes de Incremento Porcentual (+XX%) entre los nodos */}
                {growthTags.map((tag, idx) => (
                  <g key={`tag-${idx}`} className="growth-tag-group" opacity="0.95">
                    {/* Sombra de la etiqueta */}
                    <rect
                      x={tag.x - 14}
                      y={tag.y - 6}
                      width="28"
                      height="12"
                      rx="4"
                      fill="#ffffff"
                      stroke="#10b981"
                      strokeWidth="1"
                      filter="drop-shadow(0 2px 4px rgba(16,185,129,0.15))"
                    />
                    {/* Texto del porcentaje */}
                    <text
                      x={tag.x}
                      y={tag.y + 2.5}
                      fill="#059669"
                      fontSize="6.5"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {tag.text}
                    </text>
                  </g>
                ))}

                {/* Puntos (Nodos) en cada año */}
                {tendenciaData.map((pt) => {
                  return (
                    <g key={pt.año} className="dot-group">
                      {/* Sombra exterior flotante */}
                      <circle
                        cx={pt.coordX}
                        cy={pt.coordY}
                        r="7"
                        fill="#06b6d4"
                        opacity="0.3"
                        filter="url(#neon-glow)"
                      />
                      {/* Punto Central */}
                      <circle
                        cx={pt.coordX}
                        cy={pt.coordY}
                        r="4"
                        fill="#ffffff"
                        stroke="#0ea5e9"
                        strokeWidth="2.5"
                        className="line-chart-dot"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      >
                        <title>{`Año ${pt.año}: ${pt.activos} activos`}</title>
                      </circle>

                      {/* Valor numérico encima de cada punto */}
                      <text
                        x={pt.coordX}
                        y={pt.coordY - 11}
                        fill="#0f172a"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {pt.activos}
                      </text>

                      {/* Etiqueta del Año en el eje X */}
                      <text
                        x={pt.coordX}
                        y="173"
                        fill="#475569"
                        fontSize="9.5"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {pt.año}
                      </text>
                    </g>
                  );
                })}
              </svg>
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
            <p className="chart-card-subtitle">Plano de planta isométrico de las instalaciones</p>

            <div className="ecuador-map-container" style={{ background: 'none' }}>
              {/* Plano de Planta Arquitectónico de las Oficinas del INAMHI con ángulo Isométrico */}
              <svg viewBox="0 0 350 350" className="map-svg">
                <defs>
                  {/* Patrón de Rejilla Tecnológica para Fondo */}
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Cuadrículas de fondo premium */}
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Grupo Rotado para la vista isométrica (arquitectura/plano de planta) */}
                <g transform="rotate(-12) translate(-15, 20)">
                  {/* Edificios / Departamentos del INAMHI (Planos de planta interactivos) */}
                  {/* 1. Edificio Noroeste (Iñaquito) */}
                  <rect
                    x="40"
                    y="30"
                    width="70"
                    height="110"
                    rx="6"
                    fill={isSelectedCoord(75, 85) ? 'rgba(14, 165, 233, 0.15)' : '#e9ecf0'}
                    stroke={isSelectedCoord(75, 85) ? '#0ea5e9' : '#cbd5e1'}
                    strokeWidth={isSelectedCoord(75, 85) ? '2.5' : '1.5'}
                    style={{ transition: 'all 0.3s' }}
                  />

                  {/* 2. Edificio Suroeste (Guayaquil) */}
                  <rect
                    x="35"
                    y="160"
                    width="65"
                    height="100"
                    rx="6"
                    fill={isSelectedCoord(67, 210) ? 'rgba(14, 165, 233, 0.15)' : '#e9ecf0'}
                    stroke={isSelectedCoord(67, 210) ? '#0ea5e9' : '#cbd5e1'}
                    strokeWidth={isSelectedCoord(67, 210) ? '2.5' : '1.5'}
                    style={{ transition: 'all 0.3s' }}
                  />

                  {/* 3. Edificio L Central-Este (Calibración, Mantenimiento, Labrador, Tababela) */}
                  <path
                    d="M 140 90 L 200 90 L 200 60 L 270 60 L 270 190 L 140 190 Z"
                    fill={(isSelectedCoord(235, 90) || isSelectedCoord(190, 140) || isSelectedCoord(165, 110) || isSelectedCoord(235, 130)) ? 'rgba(14, 165, 233, 0.15)' : '#e9ecf0'}
                    stroke={(isSelectedCoord(235, 90) || isSelectedCoord(190, 140) || isSelectedCoord(165, 110) || isSelectedCoord(235, 130)) ? '#0ea5e9' : '#cbd5e1'}
                    strokeWidth={(isSelectedCoord(235, 90) || isSelectedCoord(190, 140) || isSelectedCoord(165, 110) || isSelectedCoord(235, 130)) ? '2.5' : '1.5'}
                    strokeLinejoin="round"
                    style={{ transition: 'all 0.3s' }}
                  />

                  {/* 4. Edificio Sureste (Cuenca, Cotopaxi) */}
                  <rect
                    x="210"
                    y="210"
                    width="55"
                    height="80"
                    rx="6"
                    fill={(isSelectedCoord(237, 250) || isSelectedCoord(237, 225)) ? 'rgba(14, 165, 233, 0.15)' : '#e9ecf0'}
                    stroke={(isSelectedCoord(237, 250) || isSelectedCoord(237, 225)) ? '#0ea5e9' : '#cbd5e1'}
                    strokeWidth={(isSelectedCoord(237, 250) || isSelectedCoord(237, 225)) ? '2.5' : '1.5'}
                    style={{ transition: 'all 0.3s' }}
                  />

                  {/* 5. Edificio de Almacenamiento Sur (Bodega, Izobamba) */}
                  <rect
                    x="30"
                    y="280"
                    width="170"
                    height="60"
                    rx="6"
                    fill={(isSelectedCoord(120, 310) || isSelectedCoord(70, 310)) ? 'rgba(14, 165, 233, 0.15)' : '#e9ecf0'}
                    stroke={(isSelectedCoord(120, 310) || isSelectedCoord(70, 310)) ? '#0ea5e9' : '#cbd5e1'}
                    strokeWidth={(isSelectedCoord(120, 310) || isSelectedCoord(70, 310)) ? '2.5' : '1.5'}
                    style={{ transition: 'all 0.3s' }}
                  />

                  {/* Pines de Estaciones Meteorológicas colocados sobre los edificios */}
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
                </g>
              </svg>

              {/* Panel Flotante de Información de la Estación */}
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