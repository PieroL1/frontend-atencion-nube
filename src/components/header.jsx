// src/components/header.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, getRole, logout } from '../auth';
import ThemeToggle from './ui/ThemeToggle';
import logo from '../assets/incadev-mark.png';

const linkCls = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm transition
   ${isActive ? 'bg-primary/10 text-primary' : 'text-ink/80 dark:text-slate/80 hover:bg-gray-100 dark:hover:bg-slate/10'}`;

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
    <header className="w-full bg-white dark:bg-night border-b border-gray-200 dark:border-slate/20 shadow-sm">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        {/* Marca */}
        <div className="flex items-center gap-3">
          {/* Logo con efecto de brillo */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 dark:bg-primary/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gradient-to-br from-primary/10 to-blue-500/10 dark:from-primary/5 dark:to-blue-500/5 p-2 rounded-lg border border-primary/20 dark:border-primary/10">
              <img src={logo} alt="INCADEV" className="h-7 w-auto" />
            </div>
          </div>
          
          {/* Texto de marca mejorado */}
          <div className="hidden sm:block">
            <div className="text-ink dark:text-slate font-bold tracking-wide text-sm">
              Atención y Soporte
            </div>
            <div className="text-xs text-primary font-semibold -mt-0.5">
              INCADEV
            </div>
          </div>

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
                <NavLink to="/empleado/foros" className={linkCls}>Gestión de Foros</NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Usuario y tema */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="text-sm text-ink/80 dark:text-slate/80 hidden sm:inline">{name}</span>
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
