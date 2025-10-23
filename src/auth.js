import { api } from './api';

export function isBypass() {
  return import.meta.env.VITE_AUTH_BYPASS === 'true';
}

const DEV_USER = {
  id: 701,
  first_name: 'Estudiante',
  last_name: 'Test',
  full_name: 'Estudiante Test 1',
  email: 'estudiante1@uns.edu.pe',
  role: ['student'],
  student_id: 701, // ⭐ ID de la tabla students
};

const DEV_TOKEN = 'DEV-BYPASS-TOKEN';

export function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  sessionStorage.removeItem('logged_out');
}

export function clearSessionLocal() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  if (isBypass()) {
    const user = getUser();
    const loggedOut = sessionStorage.getItem('logged_out');
    
    // Si no hay usuario Y no hay marca de logout manual, crear sesión
    if (!user && !loggedOut) {
      setSession(DEV_TOKEN, DEV_USER);
      return true;
    }
    
    return !!user;
  }
  return !!localStorage.getItem('token');
}

export async function login(email, password) {
  if (isBypass()) {
    setSession(DEV_TOKEN, { ...DEV_USER, email: email || DEV_USER.email });
    return getUser();
  }
  
  const { data } = await api.post('/login', { email, password });
  setSession(data.token, data.user);
  return data.user;
}

export function logout() {
  const token = localStorage.getItem('token');
  clearSessionLocal();

  if (isBypass()) {
    sessionStorage.setItem('logged_out', '1'); // Marcar que hiciste logout manual
    return Promise.resolve({ ok: true });
  }
  
  if (token) {
    return api.post('/logout').catch(() => ({ ok: false }));
  }
  return Promise.resolve({ ok: true });
}

export function getRole() {
  const u = getUser();
  if (!u) return null;
  if (Array.isArray(u.role)) return u.role[0];
  return u.role;
}

export function hasRole(role) {
  const u = getUser();
  if (!u) return false;
  if (Array.isArray(u.role)) return u.role.includes(role);
  return u.role === role;
}

export const isStudent = () => hasRole('student');
export const isEmployee = () => hasRole('employee');
export const isInstructor = () => hasRole('instructor');

