import { useState } from 'react';
import { login, isAuthenticated } from '../auth';
import { Navigate, useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  if (isAuthenticated()) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      nav('/dashboard');
    } catch {
      setErr('Credenciales inválidas');
    }
  };

  return (
    <div style={{display:'grid', placeItems:'center', minHeight:'100vh', background:'#f6f7f9'}}>
      <form onSubmit={onSubmit} style={{background:'#fff', padding:24, borderRadius:12, minWidth:320, boxShadow:'0 8px 24px rgba(0,0,0,.08)'}}>
        <h1 style={{marginBottom:12}}>Iniciar sesión</h1>
        {!!err && <div style={{color:'#b00020', marginBottom:8}}>{err}</div>}
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="juan@uns.edu.pe" style={{width:'100%', padding:8, margin:'4px 0 12px'}} />
        <label>Contraseña</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" style={{width:'100%', padding:8, margin:'4px 0 16px'}} />
        <button type="submit" style={{width:'100%', padding:10, background:'#111', color:'#fff', borderRadius:8}}>Entrar</button>
      </form>
    </div>
  );
}
