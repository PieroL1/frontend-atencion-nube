import { api } from './api';

// --- NUEVO: flags para controlar el bypass tras logout
const BYPASS_LOGGED_OUT_KEY = 'BYPASS_LOGGED_OUT';

function markBypassLoggedOut() { localStorage.setItem(BYPASS_LOGGED_OUT_KEY, '1'); }
function clearBypassLoggedOut() { localStorage.removeItem(BYPASS_LOGGED_OUT_KEY); }
function isBypassLoggedOut() { return localStorage.getItem(BYPASS_LOGGED_OUT_KEY) === '1'; }

// Mantén tus imports/exports actuales y añade lo siguiente si no lo tienes:
export function isBypass() {
  return import.meta.env.VITE_AUTH_BYPASS === 'true';
}

const DEV_USER = {
  id: 1, first_name: 'Dev', last_name: 'User', full_name: 'Dev User',
  email: 'dev@uns.edu.pe', role: ['student'], // Cambia a 'student' o 'employee' para probar diferentes modulos
};
const DEV_TOKEN = 'DEV-BYPASS-TOKEN';

export function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSessionLocal() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

// --- MOD: si está en bypass y NO marcaste logout, te deja pasar; si marcaste logout, te muestra login
export function isAuthenticated() {
  if (isBypass()) {
    if (isBypassLoggedOut()) return false;
    ensureDevSession();
    return true;
  }
  return !!localStorage.getItem('token');
}

export function ensureDevSession() {
  if (!isBypass()) return;
  if (!getUser()) setSession(DEV_TOKEN, DEV_USER);
}

// --- MOD: si estás en bypass, borra la marca de logout para que te deje pasar
export async function login(email, password) {
  if (isBypass()) {
    clearBypassLoggedOut();
    setSession(DEV_TOKEN, { ...DEV_USER, email: email || DEV_USER.email });
    return getUser();
  }
  const { data } = await api.post('/login', { email, password });
  setSession(data.token, data.user);
  return data.user;
}

// --- MOD: si estás en bypass, marca logout y NO re-crees la sesión
export function logout() {
  const token = localStorage.getItem('token');
  clearSessionLocal();

  if (isBypass()) {
    markBypassLoggedOut();
    return Promise.resolve({ ok: true });
  }
  if (token) return api.post('/logout').catch(()=>({ ok:false }));
  return Promise.resolve({ ok:true });
}

// Exporta si necesitas usar en ProtectedRoute
export { isBypassLoggedOut };



// --- NUEVO: funciones para roles 
export function getRole() {
  const u = getUser();
  if (!u) return null;
  if (Array.isArray(u.role)) return u.role[0];
  return u.role;
}

export const isStudent = () => getRole() === 'student';
export const isEmployee = () => getRole() === 'employee';
