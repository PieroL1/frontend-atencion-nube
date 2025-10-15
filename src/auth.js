import { api } from './api';

export async function login(email, password) {
  const { data } = await api.post('/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  const token = localStorage.getItem('token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (token) api.post('/logout').catch(()=>{});
}

export function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}
