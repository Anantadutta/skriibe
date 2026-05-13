import { useLocation } from 'react-router-dom';
export default function AMAPlaceholder() {
  const { pathname } = useLocation();
  return (
    <div style={{ minHeight:'100vh', background:'var(--ink)', color:'var(--white)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--font-mono)', gap:'12px' }}>
      <div style={{ fontSize:'11px', color:'var(--g3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
        Phase 1 scaffold
      </div>
      <div style={{ fontSize:'20px', color:'var(--blue)' }}>{pathname}</div>
      <div style={{ fontSize:'13px', color:'var(--g2)' }}>This page will be built in a future phase.</div>
    </div>
  );
}
