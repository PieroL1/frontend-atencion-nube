/**
 * RECLAMOS ROUTER
 * Router principal que redirige al componente correcto según el rol del usuario
 */

import { Navigate } from 'react-router-dom';
import { getRole } from '../../auth';

export default function ReclamosRouter() {
  const role = getRole();

  // Si es empleado, redirigir a la vista de gestión
  if (role === 'employee') {
    return <Navigate to="/reclamos-employee" replace />;
  }

  // Por defecto, redirigir a la vista de estudiante
  return <Navigate to="/reclamos-estudiante" replace />;
}
