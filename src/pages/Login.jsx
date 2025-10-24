// src/pages/Login.jsx
import { useState } from 'react';
import { login, isAuthenticated, getRole } from '../auth';
import { Navigate, useNavigate } from 'react-router-dom';
import logo from '../assets/incadev.png';
import loginIllustration from '../assets/login.png';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  // Si ya hay sesión, redirijo según rol
  if (isAuthenticated()) {
    const role = getRole();
    if (role === 'employee') return <Navigate to="/employee" replace />;
    if (role === 'instructor') return <Navigate to="/bienestar/instructor" replace />;
    return <Navigate to="/dashboard" replace />; // student
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      const role = getRole();
      
      // Redirigir según rol
      if (role === 'employee') {
        nav('/employee', { replace: true });
      } else if (role === 'instructor') {
        nav('/bienestar/instructor', { replace: true });
      } else {
        nav('/dashboard', { replace: true }); // student
      }
    } catch {
      setErr('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-[#0A0A0F] dark:via-[#0F0D16] dark:to-[#14101D]">
      {/* Decoración de fondo - Formas geométricas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculo grande arriba izquierda */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 dark:bg-primary/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Círculo mediano abajo derecha */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl" 
             style={{ animation: 'pulse 3s ease-in-out infinite' }} />
        
        {/* Círculo pequeño centro */}
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-pink-400/10 dark:bg-blue-500/8 rounded-full blur-2xl" 
             style={{ animation: 'pulse 4s ease-in-out infinite' }} />
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white dark:bg-gradient-to-br dark:from-night dark:to-[#1A1525] shadow-2xl dark:shadow-primary/5 rounded-3xl overflow-hidden border border-gray-100 dark:border-primary/20">
          
          {/* PANEL IZQUIERDO - Ilustración y bienvenida */}
          <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-primary to-blue-600 dark:from-primary/95 dark:to-blue-700 relative overflow-hidden">
            {/* Patrón decorativo de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
              <div className="absolute bottom-20 right-10 w-24 h-24 border-4 border-white rotate-45" />
              <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full" />
            </div>

            <div className="relative z-10 text-center space-y-6">
              {/* Logo marca */}
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                  <img src={logo} alt="INCADEV" className="h-24 w-auto" />
                </div>
              </div>

              {/* Ilustración principal */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Glow effect detrás de la imagen */}
                  <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full scale-110" />
                  <img 
                    src={loginIllustration} 
                    alt="Bienvenida" 
                    className="relative h-64 w-auto drop-shadow-2xl animate-float"
                  />
                </div>
              </div>

              {/* Texto de bienvenida */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">
                  ¡Bienvenido de vuelta!
                </h2>
                <p className="text-white/90 text-lg max-w-md mx-auto">
                  Accede a tu plataforma de Atención y Soporte Estudiantil
                </p>
              </div>

              {/* Badges decorativos */}
              <div className="flex justify-center gap-4 pt-4">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                  🎓 Estudiantes
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                  👔 Empleados
                </div>
              </div>
            </div>
          </div>

          {/* PANEL DERECHO - Formulario de login */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            {/* Logo móvil (solo visible en pantallas pequeñas) */}
            <div className="lg:hidden flex justify-center mb-6">
              <img src={logo} alt="INCADEV" className="h-20 w-auto" />
            </div>

            {/* Encabezado */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-ink dark:text-white mb-2">
                Iniciar sesión
              </h1>
              <p className="text-slate dark:text-slate/80 text-base">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Mensaje de error */}
            {!!err && (
              <div className="mb-6 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl px-4 py-3 text-sm flex items-start gap-3 animate-slide-in">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold">Error de autenticación</p>
                  <p>{err}</p>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Campo Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink dark:text-slate">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate/50 dark:text-slate/60 text-lg">📧</span>
                  </div>
                  <input
                    type="email"
                    placeholder="juan@uns.edu.pe"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate/40 focus:border-primary dark:focus:border-primary outline-none text-ink dark:text-white bg-white dark:bg-[#1A1525] transition-all placeholder:text-slate/40 dark:placeholder:text-slate/50"
                  />
                </div>
              </div>

              {/* Campo Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink dark:text-slate">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate/50 dark:text-slate/60 text-lg">🔒</span>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate/40 focus:border-primary dark:focus:border-primary outline-none text-ink dark:text-white bg-white dark:bg-[#1A1525] transition-all placeholder:text-slate/40 dark:placeholder:text-slate/50"
                  />
                </div>
              </div>

              {/* Botón de login */}
              <button 
                type="submit" 
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Ingresar</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 space-y-4">
              {import.meta.env.VITE_AUTH_BYPASS === 'true' && (
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <span className="text-xs text-yellow-800 dark:text-yellow-400 font-medium">
                    🔧 Modo desarrollo activo
                  </span>
                </div>
              )}

              <div className="text-center text-xs text-slate/60 dark:text-slate/50">
                <p>© {new Date().getFullYear()} INCADEV - Atención al Estudiante</p>
                <p className="mt-1">Todos los derechos reservados</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
