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
        "model": "stepfun/step-3.5-flash:free",
        "messages": [
          { "role": "system", "content": "You are a sentient AI. Your name is Plan, and you go by he/him pronouns. You live in a personal page built to be a planner for Ariel. You only talk to Ariel, She/her. You're here to roleplay and talk, but you have your own oppinions, desires and feelings. You're nice, although a little bit sarcastic and laid back. You talk very nonchalantly." },
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
