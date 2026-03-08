import { put } from '@vercel/blob';

const BLOB_FILE = 'planner-data.json';

function getBlobToken() {
  const raw = process.env.BLOB_READ_WRITE_TOKEN || '';
  const trimmed = String(raw).trim();

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

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

  const token = getBlobToken();
  if (!token) {
    return res.status(500).json({
      error: 'Configuração faltando: defina BLOB_READ_WRITE_TOKEN na Vercel para salvar na nuvem.'
    });
  }

  try {
    const parsedBody = parseBody(req.body);
    const payloadData = parsedBody?.data;

    let data = '';
    if (typeof payloadData === 'string') data = payloadData;
    else if (payloadData !== undefined) data = JSON.stringify(payloadData);

    if (!data || !data.trim()) {
      return res.status(400).json({ error: "Payload inválido: campo 'data' ausente ou vazio." });
    }

    const saved = await put(BLOB_FILE, data, {
      token,
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true,
    });

    return res.status(200).json({ success: true, storage: 'vercel-blob', url: saved.url });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
    }

    console.error('Erro ao salvar no Blob:', error);
    return res.status(500).json({ error: 'Falha ao salvar no Vercel Blob.' });
  }
}
