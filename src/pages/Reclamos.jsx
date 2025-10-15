import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Reclamos() {
  const [data, setData] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/reclamos')
      .then(res => setData(res.data))
      .catch(() => setErr('No se pudo cargar /reclamos. ¿Iniciaste sesión?'));
  }, []);

  return (
    <div style={{padding:24}}>
      <h1 style={{marginBottom:12}}>Reclamos & Sugerencias</h1>
      {err && <div style={{color:'#b00020', marginBottom:8}}>{err}</div>}
      <div style={{overflowX:'auto', background:'#fff', borderRadius:12, boxShadow:'0 6px 18px rgba(0,0,0,.06)'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{textAlign:'left', borderBottom:'1px solid #eee'}}>
              <th style={{padding:12}}>ID</th>
              <th style={{padding:12}}>Código</th>
              <th style={{padding:12}}>Tipo</th>
              <th style={{padding:12}}>Estado</th>
              <th style={{padding:12}}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {data.map(r => (
              <tr key={r.id} style={{borderBottom:'1px solid #f2f2f2'}}>
                <td style={{padding:12}}>{r.id}</td>
                <td style={{padding:12}}>{r.codigo}</td>
                <td style={{padding:12}}>{r.tipo}</td>
                <td style={{padding:12}}>{r.estado}</td>
                <td style={{padding:12}}>{r.fecha}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td style={{padding:12, color:'#666'}} colSpan="5">Sin registros</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
