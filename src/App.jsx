// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Reclamos from './pages/Reclamos';

import Header from './components/header';
import Footer from './components/footer';

function Placeholder({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-gray-600">En construcción…</p>
    </div>
  );
}

function ProtectedShell() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-[#F6F7F9]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Redirección raíz */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protegidas con layout */}
        <Route
          element={
            <ProtectedRoute>
              <ProtectedShell />
            </ProtectedRoute>
          }
        >
          {/* Estudiante */}
          <Route
            path="/dashboard"
            element={
              <RoleRoute allow="student">
                <Dashboard />
              </RoleRoute>
            }
          />
          {/* Empleado */}
          <Route
            path="/employee"
            element={
              <RoleRoute allow="employee">
                <EmployeeDashboard />
              </RoleRoute>
            }
          />
          {/* Módulos */}
          <Route path="/atencion" element={<Placeholder title="Atención al estudiante" />} />
          <Route path="/orientacion" element={<Placeholder title="Orientación vocacional y profesional" />} />
          <Route path="/bienestar" element={<Placeholder title="Bienestar estudiantil" />} />
          <Route path="/reclamos" element={<Reclamos />} />
          <Route path="/comunidad" element={<Placeholder title="Comunidad estudiantil" />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
