// Serverless proxy to the Claude API.
// - requires a valid Supabase session (Authorization: Bearer <access_token>)
// - model is fixed on the server, max_tokens is capped
// - the Anthropic key lives only in the ANTHROPIC_API_KEY env var on Vercel

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS_CAP = 6000;
const MAX_BODY_CHARS = 100000;

// Public values (same as in app.js): used only to ask Supabase who the token belongs to.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lrronntdfuyrzmkdeusa.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycm9ubnRkZnV5cnpta2RldXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzUwOTYsImV4cCI6MjA5NDc1MTA5Nn0.XVZJ3L7MvIzkdYCTfqx9SZxDDtk0Ym37jg0y_HxS7FE';

async function getUser(token) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

export default async function handler(req, res) {
  // The app and the API share one origin on Vercel, so no CORS headers are needed.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const user = await getUser(token);
    if (!user || !user.id) return res.status(401).json({ error: 'Invalid session' });

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid JSON body' });
    }
    if (JSON.stringify(req.body).length > MAX_BODY_CHARS) {
      return res.status(413).json({ error: 'Request too large' });
    }

    const { max_tokens, system, messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages are required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL, // ignore any model sent by the client
        max_tokens: Math.min(Number(max_tokens) || 1000, MAX_TOKENS_CAP),
        system,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) console.error('Anthropic API error', response.status, data);
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Handler error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
