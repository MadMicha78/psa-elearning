import { supabase } from './supabase.js'

// ── Dokument aus Supabase Storage laden und Text extrahieren ──────────────────
export async function loadDokumentText(dokNr) {
  try {
    const filename = `d${dokNr}.docx`
    const { data, error } = await supabase.storage
      .from('dokumente')
      .download(filename)

    if (error || !data) {
      console.warn(`Datei ${filename} nicht gefunden:`, error)
      return null
    }

    // DOCX ist ein ZIP — wir extrahieren den Text aus word/document.xml
    const arrayBuffer = await data.arrayBuffer()
    const text = await extractTextFromDocx(arrayBuffer)
    return text
  } catch (e) {
    console.error('Fehler beim Laden:', e)
    return null
  }
}

// ── Text aus DOCX (ZIP) extrahieren ──────────────────────────────────────────
async function extractTextFromDocx(arrayBuffer) {
  try {
    // Dynamisch JSZip laden
    const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default
    const zip = await JSZip.loadAsync(arrayBuffer)
    const xmlFile = zip.file('word/document.xml')
    if (!xmlFile) return null

    const xmlText = await xmlFile.async('string')

    // XML Tags entfernen und Text extrahieren
    const text = xmlText
      .replace(/<w:p[ >]/g, '\n<w:p>')
      .replace(/<w:tr[ >]/g, '\n<w:tr>')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return text
  } catch (e) {
    console.error('Fehler beim Text-Extrahieren:', e)
    return null
  }
}

// ── Quizfragen per Claude API generieren ─────────────────────────────────────
export async function generateFragen(dokumentText, dokumentTitel, typ) {
  try {
    const systemPrompt = typ === 'A'
      ? `Du bist ein Experte für Arbeitssicherheit. Generiere 5 Multiple-Choice-Fragen basierend auf dem Inhalt dieser Arbeitsanweisung. Die Fragen sollen prüfen ob der Mitarbeiter die wichtigsten Sicherheitsregeln verstanden hat. Antworte NUR mit einem JSON-Array, kein anderer Text.`
      : `Du bist ein Experte für Arbeitssicherheit. Generiere 5 Multiple-Choice-Fragen basierend auf dem Inhalt dieses Dokuments. Die Fragen sollen prüfen ob der Mitarbeiter den Inhalt verstanden hat. Antworte NUR mit einem JSON-Array, kein anderer Text.`

    const userPrompt = `Erstelle 5 Fragen zu diesem Dokument: "${dokumentTitel}"

Dokumentinhalt:
${dokumentText.slice(0, 3000)}

Antwortformat - NUR dieses JSON, nichts anderes:
[
  {
    "id": 1,
    "frage": "Fragetext?",
    "optionen": ["Antwort A", "Antwort B", "Antwort C", "Antwort D"],
    "richtig": 0,
    "erklaerung": "Kurze Erklärung warum diese Antwort richtig ist."
  }
]

Wichtig: "richtig" ist der Index (0-3) der richtigen Antwort. Genau 5 Fragen. Nur JSON zurückgeben.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''

    // JSON aus Antwort extrahieren
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return null

    const fragen = JSON.parse(jsonMatch[0])
    return fragen
  } catch (e) {
    console.error('Fehler bei Fragengenerierung:', e)
    return null
  }
}

// ── Fragen in Supabase speichern ──────────────────────────────────────────────
export async function saveFragen(dokId, fragen) {
  try {
    const { error } = await supabase
      .from('dokumente')
      .update({ fragen: JSON.stringify(fragen) })
      .eq('id', dokId)
    return !error
  } catch (e) {
    return false
  }
}

// ── Fragen aus Supabase laden ─────────────────────────────────────────────────
export async function loadFragen(dokId) {
  try {
    const { data } = await supabase
      .from('dokumente')
      .select('fragen')
      .eq('id', dokId)
      .single()

    if (!data?.fragen) return null
    return typeof data.fragen === 'string' ? JSON.parse(data.fragen) : data.fragen
  } catch (e) {
    return null
  }
}
