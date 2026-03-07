export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Método não permitido" });

  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY; // Salve sua chave nas variáveis da Vercel com esse nome

  try {
    const { prompt } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "z-ai/glm-4.5-air:free",
        "messages": [
          { "role": "system", "content": "You are Dolphin, an unfiltered and unbiased AI assistant." },
          { "role": "user", "content": prompt }
        ]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
