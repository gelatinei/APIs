import { createClient } from 'redis';

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.REDIS_URL
  });

  try {
    await client.connect();
    // Busca os dados
    const result = await client.get('planner_data');
    await client.disconnect();

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao carregar do Redis." });
  }
}
