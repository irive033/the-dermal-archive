const LIMITS = {
  name: 120,
  email: 200,
  subject: 200,
  message: 5000,
  productLink: 500,
};

// Trim and cap a submitted value.
function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

// Anything that ends up in a mail header has to lose its line breaks, or a
// submitted value could inject headers of its own.
function header(value) {
  return value.replace(/[\r\n]+/g, ' ');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  // Honeypot — hidden from people, catnip to bots. Answer as if it went through.
  if (clean(body.website, 100)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const subject = clean(body.subject, LIMITS.subject);
  const message = clean(body.message, LIMITS.message);
  const productLink = clean(body.productLink, LIMITS.productLink);

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Please fill in every required field.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "That email address doesn't look right." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO || 'info@thedermalarchive.com';
  if (!apiKey) {
    console.error('RESEND_API_KEY must be set.');
    return res.status(500).json({ error: 'The form is not configured yet.' });
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    productLink ? `Product link: ${productLink}` : null,
    '',
    message,
  ]
    .filter((line) => line !== null)
    .join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // From has to sit on the domain verified with Resend. The visitor goes
        // in reply_to instead, so hitting reply in your inbox writes to them.
        from: process.env.CONTACT_FROM || 'The Dermal Archive <info@thedermalarchive.com>',
        to: [to],
        reply_to: `${header(name)} <${header(email)}>`,
        subject: `Contact form: ${header(subject)}`,
        text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Resend rejected the message:', response.status, detail);
      return res.status(502).json({ error: 'Something went wrong sending your note.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form send failed:', error);
    return res.status(502).json({ error: 'Something went wrong sending your note.' });
  }
};

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}
