const BLOB_FILE = 'planner-data.json';
const BLOB_API_BASE = 'https://blob.vercel-storage.com';

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

    const saveUrl = `${BLOB_API_BASE}/${BLOB_FILE}`;
    const blobResponse = await fetch(saveUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-add-random-suffix': 'false',
        'x-content-type': 'application/json',
      },
      body: data,
    });

    if (!blobResponse.ok) {
      const blobErrorText = await blobResponse.text().catch(() => '');
      console.error('Erro Vercel Blob (save):', blobResponse.status, blobErrorText);
      return res.status(500).json({ error: `Falha ao salvar no Vercel Blob (${blobResponse.status}).` });
    }

    return res.status(200).json({ success: true, storage: 'vercel-blob' });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
    }

    console.error('Erro ao salvar:', error);
    return res.status(500).json({ error: 'Falha ao salvar no storage da nuvem.' });
  }
}
