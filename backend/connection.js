const mongoose = require('mongoose');
const dns = require('dns');

async function connectDatabase(url) {
  if (!url) {
    throw new Error('MONGODB_URI is not configured');
  }

  // Some local/router DNS services refuse MongoDB SRV queries. Use configurable
  // public resolvers for mongodb+srv URLs while leaving other DNS behavior alone.
  if (url.startsWith('mongodb+srv://')) {
    const servers = (process.env.MONGODB_DNS_SERVERS || '1.1.1.1,8.8.8.8')
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean);
    if (servers.length) dns.setServers(servers);
  }

  return mongoose.connect(url);
}

module.exports = connectDatabase;
