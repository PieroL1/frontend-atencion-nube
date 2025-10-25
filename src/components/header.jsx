// src/components/header.jsx
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getUser, getRole, logout } from '../auth';
import ThemeToggle from './ui/ThemeToggle';
import logo from '../assets/incadev-mark.png';

const linkCls = ({ isActive }) =>
  `px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative group
   ${isActive 
     ? 'bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary dark:text-primary shadow-lg scale-105' 
     : 'text-ink/70 dark:text-slate/70 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`;

const mobileLinkCls = ({ isActive }) =>
  `block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300
   ${isActive 
     ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105' 
     : 'text-ink dark:text-slate hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:scale-102'}`;

export default function Header() {
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();
  const role = getRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Función para verificar si estamos en reclamos
  const isReclamosActive = location.pathname.startsWith('/reclamos');
  
  // Función personalizada para el className de Reclamos
  const reclamosLinkCls = () =>
    `px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative group
     ${isReclamosActive 
       ? 'bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary dark:text-primary shadow-lg scale-105' 
       : 'text-ink/70 dark:text-slate/70 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`;
  
  const reclamosMobileLinkCls = () =>
    `block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300
     ${isReclamosActive 
       ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105' 
       : 'text-ink dark:text-slate hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:scale-102'}`;
  
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
    <header className="w-full bg-white/80 dark:bg-night/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between gap-6">
        {/* Marca mejorada */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Logo con efecto de brillo mejorado */}
          <div className="relative group cursor-pointer flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 rounded-xl blur-lg opacity-0 group-hover:opacity-70 transition-all duration-500 animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary/10 via-blue-500/10 to-cyan-500/10 dark:from-primary/20 dark:via-blue-500/20 dark:to-cyan-500/20 p-2 rounded-xl border-2 border-primary/30 dark:border-primary/20 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <img src={logo} alt="INCADEV" className="h-6 w-auto" />
            </div>
          </div>
          
          {/* Texto de marca mejorado con gradiente - INCADEV primero */}
          <div className="hidden sm:flex flex-col">
            <div className="text-sm font-bold text-primary/80 dark:text-primary/70 flex items-center gap-1.5 leading-tight">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              INCADEV
            </div>
            <div className="text-xs font-medium text-ink/70 dark:text-slate/70 leading-tight">
              Atención y Soporte
            </div>
          </div>

          {/* Nav principal - Desktop con efectos mejorados */}
          <nav className="hidden lg:flex items-center gap-1.5 ml-4 mr-auto">
            {role === 'student' && (
              <>
                <NavLink to="/dashboard" className={linkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </span>
                </NavLink>
                <NavLink to="/atencion" className={linkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Atención
                  </span>
                </NavLink>
                <NavLink to="/orientacion" className={linkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Orientación
                  </span>
                </NavLink>
                <NavLink to="/bienestar" className={linkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Bienestar
                  </span>
                </NavLink>
                <NavLink to="/reclamos" className={reclamosLinkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Reclamos
                  </span>
                </NavLink>
                <NavLink to="/comunidad" className={linkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Comunidad
                  </span>
                </NavLink>
              </>
            )}
            {role === 'employee' && (
              <>
                <NavLink to="/employee" className={linkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Panel
                  </span>
                </NavLink>
                <NavLink to="/atencion" className={linkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Atenciones
                  </span>
                </NavLink>
                <NavLink to="/reclamos" className={reclamosLinkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Reclamos
                  </span>
                </NavLink>
                <NavLink to="/empleado/foros" className={linkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Gestión de Foros
                  </span>
                </NavLink>
              </>
            )}
            {role === 'instructor' && (
              <>
                <NavLink to="/bienestar/instructor" className={linkCls}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </span>
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Usuario y controles con mejor diseño */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />
          
          {/* Perfil de usuario mejorado */}
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 border border-primary/20 dark:border-primary/10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-ink dark:text-slate leading-none whitespace-nowrap">{name}</p>
              <p className="text-xs text-primary/70 dark:text-primary/60 capitalize whitespace-nowrap">{role}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="hidden sm:flex items-center gap-2 text-xs px-3 py-2 rounded-xl border-2 border-red-400/50 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salir
          </button>
          
          {/* Botón menú hamburguesa mejorado - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/10 hover:from-primary/20 hover:to-blue-500/20 dark:from-primary/20 dark:to-blue-500/20 border border-primary/20 transition-all duration-300 hover:scale-110 shadow-lg"
            aria-label="Menú"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil - Dropdown animado mejorado */}
      {mobileMenuOpen && (
        <>
          {/* Overlay oscuro con blur */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden z-40"
            onClick={closeMobileMenu}
          />
          
          {/* Panel del menú mejorado */}
          <div className="fixed top-20 left-0 right-0 bg-white/95 dark:bg-night/95 backdrop-blur-xl border-b-2 border-primary/20 shadow-2xl lg:hidden z-50 max-h-[calc(100vh-5rem)] overflow-y-auto animate-slideDown">
            <div className="px-6 py-6 space-y-3">
              {/* Info del usuario en mobile mejorada */}
              <div className="mb-4 pb-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 border border-primary/20">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-ink dark:text-slate">{name}</p>
                    <p className="text-sm text-primary/70 dark:text-primary/60 capitalize">{role}</p>
                  </div>
                </div>
              </div>

              {/* Links según rol con iconos SVG */}
              {role === 'student' && (
                <nav className="space-y-2">
                  <NavLink to="/dashboard" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Dashboard</span>
                    </div>
                  </NavLink>
                  <NavLink to="/atencion" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Atención</span>
                    </div>
                  </NavLink>
                  <NavLink to="/orientacion" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Orientación</span>
                    </div>
                  </NavLink>
                  <NavLink to="/bienestar" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Bienestar</span>
                    </div>
                  </NavLink>
                  <NavLink to="/reclamos" className={reclamosMobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>Reclamos</span>
                    </div>
                  </NavLink>
                  <NavLink to="/comunidad" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Comunidad</span>
                    </div>
                  </NavLink>
                </nav>
              )}

              {role === 'employee' && (
                <nav className="space-y-2">
                  <NavLink to="/employee" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Panel</span>
                    </div>
                  </NavLink>
                  <NavLink to="/atencion" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Atenciones</span>
                    </div>
                  </NavLink>
                  <NavLink to="/reclamos" className={reclamosMobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>Reclamos</span>
                    </div>
                  </NavLink>
                  <NavLink to="/empleado/foros" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Gestión de Foros</span>
                    </div>
                  </NavLink>
                </nav>
              )}

              {role === 'instructor' && (
                <nav className="space-y-2">
                  <NavLink to="/bienestar/instructor" className={mobileLinkCls} onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Dashboard</span>
                    </div>
                  </NavLink>
                </nav>
              )}

              {/* Botón cerrar sesión en mobile mejorado */}
              <div className="pt-3 border-t-2 border-primary/10">
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
