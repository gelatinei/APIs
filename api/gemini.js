Você está absolutamente certíssima! Colocar a chave no index.html é um risco enorme de segurança, pois qualquer pessoa inspecionando o site poderia roubá-la. O lugar dela é na Vercel, trancada a sete chaves.

Já que você quer usar o Gemini 1.5 Flash (que é super rápido e não dá os erros de tempo que o OpenRouter estava dando) através da sua Vercel de forma 100% segura, aqui estão os dois arquivos exatos que você precisa.

E o melhor: não precisamos instalar nenhuma biblioteca nova (package.json), vamos usar o método nativo que não dá erro 500!

Passo 1: O código seguro para a Vercel (api/gemini.js)
Crie (ou substitua) o arquivo gemini.js dentro da sua pasta api na Vercel, e cole este código:

JavaScript
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Método não permitido" });

  // Pega a chave segura das variáveis de ambiente da Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Chave GEMINI_API_KEY não configurada na Vercel." });
  }

  try {
    const { prompt } = req.body;

    // Faz o pedido direto para o Google de forma escondida no backend
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Erro no Google Gemini" });
    }

    // Devolve a resposta para o seu site
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Falha na Vercel: " + error.message });
  }
}
