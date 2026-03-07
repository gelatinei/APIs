export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "Chave GEMINI_API_KEY não configurada na Vercel." });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Apenas POST permitido' });
  }

  try {
    const { prompt } = req.body;

    // Mudamos de v1beta para v1 (mais estável)
    // E garantimos o nome correto do modelo
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // Se o Google devolver um erro, repassamos para o seu site entender
    if (data.error) {
      console.error("Erro do Google:", data.error);
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro no Servidor:", error);
    return res.status(500).json({ error: 'Erro interno ao processar a requisição.' });
  }
}
