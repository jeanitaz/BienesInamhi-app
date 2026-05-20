import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../Pages/Home';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Redirección para cualquier ruta desconocida */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
