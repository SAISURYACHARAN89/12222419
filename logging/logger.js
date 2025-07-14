const axios = require('axios');

async function Log(stack, level, pkg, message) {
  try {
    await axios.post('http://20.244.56.144/evaluation-service/logs', {
      stack,
      level,
      package: pkg,
      message
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Failed to send log:', err.message);
  }
}

function loggingMiddleware(req, res, next) {
  Log('backend', 'info', 'middleware', `Incoming ${req.method} request to ${req.originalUrl}`);
  next();
}

module.exports = { Log, loggingMiddleware };