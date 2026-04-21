import { loadDokumentUrl, generateFragen, saveFragen, loadFragen } from './docProcessor.js'
import { supabase } from './supabase.js'
import { C } from './theme.js'
import { Icon, Badge, ProgressBar, Spinner } from './components.jsx'
import { loadDokumentText, generateFragen, saveFragen, loadFragen } from './docProcessor.js'

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [personal, setPersonal] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const go = async () => {
    if (!name.trim() || !personal.trim()) { setErr('Bitte alle Felder ausfüllen.'); return }
    setLoading(true); setErr('')
    const { data, error } = await supabase
      .from('mitarbeiter').select('*')
      .eq('personal', personal.trim())
      .ilike('name', name.trim())
      .single()
    setLoading(false)
    if (error || !data) { setErr('Mitarbeiter nicht gefunden. Bitte Name und Personalnummer prüfen.'); return }
    onLogin(data)
  }

  const inp = { width:"100%",padding:"10px 13px",border:`1px solid ${C.border}`,borderRadius:6,fontSize:14,color:C.text,background:C.surface }

  return (
    <div className="fade-up" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:C.bg}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"10px 20px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:C.shadow}}>
            <div style={{background:C.accent,borderRadius:6,padding:"6px 8px",display:"flex"}}><Icon n="shield" s={20} c="#fff"/></div>
            <div style={{textAlign:"left"}}>
              <div style={{fontWeight:700,fontSize:16,lineHeight:1}}>PSArbeitssicherheit</div>
              <div style={{fontSize:10,color:C.textMuted,letterSpacing:".08em",marginTop:2}}>E-LEARNING PORTAL</div>
            </div>
          </div>
        </div>
        <div className="card" style={{padding:"32px 28px"}}>
          <h1 style={{fontSize:22,fontWeight:700,marginBottom:6}}>Anmelden</h1>
          <p style={{color:C.textMuted,fontSize:14,marginBottom:24}}>Bitte Name und Personalnummer eingeben.</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:C.textMuted,marginBottom:5,letterSpacing:".06em"}}>NAME</label>
              <input style={inp} placeholder="Vorname Nachname" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:C.textMuted,marginBottom:5,letterSpacing:".06em"}}>PERSONALNUMMER</label>
              <input style={inp} placeholder="z.B. MA-001" value={personal} onChange={e=>setPersonal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()}/>
            </div>
            {err&&<div style={{display:"flex",gap:7,alignItems:"center",fontSize:13,color:C.danger,background:C.dangerBg,border:`1px solid ${C.dangerBdr}`,padding:"9px 13px",borderRadius:6}}><Icon n="warn" s={14} c={C.danger}/>{err}</div>}
            <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={go} disabled={loading}>
              {loading ? <Spinner/> : 'Anmelden & Schulung starten'}
            </button>
          </div>
        </div>
        <p style={{marginTop:12,textAlign:"center",fontSize:12,color:C.textDim,display:"flex",alignItems:"center",gap:5,justifyContent:"center"}}>
          <Icon n="lock" s={12} c={C.textDim}/>Schulungsnachweise werden sicher gespeichert
        </p>
      </div>
    </div>
  )
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function Overview({ user, onSelect }) {
  const [modules, setModules] = useState([])
  const [docs, setDocs] = useState([])
  const [nachweise, setNachweise] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: mods }, { data: doks }, { data: nw }] = await Promise.all([
        supabase.from('module').select('*').order('nr'),
        supabase.from('dokumente').select('*').eq('aktiv', true).order('nr'),
        supabase.from('nachweise').select('*').eq('ma_id', user.id),
      ])
      setModules(mods||[]); setDocs(doks||[]); setNachweise(nw||[])
      setLoading(false)
    }
    load()
  }, [user.id])

  const getDone = (docId) => nachweise.find(n => n.dok_id === docId && n.score/n.total >= 0.8)
  const total = docs.length
  const abg = docs.filter(d => getDone(d.id)).length

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",gap:12,color:C.textMuted}}>
      <Spinner size={28} color={C.accent}/> Schulungen werden geladen…
    </div>
  )

  return (
    <div className="fade-up" style={{maxWidth:860,margin:"0 auto",padding:"36px 24px"}}>
      <div style={{marginBottom:28,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16}}>
        <div>
          <p style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:".07em",marginBottom:4}}>SCHULUNGSPORTAL</p>
          <h1 style={{fontSize:26,fontWeight:700}}>Willkommen, {user.name.split(' ')[0]}</h1>
          <p style={{color:C.textMuted,fontSize:14,marginTop:4}}>Personal-Nr.: <strong>{user.personal}</strong></p>
        </div>
        {total > 0 && (
          <div className="card" style={{padding:"14px 20px",textAlign:"center",minWidth:140}}>
            <div style={{fontSize:28,fontWeight:700,color:abg===total?C.success:C.accent}}>{abg}/{total}</div>
            <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>Abgeschlossen</div>
            <div style={{marginTop:8}}><ProgressBar value={abg} max={total||1}/></div>
          </div>
        )}
      </div>

      {modules.map(m => {
        const mDocs = docs.filter(d => d.modul_id === m.id)
        return (
          <div key={m.id} style={{marginBottom:22}}>
            <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:10,marginBottom:10,borderBottom:`2px solid ${C.borderLight}`,flexWrap:"wrap"}}>
              <Badge color={C.accent} bg={C.accentBg}>MODUL {m.nr}</Badge>
              <span style={{fontWeight:700,fontSize:15}}>{m.name}</span>
            </div>
            {mDocs.length === 0 ? (
              <div style={{border:`1px dashed ${C.border}`,borderRadius:8,padding:"18px 20px",display:"flex",alignItems:"center",gap:10,color:C.textDim,background:C.surface}}>
                <Icon n="plus" s={15} c={C.textDim}/>
                <span style={{fontSize:13}}>Dokumente werden in Kürze hinzugefügt</span>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {mDocs.map(dok => {
                  const done = getDone(dok.id)
                  return (
                    <div key={dok.id} className="card"
                      style={{padding:"15px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"box-shadow .15s,border-color .15s",borderColor:done?"rgba(45,106,79,.35)":C.border}}
                      onClick={() => onSelect(m, dok)}
                      onMouseEnter={e=>{e.currentTarget.style.boxShadow=C.shadowMd;e.currentTarget.style.borderColor=done?"rgba(45,106,79,.5)":C.accent}}
                      onMouseLeave={e=>{e.currentTarget.style.boxShadow=C.shadow;e.currentTarget.style.borderColor=done?"rgba(45,106,79,.35)":C.border}}>
                      <div style={{width:40,height:40,borderRadius:8,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:done?C.successBg:C.accentBg}}>
                        {done ? <Icon n="check" s={18} c={C.success}/> : <Icon n="docs" s={18} c={C.accent}/>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:11,color:C.textMuted,fontWeight:600}}>DOK {dok.nr}</span>
                          {done && <Badge color={C.success} bg={C.successBg} bdr={C.successBdr}>✓ Abgeschlossen · {done.datum}</Badge>}
                        </div>
                        <div style={{fontWeight:600,fontSize:15}}>{dok.titel}</div>
                        <div style={{fontSize:12,color:C.textMuted}}>Version {dok.version} · Stand {dok.stand}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:5,color:C.textMuted,fontSize:13,flexShrink:0}}>
                        <Icon n="clock" s={13} c={C.textMuted}/>ca. {dok.minuten} Min.<Icon n="right" s={14} c={C.textMuted}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── READER ────────────────────────────────────────────────────────────────────
function Reader({ modul, dok, onWeiter, onBack }) {
  const [gelesen, setGelesen] = useState(false)
  const [dokumentText, setDokumentText] = useState(null)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const text = await loadDokumentText(dok.nr)
      setDokumentText(text)
      setLoading(false)
    }
    load()
  }, [dok.nr])

  useEffect(() => {
    const el = ref.current; if (!el) return
    const fn = () => { if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setGelesen(true) }
    el.addEventListener('scroll', fn)
    return () => el.removeEventListener('scroll', fn)
  }, [loading])

  const absaetze = dokumentText
    ? dokumentText.split('\n').filter(l => l.trim().length > 0)
    : []

  return (
    <div className="fade-up" style={{maxWidth:820,margin:"0 auto",padding:"28px 24px"}}>
      <button className="btn btn-ghost" style={{marginBottom:18,fontSize:13}} onClick={onBack}>
        <Icon n="back" s={14}/>Zurück zur Übersicht
      </button>
      <div className="card" style={{overflow:"hidden"}}>
        <div style={{padding:"20px 24px",background:`linear-gradient(to right,${C.accentBg},${C.surface})`,borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <Badge color={C.accent} bg={C.accentBg}>MODUL {modul.nr}</Badge>
            <Badge color={C.textMuted} bg={C.surfaceAlt}>DOK {dok.nr}</Badge>
            <Badge color={dok.typ==='A'?C.info:C.warning} bg={dok.typ==='A'?C.infoBg:C.warningBg} bdr={dok.typ==='A'?C.infoBdr:C.warningBdr}>
              {dok.typ==='A'?'Tabellen-Format':'Fließtext'}
            </Badge>
          </div>
          <h1 style={{fontSize:20,fontWeight:700,marginBottom:3}}>{dok.titel}</h1>
          <p style={{fontSize:12,color:C.textMuted}}>Version {dok.version} · Stand {dok.stand}</p>
          <div style={{marginTop:12,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:12,color:C.textMuted,whiteSpace:"nowrap"}}>Lesefortschritt</span>
            <ProgressBar value={gelesen?1:0} max={1}/>
            {gelesen && <Badge color={C.success} bg={C.successBg} bdr={C.successBdr}><Icon n="check" s={11} c={C.success}/>Gelesen</Badge>}
          </div>
        </div>

        <div ref={ref} style={{maxHeight:"55vh",overflowY:"auto",padding:"20px 24px"}}>
          {loading ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px",gap:12,color:C.textMuted}}>
              <Spinner size={24} color={C.accent}/><span>Dokument wird geladen…</span>
            </div>
          ) : !dokumentText ? (
            <div style={{padding:"32px",textAlign:"center",color:C.textMuted}}>
              <Icon n="docs" s={40} c={C.textDim}/>
              <p style={{marginTop:12,fontSize:14,fontWeight:600}}>Dokument noch nicht verfügbar</p>
              <p style={{marginTop:6,fontSize:13,color:C.textDim}}>Die Datei d{dok.nr}.docx wurde noch nicht hochgeladen.</p>
              <button className="btn btn-ghost" style={{marginTop:16,fontSize:12}} onClick={()=>setGelesen(true)}>
                Trotzdem fortfahren
              </button>
            </div>
          ) : (
            <div>
              {absaetze.map((absatz, i) => {
                const isWarning = /warnung|gefahr|vorsicht|verboten/i.test(absatz)
                const isHeading = absatz.length < 80 && !absatz.endsWith('.') && /^\d+\.|^[A-ZÄÖÜ]/.test(absatz)
                const isBullet = /^[•\-–·]/.test(absatz)
                if (isWarning) return (
                  <div key={i} style={{margin:"10px 0",padding:"10px 14px",background:C.warningBg,border:`1px solid ${C.warningBdr}`,borderRadius:7,fontSize:13,color:C.warning,display:"flex",gap:8,alignItems:"flex-start"}}>
                    <Icon n="warn" s={15} c={C.warning}/><span>{absatz}</span>
                  </div>
                )
                if (isHeading) return (
                  <h3 key={i} style={{fontSize:15,fontWeight:700,color:C.text,margin:"18px 0 8px",paddingBottom:6,borderBottom:`1px solid ${C.borderLight}`}}>{absatz}</h3>
                )
                if (isBullet) return (
                  <div key={i} style={{display:"flex",gap:8,margin:"4px 0",paddingLeft:8}}>
                    <span style={{color:C.accent,flexShrink:0}}>•</span>
                    <span style={{fontSize:14,color:C.textMuted,lineHeight:1.7}}>{absatz.replace(/^[•\-–·]\s*/,'')}</span>
                  </div>
                )
                return <p key={i} style={{fontSize:14,color:C.textMuted,lineHeight:1.85,margin:"6px 0"}}>{absatz}</p>
              })}
            </div>
          )}
          <div style={{textAlign:"center",padding:"24px 0 8px",fontSize:12,color:C.textDim}}>— Ende des Dokuments —</div>
        </div>

        <div style={{padding:"14px 24px",borderTop:`1px solid ${C.border}`,background:C.bg,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <p style={{fontSize:13,color:gelesen?C.success:C.textMuted,display:"flex",alignItems:"center",gap:6}}>
            {gelesen ? <><Icon n="check" s={14} c={C.success}/>Dokument vollständig gelesen</> : "Bitte bis zum Ende scrollen"}
          </p>
          <button className="btn btn-primary" disabled={!gelesen} onClick={onWeiter}>
            Zum Quiz <Icon n="right" s={14} c="#fff"/>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── QUIZ ──────────────────────────────────────────────────────────────────────
function Quiz({ user, modul, dok, onDone, onBack }) {
  const [fragen, setFragen] = useState(null)
  const [loadingFragen, setLoadingFragen] = useState(true)
  const [generatingMsg, setGeneratingMsg] = useState('')
  const [idx, setIdx] = useState(0)
  const [ans, setAns] = useState({})
  const [conf, setConf] = useState(false)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fragen laden oder generieren
  useEffect(() => {
    const load = async () => {
      setLoadingFragen(true)

      // Zuerst aus DB laden
      const gespeichert = await loadFragen(dok.id)
      if (gespeichert && gespeichert.length > 0) {
        setFragen(gespeichert)
        setLoadingFragen(false)
        return
      }

      // Nicht vorhanden → per Claude API generieren
      setGeneratingMsg('Dokument wird analysiert…')
      const text = await loadDokumentText(dok.nr)

      if (!text) {
        // Fallback-Fragen wenn kein Dokument vorhanden
        setFragen([
          {id:1,frage:`Ich habe das Dokument "${dok.titel}" vollständig gelesen.`,optionen:["Ja, vollständig gelesen","Nein, nicht gelesen"],richtig:0,erklaerung:"Danke für die Bestätigung."},
          {id:2,frage:"Ich werde die beschriebenen Sicherheitsregeln einhalten.",optionen:["Ja, werde ich einhalten","Nein"],richtig:0,erklaerung:"Arbeitssicherheit hat oberste Priorität."},
          {id:3,frage:"Bei Unklarheiten wende ich mich an meinen Vorgesetzten oder die FASI.",optionen:["Ja, korrekt","Nein"],richtig:0,erklaerung:"Rückfragen sind immer erwünscht."},
        ])
        setLoadingFragen(false)
        return
      }

      setGeneratingMsg('KI generiert Prüfungsfragen…')
      const generiert = await generateFragen(text, dok.titel, dok.typ)

      if (generiert && generiert.length > 0) {
        // In DB speichern für nächstes Mal
        await saveFragen(dok.id, generiert)
        setFragen(generiert)
      } else {
        // Fallback
        setFragen([
          {id:1,frage:`Ich habe das Dokument "${dok.titel}" vollständig gelesen.`,optionen:["Ja, vollständig gelesen","Nein, nicht gelesen"],richtig:0,erklaerung:"Danke für die Bestätigung."},
          {id:2,frage:"Ich werde die beschriebenen Sicherheitsregeln einhalten.",optionen:["Ja, werde ich einhalten","Nein"],richtig:0,erklaerung:"Arbeitssicherheit hat oberste Priorität."},
        ])
      }
      setLoadingFragen(false)
    }
    load()
  }, [dok.id, dok.nr])

  if (loadingFragen) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:16,color:C.textMuted}}>
      <Spinner size={32} color={C.accent}/>
      <div style={{textAlign:"center"}}>
        <p style={{fontWeight:600,color:C.text}}>{generatingMsg || 'Fragen werden geladen…'}</p>
        <p style={{fontSize:13,marginTop:4}}>Die KI analysiert das Dokument und erstellt passende Prüfungsfragen.</p>
      </div>
    </div>
  )

  const q = fragen[idx]
  const chosen = ans[idx]
  const correct = chosen === q.richtig
  const score = fragen.filter((_,i) => ans[i] === fragen[i].richtig).length
  const passed = score >= Math.ceil(fragen.length * 0.8)

  const saveNachweis = async () => {
    setSaving(true)
    const datum = new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})
    const nachweisId = `PSA-${Date.now().toString(36).toUpperCase()}`
    await supabase.from('nachweise').insert({
      ma_id: user.id, dok_id: dok.id,
      score, total: fragen.length,
      nachweis_id: nachweisId, datum,
    })
    generateCert(user, modul, dok, score, fragen.length, datum, nachweisId)
    setSaving(false)
    onDone()
  }

  if (finished) return (
    <div className="fade-up" style={{maxWidth:600,margin:"0 auto",padding:"40px 24px",textAlign:"center"}}>
      <div className="card" style={{padding:"40px 32px",borderColor:passed?C.successBdr:C.dangerBdr,borderWidth:2}}>
        <div style={{fontSize:48,marginBottom:14}}>{passed?"🏆":"📖"}</div>
        <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>{passed?"Bestanden!":"Nicht bestanden"}</h2>
        <div style={{fontSize:40,fontWeight:700,color:passed?C.success:C.danger,margin:"14px 0"}}>{score}/{fragen.length}</div>
        <p style={{color:C.textMuted,fontSize:14,marginBottom:28,lineHeight:1.7}}>
          {passed
            ? `Du hast ${score} von ${fragen.length} Fragen korrekt beantwortet. Dein Schulungsnachweis wird gespeichert und heruntergeladen.`
            : `Mindestens ${Math.ceil(fragen.length*0.8)} Richtige erforderlich. Bitte das Dokument erneut lesen.`}
        </p>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          {!passed && <button className="btn btn-ghost" onClick={onBack}><Icon n="back" s={14}/>Nochmals lesen</button>}
          {passed && <button className="btn btn-primary" disabled={saving} onClick={saveNachweis}>
            {saving ? <Spinner/> : <><Icon n="dl" s={14} c="#fff"/>Nachweis speichern & herunterladen</>}
          </button>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="fade-up" style={{maxWidth:700,margin:"0 auto",padding:"28px 24px"}}>
      <button className="btn btn-ghost" style={{marginBottom:18,fontSize:13}} onClick={onBack}><Icon n="back" s={14}/>Zurück zum Dokument</button>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <span style={{fontSize:12,color:C.textMuted,fontWeight:600,whiteSpace:"nowrap"}}>Frage {idx+1} von {fragen.length}</span>
        <div style={{background:C.borderLight,borderRadius:4,height:5,overflow:"hidden",flex:1}}>
          <div style={{width:`${((idx+(conf?1:0))/fragen.length)*100}%`,height:"100%",background:C.accent,borderRadius:4,transition:"width .4s"}}/>
        </div>
      </div>
      <div className="card">
        <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.borderLight}`}}>
          <p style={{fontWeight:600,fontSize:16,lineHeight:1.5}}>{q.frage}</p>
        </div>
        <div style={{padding:"14px 24px",display:"flex",flexDirection:"column",gap:8}}>
          {q.optionen.map((opt,i) => {
            let bg=C.surface,bc=C.border,tc=C.text
            if(chosen===i&&!conf){bg=C.accentBg;bc=C.accent}
            if(conf&&i===q.richtig){bg=C.successBg;bc=C.successBdr;tc=C.success}
            if(conf&&chosen===i&&i!==q.richtig){bg=C.dangerBg;bc=C.dangerBdr;tc=C.danger}
            return (
              <div key={i} onClick={()=>!conf&&setAns(a=>({...a,[idx]:i}))}
                style={{border:`1px solid ${bc}`,borderRadius:8,padding:"11px 15px",cursor:conf?"default":"pointer",background:bg,color:tc,display:"flex",alignItems:"center",gap:12,transition:"all .15s",fontSize:14}}>
                <div style={{width:24,height:24,borderRadius:"50%",border:`1.5px solid ${bc}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,background:chosen===i&&!conf?C.accent:"transparent",color:chosen===i&&!conf?"#fff":tc}}>
                  {conf&&i===q.richtig?<Icon n="check" s={13} c={C.success}/>:conf&&chosen===i&&i!==q.richtig?<Icon n="close" s={13} c={C.danger}/>:String.fromCharCode(65+i)}
                </div>
                {opt}
              </div>
            )
          })}
        </div>
        {conf && (
          <div style={{margin:"0 24px 14px",padding:"11px 15px",background:correct?C.successBg:C.dangerBg,border:`1px solid ${correct?C.successBdr:C.dangerBdr}`,borderRadius:8}}>
            <p style={{fontWeight:600,fontSize:13,color:correct?C.success:C.danger,marginBottom:3}}>{correct?"✓ Richtig!":"✗ Leider falsch"}</p>
            <p style={{fontSize:13,color:C.textMuted,lineHeight:1.6}}>{q.erklaerung}</p>
          </div>
        )}
        <div style={{padding:"12px 24px",borderTop:`1px solid ${C.borderLight}`,display:"flex",justifyContent:"flex-end",gap:10}}>
          {!conf
            ? <button className="btn btn-primary" disabled={chosen===undefined} onClick={()=>chosen!==undefined&&setConf(true)}>Bestätigen</button>
            : <button className="btn btn-primary" onClick={()=>{if(idx<fragen.length-1){setIdx(i=>i+1);setConf(false)}else setFinished(true)}}>
                {idx<fragen.length-1?"Nächste Frage":"Auswertung"}<Icon n="right" s={14} c="#fff"/>
              </button>}
        </div>
      </div>
    </div>
  )
}

