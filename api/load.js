const BLOB_FILE = 'planner-data.json';
const BLOB_API_BASE = 'https://blob.vercel-storage.com';

function getBlobToken() {
  const raw = process.env.BLOB_READ_WRITE_TOKEN || '';
  const trimmed = String(raw).trim();

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const token = getBlobToken();
  if (!token) {
    return res.status(500).json({
      error: 'Configuração faltando: defina BLOB_READ_WRITE_TOKEN na Vercel para carregar da nuvem.'
    });
  }

  try {
    const loadUrl = `${BLOB_API_BASE}/${BLOB_FILE}`;
    const blobResponse = await fetch(loadUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (blobResponse.status === 404) {
      return res.status(200).json({ data: '{}' });
    }

    if (!blobResponse.ok) {
      const blobErrorText = await blobResponse.text().catch(() => '');
      console.error('Erro Vercel Blob (load):', blobResponse.status, blobErrorText);
      return res.status(500).json({ error: `Falha ao carregar do Vercel Blob (${blobResponse.status}).` });
    }

    const data = await blobResponse.text();
    return res.status(200).json({ data: data || '{}' });
  } catch (error) {
    console.error('Erro ao carregar:', error);
    return res.status(500).json({ error: 'Falha ao carregar do storage da nuvem.' });
  }
}
