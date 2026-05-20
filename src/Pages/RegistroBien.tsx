import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoNodos from '../components/FondoParticulas';
import '../styles/RegistroBien.css';

export default function RegistroBien() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Estados independientes para el formulario de activos
  const [formData, setFormData] = useState({
    nombreBien: '',
    codigoEsbye: '',
    codigoAnterior: '',
    codigoProvisional: '',
    serie: '',
    modelo: '',
    color: '',
    numActa: '',
    estado: 'bueno' as 'bueno' | 'regular' | 'malo',
    material: '',
    ubicacion: '',
    marca: '',
    custodio: '',
    observacion: ''
  });

  // Marcadores de inexistencia de códigos
  const [sinEsbye, setSinEsbye] = useState(false);
  const [sinAnterior, setSinAnterior] = useState(false);
  const [sinProvisional, setSinProvisional] = useState(false);

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

    // Simulación de respuesta y registro
    setTimeout(() => {
      setCargando(false);
      setAlerta({
        tipo: 'success',
        mensaje: '¡Bien institucional registrado exitosamente en el inventario!'
      });

      // Redirigir al inventario tras el retardo
      setTimeout(() => {
        navigate('/inventario');
      }, 2200);
    }, 1500);
  };

  return (
    <div className="registro-bien-container liquid-theme">
      {/* Fondo de partículas cibernéticas y luces */}
      <FondoNodos />
      <div className="ambient-light light-1"></div>
      <div className="ambient-light light-2"></div>

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

              {/* Modelo Desplegable */}
              <div className="input-group">
                <label htmlFor="modelo">Modelo</label>
                <select id="modelo" name="modelo" value={formData.modelo} onChange={manejarCambio} required disabled={cargando}>
                  <option value="">-- Seleccionar --</option>
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
                  <option value="Gris">Gris Técnico</option>
                  <option value="Negro">Negro Mate</option>
                  <option value="Blanco">Blanco Ártico</option>
                  <option value="Azul">Azul Institucional</option>
                  <option value="Plata">Plata / Metalizado</option>
                  <option value="Amarillo">Amarillo Seguridad</option>
                  <option value="Naranja">Naranja Óxido</option>
                </select>
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
                  <option value="">-- Seleccionar --</option>
                  <option value="Aluminio Anodizado">Aluminio Anodizado</option>
                  <option value="Acero Inoxidable 316">Acero Inoxidable 316</option>
                  <option value="Plástico ABS Reforzado">Plástico ABS Reforzado</option>
                  <option value="Vidrio Borosilicato">Vidrio Borosilicato</option>
                  <option value="Fibra de Vidrio">Fibra de Vidrio</option>
                  <option value="Policarbonato">Policarbonato</option>
                </select>
              </div>

              {/* Ubicacion Desplegable */}
              <div className="input-group">
                <label htmlFor="ubicacion">Ubicación / Estación</label>
                <select id="ubicacion" name="ubicacion" value={formData.ubicacion} onChange={manejarCambio} required disabled={cargando}>
                  <option value="">-- Seleccionar --</option>
                  <option value="Estación Iñaquito - Quito">Estación Iñaquito - Quito</option>
                  <option value="Estación Izobamba">Estación Izobamba</option>
                  <option value="Estación Tababela">Estación Tababela</option>
                  <option value="Estación Cotopaxi">Estación Cotopaxi</option>
                  <option value="Laboratorio de Calibración">Laboratorio de Calibración</option>
                  <option value="Estación El Labrador">Estación El Labrador</option>
                  <option value="Bodega Central INAMHI">Bodega Central INAMHI</option>
                </select>
              </div>
            </div>

            <div className="form-grid-three">
              {/* Custodio Desplegable */}
              <div className="input-group col-span-2">
                <label htmlFor="custodio">Custodio Responsable</label>
                <select id="custodio" name="custodio" value={formData.custodio} onChange={manejarCambio} required disabled={cargando}>
                  <option value="">-- Seleccionar --</option>
                  <option value="Ing. Carlos Mendoza">Ing. Carlos Mendoza (Analista Instrumentación)</option>
                  <option value="Tec. Mariana Silva">Tec. Mariana Silva (Técnico de Redes)</option>
                  <option value="Dra. Elena Rostova">Dra. Elena Rostova (Jefe de Laboratorio)</option>
                  <option value="Tec. Luis Narváez">Tec. Luis Narváez (Mantenimiento Estaciones)</option>
                  <option value="Ing. Diana Paredes">Ing. Diana Paredes (Especialista Hidrometría)</option>
                  <option value="Lic. Roberto Gómez">Lic. Roberto Gómez (Jefe de Activos Fijos)</option>
                </select>
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
