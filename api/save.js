import { createClient } from 'redis';

function getRedisUrl() {
  const raw = process.env.REDIS_URL || process.env.KV_URL || process.env.UPSTASH_REDIS_URL || '';
  const trimmed = String(raw).trim();

  // Remove aspas acidentais no valor da env (erro comum de copy/paste na Vercel)
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function parseBody(body) {
  if (!body) return {};

  if (typeof body === 'string') {
    return JSON.parse(body);
  }

  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString('utf8'));
  }

  return body;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    return res.status(500).json({
      error: 'Configuração de Redis faltando. Defina REDIS_URL (ou KV_URL/UPSTASH_REDIS_URL) na Vercel.'
    });
  }

  const client = createClient({ url: redisUrl });
  client.on('error', (err) => console.error('Erro no Cliente Redis:', err));

  let isConnected = false;

  try {
    const parsedBody = parseBody(req.body);
    const payloadData = parsedBody?.data;

    // Aceita string (preferido), mas também objeto/array para tolerar serializações diferentes
    let data = '';
    if (typeof payloadData === 'string') data = payloadData;
    else if (payloadData !== undefined) data = JSON.stringify(payloadData);

    if (!data || !data.trim()) {
      return res.status(400).json({ error: "Payload inválido: campo 'data' ausente ou vazio." });
    }

    await client.connect();
    isConnected = true;

    await client.set('planner_data', data);

    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
    }

    console.error('Erro ao salvar:', error);
    return res.status(500).json({ error: 'Falha ao salvar no banco de dados.' });
  } finally {
    if (isConnected) {
      await client.disconnect();
    }
  }
}
