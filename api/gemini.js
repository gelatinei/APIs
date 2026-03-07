export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;

  // Log para ver se a chave existe (vai aparecer nos Logs da Vercel)
  if (!API_KEY) {
    console.error("ERRO: A chave GEMINI_API_KEY não foi encontrada nas variáveis de ambiente!");
  }

  try {
    const { prompt } = req.body;
    console.log("Recebi o prompt:", prompt);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    // Log da resposta bruta do Google
    console.log("Resposta do Google:", JSON.stringify(data));

    if (data.error) {
       return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro no servidor:", error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
