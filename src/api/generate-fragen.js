export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { inhalt, titel } = req.body

  const prompt = inhalt
    ? 'Erstelle 5 Pruefungsfragen zu der Arbeitsanweisung "' + titel + '".\n\nInhalt:\n' + inhalt.slice(0, 2500)
    : 'Erstelle 5 Pruefungsfragen zur Arbeitssicherheit zum Thema "' + titel + '".'

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: 'Du bist ein Experte fuer Arbeitssicherheit. Erstelle Multiple-Choice-Pruefungsfragen basierend auf dem Dokumentinhalt. Antworte NUR mit einem JSON-Array, kein anderer Text.',
      messages: [{ role: 'user', content: prompt + '\n\nFormat: [{"id":1,"frage":"Konkrete Frage?","optionen":["A","B","C","D"],"richtig":0,"erklaerung":"Erklaerung."}]\n\nNur JSON, 5 Fragen.' }]
    })
  })

  const data = await response.json()
  const text = data.content && data.content[0] ? data.content[0].text : ''
  const match = text.match(/\[[\s\S]*\]/)
  
  if (!match) {
    return res.status(500).json({ error: 'Keine Fragen generiert' })
  }

  res.status(200).json({ fragen: JSON.parse(match[0]) })
}
