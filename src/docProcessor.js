import { supabase } from './supabase.js'

export async function loadDokumentUrl(dokNr) {
  try {
    const { data } = await supabase.storage
      .from('dokumente')
      .createSignedUrl('d' + dokNr + '.pdf', 3600)
    return data ? data.signedUrl : null
  } catch (e) {
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
        system: 'Arbeitssicherheitsexperte. Nur JSON-Array zurueckgeben.',
        messages: [{ role: 'user', content: 'Erstelle 5 Pruefungsfragen zu: "' + dokumentTitel + '". Format: [{"id":1,"frage":"?","optionen":["A","B","C","D"],"richtig":0,"erklaerung":"..."}]' }]
      })
    })
    const data = await response.json()
    const text = data.content && data.content[0] ? data.content[0].text : ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch (e) {
    return null
  }
}

export async function saveFragen(dokId, fragen) {
  try {
    await supabase.from('dokumente').update({ fragen: JSON.stringify(fragen) }).eq('id', dokId)
    return true
  } catch (e) {
    return false
  }
}

export async function loadFragen(dokId) {
  try {
    const { data } = await supabase.from('dokumente').select('fragen').eq('id', dokId).single()
    if (!data || !data.fragen) return null
    return typeof data.fragen === 'string' ? JSON.parse(data.fragen) : data.fragen
  } catch (e) {
    return null
  }
}
