import { createClient } from 'redis';

export default async function handler(req, res) {
  // 1. Só permite salvar se for um envio de dados (POST)
  if (req.method !== 'POST') return res.status(405).json({ error: "Método não permitido" });

  // 2. Verifica se a URL do banco existe
  if (!process.env.REDIS_URL) {
    return res.status(500).json({ error: "Configuração REDIS_URL faltando na Vercel." });
  }

  // 3. Criação do "Cliente" (a ponte com o Redis)
  // Ele usa automaticamente o REDIS_URL que você configurou no painel da Vercel
  const client = createClient({
    url: process.env.REDIS_URL
  });

  // Mostra erro no log da Vercel se a conexão cair
  client.on('error', (err) => console.log('Erro no Cliente Redis:', err));

  let isConnected = false;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { data } = body || {};

    if (typeof data !== 'string') {
      return res.status(400).json({ error: "Payload inválido: campo 'data' precisa ser string." });
    }
    
    // 4. Abre a conexão, salva os dados e fecha
    await client.connect();
    isConnected = true;
    await client.set('planner_data', data);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return res.status(500).json({ error: "Falha ao salvar no banco de dados." });
  } finally {
    if (isConnected) {
      await client.disconnect();
    }
  }
}
