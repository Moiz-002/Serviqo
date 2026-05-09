const mongoose = require('mongoose');

async function connectDatabase(url) {
  return mongoose.connect(url);
}

module.exports = connectDatabase;
