import { Link } from 'react-router-dom';
import { getUser, logout } from '../auth';

const items = [
  { name: 'Atención y Trámites', href: '/atencion', desc: 'Consultas y trámites.' },
  { name: 'Orientación Vocacional', href: '/orientacion', desc: 'Rutas y simuladores.' },
  { name: 'Bienestar Estudiantil', href: '/bienestar', desc: 'Tutorías y soporte.' },
  { name: 'Reclamos & Sugerencias', href: '/reclamos', desc: 'Registro y análisis.' },
  { name: 'Comunidad Estudiantil', href: '/comunidad', desc: 'Foros y grupos.' },
];

export default function Dashboard() {
  const user = getUser();

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <h1>Bienvenido{user ? `, ${user.full_name || user.first_name || user.name}` : ''}</h1>
        <button onClick={()=>{ logout(); location.href='/login'; }} style={{padding:'6px 12px'}}>Salir</button>
      </div>

      <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))'}}>
        {items.map(x => (
          <Link key={x.name} to={x.href} style={{background:'#fff', padding:16, borderRadius:12, boxShadow:'0 6px 18px rgba(0,0,0,.06)'}}>
            <div style={{fontWeight:600}}>{x.name}</div>
            <div style={{color:'#666', fontSize:14}}>{x.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
