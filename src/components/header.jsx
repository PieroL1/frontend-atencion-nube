// src/components/header.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, getRole, logout } from '../auth';
import logo from '../assets/incadev-mark.png';

const linkCls = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm transition
   ${isActive ? 'bg-primary/10 text-primary' : 'text-[#111115]/80 hover:bg-gray-100'}`;

export default function Header() {
  const nav = useNavigate();
  const user = getUser();
  const role = getRole();
  const name =
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    'Usuario';

  const onLogout = async () => {
    await logout();
    nav('/login', { replace: true });
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-14 px-4 flex items-center justify-between">
        {/* Marca */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="INCADEV" className="h-6 w-auto" />
          <span className="text-[#111115] font-semibold tracking-wide">
            Atención y Soporte – <span className="text-primary">INCADEV</span>
          </span>

          {/* Nav principal */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {role === 'student' && (
              <>
                <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
                <NavLink to="/atencion" className={linkCls}>Atención</NavLink>
                <NavLink to="/orientacion" className={linkCls}>Orientación</NavLink>
                <NavLink to="/bienestar" className={linkCls}>Bienestar</NavLink>
                <NavLink to="/reclamos" className={linkCls}>Reclamos</NavLink>
                <NavLink to="/comunidad" className={linkCls}>Comunidad</NavLink>
              </>
            )}
            {role === 'employee' && (
              <>
                <NavLink to="/employee" className={linkCls}>Panel</NavLink>
                <NavLink to="/atencion" className={linkCls}>Atenciones</NavLink>
                <NavLink to="/reclamos" className={linkCls}>Reclamos</NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#111115]/80 hidden sm:inline">{name}</span>
          <button
            onClick={onLogout}
            className="text-xs px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
