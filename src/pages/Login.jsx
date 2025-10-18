// src/pages/Login.jsx
import { useState } from 'react';
import { login, isAuthenticated, getRole } from '../auth';
import { Navigate, useNavigate } from 'react-router-dom';
import logo from '../assets/incadev.png';

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
    <div className="min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#F6F7F9]">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border-0">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-[190px] w-auto mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-[#111115] text-center">Iniciar sesión</h1>
        <p className="text-sm text-[#848282] text-center mt-1 mb-6">Accede a tu panel</p>

        {!!err && (
          <div className="mb-4 text-[#B00020] bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#848282] mb-1">Email</label>
            <input
              type="email"
              placeholder="juan@uns.edu.pe"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#D1D1D1] focus:border-[#26BBFF] outline-none px-3 py-2 text-[#111115]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#848282] mb-1">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#D1D1D1] focus:border-[#26BBFF] outline-none px-3 py-2 text-[#111115]"
            />
          </div>

          <button type="submit" className="w-full mt-2 py-2.5 rounded-xl bg-[#26BBFF] text-white font-semibold hover:opacity-90 transition">
            Entrar
          </button>
        </form>

        {import.meta.env.VITE_AUTH_BYPASS === 'true' && (
          <div className="mt-4 text-center">
            <span className="text-xs text-[#848282]">Modo dev activo • bypass</span>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-[#848282]">
          © {new Date().getFullYear()} Atención al Estudiante
        </div>
      </div>
    </div>
  );
}
