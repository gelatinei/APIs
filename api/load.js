import { createClient } from 'redis';

export default async function handler(req, res) {
  // CONFIGURAÇÃO ANTI-CACHE: Diz para a Vercel e para o Navegador NÃO guardarem cópia
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (!process.env.REDIS_URL) {
    return res.status(500).json({ error: "Variável REDIS_URL não configurada." });
  }

  const client = createClient({
    url: process.env.REDIS_URL,
    socket: { tls: true }
  });

  try {
    await client.connect();
    const result = await client.get('planner_data');
    await client.disconnect();

    // Se não houver nada, retorna objeto vazio, mas com status 200 (OK)
    return res.status(200).json({ data: result || "{}" });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao conectar no Redis" });
  }
}
