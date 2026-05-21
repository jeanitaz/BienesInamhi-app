import { useState, useEffect, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FondoClaro from '../components/FondoViento';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/PantallaGeneral.css';

interface Bien {
  codigoEsbye: string;
  nombreBien: string;
  marca: string;
  modelo?: string;
  serie?: string;
  custodio: string;
  ubicacion: string;
  estado: 'bueno' | 'regular' | 'malo';
}

export default function PantallaGeneral() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [notificacion, setNotificacion] = useState<{ tipo: 'excel' | 'pdf'; mensaje: string } | null>(null);
  const [toastContextual, setToastContextual] = useState<string | null>(null);

  // Estados para Filtrado Avanzado
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  
  interface FiltrosAvanzadosType {
    codigoEsbye: string;
    nombreBien: string;
    marca: string;
    modelo: string;
    serie: string;
    custodio: string;
    ubicacion: string;
    estado: string;
  }

  const initialFiltros: FiltrosAvanzadosType = {
    codigoEsbye: '',
    nombreBien: '',
    marca: 'todas',
    modelo: 'todos',
    serie: '',
    custodio: 'todos',
    ubicacion: 'todas',
    estado: 'todos',
  };

  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FiltrosAvanzadosType>(initialFiltros);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosAvanzadosType>(initialFiltros);

  // Obtener el rol del usuario (por defecto 'consultor' si no está definido)
  const [role] = useState(() => localStorage.getItem('userRole') || 'consultor');

  // Aplicar filtros contextuales desde URL al montar la página
  useEffect(() => {
    const estadoParam = searchParams.get('estado');
    const ubicacionParam = searchParams.get('ubicacion');
    const categoriaParam = searchParams.get('categoria');

    if (estadoParam && ['bueno', 'regular', 'malo'].includes(estadoParam)) {
      setFiltroEstado(estadoParam);
      setFiltrosAplicados(prev => ({ ...prev, estado: estadoParam }));
      setFiltrosAvanzados(prev => ({ ...prev, estado: estadoParam }));
      setToastContextual(`Mostrando bienes en estado: ${estadoParam.charAt(0).toUpperCase() + estadoParam.slice(1)}`);
    }
    if (ubicacionParam) {
      setSearchTerm(ubicacionParam);
      setToastContextual(`Filtrando bienes de: ${ubicacionParam}`);
    }
    if (categoriaParam) {
      setSearchTerm(categoriaParam);
      setToastContextual(`Mostrando categoría: ${categoriaParam.charAt(0).toUpperCase() + categoriaParam.slice(1)}`);
    }

    if (estadoParam || ubicacionParam || categoriaParam) {
      setTimeout(() => setToastContextual(null), 3500);
    }
  }, [searchParams]);

  const [bienes, setBienes] = useState<Bien[]>(() => {
    const guardados = localStorage.getItem('bienes_inamhi');
    if (guardados) {
      try {
        return JSON.parse(guardados);
      } catch (e) {
        console.error('Error al parsear bienes de localStorage:', e);
      }
    }
    const mockInicial: Bien[] = [];
    localStorage.setItem('bienes_inamhi', JSON.stringify(mockInicial));
    return mockInicial;
  });

  useEffect(() => {
    localStorage.setItem('bienes_inamhi', JSON.stringify(bienes));
  }, [bienes]);

  const manejarBusqueda = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const exportarAExcel = async () => {
    setNotificacion({ tipo: 'excel', mensaje: `Generando reporte Excel...` });
    
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventario INAMHI');
      
      // Estilos de cabecera
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }, // azul INAMHI
        alignment: { horizontal: 'center', vertical: 'middle' }
      } as const;

      // Definir columnas
      worksheet.columns = [
        { header: 'Código ESBYE', key: 'codigoEsbye', width: 20 },
        { header: 'Nombre del Bien', key: 'nombreBien', width: 40 },
        { header: 'Marca', key: 'marca', width: 20 },
        { header: 'Custodio', key: 'custodio', width: 30 },
        { header: 'Ubicación', key: 'ubicacion', width: 30 },
        { header: 'Estado', key: 'estado', width: 15 }
      ];

      // Aplicar estilos a la cabecera
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = headerStyle.font;
        cell.fill = headerStyle.fill as any;
        cell.alignment = headerStyle.alignment as any;
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      // Llenar datos
      bienesFiltrados.forEach((bien) => {
        const row = worksheet.addRow({
          codigoEsbye: bien.codigoEsbye,
          nombreBien: bien.nombreBien,
          marca: bien.marca,
          custodio: bien.custodio,
          ubicacion: bien.ubicacion,
          estado: bien.estado.toUpperCase()
        });

        // Colorear estado
        const estadoCell = row.getCell('estado');
        if (bien.estado === 'bueno') estadoCell.font = { color: { argb: 'FF16A34A' }, bold: true };
        if (bien.estado === 'regular') estadoCell.font = { color: { argb: 'FFD97706' }, bold: true };
        if (bien.estado === 'malo') estadoCell.font = { color: { argb: 'FFEF4444' }, bold: true };

        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'Inventario_INAMHI.xlsx');
      
      setNotificacion({ tipo: 'excel', mensaje: `¡Reporte EXCEL descargado con éxito!` });
      setTimeout(() => setNotificacion(null), 2500);
    } catch (error) {
      console.error(error);
      setNotificacion({ tipo: 'error' as any, mensaje: `Error al exportar a Excel` });
      setTimeout(() => setNotificacion(null), 2500);
    }
  };

  const exportarAPDF = () => {
    setNotificacion({ tipo: 'pdf', mensaje: `Generando reporte PDF...` });
    
    try {
      const doc = new jsPDF('landscape');
      
      // Título
      doc.setFontSize(18);
      doc.setTextColor(2, 132, 199);
      doc.text('Inventario de Bienes - INAMHI', 14, 22);
      
      // Fecha
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

      // Metadatos
      doc.text(`Total de registros: ${bienesFiltrados.length}`, 14, 36);

      // Tabla
      const tableData = bienesFiltrados.map(bien => [
        bien.codigoEsbye,
        bien.nombreBien,
        bien.marca,
        bien.custodio,
        bien.ubicacion,
        bien.estado.toUpperCase()
      ]);

      autoTable(doc, {
        startY: 42,
        head: [['Código ESBYE', 'Nombre del Bien', 'Marca', 'Custodio', 'Ubicación', 'Estado']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 5) {
            if (data.cell.raw === 'BUENO') data.cell.styles.textColor = [22, 163, 74];
            if (data.cell.raw === 'REGULAR') data.cell.styles.textColor = [217, 119, 6];
            if (data.cell.raw === 'MALO') data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      doc.save('Inventario_INAMHI.pdf');
      
      setNotificacion({ tipo: 'pdf', mensaje: `¡Reporte PDF descargado con éxito!` });
      setTimeout(() => setNotificacion(null), 2500);
    } catch (error) {
      console.error(error);
      setNotificacion({ tipo: 'error' as any, mensaje: `Error al exportar a PDF` });
      setTimeout(() => setNotificacion(null), 2500);
    }
  };

  const manejarImportarExcel = (e: ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;
    const archivo = archivos[0];

    const lector = new FileReader();
    lector.onload = (evento) => {
      try {
        const datosBinarios = evento.target?.result;
        if (!datosBinarios) return;

        const libro = XLSX.read(datosBinarios, { type: 'array' });
        const nombreHoja = libro.SheetNames[0];
        const hoja = libro.Sheets[nombreHoja];
        const filas = XLSX.utils.sheet_to_json<any>(hoja, { header: 1 });

        if (filas.length < 2) {
          alert('El archivo de Excel parece estar vacío o no contiene suficientes filas de datos.');
          return;
        }

        // Obtener la primera fila como nombres de columnas (headers)
        const cabeceras = (filas[0] as string[]).map(c => String(c).toLowerCase().trim());

        // Mapeador flexible de palabras clave
        const buscarIndice = (palabrasClave: string[]): number => {
          return cabeceras.findIndex(cabecera => 
            palabrasClave.some(pc => cabecera.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(pc))
          );
        };

        const idxEsbye = buscarIndice(['esbye', 'codigo', 'cod', 'identificador']);
        const idxNombre = buscarIndice(['nombre', 'descripcion', 'bien', 'articulo', 'equipo']);
        const idxMarca = buscarIndice(['marca', 'brand']);
        const idxModelo = buscarIndice(['modelo', 'model']);
        const idxSerie = buscarIndice(['serie', 'serial', 'sn']);
        const idxCustodio = buscarIndice(['custodio', 'responsable', 'usuario', 'empleado']);
        const idxUbicacion = buscarIndice(['ubicacion', 'estacion', 'oficina', 'lugar']);
        const idxEstado = buscarIndice(['estado', 'status', 'condicion']);

        if (idxNombre === -1) {
          alert('No pudimos identificar la columna para el "Nombre del Bien". Asegúrate de que tu Excel tenga un encabezado adecuado como "Nombre", "Descripción" o "Bien".');
          return;
        }

        const nuevosBienes: Bien[] = [];
        // Empezar desde la fila 1 (la primera con datos reales)
        for (let i = 1; i < filas.length; i++) {
          const fila = filas[i] as any[];
          if (!fila || fila.length === 0) continue;

          // Extraer campos con valores por defecto si no existen
          const codigoEsbye = idxEsbye !== -1 && fila[idxEsbye] ? String(fila[idxEsbye]).trim() : `ESBYE-${Date.now()}-${i}`;
          const nombreBien = idxNombre !== -1 && fila[idxNombre] ? String(fila[idxNombre]).trim() : '';
          
          // Saltar filas que no tengan nombre del bien
          if (!nombreBien) continue;

          const marca = idxMarca !== -1 && fila[idxMarca] ? String(fila[idxMarca]).trim() : 'Genérico';
          const modelo = idxModelo !== -1 && fila[idxModelo] ? String(fila[idxModelo]).trim() : 'S/M';
          const serie = idxSerie !== -1 && fila[idxSerie] ? String(fila[idxSerie]).trim() : 'S/N';
          const custodio = idxCustodio !== -1 && fila[idxCustodio] ? String(fila[idxCustodio]).trim() : 'Sin Asignar';
          const ubicacion = idxUbicacion !== -1 && fila[idxUbicacion] ? String(fila[idxUbicacion]).trim() : 'Bodega Central';
          
          // Mapear estado a 'bueno' | 'regular' | 'malo'
          let estadoRaw = idxEstado !== -1 && fila[idxEstado] ? String(fila[idxEstado]).toLowerCase().trim() : 'bueno';
          let estado: 'bueno' | 'regular' | 'malo' = 'bueno';
          if (estadoRaw.includes('malo') || estadoRaw.includes('dañado') || estadoRaw.includes('baja') || estadoRaw.includes('mal')) {
            estado = 'malo';
          } else if (estadoRaw.includes('reg') || estadoRaw.includes('regular') || estadoRaw.includes('mantenimiento') || estadoRaw.includes('daño')) {
            estado = 'regular';
          }

          nuevosBienes.push({
            codigoEsbye,
            nombreBien,
            marca,
            modelo,
            serie,
            custodio,
            ubicacion,
            estado
          });
        }

        if (nuevosBienes.length === 0) {
          alert('No se encontraron bienes válidos para importar en el archivo.');
          return;
        }

        // Unir bienes actuales con los importados sin duplicar Código Esbye
        setBienes(prev => {
          const codigosExistentes = new Set(prev.map(b => b.codigoEsbye));
          const filtradosNuevos = nuevosBienes.filter(b => !codigosExistentes.has(b.codigoEsbye));
          const listaActualizada = [...prev, ...filtradosNuevos];
          localStorage.setItem('bienes_inamhi', JSON.stringify(listaActualizada));
          return listaActualizada;
        });

        alert(`¡Carga de inventario finalizada con éxito!\nSe importaron ${nuevosBienes.length} activos reales al sistema.`);
      } catch (err) {
        console.error('Error al procesar el archivo Excel:', err);
        alert('Ocurrió un error al intentar leer el archivo de Excel. Asegúrate de que sea un archivo válido (.xlsx, .xls o .csv).');
      }
    };

    lector.readAsArrayBuffer(archivo);
    // Limpiar input de archivo para poder volver a seleccionar el mismo si se requiere
    e.target.value = '';
  };

  const eliminarBien = (codigo: string) => {
    if (confirm(`¿Está seguro de que desea dar de baja o eliminar el bien con código ${codigo}?`)) {
      setBienes((prev) => prev.filter((b) => b.codigoEsbye !== codigo));
    }
  };

  // Filtrado y búsqueda reactiva
  const bienesFiltrados = bienes.filter((bien) => {
    // 1. Búsqueda rápida
    const campoBusqueda = searchTerm.toLowerCase().trim();
    const cumpleBusqueda =
      !campoBusqueda ||
      bien.codigoEsbye.toLowerCase().includes(campoBusqueda) ||
      bien.nombreBien.toLowerCase().includes(campoBusqueda) ||
      bien.marca.toLowerCase().includes(campoBusqueda) ||
      bien.custodio.toLowerCase().includes(campoBusqueda) ||
      bien.ubicacion.toLowerCase().includes(campoBusqueda);

    // 2. Filtro rápido por estado (sincronizado con la barra)
    const cumpleEstado = filtroEstado === 'todos' || bien.estado === filtroEstado;

    // 3. Filtros Avanzados Aplicados
    const cumpleCodigoAvanzado = !filtrosAplicados.codigoEsbye.trim() || 
      bien.codigoEsbye.toLowerCase().includes(filtrosAplicados.codigoEsbye.toLowerCase().trim());
      
    const cumpleNombreAvanzado = !filtrosAplicados.nombreBien.trim() || 
      bien.nombreBien.toLowerCase().includes(filtrosAplicados.nombreBien.toLowerCase().trim());
      
    const cumpleMarcaAvanzado = filtrosAplicados.marca === 'todas' || 
      bien.marca.toLowerCase() === filtrosAplicados.marca.toLowerCase();
      
    const cumpleModeloAvanzado = filtrosAplicados.modelo === 'todos' || 
      (bien.modelo && bien.modelo.toLowerCase() === filtrosAplicados.modelo.toLowerCase());
      
    const cumpleSerieAvanzado = !filtrosAplicados.serie.trim() || 
      (bien.serie && bien.serie.toLowerCase().includes(filtrosAplicados.serie.toLowerCase().trim()));
      
    const cumpleCustodioAvanzado = filtrosAplicados.custodio === 'todos' || 
      bien.custodio.toLowerCase() === filtrosAplicados.custodio.toLowerCase();
      
    const cumpleUbicacionAvanzado = filtrosAplicados.ubicacion === 'todas' || 
      bien.ubicacion.toLowerCase() === filtrosAplicados.ubicacion.toLowerCase();

    const cumpleEstadoAvanzado = filtrosAplicados.estado === 'todos' || 
      bien.estado.toLowerCase() === filtrosAplicados.estado.toLowerCase();

    return cumpleBusqueda && 
      cumpleEstado && 
      cumpleCodigoAvanzado && 
      cumpleNombreAvanzado && 
      cumpleMarcaAvanzado && 
      cumpleModeloAvanzado && 
      cumpleSerieAvanzado && 
      cumpleCustodioAvanzado && 
      cumpleUbicacionAvanzado && 
      cumpleEstadoAvanzado;
  });

  const seleccionarFiltroEstado = (estado: string) => {
    setFiltroEstado(estado);
    setFiltrosAplicados(prev => ({ ...prev, estado }));
    setFiltrosAvanzados(prev => ({ ...prev, estado }));
  };

  const aplicarFiltrosAvanzados = () => {
    setFiltrosAplicados(filtrosAvanzados);
    setFiltroEstado(filtrosAvanzados.estado);
    setMostrarFiltrosAvanzados(false);
  };

  const limpiarFiltrosAvanzados = () => {
    setFiltrosAvanzados(initialFiltros);
    setFiltrosAplicados(initialFiltros);
    setFiltroEstado('todos');
    setMostrarFiltrosAvanzados(false);
  };

  return (
    <div className="pantalla-general-layout light-theme">
      {/* Fondo de líneas animadas sutiles en tono claro */}
      <FondoClaro />

      {/* Toast contextual de navegación desde otra vista */}
      {toastContextual && (
        <div className="toast-notification notification-excel" style={{ background: 'rgba(14, 165, 233, 0.95)', borderLeft: '4px solid #0284c7' }}>
          <span className="toast-icon">🔗</span>
          <p>{toastContextual}</p>
        </div>
      )}

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

            {/* Botón de Filtrado Avanzado */}
            <button
              className="btn-advanced-toggle"
              type="button"
              onClick={() => setMostrarFiltrosAvanzados(true)}
              title="Abrir filtros avanzados"
            >
              <span className="filter-icon">🎛️</span> Filtrado Avanzado
            </button>

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
                onClick={() => seleccionarFiltroEstado('todos')}
              >
                Todos
              </button>
              <button
                className={`filter-pill pill-bueno ${filtroEstado === 'bueno' ? 'active' : ''}`}
                onClick={() => seleccionarFiltroEstado('bueno')}
              >
                Bueno
              </button>
              <button
                className={`filter-pill pill-regular ${filtroEstado === 'regular' ? 'active' : ''}`}
                onClick={() => seleccionarFiltroEstado('regular')}
              >
                Regular
              </button>
              <button
                className={`filter-pill pill-malo ${filtroEstado === 'malo' ? 'active' : ''}`}
                onClick={() => seleccionarFiltroEstado('malo')}
              >
                Malo
              </button>
            </div>

            {/* Descarga e Importación de Reportes */}
            <div className="export-buttons-group">
              <span className="export-label">Inventario:</span>
              <input
                type="file"
                id="excel-import-input"
                accept=".xlsx,.xls,.csv"
                onChange={manejarImportarExcel}
                style={{ display: 'none' }}
              />
              <button 
                className="btn-export btn-import-excel" 
                onClick={() => document.getElementById('excel-import-input')?.click()}
                title="Importar inventario desde un archivo Excel o CSV"
                type="button"
              >
                <span className="icon-excel">📥</span> Importar Excel
              </button>
              
              <span className="export-label" style={{ marginLeft: '12px' }}>Reportes:</span>
              <button className="btn-export btn-excel" onClick={exportarAExcel} type="button">
                <span className="icon-excel">📊</span> Exportar Excel
              </button>
              <button className="btn-export btn-pdf" onClick={exportarAPDF} type="button">
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
                          {bien.estado === 'bueno' && '● Bueno'}
                          {bien.estado === 'regular' && '● Regular'}
                          {bien.estado === 'malo' && '● Malo'}
                        </span>
                      </td>
                      {role === 'tecnico' && (
                        <td className="text-center">
                          <div className="action-buttons-cell">
                            <button
                              className="btn-table-action btn-edit-asset"
                              onClick={() => navigate('/registro-bien', { state: { bienAEditar: bien } })}
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

      {/* Ventana Modal de Filtrado Avanzado */}
      {mostrarFiltrosAvanzados && (
        <div className="modal-overlay" onClick={() => setMostrarFiltrosAvanzados(false)}>
          <div className="modal-panel solid-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>FILTRADO AVANZADO</h3>
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={() => setMostrarFiltrosAvanzados(false)} 
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body-grid">
              {/* Código Esbye */}
              <div className="modal-input-group">
                <label>Código Esbye:</label>
                <input 
                  type="text" 
                  placeholder="Filtrar por código..." 
                  value={filtrosAvanzados.codigoEsbye}
                  onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, codigoEsbye: e.target.value }))}
                />
              </div>

              {/* Nombre */}
              <div className="modal-input-group">
                <label>Nombre:</label>
                <input 
                  type="text" 
                  placeholder="Filtrar por nombre..." 
                  value={filtrosAvanzados.nombreBien}
                  onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, nombreBien: e.target.value }))}
                />
              </div>

              {/* Marca */}
              <div className="modal-input-group">
                <label>Marca:</label>
                <select 
                  value={filtrosAvanzados.marca}
                  onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, marca: e.target.value }))}
                >
                  <option value="todas">Todas</option>
                  <option value="Campbell Scientific">Campbell Scientific</option>
                  <option value="Davis Instruments">Davis Instruments</option>
                  <option value="RM Young">RM Young</option>
                  <option value="Lufft">Lufft</option>
                  <option value="Panasonic">Panasonic</option>
                  <option value="Kipp & Zonen">Kipp & Zonen</option>
                  <option value="Rotronic">Rotronic</option>
                  <option value="Vaisala">Vaisala</option>
                  <option value="Sutron">Sutron</option>
                </select>
              </div>

              {/* Modelo */}
              <div className="modal-input-group">
                <label>Modelo:</label>
                <select 
                  value={filtrosAvanzados.modelo}
                  onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, modelo: e.target.value }))}
                >
                  <option value="todos">Todos</option>
                  <option value="CR1000X">Campbell CR1000X</option>
                  <option value="CR300">Campbell CR300</option>
                  <option value="Vantage Pro2">Vantage Pro2 Digital</option>
                  <option value="Model 05103">RM Young 05103 Wind</option>
                  <option value="Toughbook CF-33">Panasonic CF-33</option>
                  <option value="Toughbook FZ-G2">Panasonic FZ-G2</option>
                  <option value="HP2000">Lufft HP2000 Baro</option>
                  <option value="CMP11">Piranómetro CMP11</option>
                  <option value="HC2A-S">Termohigrómetro HC2A-S</option>
                  <option value="WXT536">Vaisala WXT536 Multi</option>
                </select>
              </div>

              {/* Serie */}
              <div className="modal-input-group">
                <label>Serie:</label>
                <input 
                  type="text" 
                  placeholder="Filtrar por serie..." 
                  value={filtrosAvanzados.serie}
                  onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, serie: e.target.value }))}
                />
              </div>

              {/* Custodio */}
              <div className="modal-input-group">
                <label>Custodio:</label>
                <select 
                  value={filtrosAvanzados.custodio}
                  onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, custodio: e.target.value }))}
                >
                  <option value="todos">Todos</option>
                  <option value="Ing. Carlos Mendoza">Ing. Carlos Mendoza</option>
                  <option value="Tec. Mariana Silva">Tec. Mariana Silva</option>
                  <option value="Dra. Elena Rostova">Dra. Elena Rostova</option>
                  <option value="Tec. Luis Narváez">Tec. Luis Narváez</option>
                  <option value="Ing. Diana Paredes">Ing. Diana Paredes</option>
                  <option value="Lic. Roberto Gómez">Lic. Roberto Gómez</option>
                </select>
              </div>

              {/* Ubicación */}
              <div className="modal-input-group">
                <label>Ubicación:</label>
                <select 
                  value={filtrosAvanzados.ubicacion}
                  onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, ubicacion: e.target.value }))}
                >
                  <option value="todas">Todas</option>
                  <option value="Estación Iñaquito - Quito">Estación Iñaquito - Quito</option>
                  <option value="Estación Izobamba">Estación Izobamba</option>
                  <option value="Estación Tababela">Estación Tababela</option>
                  <option value="Estación Cotopaxi">Estación Cotopaxi</option>
                  <option value="Laboratorio de Calibración">Laboratorio de Calibración</option>
                  <option value="Estación El Labrador">Estación El Labrador</option>
                  <option value="Bodega Central INAMHI">Bodega Central INAMHI</option>
                  <option value="Departamento de Mantenimiento">Departamento de Mantenimiento</option>
                </select>
              </div>

              {/* Estado */}
              <div className="modal-input-group">
                <label>Estado:</label>
                <select 
                  value={filtrosAvanzados.estado}
                  onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, estado: e.target.value }))}
                >
                  <option value="todos">Todos</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="malo">Malo</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-separator"></div>

            <div className="modal-actions">
              <button type="button" className="btn-modal-clear" onClick={limpiarFiltrosAvanzados}>
                Limpiar Todo
              </button>
              <button type="button" className="btn-modal-apply" onClick={aplicarFiltrosAvanzados}>
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
