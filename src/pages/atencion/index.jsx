// src/pages/atencion/index.jsx
// Rol router del módulo Atención: yo solo detecto el rol y muestro la vista correcta.
// Esto me permite en App.jsx importar "pages/atencion" sin preocuparme del rol.
import { getRole } from '../../auth';
import AtencionEmpleado from './AtencionEmpleado';
import AtencionEstudiante from './AtencionEstudiante';

export default function Atencion() {
  return getRole() === 'employee' ? <AtencionEmpleado /> : <AtencionEstudiante />;
}
