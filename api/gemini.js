function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') return JSON.parse(body);
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString('utf8'));
  return body;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const API_KEY = String(process.env.GEMINI_API_KEY || '').trim();
  const MODELO = String(process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest').trim();

  if (!API_KEY) {
    return res.status(500).json({ error: 'Chave não configurada na Vercel.' });
  }

  try {
    const parsedBody = parseBody(req.body);
    const history = parsedBody?.history;

    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'Payload inválido: history deve ser um array com mensagens.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: history })
    });

    const raw = await response.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { raw };
    }

    if (!response.ok || data?.error) {
      const apiMessage = data?.error?.message || `Gemini retornou HTTP ${response.status}.`;
      const details = {
        status: response.status,
        model: MODELO,
        apiMessage,
      };
      console.error('Erro Gemini API:', details);
      return res.status(response.status || 500).json({ error: apiMessage, details });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao conectar com o Gemini:', {
      message: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({
      error: 'Erro ao conectar com o Gemini.',
      details: error?.message || String(error),
    });
  }
}
