// src/components/header.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, getRole, logout } from '../auth';
import ThemeToggle from './ui/ThemeToggle';
import logo from '../assets/incadev-mark.png';

const linkCls = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm transition
   ${isActive ? 'bg-primary/10 text-primary' : 'text-ink/80 dark:text-slate/80 hover:bg-gray-100 dark:hover:bg-slate/10'}`;

const mobileLinkCls = ({ isActive }) =>
  `block px-4 py-3 rounded-lg text-base font-medium transition-all
   ${isActive 
     ? 'bg-primary text-white shadow-lg' 
     : 'text-ink dark:text-slate hover:bg-gray-100 dark:hover:bg-slate/10'}`;

export default function Header() {
  const nav = useNavigate();
  const user = getUser();
  const role = getRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const name =
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    'Usuario';

  const onLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    nav('/login', { replace: true });
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="w-full bg-white dark:bg-night border-b border-gray-200 dark:border-slate/20 shadow-sm sticky top-0 z-50">
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

          {/* Nav principal - Desktop */}
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
            {role === 'instructor' && (
              <>
                <NavLink to="/bienestar/instructor" className={linkCls}>Dashboard</NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Usuario y tema */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="text-sm text-ink/80 dark:text-slate/80 hidden md:inline">{name}</span>
          <button
            onClick={onLogout}
            className="hidden sm:block text-xs px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition"
          >
            Cerrar sesión
          </button>
          
          {/* Botón menú hamburguesa - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate/10 transition"
            aria-label="Menú"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-ink dark:text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-ink dark:text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil - Dropdown animado */}
      {mobileMenuOpen && (
        <>
          {/* Overlay oscuro */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
            onClick={closeMobileMenu}
          />
          
          {/* Panel del menú */}
          <div className="fixed top-16 left-0 right-0 bg-white dark:bg-night border-b border-gray-200 dark:border-slate/20 shadow-2xl lg:hidden z-50 max-h-[calc(100vh-4rem)] overflow-y-auto animate-slideDown">
            <div className="px-4 py-6 space-y-2">
              {/* Info del usuario en mobile */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-slate/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-ink dark:text-slate">{name}</p>
                    <p className="text-xs text-slate dark:text-slate/70 capitalize">{role}</p>
                  </div>
                </div>
              </div>

              {/* Links según rol */}
              {role === 'student' && (
                <nav className="space-y-1">
                  <NavLink to="/dashboard" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏠</span>
                      <span>Dashboard</span>
                    </div>
                  </NavLink>
                  <NavLink to="/atencion" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📋</span>
                      <span>Atención</span>
                    </div>
                  </NavLink>
                  <NavLink to="/orientacion" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎓</span>
                      <span>Orientación</span>
                    </div>
                  </NavLink>
                  <NavLink to="/bienestar" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌟</span>
                      <span>Bienestar</span>
                    </div>
                  </NavLink>
                  <NavLink to="/reclamos" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💬</span>
                      <span>Reclamos</span>
                    </div>
                  </NavLink>
                  <NavLink to="/comunidad" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">👥</span>
                      <span>Comunidad</span>
                    </div>
                  </NavLink>
                </nav>
              )}

              {role === 'employee' && (
                <nav className="space-y-1">
                  <NavLink to="/employee" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📊</span>
                      <span>Panel</span>
                    </div>
                  </NavLink>
                  <NavLink to="/atencion" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📋</span>
                      <span>Atenciones</span>
                    </div>
                  </NavLink>
                  <NavLink to="/reclamos" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💬</span>
                      <span>Reclamos</span>
                    </div>
                  </NavLink>
                  <NavLink to="/empleado/foros" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🛠️</span>
                      <span>Gestión de Foros</span>
                    </div>
                  </NavLink>
                </nav>
              )}

              {role === 'instructor' && (
                <nav className="space-y-1">
                  <NavLink to="/bienestar/instructor" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏠</span>
                      <span>Dashboard</span>
                    </div>
                  </NavLink>
                </nav>
              )}

              {/* Botón cerrar sesión en mobile */}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate/20">
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-3 rounded-lg border-2 border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
