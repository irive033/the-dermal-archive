// Newsletter signup. Adds the address to Kit, then attaches it to the form in
// KIT_FORM_ID — that second call is what triggers Kit's confirmation email on a
// double opt-in form.

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function kit(url, key, email) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Kit-Api-Key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_address: email }),
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const email = clean(body.email, 200);

  if (!email) {
    return res.status(400).json({ error: 'Please enter your email address.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "That email address doesn't look right." });
  }

  const key = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID || '9847970';
  if (!key) {
    console.error('KIT_API_KEY must be set.');
    return res.status(500).json({ error: 'Signups are not configured yet.' });
  }

  try {
    // Kit requires the subscriber to exist before it can be added to a form.
    const created = await kit('https://api.kit.com/v4/subscribers', key, email);
    if (!created.ok) {
      console.error('Kit rejected the subscriber:', created.status, await created.text());
      return res.status(502).json({ error: "Something went wrong. Please try again." });
    }

    const added = await kit(`https://api.kit.com/v4/forms/${formId}/subscribers`, key, email);
    if (!added.ok) {
      console.error('Kit rejected the form subscription:', added.status, await added.text());
      return res.status(502).json({ error: "Something went wrong. Please try again." });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Newsletter signup failed:', error);
    return res.status(502).json({ error: 'Something went wrong. Please try again.' });
  }
};

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}
