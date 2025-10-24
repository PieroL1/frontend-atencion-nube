// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { getRole } from './auth';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Atencion from './pages/atencion';
import BienestarEstudiante from './pages/bienestar/BienestarEstudiante';
import BienestarInstructor from './pages/bienestar/Instructor/BienestarInstructor';

import ReclamosRouter from './pages/reclamos/ReclamosRouter';
import ReclamosEstudiante from './pages/reclamos/ReclamosEstudiante';
import ReclamoDetalle from './pages/reclamos/ReclamoDetalle';
import ClaimForm from './pages/reclamos/ClaimForm';
import ReclamosEmployee from './pages/reclamos/employee/ReclamosEmployee';

import Foros from './pages/comunidad/Foros';
import ForoDetalle from './pages/comunidad/ForoDetalle';
import Eventos from './pages/comunidad/Eventos';
import Chat from './pages/comunidad/Chat';
import GestionForos from './pages/empleado/GestionForos';
import OrientacionWizard from './pages/orientacion/OrientacionWizard';

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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-ink">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-ink">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Componente para redirigir según el rol
function RoleDashboardRedirect() {
  const role = getRole();
  
  if (role === 'employee') {
    return <Navigate to="/employee" replace />;
  }
  if (role === 'instructor') {
    return <Navigate to="/bienestar/instructor" replace />;
  }
  // Por defecto (student o desconocido)
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Redirección raíz según rol */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleDashboardRedirect />
            </ProtectedRoute>
          }
        />

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
          {/* Instructor - Dashboard */}
          <Route
            path="/bienestar/instructor"
            element={
              <RoleRoute allow="instructor">
                <BienestarInstructor />
              </RoleRoute>
            }
          />
          
          {/* Módulos */}
          <Route path="/atencion" element={<Atencion />} />
          <Route
            path="/orientacion"
            element={
              <RoleRoute allow="student">
                <OrientacionWizard />
              </RoleRoute>
            }
          />
          <Route
            path="/bienestar"
            element={
              <RoleRoute allow="student">
                <BienestarEstudiante />
              </RoleRoute>
            }
          />
          
          {/* Reclamos - Router principal */}
          <Route path="/reclamos" element={<ReclamosRouter />} />
          
          {/* Reclamos - Estudiante */}
          <Route
            path="/reclamos-estudiante"
            element={
              <RoleRoute allow="student">
                <ReclamosEstudiante />
              </RoleRoute>
            }
          />
          <Route
            path="/reclamos/nuevo"
            element={
              <RoleRoute allow="student">
                <ClaimForm />
              </RoleRoute>
            }
          />
          <Route
            path="/reclamos/:id"
            element={
              <RoleRoute allow="student">
                <ReclamoDetalle />
              </RoleRoute>
            }
          />
          
          {/* Reclamos - Employee */}
          <Route
            path="/reclamos-employee"
            element={
              <RoleRoute allow="employee">
                <ReclamosEmployee />
              </RoleRoute>
            }
          />
          
          {/* Gestión de Foros - Employee */}
          <Route
            path="/empleado/foros"
            element={
              <RoleRoute allow="employee">
                <GestionForos />
              </RoleRoute>
            }
          />
          
          {/* Comunidad Estudiantil */}
          <Route path="/comunidad/foros" element={<Foros />} />
          <Route path="/comunidad/foros/:id" element={<ForoDetalle />} />
          <Route path="/comunidad/eventos" element={<Eventos />} />
          <Route path="/comunidad/chat" element={<Chat />} />
          <Route path="/comunidad" element={<Foros />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
