// api/contact.js — Vercel Serverless Function for Contact Form
// Works seamlessly on Vercel without a long-running Node server.

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const serviceId  = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey  = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS environment variables not set.');
    return res.status(200).json({
      success: true,
      note: 'Message acknowledged (EmailJS credentials not configured yet in Vercel/Netlify dashboard).'
    });
  }

  try {
    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          from_name: name,
          from_email: email,
          subject: subject || 'Portfolio Contact',
          message: message,
          to_name: 'Ayush Trivedi',
        }
      })
    });

    if (emailRes.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errText = await emailRes.text();
      throw new Error(errText);
    }
  } catch (err) {
    console.error('EmailJS error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
