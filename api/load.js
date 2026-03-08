import { createClient } from 'redis';

function getRedisUrl() {
  return (
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    process.env.UPSTASH_REDIS_URL ||
    ''
  );
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

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
    await client.connect();
    isConnected = true;

    const result = await client.get('planner_data');

    return res.status(200).json({ data: result || '{}' });
  } catch (error) {
    console.error('Erro ao carregar:', error);
    return res.status(500).json({ error: 'Falha ao carregar do banco de dados.' });
  } finally {
    if (isConnected) {
      await client.disconnect();
    }
  }
}
