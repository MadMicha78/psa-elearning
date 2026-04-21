const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')).default
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
    const zip = await JSZip.loadAsync(arrayBuffer)
    const xmlFile = zip.file('word/document.xml')
    if (!xmlFile) return null

    const xmlText = await xmlFile.async('string')

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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Du bist ein Experte für Arbeitssicherheit. Generiere 5 Multiple-Choice-Fragen basierend auf dem Inhalt der Arbeitsanweisung. Antworte NUR mit einem JSON-Array, kein anderer Text, keine Markdown-Backticks.',
        messages: [{
          role: 'user',
          content: `Erstelle 5 Prüfungsfragen zu: "${dokumentTitel}"\n\nInhalt:\n${dokumentText.slice(0, 3000)}\n\nFormat:\n[\n  {\n    "id": 1,\n    "frage": "Fragetext?",\n    "optionen": ["A", "B", "C", "D"],\n    "richtig": 0,\n    "erklaerung": "Erklärung."\n  }\n]\n\nNur JSON zurückgeben, kein anderer Text.`
        }]
      })
    })

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
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
