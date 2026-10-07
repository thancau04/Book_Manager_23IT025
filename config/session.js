const session = require('express-session');
const MongoStore = require('connect-mongo');

if (!process.env.SESSION_SECRET) {
  throw new Error('Thieu SESSION_SECRET trong bien moi truong');
}

// Session luu tap trung tren MongoDB Atlas (stateless server, auto-scaling duoc)
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_SESSION_URI || process.env.MONGO_WRITE_URI,
  dbName: process.env.DB_NAME || 'DB_23IT025',
  collectionName: 'sessions',
  ttl: 14 * 24 * 60 * 60, // 14 ngay
});

module.exports = session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // Render chay HTTPS
    maxAge: 14 * 24 * 60 * 60 * 1000,
  },
});
