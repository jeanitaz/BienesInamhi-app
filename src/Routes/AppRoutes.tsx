import { Routes, Route } from 'react-router-dom';
import Home from '../Pages/Home';
import Login from '../Pages/Login';
import Admin from '../Pages/Admin';
import CreacionUsuarios from '../Pages/CreacionUsuarios';
import PantallaGeneral from '../Pages/PantallaGeneral';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/creacion-usuarios" element={<CreacionUsuarios />} />
      <Route path="/inventario" element={<PantallaGeneral />} />
    </Routes>
  );
}

