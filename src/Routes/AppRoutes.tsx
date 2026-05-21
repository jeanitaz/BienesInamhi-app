import { Routes, Route } from 'react-router-dom';
import Home from '../Pages/Home';
import Login from '../Pages/Login';
import Admin from '../Pages/Admin';
import CreacionUsuarios from '../Pages/CreacionUsuarios';
import PantallaGeneral from '../Pages/PantallaGeneral';
import RegistroBien from '../Pages/RegistroBien';
import Analitica from '../Pages/Analitica';
import ListaUsuarios from '../Pages/ListaUsuarios';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/creacion-usuarios" element={<CreacionUsuarios />} />
      <Route path="/lista-usuarios" element={<ListaUsuarios />} />
      <Route path="/analitica" element={<Analitica />} />
      <Route path="/inventario" element={<PantallaGeneral />} />
      <Route path="/registro-bien" element={<RegistroBien />} />
    </Routes>
  );
}

