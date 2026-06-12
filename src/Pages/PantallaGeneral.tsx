import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
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
  codigoAnterior?: string;
  codigoProvisional?: string;
  color?: string;
  material?: string;
  numActa?: string;
  observacion?: string;
}

export default function PantallaGeneral() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [notificacion, setNotificacion] = useState<{ tipo: 'excel' | 'pdf'; mensaje: string } | null>(null);
  const [toastContextual, setToastContextual] = useState<string | null>(null);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25);

  // Estados para Filtrado Avanzado
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  
  // Estados para Modal de Detalles del Bien
  const [bienSeleccionado, setBienSeleccionado] = useState<Bien | null>(null);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);

  const verDetallesBien = (bien: Bien) => {
    setBienSeleccionado(bien);
    setMostrarModalDetalles(true);
  };
  
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
  const isWriteUser = role === 'tecnico' || role === 'admin';

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

  // Resetear a la página 1 cuando cambien las búsquedas o filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filtroEstado, filtrosAplicados]);

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

      // Definir columnas con toda la información
      worksheet.columns = [
        { header: 'Código del Bien', key: 'codigoEsbye', width: 25 },
        { header: 'Código Anterior', key: 'codigoAnterior', width: 22 },
        { header: 'Código Provisional', key: 'codigoProvisional', width: 22 },
        { header: 'Nombre del Bien', key: 'nombreBien', width: 40 },
        { header: 'Serie', key: 'serie', width: 20 },
        { header: 'Modelo', key: 'modelo', width: 20 },
        { header: 'Marca', key: 'marca', width: 20 },
        { header: 'Color', key: 'color', width: 15 },
        { header: 'Material', key: 'material', width: 15 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Ubicación', key: 'ubicacion', width: 30 },
        { header: 'Custodio', key: 'custodio', width: 30 },
        { header: 'N-ACTA', key: 'numActa', width: 20 },
        { header: 'Observaciones', key: 'observacion', width: 45 }
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
          codigoAnterior: bien.codigoAnterior || 'SIN CÓDIGO',
          codigoProvisional: bien.codigoProvisional || 'SIN CÓDIGO',
          nombreBien: bien.nombreBien,
          serie: bien.serie || 'S/N',
          modelo: bien.modelo || 'S/M',
          marca: bien.marca,
          color: bien.color || 'S/C',
          material: bien.material || 'S/C',
          estado: bien.estado.toUpperCase(),
          ubicacion: bien.ubicacion,
          custodio: bien.custodio,
          numActa: bien.numActa || 'S/A',
          observacion: bien.observacion || ''
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
 
      // Tabla con información extendida para el PDF (ajustada con letra de tamaño 7)
      const tableData = bienesFiltrados.map(bien => [
        bien.codigoEsbye,
        bien.codigoAnterior || 'SIN CÓDIGO',
        bien.codigoProvisional || 'SIN CÓDIGO',
        bien.nombreBien,
        bien.serie || 'S/N',
        bien.modelo || 'S/M',
        bien.marca,
        bien.color || 'S/C',
        bien.material || 'S/C',
        bien.estado.toUpperCase(),
        bien.ubicacion,
        bien.custodio,
        bien.numActa || 'S/A'
      ]);
 
      autoTable(doc, {
        startY: 42,
        head: [['Código', 'Ant.', 'Prov.', 'Nombre del Bien', 'Serie', 'Modelo', 'Marca', 'Color', 'Mat.', 'Estado', 'Ubicación', 'Custodio', 'Acta']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 7, cellPadding: 2 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 9) {
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
        const idxCodigoAnterior = buscarIndice(['anterior', 'ant', 'previo', 'prev']);
        const idxCodigoProvisional = buscarIndice(['provisional', 'prov', 'temp']);
        const idxColor = buscarIndice(['color', 'tono']);
        const idxMaterial = buscarIndice(['material', 'compuesto']);
        const idxActa = buscarIndice(['acta', 'numacta', 'numeroacta', 'documento']);
        const idxObservacion = buscarIndice(['observacion', 'observaciones', 'nota', 'notas', 'detalle', 'detalles']);

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
          
          // Nuevos campos mapeados de forma dinámica
          const codigoAnterior = idxCodigoAnterior !== -1 && fila[idxCodigoAnterior] ? String(fila[idxCodigoAnterior]).trim() : 'SIN CÓDIGO';
          const codigoProvisional = idxCodigoProvisional !== -1 && fila[idxCodigoProvisional] ? String(fila[idxCodigoProvisional]).trim() : 'SIN CÓDIGO';
          const color = idxColor !== -1 && fila[idxColor] ? String(fila[idxColor]).trim() : 'S/C';
          const material = idxMaterial !== -1 && fila[idxMaterial] ? String(fila[idxMaterial]).trim() : 'S/C';
          const numActa = idxActa !== -1 && fila[idxActa] ? String(fila[idxActa]).trim() : 'S/A';
          const observacion = idxObservacion !== -1 && fila[idxObservacion] ? String(fila[idxObservacion]).trim() : '';

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
            estado,
            codigoAnterior,
            codigoProvisional,
            color,
            material,
            numActa,
            observacion
          });
        }

        if (nuevosBienes.length === 0) {
          alert('No se encontraron bienes válidos para importar en el archivo.');
          return;
        }

        // Reemplazar la lista actual de bienes con los nuevos importados del Excel
        setBienes(() => {
          localStorage.setItem('bienes_inamhi', JSON.stringify(nuevosBienes));
          return nuevosBienes;
        });

        // Limpiar búsquedas y filtros activos para que el usuario pueda ver los nuevos elementos inmediatamente
        setSearchTerm('');
        setFiltroEstado('todos');
        setFiltrosAplicados(initialFiltros);
        setFiltrosAvanzados(initialFiltros);
        setPaginaActual(1);

        alert(`¡Carga de inventario finalizada con éxito!\nSe importaron ${nuevosBienes.length} activos del archivo Excel (reemplazando el inventario anterior).`);
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

  // Obtener opciones únicas dinámicamente desde el inventario de bienes actual
  const marcasDisponibles = useMemo(() => {
    const marcasUnicas = new Set<string>();
    bienes.forEach(b => {
      if (b.marca && b.marca.trim()) {
        marcasUnicas.add(b.marca.trim());
      }
    });
    return Array.from(marcasUnicas).sort();
  }, [bienes]);

  const modelosDisponibles = useMemo(() => {
    const modelosUnicos = new Set<string>();
    bienes.forEach(b => {
      if (b.modelo && b.modelo.trim()) {
        modelosUnicos.add(b.modelo.trim());
      }
    });
    return Array.from(modelosUnicos).sort();
  }, [bienes]);

  const custodiosDisponibles = useMemo(() => {
    const custodiosUnicos = new Set<string>();
    bienes.forEach(b => {
      if (b.custodio && b.custodio.trim()) {
        custodiosUnicos.add(b.custodio.trim());
      }
    });
    return Array.from(custodiosUnicos).sort();
  }, [bienes]);

  const ubicacionesDisponibles = useMemo(() => {
    const ubicacionesUnicas = new Set<string>();
    bienes.forEach(b => {
      if (b.ubicacion && b.ubicacion.trim()) {
        ubicacionesUnicas.add(b.ubicacion.trim());
      }
    });
    return Array.from(ubicacionesUnicas).sort();
  }, [bienes]);

  // Filtrado y búsqueda reactiva
  const bienesFiltrados = useMemo(() => {
    return bienes.filter((bien) => {
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
  }, [bienes, searchTerm, filtroEstado, filtrosAplicados]);

  const totalPaginas = Math.ceil(bienesFiltrados.length / registrosPorPagina);

  const bienesPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    return bienesFiltrados.slice(inicio, fin);
  }, [bienesFiltrados, paginaActual, registrosPorPagina]);

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
              onClick={() => navigate(role === 'admin' ? '/admin' : '/')} 
              aria-label={role === 'admin' ? 'Volver a Dashboard' : 'Cerrar Sesión'}
              title={role === 'admin' ? 'Volver a Dashboard' : 'Cerrar Sesión'}
            >
              {role === 'admin' ? '←' : '🚪'}
            </button>
            <div className="header-titles">
              <h1>Inventario de Bienes</h1>
              <p>
                {role === 'admin'
                  ? 'Consulta general, filtrado y auditoría de activos institucionales (Acceso Administrador)'
                  : role === 'tecnico' 
                    ? 'Consulta general, registro y modificación de activos institucionales (Acceso Técnico)' 
                    : 'Consulta general y descarga de reportes autorizados (Acceso Consultor)'}
              </p>
              
              {(role === 'admin' || role === 'tecnico') && (
                <div className="header-nav-tabs" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button 
                    className="nav-tab active" 
                    type="button"
                    style={{
                      background: 'rgba(30, 136, 229, 0.1)',
                      color: '#1e88e5',
                      border: '1px solid rgba(30, 136, 229, 0.25)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    📦 Inventario de Bienes
                  </button>
                  <button 
                    className="nav-tab" 
                    type="button"
                    onClick={() => navigate('/analitica')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e2e8f0';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.color = '#64748b';
                    }}
                  >
                    📊 Analítica de Activos
                  </button>
                </div>
              )}
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
            {isWriteUser && (
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
              {bienesFiltrados.length > 0 ? (
                `Mostrando ${((paginaActual - 1) * registrosPorPagina) + 1} - ${Math.min(paginaActual * registrosPorPagina, bienesFiltrados.length)} de ${bienesFiltrados.length} registros`
              ) : (
                'Sin registros'
              )}
              {bienesFiltrados.length !== bienes.length && ` (filtrados de ${bienes.length} en total)`}
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
                  {isWriteUser && <th className="text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {bienesPaginados.length > 0 ? (
                  bienesPaginados.map((bien) => (
                    <tr 
                      key={bien.codigoEsbye} 
                      onClick={() => verDetallesBien(bien)}
                      style={{ cursor: 'pointer' }}
                      title="Haz clic para ver la información completa de este bien"
                    >
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
                      {isWriteUser && (
                        <td className="text-center">
                          <div className="action-buttons-cell">
                            <button
                              className="btn-table-action btn-edit-asset"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/registro-bien', { state: { bienAEditar: bien } });
                              }}
                              title="Editar registro"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-table-action btn-delete-asset"
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarBien(bien.codigoEsbye);
                              }}
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
                    <td colSpan={isWriteUser ? 7 : 6} className="no-data-cell">
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

          {/* Controles de Paginación */}
          {bienesFiltrados.length > 0 && (
            <div className="pagination-bar">
              <div className="pagination-info-select">
                <span className="pagination-select-label">Mostrar:</span>
                <select
                  value={registrosPorPagina}
                  onChange={(e) => {
                    setRegistrosPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  className="pagination-select"
                >
                  <option value={10}>10 registros</option>
                  <option value={25}>25 registros</option>
                  <option value={50}>50 registros</option>
                  <option value={100}>100 registros</option>
                </select>
              </div>

              {totalPaginas > 1 && (
                <div className="pagination-buttons">
                  <button
                    type="button"
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    className="btn-pagination btn-page-nav"
                    title="Primera página"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="btn-pagination btn-page-nav"
                    title="Página anterior"
                  >
                    ‹
                  </button>

                  {/* Páginas */}
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 1)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <div key={p} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {showEllipsis && <span className="pagination-ellipsis">...</span>}
                          <button
                            type="button"
                            onClick={() => setPaginaActual(p)}
                            className={`btn-pagination btn-page-num ${paginaActual === p ? 'active' : ''}`}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}

                  <button
                    type="button"
                    onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="btn-pagination btn-page-nav"
                    title="Siguiente página"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="btn-pagination btn-page-nav"
                    title="Última página"
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          )}
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
                  {marcasDisponibles.map(marca => (
                    <option key={marca} value={marca}>{marca}</option>
                  ))}
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
                  {modelosDisponibles.map(modelo => (
                    <option key={modelo} value={modelo}>{modelo}</option>
                  ))}
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
                  {custodiosDisponibles.map(custodio => (
                    <option key={custodio} value={custodio}>{custodio}</option>
                  ))}
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
                  {ubicacionesDisponibles.map(ubicacion => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                  ))}
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

      {/* Ventana Modal de Detalles del Bien */}
      {mostrarModalDetalles && bienSeleccionado && (
        <div className="modal-overlay" onClick={() => setMostrarModalDetalles(false)}>
          <div className="modal-panel solid-panel details-modal-panel" style={{ maxWidth: '650px', width: '100%', borderRadius: '25px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>📦</span>
                <h3>INFORMACIÓN COMPLETA DEL BIEN</h3>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={() => setMostrarModalDetalles(false)} 
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px', overflowY: 'auto', maxHeight: '70vh' }}>
              {/* Encabezado Rápido del Activo */}
              <div className="details-quick-header" style={{
                background: 'linear-gradient(135deg, rgba(30, 136, 229, 0.08), rgba(0, 210, 255, 0.04))',
                border: '1px solid rgba(30, 136, 229, 0.15)',
                padding: '16px 20px',
                borderRadius: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                    {bienSeleccionado.nombreBien}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Código ESBYE: <strong>{bienSeleccionado.codigoEsbye}</strong>
                  </span>
                </div>
                <span className={`badge-state badge-${bienSeleccionado.estado}`} style={{
                  fontSize: '0.85rem',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                }}>
                  {bienSeleccionado.estado === 'bueno' && '● Bueno'}
                  {bienSeleccionado.estado === 'regular' && '● Regular'}
                  {bienSeleccionado.estado === 'malo' && '● Malo'}
                </span>
              </div>

              {/* Grid de metadatos estructurados */}
              <div className="details-metadata-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '15px',
                textAlign: 'left'
              }}>
                {/* Bloque Identificación */}
                <div className="details-block" style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#0a4275', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔍 Identificación</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                    <p style={{ margin: 0 }}><strong>Código ESBYE:</strong> {bienSeleccionado.codigoEsbye}</p>
                    <p style={{ margin: 0 }}><strong>Código Anterior:</strong> {(bienSeleccionado as any).codigoAnterior || 'S/C'}</p>
                    <p style={{ margin: 0 }}><strong>Código Provisional:</strong> {(bienSeleccionado as any).codigoProvisional || 'S/C'}</p>
                    <p style={{ margin: 0 }}><strong>Nº de Serie:</strong> {bienSeleccionado.serie || 'S/N'}</p>
                  </div>
                </div>

                {/* Bloque Características */}
                <div className="details-block" style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#0a4275', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🛠️ Especificaciones</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                    <p style={{ margin: 0 }}><strong>Marca:</strong> {bienSeleccionado.marca || 'S/M'}</p>
                    <p style={{ margin: 0 }}><strong>Modelo:</strong> {bienSeleccionado.modelo || 'S/M'}</p>
                    <p style={{ margin: 0 }}><strong>Color:</strong> {(bienSeleccionado as any).color || 'S/C'}</p>
                    <p style={{ margin: 0 }}><strong>Material:</strong> {(bienSeleccionado as any).material || 'S/C'}</p>
                  </div>
                </div>

                {/* Bloque Asignación */}
                <div className="details-block" style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#0a4275', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👤 Asignación e Historial</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.88rem' }}>
                    <p style={{ margin: 0, gridColumn: 'span 2' }}><strong>Custodio Responsable:</strong> {bienSeleccionado.custodio || 'Sin Asignar'}</p>
                    <p style={{ margin: 0 }}><strong>Ubicación / Estación:</strong> {bienSeleccionado.ubicacion || 'Bodega Central'}</p>
                    <p style={{ margin: 0 }}><strong>Nº de Acta:</strong> {(bienSeleccionado as any).numActa || 'S/A'}</p>
                  </div>
                </div>
              </div>

              {/* Observaciones Adicionales */}
              <div className="details-observations-box" style={{
                marginTop: '15px',
                textAlign: 'left',
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                padding: '14px 18px',
                borderRadius: '12px'
              }}>
                <h5 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📌 Observaciones / Notas</h5>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350f', lineHeight: '1.4', fontStyle: 'italic' }}>
                  {(bienSeleccionado as any).observacion || 'Ninguna observación adicional registrada para este activo.'}
                </p>
              </div>
            </div>

            <div className="modal-actions-separator" style={{ margin: '0' }}></div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '15px 20px', background: '#f8fafc' }}>
              <button 
                type="button" 
                className="btn-modal-apply" 
                onClick={() => setMostrarModalDetalles(false)}
                style={{
                  background: '#0a4275',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(10,66,117,0.15)'
                }}
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
