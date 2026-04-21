import { supabase } from './supabase.js'

export async function loadDokumentUrl(dokNr) {
  try {
    const result = await supabase.storage
      .from('dokumente')
      .createSignedUrl('d' + dokNr + '.pdf', 3600)
    if (result.data) {
      return result.data.signedUrl
    }
    return null
  } catch (e) {
    return null
  }
}

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
