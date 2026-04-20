import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase.js'
import { C, inputStyle, labelStyle, getInitials, getAvatarColor } from './theme.js'
import { Icon, Badge, Modal, StatCard, Spinner } from './components.jsx'

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ docs, modules, mitarbeiter, nachweise }) {
  const aktDocs = docs.filter(d=>d.aktiv).length
  const bestanden = nachweise.filter(n=>n.score/n.total>=0.8).length
  const offene = Math.max(0, mitarbeiter.length * aktDocs - nachweise.length)

  return (
    <div className="fade-up">
      <div style={{marginBottom:22}}>
        <p style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:".07em",marginBottom:3}}>ÜBERSICHT</p>
        <h1 style={{fontSize:22,fontWeight:700}}>Dashboard</h1>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:24}}>
        <StatCard label="AKTIVE DOKUMENTE" value={aktDocs} icon="docs" color={C.accent} sub={`in ${modules.length} Modulen`}/>
        <StatCard label="MITARBEITER" value={mitarbeiter.length} icon="users" color={C.info} sub="registriert"/>
        <StatCard label="NACHWEISE" value={nachweise.length} icon="check" color={C.success} sub={`${bestanden} bestanden`}/>
        <StatCard label="AUSSTEHEND" value={offene} icon="warn" color={C.warning} sub="offene Schulungen"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div className="card">
          <div style={{padding:"13px 18px",borderBottom:`1px solid ${C.borderLight}`,fontWeight:600,fontSize:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            Schulungsstand Mitarbeiter
            <Badge color={C.info} bg={C.infoBg}>{mitarbeiter.length} gesamt</Badge>
          </div>
          {mitarbeiter.map(ma=>{
            const mn=nachweise.filter(n=>n.ma_id===ma.id&&n.score/n.total>=0.8).length
            const pct=aktDocs>0?Math.round((mn/aktDocs)*100):0
            return (
              <div key={ma.id} style={{padding:"10px 18px",borderBottom:`1px solid ${C.borderLight}`,display:"flex",alignItems:"center",gap:12}}>
                <div className="avatar" style={{background:getAvatarColor(ma.name),color:"#fff"}}>{getInitials(ma.name)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ma.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
                    <div style={{flex:1,background:C.borderLight,borderRadius:4,height:4,overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:pct===100?C.success:C.accent,borderRadius:4}}/>
                    </div>
                    <span style={{fontSize:11,color:C.textMuted,minWidth:28}}>{mn}/{aktDocs}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="card">
          <div style={{padding:"13px 18px",borderBottom:`1px solid ${C.borderLight}`,fontWeight:600,fontSize:14}}>Module & Dokumente</div>
          {modules.map(m=>{
            const mDocs=docs.filter(d=>d.modul_id===m.id&&d.aktiv)
            return (
              <div key={m.id} style={{padding:"12px 18px",borderBottom:`1px solid ${C.borderLight}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:7,background:C.accentBg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Icon n={m.icon||"docs"} s={15} c={C.accent}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{m.name}</div>
                    <div style={{fontSize:11,color:C.textMuted}}>Modul {m.nr}</div>
                  </div>
                </div>
                <Badge color={mDocs.length>0?C.accent:C.textMuted} bg={mDocs.length>0?C.accentBg:C.surfaceAlt}>{mDocs.length} Dok.</Badge>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── DOKUMENTE ─────────────────────────────────────────────────────────────────
function Dokumente({ docs, setDocs, modules }) {
  const [search,setSearch]=useState('')
  const [filterMod,setFilterMod]=useState('all')
  const [showUpload,setShowUpload]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [newDoc,setNewDoc]=useState({nr:'',titel:'',modul_id:'m1',typ:'A',version:'',stand:'',minuten:10})
  const fileRef=useRef()

  const filtered=docs.filter(d=>{
    const q=search.toLowerCase()
    return (d.titel.toLowerCase().includes(q)||d.nr.includes(q))&&(filterMod==='all'||d.modul_id===filterMod)
  })

  const handleUpload=async()=>{
    if(!newDoc.nr||!newDoc.titel) return
    setUploading(true)
    const { data, error } = await supabase.from('dokumente').insert({...newDoc,id:`d${newDoc.nr}`,aktiv:true}).select().single()
    if (!error && data) setDocs(p=>[...p,data])
    setNewDoc({nr:'',titel:'',modul_id:'m1',typ:'A',version:'',stand:'',minuten:10})
    setShowUpload(false); setUploading(false)
  }

  const toggleAktiv=async(dok)=>{
    await supabase.from('dokumente').update({aktiv:!dok.aktiv}).eq('id',dok.id)
    setDocs(p=>p.map(d=>d.id===dok.id?{...d,aktiv:!d.aktiv}:d))
  }

  const deleteDok=async(id)=>{
    if(!confirm('Dokument wirklich löschen?')) return
    await supabase.from('dokumente').delete().eq('id',id)
    setDocs(p=>p.filter(d=>d.id!==id))
  }

  return (
    <div className="fade-up">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <p style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:".07em",marginBottom:3}}>VERWALTUNG</p>
          <h1 style={{fontSize:22,fontWeight:700}}>Dokumente <span style={{fontSize:14,fontWeight:400,color:C.textMuted}}>({docs.filter(d=>d.aktiv).length} aktiv)</span></h1>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowUpload(true)}><Icon n="upload" s={14} c="#fff"/>Neues Dokument</button>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <input style={{...inputStyle,paddingLeft:34}} placeholder="Dokument suchen…" value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon n="search" s={15} c={C.textMuted}/></div>
        </div>
        <select value={filterMod} onChange={e=>setFilterMod(e.target.value)} style={{...inputStyle,width:"auto"}}>
          <option value="all">Alle Module</option>
          {modules.map(m=><option key={m.id} value={m.id}>Modul {m.nr} – {m.name}</option>)}
        </select>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table>
          <thead><tr><th>NR.</th><th>TITEL</th><th>MODUL</th><th>TYP</th><th>VERSION</th><th>STAND</th><th>STATUS</th><th style={{textAlign:"right"}}>AKTIONEN</th></tr></thead>
          <tbody>
            {filtered.map(d=>{
              const mod=modules.find(m=>m.id===d.modul_id)
              return (
                <tr key={d.id}>
                  <td><span style={{fontWeight:700,color:C.accent,fontSize:13}}>DOK {d.nr}</span></td>
                  <td style={{fontWeight:500,maxWidth:260}}>{d.titel}</td>
                  <td><Badge color={C.textMuted} bg={C.surfaceAlt}>M{mod?.nr}</Badge></td>
                  <td><Badge color={d.typ==='A'?C.info:C.warning} bg={d.typ==='A'?C.infoBg:C.warningBg} bdr={d.typ==='A'?C.infoBdr:C.warningBdr}>{d.typ==='A'?'Tabelle':'Fließtext'}</Badge></td>
                  <td style={{color:C.textMuted,fontSize:12}}>{d.version}</td>
                  <td style={{color:C.textMuted,fontSize:12}}>{d.stand}</td>
                  <td><Badge color={d.aktiv?C.success:C.textMuted} bg={d.aktiv?C.successBg:C.surfaceAlt} bdr={d.aktiv?C.successBdr:"transparent"}>{d.aktiv?"Aktiv":"Inaktiv"}</Badge></td>
                  <td>
                    <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                      <button className="btn btn-ghost" style={{padding:"5px 10px"}} onClick={()=>toggleAktiv(d)}><Icon n={d.aktiv?"close":"check"} s={13}/></button>
                      <button className="btn btn-danger" style={{padding:"5px 10px"}} onClick={()=>deleteDok(d.id)}><Icon n="trash" s={13} c={C.danger}/></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:C.textMuted,padding:"32px"}}>Keine Dokumente gefunden</td></tr>}
          </tbody>
        </table>
      </div>

      {showUpload&&(
        <Modal title="Neues Dokument hinzufügen" onClose={()=>setShowUpload(false)}>
          <div style={{marginBottom:14,padding:"11px 13px",background:C.infoBg,border:`1px solid ${C.infoBdr}`,borderRadius:7,fontSize:13,color:C.info}}>
            Unterstützte Formate: <strong>.docx</strong> und <strong>.pdf</strong> — Bilder &amp; Tabellen werden automatisch erkannt.
          </div>
          <div style={{border:`2px dashed ${C.border}`,borderRadius:8,padding:"24px",textAlign:"center",marginBottom:14,cursor:"pointer",background:C.bg}} onClick={()=>fileRef.current?.click()}>
            <Icon n="upload" s={26} c={C.textMuted}/>
            <div style={{marginTop:8,fontWeight:600,color:C.text,fontSize:14}}>Datei auswählen oder hierher ziehen</div>
            <div style={{fontSize:12,color:C.textMuted,marginTop:3}}>.docx oder .pdf</div>
            <input ref={fileRef} type="file" accept=".docx,.pdf" style={{display:"none"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
            <div><label style={labelStyle}>DOKUMENT-NR. *</label><input style={inputStyle} placeholder="z.B. 032" value={newDoc.nr} onChange={e=>setNewDoc(p=>({...p,nr:e.target.value}))}/></div>
            <div><label style={labelStyle}>VERSION</label><input style={inputStyle} placeholder="2009.001" value={newDoc.version} onChange={e=>setNewDoc(p=>({...p,version:e.target.value}))}/></div>
          </div>
          <div style={{marginBottom:11}}><label style={labelStyle}>TITEL *</label><input style={inputStyle} placeholder="Bezeichnung der Arbeitsanweisung" value={newDoc.titel} onChange={e=>setNewDoc(p=>({...p,titel:e.target.value}))}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11,marginBottom:18}}>
            <div><label style={labelStyle}>MODUL</label>
              <select style={inputStyle} value={newDoc.modul_id} onChange={e=>setNewDoc(p=>({...p,modul_id:e.target.value}))}>
                {modules.map(m=><option key={m.id} value={m.id}>M{m.nr} – {m.name.split(' ')[0]}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>TYP</label>
              <select style={inputStyle} value={newDoc.typ} onChange={e=>setNewDoc(p=>({...p,typ:e.target.value}))}>
                <option value="A">A – Tabelle/Schritte</option>
                <option value="B">B – Fließtext</option>
              </select>
            </div>
            <div><label style={labelStyle}>MINUTEN</label><input type="number" style={inputStyle} value={newDoc.minuten} onChange={e=>setNewDoc(p=>({...p,minuten:+e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="btn btn-ghost" onClick={()=>setShowUpload(false)}>Abbrechen</button>
            <button className="btn btn-primary" disabled={!newDoc.nr||!newDoc.titel||uploading} onClick={handleUpload}>
              {uploading?<><Spinner/>Wird gespeichert…</>:<><Icon n="upload" s={13} c="#fff"/>Hochladen</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── MITARBEITER ───────────────────────────────────────────────────────────────
function Mitarbeiter({ mitarbeiter, setMitarbeiter, docs, nachweise }) {
  const [showAdd,setShowAdd]=useState(false)
  const [showDetail,setShowDetail]=useState(null)
  const [search,setSearch]=useState('')
  const [saving,setSaving]=useState(false)
  const [newMa,setNewMa]=useState({name:'',personal:'',email:'',abt:''})
  const aktDocs=docs.filter(d=>d.aktiv).length

  const addMa=async()=>{
    if(!newMa.name||!newMa.personal) return
    setSaving(true)
    const {data,error}=await supabase.from('mitarbeiter').insert(newMa).select().single()
    if(!error&&data) setMitarbeiter(p=>[...p,data])
    setNewMa({name:'',personal:'',email:'',abt:''}); setShowAdd(false); setSaving(false)
  }

  const filtered=mitarbeiter.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())||m.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-up">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <p style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:".07em",marginBottom:3}}>VERWALTUNG</p>
          <h1 style={{fontSize:22,fontWeight:700}}>Mitarbeiter <span style={{fontSize:14,fontWeight:400,color:C.textMuted}}>({mitarbeiter.length})</span></h1>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowAdd(true)}><Icon n="plus" s={14} c="#fff"/>Mitarbeiter hinzufügen</button>
      </div>
      <div style={{position:"relative",marginBottom:14,maxWidth:300}}>
        <input style={{...inputStyle,paddingLeft:34}} placeholder="Name oder E-Mail…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon n="search" s={15} c={C.textMuted}/></div>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table>
          <thead><tr><th>MITARBEITER</th><th>E-MAIL</th><th>PERSONAL-NR.</th><th>ABTEILUNG</th><th>SCHULUNGSSTAND</th><th style={{textAlign:"right"}}>DETAIL</th></tr></thead>
          <tbody>
            {filtered.map(ma=>{
              const mn=nachweise.filter(n=>n.ma_id===ma.id&&n.score/n.total>=0.8).length
              const pct=aktDocs>0?Math.round((mn/aktDocs)*100):0
              return (
                <tr key={ma.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div className="avatar" style={{background:getAvatarColor(ma.name),color:"#fff"}}>{getInitials(ma.name)}</div>
                      <span style={{fontWeight:600,fontSize:14}}>{ma.name}</span>
                    </div>
                  </td>
                  <td><a href={`mailto:${ma.email}`} style={{fontSize:13,color:C.info,textDecoration:"none",display:"flex",alignItems:"center",gap:5}}><Icon n="mail" s={12} c={C.info}/>{ma.email}</a></td>
                  <td><span style={{fontFamily:"monospace",fontSize:12,color:C.textMuted,background:C.surfaceAlt,padding:"2px 8px",borderRadius:4}}>{ma.personal}</span></td>
                  <td><Badge color={C.info} bg={C.infoBg}>{ma.abt||"—"}</Badge></td>
                  <td style={{minWidth:160}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,background:C.borderLight,borderRadius:4,height:6,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:pct===100?C.success:C.accent,borderRadius:4}}/>
                      </div>
                      <span style={{fontSize:12,color:C.textMuted,minWidth:36}}>{mn}/{aktDocs}</span>
                    </div>
                  </td>
                  <td style={{textAlign:"right"}}>
                    <button className="btn btn-ghost" style={{padding:"5px 12px"}} onClick={()=>setShowDetail(ma)}><Icon n="eye" s={13}/>Details</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showAdd&&(
        <Modal title="Mitarbeiter hinzufügen" onClose={()=>setShowAdd(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
            <div><label style={labelStyle}>NAME *</label><input style={inputStyle} placeholder="Vorname Nachname" value={newMa.name} onChange={e=>setNewMa(p=>({...p,name:e.target.value}))}/></div>
            <div><label style={labelStyle}>PERSONALNUMMER *</label><input style={inputStyle} placeholder="MA-010" value={newMa.personal} onChange={e=>setNewMa(p=>({...p,personal:e.target.value}))}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:18}}>
            <div><label style={labelStyle}>E-MAIL</label><input style={inputStyle} placeholder="vorname@psarbeitssicherheit.de" value={newMa.email} onChange={e=>setNewMa(p=>({...p,email:e.target.value}))}/></div>
            <div><label style={labelStyle}>ABTEILUNG</label><input style={inputStyle} placeholder="z.B. Technik" value={newMa.abt} onChange={e=>setNewMa(p=>({...p,abt:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Abbrechen</button>
            <button className="btn btn-primary" disabled={!newMa.name||!newMa.personal||saving} onClick={addMa}>
              {saving?<Spinner/>:<><Icon n="plus" s={13} c="#fff"/>Hinzufügen</>}
            </button>
          </div>
        </Modal>
      )}

      {showDetail&&(
        <Modal title={`Schulungsstand: ${showDetail.name}`} onClose={()=>setShowDetail(null)} width={640}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,padding:"14px 16px",background:C.surfaceAlt,borderRadius:8}}>
            <div className="avatar" style={{background:getAvatarColor(showDetail.name),color:"#fff",width:44,height:44,fontSize:16}}>{getInitials(showDetail.name)}</div>
            <div>
              <div style={{fontWeight:700,fontSize:16}}>{showDetail.name}</div>
              <div style={{fontSize:13,color:C.textMuted,display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                <Icon n="mail" s={12} c={C.textMuted}/>{showDetail.email}
                <span style={{fontFamily:"monospace",fontSize:11,background:C.border,padding:"1px 6px",borderRadius:3}}>{showDetail.personal}</span>
              </div>
            </div>
          </div>
          <div className="card" style={{overflow:"hidden"}}>
            <table>
              <thead><tr><th>DOKUMENT</th><th>DATUM</th><th>ERGEBNIS</th><th>STATUS</th></tr></thead>
              <tbody>
                {docs.filter(d=>d.aktiv).map(d=>{
                  const n=nachweise.find(n=>n.ma_id===showDetail.id&&n.dok_id===d.id)
                  return (
                    <tr key={d.id}>
                      <td style={{fontSize:13}}><span style={{color:C.accent,fontWeight:700}}>DOK {d.nr}</span> <span style={{color:C.textMuted}}>{d.titel}</span></td>
                      <td style={{fontSize:12,color:C.textMuted}}>{n?.datum||"—"}</td>
                      <td style={{fontSize:13,fontWeight:n?600:400}}>{n?`${n.score}/${n.total}`:"—"}</td>
                      <td>
                        {n
                          ? <Badge color={n.score/n.total>=0.8?C.success:C.danger} bg={n.score/n.total>=0.8?C.successBg:C.dangerBg} bdr={n.score/n.total>=0.8?C.successBdr:C.dangerBdr}>{n.score/n.total>=0.8?"✓ Bestanden":"✗ Nicht bestanden"}</Badge>
                          : <Badge color={C.warning} bg={C.warningBg} bdr={C.warningBdr}>⏳ Ausstehend</Badge>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── NACHWEISE ─────────────────────────────────────────────────────────────────
function Nachweise({ nachweise, mitarbeiter, docs }) {
  const exportCSV=()=>{
    const rows=[["Name","Personal-Nr.","E-Mail","Dokument","Datum","Ergebnis","Status","Nachweis-ID"]]
    nachweise.forEach(n=>{
      const ma=mitarbeiter.find(m=>m.id===n.ma_id)
      const doc=docs.find(d=>d.id===n.dok_id)
      rows.push([ma?.name,ma?.personal,ma?.email,`DOK ${doc?.nr} – ${doc?.titel}`,n.datum,`${n.score}/${n.total}`,n.score/n.total>=0.8?"Bestanden":"Nicht bestanden",n.nachweis_id])
    })
    const csv=rows.map(r=>r.join(";")).join("\n")
    const a=document.createElement("a")
    a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv)
    a.download=`PSA_Schulungsnachweise_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return (
    <div className="fade-up">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <p style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:".07em",marginBottom:3}}>DOKUMENTATION</p>
          <h1 style={{fontSize:22,fontWeight:700}}>Schulungsnachweise</h1>
        </div>
        <button className="btn btn-ghost" onClick={exportCSV}><Icon n="dl" s={14}/>CSV exportieren</button>
      </div>
      {nachweise.length===0?(
        <div className="card" style={{padding:"56px 24px",textAlign:"center"}}>
          <Icon n="check" s={40} c={C.textDim}/>
          <div style={{fontSize:16,fontWeight:600,color:C.textMuted,marginTop:14}}>Noch keine Schulungsnachweise vorhanden</div>
          <div style={{fontSize:13,color:C.textDim,marginTop:6}}>Nachweise erscheinen hier sobald Mitarbeiter Schulungen abschließen.</div>
        </div>
      ):(
        <div className="card" style={{overflow:"hidden"}}>
          <table>
            <thead><tr><th>MITARBEITER</th><th>DOKUMENT</th><th>DATUM</th><th>ERGEBNIS</th><th>STATUS</th><th>NACHWEIS-ID</th></tr></thead>
            <tbody>
              {nachweise.map(n=>{
                const ma=mitarbeiter.find(m=>m.id===n.ma_id)
                const doc=docs.find(d=>d.id===n.dok_id)
                const ok=n.score/n.total>=0.8
                return (
                  <tr key={n.id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:9}}>
                        <div className="avatar" style={{background:getAvatarColor(ma?.name||""),color:"#fff",width:30,height:30,fontSize:11}}>{getInitials(ma?.name||"?")}</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:13}}>{ma?.name}</div>
                          <div style={{fontSize:11,color:C.textMuted}}>{ma?.personal}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{color:C.accent,fontWeight:700,fontSize:12}}>DOK {doc?.nr}</span><div style={{fontSize:12,color:C.textMuted,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc?.titel}</div></td>
                    <td style={{fontSize:13,color:C.textMuted,whiteSpace:"nowrap"}}>{n.datum}</td>
                    <td><span style={{fontWeight:700,color:ok?C.success:C.danger}}>{n.score}/{n.total}</span><span style={{fontSize:11,color:C.textMuted}}> ({Math.round(n.score/n.total*100)}%)</span></td>
                    <td><Badge color={ok?C.success:C.danger} bg={ok?C.successBg:C.dangerBg} bdr={ok?C.successBdr:C.dangerBdr}>{ok?"✓ Bestanden":"✗ Nicht bestanden"}</Badge></td>
                    <td><span style={{fontFamily:"monospace",fontSize:11,color:C.textDim}}>{n.nachweis_id}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── MAIN ADMIN APP ────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [page,setPage]=useState('dashboard')
  const [docs,setDocs]=useState([])
  const [modules,setModules]=useState([])
  const [mitarbeiter,setMitarbeiter]=useState([])
  const [nachweise,setNachweise]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    const load=async()=>{
      const [{ data: mods },{ data: doks },{ data: ma },{ data: nw }] = await Promise.all([
        supabase.from('module').select('*').order('nr'),
        supabase.from('dokumente').select('*').order('nr'),
        supabase.from('mitarbeiter').select('*').order('name'),
        supabase.from('nachweise').select('*').order('created_at',{ascending:false}),
      ])
      setModules(mods||[])
      setDocs(doks||[])
      setMitarbeiter(ma||[])
      setNachweise(nw||[])
      setLoading(false)
    }
    load()
  },[])

  const nav=[
    {id:"dashboard",label:"Dashboard",icon:"dashboard"},
    {id:"dokumente",label:"Dokumente",icon:"docs"},
    {id:"mitarbeiter",label:"Mitarbeiter",icon:"users"},
    {id:"nachweise",label:"Nachweise",icon:"check"},
  ]

  if(loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",gap:12,color:C.textMuted}}>
      <Spinner size={24} color={C.accent}/> Daten werden geladen…
    </div>
  )

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <div style={{width:220,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
        <div style={{padding:"16px 14px",borderBottom:`1px solid ${C.borderLight}`}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{background:C.accent,borderRadius:7,padding:"5px 7px",display:"flex"}}><Icon n="shield" s={16} c="#fff"/></div>
            <div>
              <div style={{fontWeight:700,fontSize:13,lineHeight:1}}>PSArbeitssicherheit</div>
              <div style={{fontSize:10,color:C.textMuted,letterSpacing:".06em",marginTop:2}}>ADMIN PANEL</div>
            </div>
          </div>
        </div>
        <nav style={{padding:"10px 8px",flex:1}}>
          <div style={{fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:".08em",padding:"6px 8px",marginBottom:2}}>NAVIGATION</div>
          {nav.map(item=>(
            <button key={item.id} className={`nav-item${page===item.id?" active":""}`} onClick={()=>setPage(item.id)}>
              <Icon n={item.icon} s={15} c={page===item.id?C.accent:C.textMuted}/>{item.label}
              {item.id==="dokumente"&&<span style={{marginLeft:"auto",background:C.accentBg,color:C.accent,borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:700}}>{docs.filter(d=>d.aktiv).length}</span>}
              {item.id==="mitarbeiter"&&<span style={{marginLeft:"auto",background:C.infoBg,color:C.info,borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:700}}>{mitarbeiter.length}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",borderTop:`1px solid ${C.borderLight}`}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div className="avatar" style={{background:C.accent,color:"#fff",width:30,height:30,fontSize:11}}>MB</div>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>Michael Butera</div>
              <div style={{fontSize:10,color:C.textDim}}>Geschäftsführer</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{flex:1,padding:"28px 26px",overflowY:"auto",minWidth:0}}>
        {page==="dashboard"  &&<Dashboard docs={docs} modules={modules} mitarbeiter={mitarbeiter} nachweise={nachweise}/>}
        {page==="dokumente"  &&<Dokumente docs={docs} setDocs={setDocs} modules={modules}/>}
        {page==="mitarbeiter"&&<Mitarbeiter mitarbeiter={mitarbeiter} setMitarbeiter={setMitarbeiter} docs={docs} nachweise={nachweise}/>}
        {page==="nachweise"  &&<Nachweise nachweise={nachweise} mitarbeiter={mitarbeiter} docs={docs}/>}
      </div>
    </div>
  )
}
