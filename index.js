const express = require('express');
const app = express();
const { loggingMiddleware } = require('./logging/logger');
app.use(express.json());
app.use(loggingMiddleware);
const urlStore = {};

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function generateShortcode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.post('/shorturls', (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;
    if (!url || !isValidUrl(url)) {
      return res.status(400).send({ message: 'Invalid or missing URL' });
    }
    const code = shortcode || generateShortcode();
    const validMinutes = typeof validity === 'number' ? validity : 30;
    const expiry = new Date(Date.now() + validMinutes * 60000).toISOString();
    const createdAt = new Date().toISOString();
    const host = req.get('host');
    const protocol = req.protocol;
    const shortLink = `${protocol}://${host}/${code}`;

    urlStore[code] = {
      url,
      createdAt,
      expiry,
      clicks: []
    };

    res.status(201).send({
      shortLink,
      expiry
    });
  } catch (error) {
    res.status(500).send({ message: 'Error creating URL', error: error.message });
  }
});


app.get('/shorturls/:id', (req, res) => {
  const { id } = req.params;
  const entry = urlStore[id];
  if (!entry) {
    return res.status(404).send({ message: 'Shortcode not found' });
  }
  res.status(200).send({
    shortcode: id,
    originalUrl: entry.url,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    totalClicks: entry.clicks.length,
    clicks: entry.clicks
  });
});
app.get('/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const entry = urlStore[shortcode];
  if (!entry) {
    return res.status(404).send({ message: 'Shortcode not found' });
  }

  entry.clicks.push({
    timestamp: new Date().toISOString(),
    referrer: req.get('referer') || null,
    location: req.ip
  });
  res.redirect(entry.url);
});

app.listen(5000, () => {
  console.log('listening on port 5000!');
});