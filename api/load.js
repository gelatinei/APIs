import { createClient } from 'redis';

export default async function handler(req, res) {
  // Força o navegador a sempre buscar dados novos (evita o erro 304)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Verifica se a URL do banco existe
  if (!process.env.REDIS_URL) {
    return res.status(500).json({ error: "Configuração REDIS_URL faltando na Vercel." });
  }

  // Criação do "Cliente" (a ponte com o Redis)
  const client = createClient({
    url: process.env.REDIS_URL
  });

  client.on('error', (err) => console.log('Erro no Cliente Redis:', err));

  let isConnected = false;

  try {
    await client.connect();
    isConnected = true;
    
    // Puxa a informação guardada na chave 'planner_data'
    const result = await client.get('planner_data');

    // Se o banco estiver vazio, retorna um texto de objeto vazio "{}"
    return res.status(200).json({ data: result || "{}" });
    
  } catch (error) {
    console.error("Erro ao carregar:", error);
    return res.status(500).json({ error: "Falha ao carregar do banco de dados." });
  } finally {
    if (isConnected) {
      await client.disconnect();
    }
  }
}
