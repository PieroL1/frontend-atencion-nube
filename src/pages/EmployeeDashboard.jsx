// src/pages/EmployeeDashboard.jsx
import { Link } from 'react-router-dom';
import { getUser } from '../auth';

const items = [
  { name: 'Bandeja de Atenciones', href: '/atencion', desc: 'Prioriza y cambia estados.' },
  { name: 'Reclamos y Sugerencias', href: '/reclamos-employee', desc: 'Gestiona reclamos y sugerencias.' },
  { name: 'Gestión de Foros', href: '/empleado/foros', desc: 'Aprobar y gestionar foros comunitarios.' },
  { name: 'Reportes', href: '#', desc: 'Indicadores y métricas.' },
];

export default function EmployeeDashboard() {
  const u = getUser();
  const name = u?.full_name || u?.first_name || 'Colaborador';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs border border-primary/30 text-primary">Panel empleado</span>
        <h1 className="text-3xl font-semibold mt-2">Hola, {name}</h1>
        <p className="text-sm text-gray-600">Revisa las atenciones pendientes y define prioridades.</p>
      </div>

      <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {items.map(it => (
          <Link
            key={it.name}
            to={it.href}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition group"
          >
            <div className="font-semibold group-hover:text-primary">{it.name}</div>
            <div className="text-sm text-gray-600">{it.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