// ── PDF CERTIFICATE ───────────────────────────────────────────────────────────
function generateCert(user, modul, dok, score, total, datum, nachweisId) {
  const w=794,h=561,cv=document.createElement("canvas")
  cv.width=w;cv.height=h;const ctx=cv.getContext("2d")
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,w,h)
  ctx.fillStyle="#fdf5f4";ctx.fillRect(0,0,w,72)
  ctx.fillStyle="#fdf5f4";ctx.fillRect(0,h-55,w,55)
  ctx.fillStyle="#c0392b";ctx.fillRect(0,0,w,5)
  ctx.fillStyle="#c0392b";ctx.fillRect(0,h-5,w,5)
  ctx.fillStyle="#c0392b";ctx.font="bold 13px sans-serif";ctx.textAlign="left";ctx.fillText("■ PSArbeitssicherheit GmbH  —  Schulungsnachweis",32,38)
  ctx.fillStyle="#6c757d";ctx.font="11px sans-serif";ctx.textAlign="right";ctx.fillText("Solingen · psarbeitssicherheit.de",w-32,38)
  ctx.textAlign="center"
  ctx.fillStyle="#1a1a2e";ctx.font="bold 30px sans-serif";ctx.fillText("Nachweis der Unterweisung",w/2,122)
  ctx.strokeStyle="#dee2e6";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(60,138);ctx.lineTo(w-60,138);ctx.stroke()
  ctx.fillStyle="#6c757d";ctx.font="14px sans-serif";ctx.fillText("Hiermit wird bestätigt, dass",w/2,174)
  ctx.fillStyle="#c0392b";ctx.font="bold 26px sans-serif";ctx.fillText(user.name,w/2,212)
  ctx.fillStyle="#adb5bd";ctx.font="11px monospace";ctx.fillText("Personal-Nr.: "+user.personal,w/2,234)
  ctx.fillStyle="#6c757d";ctx.font="13px sans-serif";ctx.fillText("das folgende Dokument gelesen und die Prüfungsfragen erfolgreich beantwortet hat:",w/2,268)
  ctx.fillStyle="#fdf5f4";ctx.beginPath();ctx.roundRect(190,282,w-380,68,8);ctx.fill()
  ctx.strokeStyle="#f5b7b1";ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(190,282,w-380,68,8);ctx.stroke()
  ctx.fillStyle="#1a1a2e";ctx.font="bold 15px sans-serif";ctx.fillText(`DOK ${dok.nr} – ${dok.titel}`,w/2,310)
  ctx.fillStyle="#6c757d";ctx.font="12px sans-serif";ctx.fillText(`Modul ${modul.nr}: ${modul.name}  ·  Version ${dok.version}`,w/2,334)
  ctx.fillStyle="#2d6a4f";ctx.font="bold 13px sans-serif";ctx.fillText(`Ergebnis: ${score} von ${total} Fragen richtig (${Math.round(score/total*100)}%)`,w/2,386)
  ctx.fillStyle="#2d6a4f";ctx.fillRect(w/2-44,395,88,3)
  ctx.strokeStyle="#dee2e6";ctx.lineWidth=1
  ctx.beginPath();ctx.moveTo(80,455);ctx.lineTo(280,455);ctx.stroke()
  ctx.beginPath();ctx.moveTo(w-280,455);ctx.lineTo(w-80,455);ctx.stroke()
  ctx.fillStyle="#6c757d";ctx.font="11px sans-serif"
  ctx.textAlign="center";ctx.fillText("Datum: "+datum,180,474);ctx.fillText("Unterschrift Vorgesetzter / FASI",w-180,474)
  ctx.fillStyle="#adb5bd";ctx.font="9px monospace";ctx.fillText(`Nachweis-ID: ${nachweisId}  ·  PSArbeitssicherheit GmbH  ·  Solingen`,w/2,520)
  const a=document.createElement("a")
  a.download=`Schulungsnachweis_${user.name.replace(/ /g,"_")}_DOK${dok.nr}.png`
  a.href=cv.toDataURL("image/png");a.click()
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function EmployeeApp() {
  const [user, setUser] = useState(null)
  const [screen, setScreen] = useState('overview')
  const [modul, setModul] = useState(null)
  const [dok, setDok] = useState(null)

  const pick = (m, d) => { setModul(m); setDok(d); setScreen('read') }
  const logout = () => { setUser(null); setScreen('overview') }

  if (!user) return <Login onLogin={setUser}/>

  return (
    <>
      <div style={{position:"sticky",top:0,zIndex:100,background:C.surface,borderBottom:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
        <div style={{maxWidth:860,margin:"0 auto",padding:"11px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:C.accent,borderRadius:6,padding:"5px 7px",display:"flex"}}><Icon n="shield" s={15} c="#fff"/></div>
            <span style={{fontWeight:700,fontSize:14}}>PSArbeitssicherheit</span>
            <span style={{fontSize:11,color:C.textDim,letterSpacing:".04em"}}>/ E-LEARNING</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:13,color:C.textMuted,display:"flex",alignItems:"center",gap:6}}>
              <Icon n="user" s={13} c={C.textMuted}/>{user.name}
              <span style={{fontSize:11,color:C.textDim}}>({user.personal})</span>
            </span>
            <button className="btn btn-ghost" style={{padding:"6px 12px",fontSize:12}} onClick={logout}>
              <Icon n="logout" s={13}/>Abmelden
            </button>
          </div>
        </div>
      </div>
      <div style={{minHeight:"calc(100vh - 53px)",background:C.bg}}>
        {screen==="overview" && <Overview user={user} onSelect={pick}/>}
        {screen==="read" && dok && <Reader modul={modul} dok={dok} onWeiter={()=>setScreen("quiz")} onBack={()=>setScreen("overview")}/>}
        {screen==="quiz" && dok && <Quiz user={user} modul={modul} dok={dok} onDone={()=>setScreen("overview")} onBack={()=>setScreen("read")}/>}
      </div>
      <div style={{borderTop:`1px solid ${C.border}`,padding:"12px 24px",textAlign:"center",fontSize:11,color:C.textDim,background:C.surface}}>
        © PSArbeitssicherheit GmbH · Solingen · E-Learning Portal
      </div>
    </>
  )
}
