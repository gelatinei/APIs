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

async function downloadBlobText(fileUrl, token) {
  const attempts = [
    { mode: 'public', headers: {} },
    { mode: 'authorized', headers: { Authorization: `Bearer ${token}` } },
  ];

  let lastError = null;

  for (const attempt of attempts) {
    try {
      const response = await fetch(fileUrl, {
        cache: 'no-store',
        headers: attempt.headers,
      });

      if (response.ok) {
        return await response.text();
      }

      const responseBody = await response.text().catch(() => '');
      lastError = `modo=${attempt.mode} status=${response.status} body=${responseBody.slice(0, 200)}`;
    } catch (err) {
      lastError = `modo=${attempt.mode} erro=${err?.message || String(err)}`;
    }
  }

  throw new Error(lastError || 'Falha desconhecida ao baixar blob');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

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
    const { blobs } = await list({ token, prefix: BLOB_FILE, limit: 100 });

    const sorted = [...(blobs || [])].sort((a, b) => {
      const timeA = new Date(a.uploadedAt || 0).getTime();
      const timeB = new Date(b.uploadedAt || 0).getTime();
      return timeB - timeA;
    });

    const file = sorted.find((b) => b.pathname === BLOB_FILE) || sorted[0];

    if (!file?.url) {
      return res.status(200).json({ data: '{}' });
    }

    const data = await downloadBlobText(file.url, token);
    return res.status(200).json({ data: data || '{}' });
  } catch (error) {
    console.error('Erro ao carregar do Blob:', {
      message: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({
      error: 'Falha ao carregar do Vercel Blob.',
      details: error?.message || String(error),
    });
  }
}
