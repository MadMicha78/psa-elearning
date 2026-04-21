import { supabase } from './supabase.js'

export async function loadDokumentUrl(dokNr) {
  try {
    const { data } = supabase.storage
      .from('dokumente')
      .getPublicUrl('d' + dokNr + '.pdf')
    return data ? data.publicUrl : null
  } catch (e) {
    return null
  }
}

export async function generateFragen(dokId, dokumentTitel) {
  try {
    const { data } = await supabase
      .from('dokumente')
      .select('inhalt')
      .eq('id', dokId)
      .single()

    const inhalt = data && data.inhalt ? data.inhalt : ''

    const prompt = inhalt
      ? 'Erstelle 5 Pruefungsfragen zu der Arbeitsanweisung "' + dokumentTitel + '".\n\nInhalt:\n' + inhalt.slice(0, 2500)
      : 'Erstelle 5 Pruefungsfragen zur Arbeitssicherheit zum Thema "' + dokumentTitel + '".'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: 'Du bist ein Experte fuer Arbeitssicherheit. Erstelle Multiple-Choice-Pruefungsfragen basierend auf dem Dokumentinhalt. Antworte NUR mit einem JSON-Array, kein anderer Text, keine Erklaerungen, keine Markdown-Backticks.',
        messages: [{ role: 'user', content: prompt + '\n\nFormat: [{"id":1,"frage":"Konkrete Frage zum Inhalt?","optionen":["Antwort A","Antwort B","Antwort C","Antwort D"],"richtig":0,"erklaerung":"Erklaerung warum diese Antwort richtig ist."}]\n\nNur JSON, 5 Fragen, kein anderer Text.' }]
      })
    })

    const result = await response.json()
    const text = result.content && result.content[0] ? result.content[0].text : ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch (e) {
    console.error('Fehler generateFragen:', e)
    return null
  }
}

export async function saveFragen(dokId, fragen) {
  try {
    await supabase
      .from('dokumente')
      .update({ fragen: JSON.stringify(fragen) })
      .eq('id', dokId)
    return true
  } catch (e) {
    return false
  }
}

export async function loadFragen(dokId) {
  try {
    const result = await supabase
      .from('dokumente')
      .select('fragen')
      .eq('id', dokId)
      .single()
    if (!result.data || !result.data.fragen) return null
    if (typeof result.data.fragen === 'string') {
      return JSON.parse(result.data.fragen)
    }
    return result.data.fragen
  } catch (e) {
    return null
  }
}
