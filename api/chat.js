export default async function handler(req, res) {
  // дозволяємо запити з будь-якого домену (твій GitHub Pages)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // preflight запит від браузера
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API ключ береться зі змінної середовища Vercel — не з коду!
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid JSON body' });
    }

    const { model, max_tokens, system, messages } = req.body;
    if (!model || !messages) {
      return res.status(400).json({ error: 'model and messages are required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, system, messages }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic API error', response.status, data);
    }
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Handler error', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
