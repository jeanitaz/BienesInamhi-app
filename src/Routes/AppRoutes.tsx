import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../Pages/Home';
import Login from '../Pages/Login';
import Admin from '../Pages/Admin';
import CreacionUsuarios from '../Pages/CreacionUsuarios';
import PantallaGeneral from '../Pages/PantallaGeneral';
import RegistroBien from '../Pages/RegistroBien';
import Analitica from '../Pages/Analitica';
import ListaUsuarios from '../Pages/ListaUsuarios';
import ContraUsu from '../Pages/ContraUsu';
import NotFound from '../Pages/NotFound';

// Guardián de Rutas Protegidas
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const role = localStorage.getItem('userRole');
  
  if (!role) {
    // Si no ha iniciado sesión, se le envía a la pantalla 404
    return <Navigate to="/404" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Si no está autorizado para este rol específico, se le envía a la pantalla 404
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/contra-usu" element={<ContraUsu />} />
      <Route path="/404" element={<NotFound />} />

      {/* Rutas Protegidas de Administración y Dashboard (Acceso exclusivo: admin) */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas Protegidas de Inventario de Bienes (Acceso: admin, tecnico, consultor) */}
      <Route 
        path="/inventario" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico', 'consultor']}>
            <PantallaGeneral />
          </ProtectedRoute>
        } 
      />

      {/* Rutas Protegidas de Registro de Bienes (Acceso: admin y tecnico) */}
      <Route 
        path="/registro-bien" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
            <RegistroBien />
          </ProtectedRoute>
        } 
      />

      {/* Rutas Protegidas de Analítica (Acceso: admin y tecnico) */}
      <Route 
        path="/analitica" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
            <Analitica />
          </ProtectedRoute>
        } 
      />

      {/* Rutas Protegidas Exclusivas del Administrador (Creación y Listado de Usuarios) */}
      <Route 
        path="/creacion-usuarios" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreacionUsuarios />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/lista-usuarios" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ListaUsuarios />
          </ProtectedRoute>
        } 
      />

      {/* Comodín redirige cualquier ruta desconocida al 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

