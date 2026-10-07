const mongoose = require('mongoose');

const dbName = process.env.DB_NAME || 'DB_23IT025';

if (!process.env.MONGO_READ_URI || !process.env.MONGO_WRITE_URI) {
  throw new Error('Thieu MONGO_READ_URI hoac MONGO_WRITE_URI trong bien moi truong');
}

// Ket noi chi-doc: tat autoIndex/autoCreate vi tai khoan doc khong duoc phep tao index/collection
const readConnection = mongoose.createConnection(process.env.MONGO_READ_URI, {
  dbName,
  autoIndex: false,
  autoCreate: false,
});

// Ket noi chi-ghi: duoc phep tao collection + unique index cho bookCode
const writeConnection = mongoose.createConnection(process.env.MONGO_WRITE_URI, {
  dbName,
});

readConnection.on('error', (e) => console.error('[readConnection]', e.message));
writeConnection.on('error', (e) => console.error('[writeConnection]', e.message));

async function connectAll() {
  await Promise.all([readConnection.asPromise(), writeConnection.asPromise()]);
  console.log(`Da ket noi MongoDB Atlas (DB: ${dbName}) bang 2 connection Read/Write`);
}

module.exports = { readConnection, writeConnection, connectAll };
