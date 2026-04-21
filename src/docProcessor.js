import { supabase } from './supabase.js'

export async function loadDokumentUrl(dokNr) {
  try {
    const { data } = await supabase.storage
      .from('dokumente')
      .createSignedUrl(`d${dokNr}.pdf`, 3600)
    return data?.signedUrl || null
  } catch (e) {
    console.error(e)
    return null
  }
}

export async function generateFragen(dokumentText, dokumentTitel) {
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
  } catch (e) { return null }
}

export async function saveFragen(dokId, fragen) {
  try {
    await supabase.from('dokumente')
      .update({ fragen: JSON.stringify(fragen) })
      .eq('id', dokId)
    return true
  } catch (e) { return false }
}

export async function loadFragen(dokId) {
  try {
