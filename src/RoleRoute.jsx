import { Navigate } from 'react-router-dom';
import { isAuthenticated, isStudent, isEmployee, isInstructor } from './auth';

export default function RoleRoute({ children, allow = 'student' }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (allow === 'employee' && !isEmployee()) return <Navigate to="/dashboard" replace />;
  if (allow === 'student' && !isStudent()) return <Navigate to="/employee" replace />;
  if (allow === 'instructor' && !isInstructor()) return <Navigate to="/dashboard" replace />;
  return children;
}
