export const C = {
  bg:"#f8f9fa", surface:"#ffffff", surfaceAlt:"#f1f3f5",
  border:"#dee2e6", borderLight:"#e9ecef",
  accent:"#c0392b", accentDark:"#96281b", accentBg:"#fdf5f4",
  text:"#1a1a2e", textMuted:"#6c757d", textDim:"#adb5bd",
  success:"#2d6a4f", successBg:"#d8f3dc", successBdr:"#b7e4c7",
  danger:"#c0392b", dangerBg:"#fde8e7", dangerBdr:"#f5b7b1",
  warning:"#9c6300", warningBg:"#fff3cd", warningBdr:"#ffc107",
  info:"#1a6fc4", infoBg:"#e8f1fb", infoBdr:"#93c5fd",
  shadow:"0 1px 3px rgba(0,0,0,.08)", shadowMd:"0 4px 16px rgba(0,0,0,.1)",
}

export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.bg};color:${C.text};font-family:'Source Sans 3',sans-serif;font-size:15px;line-height:1.6;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:${C.bg};}
  ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-up{animation:fadeUp .3s ease forwards;}
  .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:6px;border:none;font-family:'Source Sans 3',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;white-space:nowrap;}
  .btn-primary{background:${C.accent};color:#fff;}
  .btn-primary:hover{background:${C.accentDark};box-shadow:0 2px 8px rgba(192,57,43,.25);}
  .btn-primary:disabled{opacity:.4;cursor:not-allowed;}
  .btn-ghost{background:transparent;color:${C.textMuted};border:1px solid ${C.border};}
  .btn-ghost:hover{color:${C.text};border-color:#aaa;background:${C.surfaceAlt};}
  .btn-danger{background:${C.dangerBg};color:${C.danger};border:1px solid ${C.dangerBdr};}
  .btn-danger:hover{background:#fbd0ce;}
  .card{background:${C.surface};border:1px solid ${C.border};border-radius:10px;box-shadow:${C.shadow};}
  input,select,textarea{font-family:'Source Sans 3',sans-serif;font-size:14px;}
  input:focus,select:focus,textarea:focus{outline:none;border-color:${C.accent}!important;box-shadow:0 0 0 3px rgba(192,57,43,.1)!important;}
  table{width:100%;border-collapse:collapse;}
  th{background:${C.surfaceAlt};font-size:11px;font-weight:700;letter-spacing:.06em;color:${C.textMuted};padding:9px 14px;text-align:left;border-bottom:1px solid ${C.border};}
  td{padding:11px 14px;border-bottom:1px solid ${C.borderLight};font-size:14px;vertical-align:middle;}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:${C.bg};}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.03em;}
  .avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}
  .nav-item{display:flex;align-items:center;gap:9px;padding:9px 14px;border-radius:7px;cursor:pointer;font-size:14px;font-weight:500;color:${C.textMuted};transition:all .15s;border:none;background:none;width:100%;text-align:left;}
  .nav-item:hover{background:${C.surfaceAlt};color:${C.text};}
  .nav-item.active{background:${C.accentBg};color:${C.accent};font-weight:600;}
`

export const inputStyle = {
  width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,
  borderRadius:6,fontSize:14,color:C.text,background:C.surface
}

export const labelStyle = {
  display:"block",fontSize:11,fontWeight:700,
  color:C.textMuted,marginBottom:5,letterSpacing:".05em"
}

export const AVATAR_COLORS = ["#c0392b","#1a6fc4","#2d6a4f","#9c6300","#6d3fa0","#c0762b","#1a8c7d","#c04a7a","#4a6dc0"]
export const getInitials = name => (name||"?").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)
export const getAvatarColor = name => AVATAR_COLORS[(name||"A").charCodeAt(0) % AVATAR_COLORS.length]
