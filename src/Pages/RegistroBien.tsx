import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FondoClaro from '../components/FondoViento';
import '../styles/RegistroBien.css';

export default function RegistroBien() {
  const navigate = useNavigate();
  const location = useLocation();
  const bienAEditar = location.state?.bienAEditar;

  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Función genérica para obtener opciones únicas
  const getOpcionesUnicas = (campo: string, opcionesPorDefecto: string[]) => {
    try {
      const guardados = localStorage.getItem('bienes_inamhi');
      if (guardados) {
        const bienes = JSON.parse(guardados);
        const unicos = Array.from(new Set(bienes.map((b: any) => b[campo]))) as string[];
        const validos = unicos.filter(v => v && v !== 'Otro' && v !== 'Sin Asignar' && v !== 'S/M' && v !== 'Genérico');
        return validos.length > 0 ? validos : opcionesPorDefecto;
      }
    } catch (e) {}
    return opcionesPorDefecto;
  };

  const custodiosGuardados = getOpcionesUnicas('custodio', ['Ing. Carlos Mendoza', 'Tec. Mariana Silva']);
  const marcasGuardadas = getOpcionesUnicas('marca', ['Campbell Scientific', 'Davis Instruments', 'RM Young', 'Lufft', 'Panasonic', 'Kipp & Zonen', 'Rotronic', 'Vaisala', 'Sutron']);
  const modelosGuardados = getOpcionesUnicas('modelo', ['CR1000X', 'CR300', 'Vantage Pro2', 'Model 05103', 'Toughbook CF-33', 'Toughbook FZ-G2', 'HP2000', 'CMP11', 'HC2A-S', 'WXT536']);
  const coloresGuardados = getOpcionesUnicas('color', ['Gris', 'Negro', 'Blanco', 'Azul', 'Plata', 'Amarillo', 'Naranja']);
  const materialesGuardados = ['Plástico', 'Metal', 'Madera'];
  const ubicacionesGuardadas = getOpcionesUnicas('ubicacion', ['Estación Iñaquito - Quito', 'Estación Izobamba', 'Estación Tababela', 'Estación Cotopaxi', 'Laboratorio de Calibración', 'Estación El Labrador', 'Bodega Central INAMHI']);

  const checkCustom = (val: string | undefined, list: string[]) => val ? !list.includes(val) : false;

  const esCustodioCustom = checkCustom(bienAEditar?.custodio, custodiosGuardados);
  const esMarcaCustom = checkCustom(bienAEditar?.marca, marcasGuardadas);
  const esModeloCustom = checkCustom(bienAEditar?.modelo, modelosGuardados);
  const esColorCustom = checkCustom(bienAEditar?.color, coloresGuardados);
  const esMaterialCustom = checkCustom(bienAEditar?.material, materialesGuardados);
  const esUbicacionCustom = checkCustom(bienAEditar?.ubicacion, ubicacionesGuardadas);

  const [custodioOtro, setCustodioOtro] = useState(esCustodioCustom ? bienAEditar.custodio : '');
  const [marcaOtro, setMarcaOtro] = useState(esMarcaCustom ? bienAEditar.marca : '');
  const [modeloOtro, setModeloOtro] = useState(esModeloCustom ? bienAEditar.modelo : '');
  const [colorOtro, setColorOtro] = useState(esColorCustom ? bienAEditar.color : '');
  const [materialOtro, setMaterialOtro] = useState(esMaterialCustom ? bienAEditar.material : '');
  const [ubicacionOtro, setUbicacionOtro] = useState(esUbicacionCustom ? bienAEditar.ubicacion : '');

  // Estados independientes para el formulario de activos
  const [formData, setFormData] = useState({
    nombreBien: bienAEditar?.nombreBien || '',
    codigoEsbye: bienAEditar?.codigoEsbye || '',
    codigoAnterior: bienAEditar?.codigoAnterior || '',
    codigoProvisional: bienAEditar?.codigoProvisional || '',
    serie: bienAEditar?.serie || '',
    modelo: esModeloCustom ? 'Otro' : (bienAEditar?.modelo || ''),
    color: esColorCustom ? 'Otro' : (bienAEditar?.color || ''),
    numActa: bienAEditar?.numActa || '',
    estado: (bienAEditar?.estado || 'bueno') as 'bueno' | 'regular' | 'malo',
    material: esMaterialCustom ? 'Otro' : (bienAEditar?.material || ''),
    ubicacion: esUbicacionCustom ? 'Otro' : (bienAEditar?.ubicacion || ''),
    marca: esMarcaCustom ? 'Otro' : (bienAEditar?.marca || ''),
    custodio: esCustodioCustom ? 'Otro' : (bienAEditar?.custodio || ''),
    observacion: bienAEditar?.observacion || ''
  });

  // Marcadores de inexistencia de códigos
  const [sinEsbye, setSinEsbye] = useState(bienAEditar?.codigoEsbye?.startsWith('SIN-') || bienAEditar?.codigoEsbye === 'SIN CÓDIGO' || false);
  const [sinAnterior, setSinAnterior] = useState(bienAEditar?.codigoAnterior === 'SIN CÓDIGO' || false);
  const [sinProvisional, setSinProvisional] = useState(bienAEditar?.codigoProvisional === 'SIN CÓDIGO' || false);

  // Expresión regular para validar formato del código provisional (e.g. TICS-GD-0000)
  const regexProvisional = /^[A-Z]{4}-[A-Z]{2}-\d{4}$/;

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const seleccionarEstado = (estado: 'bueno' | 'regular' | 'malo') => {
    setFormData((prev) => ({
      ...prev,
      estado
    }));
  };

  const manejarEnvio = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlerta(null);

    // Validar nombre del bien
    if (formData.nombreBien.trim().length < 3) {
      setAlerta({
        tipo: 'error',
        mensaje: 'El nombre del bien debe tener al menos 3 caracteres.'
      });
      return;
    }

    // Validaciones de códigos obligatorios si no están marcados como inexistentes
    if (!sinEsbye && !formData.codigoEsbye.trim()) {
      setAlerta({
        tipo: 'error',
        mensaje: 'Debe ingresar el código ESBYE o marcar que no dispone de uno.'
      });
      return;
    }

    if (!sinAnterior && !formData.codigoAnterior.trim()) {
      setAlerta({
        tipo: 'error',
        mensaje: 'Debe ingresar el código anterior o marcar que no dispone de uno.'
      });
      return;
    }

    if (!sinProvisional) {
      if (!formData.codigoProvisional.trim()) {
        setAlerta({
          tipo: 'error',
          mensaje: 'Debe ingresar el código provisional o marcar que no dispone de uno.'
        });
        return;
      }
      if (!regexProvisional.test(formData.codigoProvisional.trim())) {
        setAlerta({
          tipo: 'error',
          mensaje: 'El código provisional no cumple con el formato requerido. Ejemplo: TICS-GD-0000'
        });
        return;
      }
    }

    setCargando(true);
    console.log('Registrando nuevo bien institucional:', {
      ...formData,
      codigoEsbye: sinEsbye ? 'SIN CÓDIGO' : formData.codigoEsbye,
      codigoAnterior: sinAnterior ? 'SIN CÓDIGO' : formData.codigoAnterior,
      codigoProvisional: sinProvisional ? 'SIN CÓDIGO' : formData.codigoProvisional
    });

    // Persistir el nuevo bien en localStorage
    const nuevoBien = {
      codigoEsbye: sinEsbye ? (bienAEditar?.codigoEsbye || `SIN-CODIGO-${Date.now()}`) : formData.codigoEsbye.trim(),
      nombreBien: formData.nombreBien.trim(),
      marca: formData.marca === 'Otro' ? marcaOtro.trim() : formData.marca.trim() || 'Genérico',
      modelo: formData.modelo === 'Otro' ? modeloOtro.trim() : formData.modelo.trim() || 'S/M',
      serie: formData.serie.trim() || 'S/N',
      color: formData.color === 'Otro' ? colorOtro.trim() : formData.color.trim(),
      material: formData.material === 'Otro' ? materialOtro.trim() : formData.material.trim(),
      custodio: formData.custodio === 'Otro' ? custodioOtro.trim() : formData.custodio.trim() || 'Sin Asignar',
      ubicacion: formData.ubicacion === 'Otro' ? ubicacionOtro.trim() : formData.ubicacion.trim() || 'Bodega Central',
      estado: formData.estado,
      codigoAnterior: sinAnterior ? 'SIN CÓDIGO' : formData.codigoAnterior.trim(),
      codigoProvisional: sinProvisional ? 'SIN CÓDIGO' : formData.codigoProvisional.trim(),
      numActa: formData.numActa.trim() || 'S/A',
      observacion: formData.observacion.trim()
    };

    try {
      const guardados = localStorage.getItem('bienes_inamhi');
      let listaBienes: any[] = guardados ? JSON.parse(guardados) : [];
      
      if (bienAEditar) {
        const index = listaBienes.findIndex(b => b.codigoEsbye === bienAEditar.codigoEsbye);
        if (index !== -1) {
          listaBienes[index] = { ...listaBienes[index], ...nuevoBien };
        } else {
          listaBienes.push(nuevoBien);
        }
      } else {
        listaBienes.push(nuevoBien);
      }
      
      localStorage.setItem('bienes_inamhi', JSON.stringify(listaBienes));
    } catch (e) {
      console.error('Error al persistir bien en localStorage:', e);
    }

    // Simulación de respuesta y registro
    setTimeout(() => {
      setCargando(false);
      setAlerta({
        tipo: 'success',
        mensaje: bienAEditar ? '¡Bien actualizado exitosamente!' : '¡Bien institucional registrado exitosamente en el inventario!'
      });

      // Redirigir al inventario tras el retardo
      setTimeout(() => {
        navigate('/inventario');
      }, 2200);
    }, 1500);
  };

  return (
    <div className="registro-bien-container light-theme">
      {/* Fondo de partículas dinámico sutil y elegante en tono claro */}
      <FondoClaro />

      <div className="centered-wrapper">
        <div className="registro-bien-card liquid-glass">
          {/* Botón Volver al Inventario */}
          <button
            type="button"
            className="btn-back-general"
            onClick={() => navigate('/inventario')}
            aria-label="Volver al inventario"
            disabled={cargando}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span>Volver al Inventario</span>
          </button>

          <div className="logo-container logo-layout">
            <img src="/logo-inamhi.png" alt="INAMHI" className="inamhi-logo-liquid" />
          </div>

          <h2 className="card-title">
            Registro de <span className="text-gradient-aqua">Bienes</span>
          </h2>
          <p className="card-subtitle">Ingreso de activos y equipamiento técnico institucional</p>

          {/* Banner de Alerta */}
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

          <form onSubmit={manejarEnvio} className="registro-form">
            {/* --- SECCIÓN 1: IDENTIFICACIÓN Y CÓDIGOS --- */}
            <h3 className="section-title">🔍 Identificación del Bien</h3>
            <div className="form-grid-three">
              {/* Código ESBYE */}
              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="codigoEsbye">Código ESBYE</label>
                  <label className="checkbox-marker">
                    <input
                      type="checkbox"
                      checked={sinEsbye}
                      onChange={(e) => {
                        setSinEsbye(e.target.checked);
                        if (e.target.checked) {
                          setFormData((prev) => ({ ...prev, codigoEsbye: '' }));
                        }
                      }}
                    />
                    <span>No tiene</span>
                  </label>
                </div>
                <input
                  type="text"
                  id="codigoEsbye"
                  name="codigoEsbye"
                  placeholder={sinEsbye ? "(No aplica)" : "ej. ESBYE-2026-089"}
                  value={formData.codigoEsbye}
                  onChange={manejarCambio}
                  disabled={sinEsbye || cargando}
                  required={!sinEsbye}
                />
              </div>

              {/* Código Anterior */}
              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="codigoAnterior">Código Anterior</label>
                  <label className="checkbox-marker">
                    <input
                      type="checkbox"
                      checked={sinAnterior}
                      onChange={(e) => {
                        setSinAnterior(e.target.checked);
                        if (e.target.checked) {
                          setFormData((prev) => ({ ...prev, codigoAnterior: '' }));
                        }
                      }}
                    />
                    <span>No tiene</span>
                  </label>
                </div>
                <input
                  type="text"
                  id="codigoAnterior"
                  name="codigoAnterior"
                  placeholder={sinAnterior ? "(No aplica)" : "ej. COD-ANT-8742"}
                  value={formData.codigoAnterior}
                  onChange={manejarCambio}
                  disabled={sinAnterior || cargando}
                  required={!sinAnterior}
                />
              </div>

              {/* Código Provisional */}
              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="codigoProvisional">Código Provisional</label>
                  <label className="checkbox-marker">
                    <input
                      type="checkbox"
                      checked={sinProvisional}
                      onChange={(e) => {
                        setSinProvisional(e.target.checked);
                        if (e.target.checked) {
                          setFormData((prev) => ({ ...prev, codigoProvisional: '' }));
                        }
                      }}
                    />
                    <span>No tiene</span>
                  </label>
                </div>
                <input
                  type="text"
                  id="codigoProvisional"
                  name="codigoProvisional"
                  placeholder={sinProvisional ? "(No aplica)" : "TICS-GD-0000"}
                  value={formData.codigoProvisional}
                  onChange={manejarCambio}
                  disabled={sinProvisional || cargando}
                  required={!sinProvisional}
                />
                {!sinProvisional && formData.codigoProvisional && (
                  <span className={`format-helper ${regexProvisional.test(formData.codigoProvisional) ? 'text-success' : 'text-danger'}`}>
                    {regexProvisional.test(formData.codigoProvisional) ? '✓ Formato correcto' : '✗ Debe ser ej. TICS-GD-0000'}
                  </span>
                )}
              </div>
            </div>

            {/* --- SECCIÓN 2: DESCRIPCIÓN DEL ACTIVO --- */}
            <h3 className="section-title">📝 Descripción y Detalles</h3>
            <div className="form-grid-three">
              {/* Nombre del Bien */}
              <div className="input-group col-span-2">
                <label htmlFor="nombreBien">Nombre del Bien / Descripción</label>
                <input
                  type="text"
                  id="nombreBien"
                  name="nombreBien"
                  placeholder="ej. Estación Meteorológica Automática Digital"
                  value={formData.nombreBien}
                  onChange={manejarCambio}
                  required
                  disabled={cargando}
                />
              </div>

              {/* Marca Desplegable */}
              <div className="input-group">
                <label htmlFor="marca">Marca</label>
                <select id="marca" name="marca" value={formData.marca} onChange={manejarCambio} required disabled={cargando}>
                  <option value="">-- Seleccionar --</option>
                  {marcasGuardadas.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                  <option value="Otro">Otro...</option>
                </select>
                {formData.marca === 'Otro' && (
                  <input
                    type="text"
                    style={{ marginTop: '10px' }}
                    placeholder="Escriba la nueva marca"
                    value={marcaOtro}
                    onChange={(e) => setMarcaOtro(e.target.value)}
                    required
                    disabled={cargando}
                  />
                )}
              </div>

              {/* Modelo Desplegable */}
              <div className="input-group">
                <label htmlFor="modelo">Modelo</label>
                <select id="modelo" name="modelo" value={formData.modelo} onChange={manejarCambio} required disabled={cargando}>
                  <option value="">-- Seleccionar --</option>
                  {modelosGuardados.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                  <option value="Otro">Otro...</option>
                </select>
                {formData.modelo === 'Otro' && (
                  <input
                    type="text"
                    style={{ marginTop: '10px' }}
                    placeholder="Escriba el nuevo modelo"
                    value={modeloOtro}
                    onChange={(e) => setModeloOtro(e.target.value)}
                    required
                    disabled={cargando}
                  />
                )}
              </div>

              {/* Serie */}
              <div className="input-group">
                <label htmlFor="serie">Nº de Serie</label>
                <input
                  type="text"
                  id="serie"
                  name="serie"
                  placeholder="ej. S/N 98542-C"
                  value={formData.serie}
                  onChange={manejarCambio}
                  required
                  disabled={cargando}
                />
              </div>

              {/* Color Desplegable */}
              <div className="input-group">
                <label htmlFor="color">Color</label>
                <select id="color" name="color" value={formData.color} onChange={manejarCambio} required disabled={cargando}>
                  <option value="">-- Seleccionar --</option>
                  {coloresGuardados.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                  <option value="Otro">Otro...</option>
                </select>
                {formData.color === 'Otro' && (
                  <input
                    type="text"
                    style={{ marginTop: '10px' }}
                    placeholder="Escriba el nuevo color"
                    value={colorOtro}
                    onChange={(e) => setColorOtro(e.target.value)}
                    required
                    disabled={cargando}
                  />
                )}
              </div>
            </div>

            {/* --- SECCIÓN 3: CONTROL ADQUISICIÓN Y ESTADO --- */}
            <h3 className="section-title">📊 Control y Estado Operativo</h3>
            <div className="form-grid-three">
              {/* N de Acta */}
              <div className="input-group">
                <label htmlFor="numActa">Nº de Acta</label>
                <input
                  type="text"
                  id="numActa"
                  name="numActa"
                  placeholder="ej. ACTA-2026-004-IN"
                  value={formData.numActa}
                  onChange={manejarCambio}
                  required
                  disabled={cargando}
                />
              </div>

              {/* Material Desplegable */}
              <div className="input-group">
                <label htmlFor="material">Material</label>
                <select id="material" name="material" value={formData.material} onChange={manejarCambio} required disabled={cargando}>
                  <option value="">Seleccione...</option>
                  {materialesGuardados.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                  <option value="Otro">OTRO</option>
                </select>
                {formData.material === 'Otro' && (
                  <input
                    type="text"
                    style={{ marginTop: '10px' }}
                    placeholder="Escriba el nuevo material"
                    value={materialOtro}
                    onChange={(e) => setMaterialOtro(e.target.value)}
                    required
                    disabled={cargando}
                  />
                )}
              </div>

              {/* Ubicacion Desplegable */}
              <div className="input-group">
                <label htmlFor="ubicacion">Ubicación / Estación</label>
                <select id="ubicacion" name="ubicacion" value={formData.ubicacion} onChange={manejarCambio} required disabled={cargando}>
                  <option value="">-- Seleccionar --</option>
                  {ubicacionesGuardadas.map((u, idx) => (
                    <option key={idx} value={u}>{u}</option>
                  ))}
                  <option value="Otro">Otro...</option>
                </select>
                {formData.ubicacion === 'Otro' && (
                  <input
                    type="text"
                    style={{ marginTop: '10px' }}
                    placeholder="Escriba la nueva ubicación"
                    value={ubicacionOtro}
                    onChange={(e) => setUbicacionOtro(e.target.value)}
                    required
                    disabled={cargando}
                  />
                )}
              </div>
            </div>

            <div className="form-grid-three">
              {/* Custodio Desplegable */}
              <div className="input-group col-span-2">
                <label htmlFor="custodio">Custodio Responsable</label>
                <select id="custodio" name="custodio" value={formData.custodio} onChange={manejarCambio} required disabled={cargando}>
                  <option value="">-- Seleccionar --</option>
                  {custodiosGuardados.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                  <option value="Otro">Otro...</option>
                </select>
                
                {formData.custodio === 'Otro' && (
                  <input
                    type="text"
                    style={{ marginTop: '10px' }}
                    placeholder="Escriba el nombre del nuevo custodio"
                    value={custodioOtro}
                    onChange={(e) => setCustodioOtro(e.target.value)}
                    required
                    disabled={cargando}
                  />
                )}
              </div>

              {/* Estado Físico del Bien (Bueno, Regular, Malo) */}
              <div className="input-group">
                <label>Estado del Bien</label>
                <div className="estados-badge-grid">
                  <div
                    className={`estado-badge-card bueno ${formData.estado === 'bueno' ? 'active' : ''}`}
                    onClick={() => !cargando && seleccionarEstado('bueno')}
                  >
                    <span className="estado-dot">●</span>
                    <span className="estado-text">Bueno</span>
                  </div>

                  <div
                    className={`estado-badge-card regular ${formData.estado === 'regular' ? 'active' : ''}`}
                    onClick={() => !cargando && seleccionarEstado('regular')}
                  >
                    <span className="estado-dot">●</span>
                    <span className="estado-text">Regular</span>
                  </div>

                  <div
                    className={`estado-badge-card malo ${formData.estado === 'malo' ? 'active' : ''}`}
                    onClick={() => !cargando && seleccionarEstado('malo')}
                  >
                    <span className="estado-dot">●</span>
                    <span className="estado-text">Malo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="input-group">
              <label htmlFor="observacion">Observaciones / Notas Adicionales</label>
              <textarea
                id="observacion"
                name="observacion"
                placeholder="Describa brevemente cualquier particularidad, estado del sensor, empaquetado o calibración pendiente del bien..."
                value={formData.observacion}
                onChange={manejarCambio}
                disabled={cargando}
                rows={3}
              />
            </div>

            {/* Botones de acción */}
            <div className="form-actions-row">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/inventario')}
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
                  'Registrar Bien'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
