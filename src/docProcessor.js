import { supabase } from './supabase.js'

export async function loadDokumentText(dokNr) {
  try {
    const { data, error } = await supabase.storage
      .from('dokumente')
      .download(`d${dokNr}.docx`)
    if (error || !data) { console.warn('Datei nicht gefunden:', error); return null }
    const arrayBuffer = await data.arrayBuffer()
    return await extractText(arrayBuffer)
  } catch (e) { console.error(e); return null }
}

async function extractText(arrayBuffer) {
  try {
    // DOCX als ZIP über DecompressionStream lesen (kein externes Paket nötig)
    const bytes = new Uint8Array(arrayBuffer)
    // Suche nach word/document.xml im ZIP
    const str = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    const start = str.indexOf('<w:body')
    const end = str.indexOf('</w:body>')
    if (start === -1 || end === -1) return null
    const xml = str.slice(start, end + 9)
    return xml
      .replace(/<w:p[ >]/g, '\n<w:p>')
      .replace(/<w:tr[ >]/g, '\n<w:tr>')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n').trim()
  } catch (e) { console.error(e); return null }
}

export async function generateFragen(dokumentText, dokumentTitel, typ) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Du bist ein Experte für Arbeitssicherheit. Generiere 5 Multiple-Choice-Fragen. Antworte NUR mit JSON-Array, kein anderer Text.',
        messages: [{ role: 'user', content: `Erstelle 5 Prüfungsfragen zu: "${dokumentTitel}"\n\nInhalt:\n${dokumentText.slice(0, 3000)}\n\nFormat:\n[\n  {\n    "id": 1,\n    "frage": "Fragetext?",\n    "optionen": ["A", "B", "C", "D"],\n    "richtig": 0,\n    "erklaerung": "Erklärung."\n  }\n]\n\nNur JSON, kein anderer Text.` }]
      })
    })
    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch (e) { console.error(e); return null }
}

export async function saveFragen(dokId, fragen) {
  try {
    await supabase.from('dokumente').update({ fragen: JSON.stringify(fragen) }).eq('id', dokId)
    return true
  } catch (e) { return false }
}

export async function loadFragen(dokId) {
  try {
    const { data } = await supabase.from('dokumente').select('fragen').eq('id', dokId).single()
    if (!data?.fragen) return null
    return typeof data.fragen === 'string' ? JSON.parse(data.fragen) : data.fragen
  } catch (e) { return null }
}
