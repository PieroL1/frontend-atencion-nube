import { Navigate } from 'react-router-dom';
import { isAuthenticated, ensureDevSession } from './auth';

export default function ProtectedRoute({ children }) {
  // En bypass, ensureDevSession se maneja dentro de isAuthenticated()
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  ensureDevSession(); // no hace nada si no es bypass
  return children;
}
