export default async function handler(req, res) {
  // A chave que você salvou na Vercel entra aqui
  const API_KEY = process.env.GEMINI_API_KEY;
  
  // O NOME DO MODELO QUE VOCÊ DESCOBRIU:
  const MODELO = "gemini-3-flash-preview"; 

  if (!API_KEY) {
    return res.status(500).json({ error: "Chave não configurada na Vercel." });
  }

  try {
    const { prompt } = req.body;

    // A URL para o Gemini 3 usando a versão v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Retorna a resposta para o seu index.html
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao conectar com o Gemini 3" });
  }
}
