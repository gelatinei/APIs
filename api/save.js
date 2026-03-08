export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Método não permitido" });

  try {
    const { data } = req.body;
    
    // Conecta com o Vercel KV usando as chaves geradas automaticamente
    const url = `${process.env.KV_REST_API_URL}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      // Comando Redis para salvar a chave "planner_data"
      body: JSON.stringify(["SET", "planner_data", data])
    });

    const result = await response.json();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao salvar na nuvem." });
  }
}
