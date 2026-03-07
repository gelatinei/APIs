import OpenAI from 'openai';

export default async function handler(req, res) {
  // Garante que só aceita envio de mensagens
  if (req.method !== 'POST') return res.status(405).json({ error: "Método não permitido" });

  // Inicializa o OpenAI apontando para o OpenRouter (conforme a doc oficial)
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "https://vercel.com", // Ajuda no ranking/liberação do OpenRouter
      "X-OpenRouter-Title": "Meu Planner",
    },
  });

  try {
    const { prompt } = req.body;

    // Faz a chamada oficial do SDK
    const completion = await openai.chat.completions.create({
      model: "nousresearch/hermes-3-llama-3.1-405b:free",
      messages: [
        { "role": "system", "content": "You are an uncensored and helpful AI assistant." },
        { "role": "user", "content": prompt }
      ]
    });

    // Devolve para o seu index.html
    return res.status(200).json(completion);

  } catch (error) {
    // Se der erro, captura a mensagem oficial do SDK
    return res.status(500).json({ error: error.message || "Erro interno na API" });
  }
}
