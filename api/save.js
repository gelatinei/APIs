import { createClient } from 'redis';

export default async function handler(req, res) {
  // 1. Só permite salvar se for um envio de dados (POST)
  if (req.method !== 'POST') return res.status(405).json({ error: "Método não permitido" });

  // 2. Criação do "Cliente" (a ponte com o Redis)
  // Ele usa automaticamente o REDIS_URL que você configurou no painel da Vercel
  const client = createClient({
    url: process.env.REDIS_URL
  });

  // Mostra erro no log da Vercel se a conexão cair
  client.on('error', (err) => console.log('Erro no Cliente Redis:', err));

  try {
    const { data } = req.body;
    
    // 3. Abre a conexão, salva os dados e fecha
    await client.connect();
    await client.set('planner_data', data);
    await client.disconnect();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return res.status(500).json({ error: "Falha ao salvar no banco de dados." });
  }
}
