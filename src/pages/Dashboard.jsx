// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';
import { getUser } from '../auth';

const items = [
  { name: 'Atención y Trámites', href: '/atencion', desc: 'Consultas y trámites.' },
  { name: 'Orientación Vocacional', href: '/orientacion', desc: 'Rutas y simuladores.' },
  { name: 'Bienestar Estudiantil', href: '/bienestar', desc: 'Tutorías y soporte.' },
  { name: 'Reclamos & Sugerencias', href: '/reclamos', desc: 'Registro y análisis.' },
  { name: 'Comunidad Estudiantil', href: '/comunidad', desc: 'Foros y grupos.' },
];

export default function Dashboard() {
  const user = getUser();
  const name = user?.full_name || user?.first_name || 'Estudiante';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <section className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs tracking-wide border border-primary/30 text-primary">
            Panel principal
          </span>
          <span className="text-xs text-gray-500">v1.0</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#111115]">Bienvenido, {name}</h1>
        <p className="text-sm text-gray-600 mt-1">Selecciona un módulo o continúa con tus trámites.</p>
      </section>

      <section>
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {items.map(x => (
            <Link
              key={x.name}
              to={x.href}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition group"
            >
              <div className="flex items-start justify-between">
                <div className="font-semibold text-[#111115] group-hover:text-primary">{x.name}</div>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">módulo</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">{x.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
