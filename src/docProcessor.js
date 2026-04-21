import { supabase } from './supabase.js'

export async function loadDokumentUrl(dokNr) {
  try {
    const { data } = await supabase.storage
      .from('dokumente')
      .createSignedUrl('d' + dokNr + '.pdf', 3600)
    return data ? data.signedUrl : null
  } catch (e) {
    console.error(e)
    return null
  }
}

export async function generateFragen(dokumentTitel) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Du bist ein Experte fuer Arbeitssicherheit. Generiere 5 Multiple-Choice-Fragen. Antworte NUR mit JSON-Array, kein anderer Text.',
        messages: [{
          role: 'user',
          content: 'Erstelle 5 Pruefungsfragen zu: "' + dokumentTitel + '". Format: [{"id":1,"frage":"Frage?","optionen":["A","B","C","D"],"richtig":0,"erklaerung":"Erklaerung."}]. Nur JSON zurueckgeben.'
        }]
      })
    })
    const data = await response.json()
    const rawText = data.content && data.content[0] ? data
