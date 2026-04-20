import { C } from './theme.js'

export const Icon = ({n,s=16,c="currentColor"}) => {
  const d = {
    shield:"M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5l-8-3z",
    dashboard:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    docs:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
    users:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    check:"M20 6L9 17l-5-5",
    upload:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    trash:"M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    warn:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
    bell:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    layers:"M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    plus:"M12 5v14 M5 12h14",
    eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    dl:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    close:"M18 6L6 18 M6 6l12 12",
    right:"M9 18l6-6-6-6",
    down:"M6 9l6 6 6-6",
    back:"M19 12H5 M12 5l-7 7 7 7",
    search:"M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M21 21l-4.35-4.35",
    mail:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    lock:"M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
    user:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    clock:"M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2",
    logout:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  }
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d[n]||""}/>
    </svg>
  )
}

export const Badge = ({children,color=C.textMuted,bg=C.surfaceAlt,bdr="transparent"}) => (
  <span className="badge" style={{background:bg,color,border:`1px solid ${bdr}`}}>{children}</span>
)

export const Spinner = ({size=20,color="#fff"}) => (
  <span style={{width:size,height:size,border:`2px solid ${color}`,borderTop:`2px solid transparent`,borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block",flexShrink:0}}/>
)

export const Modal = ({title,onClose,children,width=520}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={onClose}>
    <div className="card fade-up" style={{width:"100%",maxWidth:width,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h2 style={{fontSize:16,fontWeight:700}}>{title}</h2>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}><Icon n="close" s={17} c={C.textMuted}/></button>
      </div>
      <div style={{padding:"20px 22px"}}>{children}</div>
    </div>
  </div>
)

export const ProgressBar = ({value,max,color}) => (
  <div style={{background:C.borderLight,borderRadius:4,height:5,overflow:"hidden",flex:1}}>
    <div style={{width:`${Math.min(100,max>0?(value/max)*100:0)}%`,height:"100%",background:color||C.accent,borderRadius:4,transition:"width .4s ease"}}/>
  </div>
)

export const StatCard = ({label,value,color=C.accent,icon,sub}) => (
  <div className="card" style={{padding:"18px 20px"}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:".06em",marginBottom:4}}>{label}</div>
        <div style={{fontSize:30,fontWeight:700,color,lineHeight:1}}>{value}</div>
        {sub&&<div style={{fontSize:12,color:C.textMuted,marginTop:4}}>{sub}</div>}
      </div>
      <div style={{background:`${color}18`,borderRadius:8,padding:10,display:"flex"}}><Icon n={icon} s={20} c={color}/></div>
    </div>
  </div>
)
