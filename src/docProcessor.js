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

    const response = await fetch('/api/generate-fragen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inhalt: inhalt, titel: dokumentTitel })
    })

    const result = await response.json()
    return result.fragen || null
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
