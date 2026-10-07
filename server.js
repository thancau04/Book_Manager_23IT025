require('dotenv').config(); // phai nam dau tien de db.js/session.js doc duoc env
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const { connectAll } = require('./config/db');
const sessionMiddleware = require('./config/session');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // Render dung reverse proxy -> can cho cookie secure

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    inc: (i) => i + 1,
    money: (n) => (typeof n === 'number' ? n.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : ''),
    date: (d) => (d ? new Date(d).toLocaleString('vi-VN') : ''),
  },
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (req, res) => res.send('ok')); // khong qua session
app.use(express.urlencoded({ extended: false }));
app.use(sessionMiddleware);

// Chuc nang tan dung session: dem luot thao tac + flash message
app.use((req, res, next) => {
  req.session.visits = (req.session.visits || 0) + 1;
  res.locals.visits = req.session.visits;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.use('/', bookRoutes);

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).send('Lỗi máy chủ. Vui lòng thử lại.');
});

connectAll()
  .then(() => app.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`)))
  .catch((err) => {
    console.error('Không thể kết nối MongoDB Atlas:', err.message);
    process.exit(1);
  });
