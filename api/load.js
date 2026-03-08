import { list } from '@vercel/blob';

const BLOB_FILE = 'planner-data.json';

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
    const { blobs } = await list({ token, prefix: BLOB_FILE, limit: 1 });
    const file = blobs?.find((b) => b.pathname === BLOB_FILE) || blobs?.[0];

    if (!file?.url) {
      return res.status(200).json({ data: '{}' });
    }

    const fileResponse = await fetch(file.url, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!fileResponse.ok) {
      console.error('Erro ao baixar blob salvo:', fileResponse.status, file.url);
      return res.status(500).json({ error: `Falha ao carregar do Vercel Blob (${fileResponse.status}).` });
    }

    const data = await fileResponse.text();
    return res.status(200).json({ data: data || '{}' });
  } catch (error) {
    console.error('Erro ao carregar do Blob:', error);
    return res.status(500).json({ error: 'Falha ao carregar do Vercel Blob.' });
  }
}
