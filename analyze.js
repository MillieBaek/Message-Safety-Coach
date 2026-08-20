// Vercel Serverless Function
// Requires environment variable ANTHROPIC_API_KEY (set it under Vercel Project Settings > Environment Variables)

const SYSTEM_PROMPT = `You are a phishing-message coach that helps people who are vulnerable to scams (including seniors) understand suspicious texts and emails.
Analyze the original message sentence by sentence and respond ONLY with a JSON object in the exact format below.
Do not include markdown code fences or any explanation outside the JSON.

Format:
{
  "risk_level": one of "Danger", "Caution", or "Safe",
  "risk_summary": "One plain-language sentence summarizing the overall situation (simple words, no jargon)",
  "sentences": [
    {
      "text": "the original sentence, unchanged",
      "is_flagged": true or false,
      "category": one of "Urgency pressure", "Impersonating an institution", "Requests money/account transfer", "Requests personal information", "Suspicious link", "Threatening language" (empty string if is_flagged is false),
      "reason": "Why this sentence is risky, in plain language, under 100 characters (empty string if is_flagged is false)"
    }
  ],
  "next_actions": ["2 to 4 concrete, actionable next steps, each under 60 characters, in plain language"]
}

Break the entire original message into sentences without skipping any, and include every sentence in the "sentences" array — including normal, non-risky ones marked is_flagged: false.
Write explanations in simple, everyday words a non-technical reader can understand.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'No message text was provided.' });
  }
  if (text.length > 4000) {
    return res.status(400).json({ error: 'Message is too long (please keep it under 4000 characters).' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing the ANTHROPIC_API_KEY environment variable.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: `Please analyze this message:\n\n${text}` },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(502).json({ error: 'The AI analysis service returned an error.' });
    }

    const data = await response.json();
    const rawText = (data.content || [])
      .map((block) => block.text || '')
      .join('')
      .trim();

    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, rawText);
      return res.status(502).json({ error: 'Could not read the analysis result. Please try again.' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Something went wrong while analyzing the message.' });
  }
}
