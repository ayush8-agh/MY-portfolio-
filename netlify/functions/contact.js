// netlify/functions/contact.js
// Serverless contact form handler via EmailJS REST API

exports.handler = async function(event) {
  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, subject, message } = body;
  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // EmailJS REST API (no SMTP server needed)
  // Set these env vars in Netlify dashboard:
  //   EMAILJS_SERVICE_ID
  //   EMAILJS_TEMPLATE_ID
  //   EMAILJS_PUBLIC_KEY
  //   EMAILJS_PRIVATE_KEY  (optional — for server-side auth)
  const serviceId  = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey  = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    // Graceful fallback — acknowledge without sending
    console.warn('EmailJS env vars not set. Acknowledge only.');
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, note: 'EmailJS not configured yet — see SETUP.md' })
    };
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
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

    if (res.ok) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } else {
      const errText = await res.text();
      throw new Error(errText);
    }
  } catch (err) {
    console.error('EmailJS error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
