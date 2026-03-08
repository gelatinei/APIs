export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const MODELO = "gemini-3-flash-preview"; 

  if (!API_KEY) {
    return res.status(500).json({ error: "Chave não configurada na Vercel." });
  }

  try {
    // Agora recebemos 'history' que já é um array com as mensagens anteriores
    const { history } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Passamos o histórico completo para a API do Google
      body: JSON.stringify({
        contents: history
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao conectar com o Gemini" });
  }
}
