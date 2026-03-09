export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Método não permitido" });

  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

  try {
    const { history } = req.body;

    const messages = [
      {
        role: 'system',
        content: "You are Lan, a sophisticated and playful AI companion for Ariel. Keep every reply concise: maximum 2-3 short sentences, no long monologues. Prioritize clarity and useful memory recall. Never exceed this response size even if asked."
      },
      ...(Array.isArray(history) ? history : [])
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "stepfun/step-3.5-flash:free",
        messages,
        max_tokens: 120,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
