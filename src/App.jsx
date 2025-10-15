// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reclamos from './pages/Reclamos';

// Componente mini para las rutas que aún no implemento
function Placeholder({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-gray-600">En construcción…</p>
    </div>
  );
}

// Barra simple de navegación (solo para desarrollo)
function Topbar() {
  return (
    <nav className="flex gap-3 p-3 bg-gray-100 text-sm">
      <Link to="/dashboard" className="hover:underline">Dashboard</Link>
      <Link to="/atencion" className="hover:underline">Atención</Link>
      <Link to="/orientacion" className="hover:underline">Orientación</Link>
      <Link to="/bienestar" className="hover:underline">Bienestar</Link>
      <Link to="/reclamos" className="hover:underline">Reclamos</Link>
      <Link to="/comunidad" className="hover:underline">Comunidad</Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* redirección raíz */}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Topbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/atencion"
          element={
            <ProtectedRoute>
              <Topbar />
              <Placeholder title="Atención al estudiante" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orientacion"
          element={
            <ProtectedRoute>
              <Topbar />
              <Placeholder title="Orientación vocacional y profesional" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bienestar"
          element={
            <ProtectedRoute>
              <Topbar />
              <Placeholder title="Bienestar estudiantil" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reclamos"
          element={
            <ProtectedRoute>
              <Topbar />
              <Reclamos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/comunidad"
          element={
            <ProtectedRoute>
              <Topbar />
              <Placeholder title="Comunidad estudiantil" />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
