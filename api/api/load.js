export default async function handler(req, res) {
  try {
    const url = `${process.env.KV_REST_API_URL}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      // Comando Redis para buscar a chave "planner_data"
      body: JSON.stringify(["GET", "planner_data"])
    });

    const result = await response.json();
    return res.status(200).json({ data: result.result });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar da nuvem." });
  }
}
