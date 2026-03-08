import { createClient } from 'redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Método não permitido" });

  // Cria o cliente usando a REDIS_URL que você tem no painel
  const client = createClient({
    url: process.env.REDIS_URL
  });

  try {
    const { data } = req.body;
    
    await client.connect();
    // Salva os dados no Redis
    await client.set('planner_data', data);
    await client.disconnect();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao salvar no Redis." });
  }
}
