import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoNodos from '../components/FondoParticulas';
import '../styles/CreacionUsuarios.css'; // Reusamos los estilos de la ventana de creación

export default function ListaUsuarios() {
  const navigate = useNavigate();
  const [usuariosLista, setUsuariosLista] = useState<any[]>([]);

  useEffect(() => {
    try {
      const guardados = localStorage.getItem('usuarios_inamhi');
      if (guardados) {
        setUsuariosLista(JSON.parse(guardados));
      }
    } catch (e) {}
  }, []);

  return (
    <div className="creacion-usuarios-container liquid-theme">
      <FondoNodos />
      <div className="ambient-light light-1"></div>
      <div className="ambient-light light-2"></div>

      <div className="centered-wrapper" style={{ maxWidth: '1000px' }}>
        <div className="creacion-usuarios-card liquid-glass">
          {/* Botón para volver al Dashboard */}
          <button
            type="button"
            className="btn-back-admin"
            onClick={() => navigate('/admin')}
            aria-label="Volver al panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span>Volver</span>
          </button>

          <div className="logo-container logo-layout">
            <h1 className="main-title">Listado de Usuarios</h1>
            <p className="subtitle">Visualiza y gestiona los accesos al sistema</p>
          </div>

          <div className="usuarios-lists-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
            {/* Técnicos */}
            <div className="list-section">
              <h3 style={{ color: '#0284c7', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', borderBottom: '2px solid rgba(2, 132, 199, 0.2)', paddingBottom: '10px' }}>
                <span>🛠️</span> Técnicos Autorizados
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {usuariosLista.filter(u => u.rol === 'tecnico').length === 0 && (
                  <li style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No hay técnicos registrados.</li>
                )}
                {usuariosLista.filter(u => u.rol === 'tecnico').map(u => (
                  <li key={u.id} style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.15rem' }}>{u.nombreCompleto}</div>
                    <div style={{ fontSize: '0.95rem', color: '#475569' }}><strong>Usuario:</strong> {u.usuario}</div>
                    <div style={{ marginTop: '5px' }}>
                      <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', display: 'inline-block', fontWeight: '700', backgroundColor: u.activo ? '#dcfce7' : '#fee2e2', color: u.activo ? '#166534' : '#991b1b' }}>
                        {u.activo ? '● ACTIVO' : '○ INACTIVO'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Consultores */}
            <div className="list-section">
              <h3 style={{ color: '#10b981', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', borderBottom: '2px solid rgba(16, 185, 129, 0.2)', paddingBottom: '10px' }}>
                <span>🔍</span> Consultores de Lectura
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {usuariosLista.filter(u => u.rol === 'consultor').length === 0 && (
                  <li style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No hay consultores registrados.</li>
                )}
                {usuariosLista.filter(u => u.rol === 'consultor').map(u => (
                  <li key={u.id} style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.15rem' }}>{u.nombreCompleto}</div>
                    <div style={{ fontSize: '0.95rem', color: '#475569' }}><strong>Usuario:</strong> {u.usuario}</div>
                    <div style={{ marginTop: '5px' }}>
                      <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', display: 'inline-block', fontWeight: '700', backgroundColor: u.activo ? '#dcfce7' : '#fee2e2', color: u.activo ? '#166534' : '#991b1b' }}>
                        {u.activo ? '● ACTIVO' : '○ INACTIVO'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
