const { BookReadModel, BookWriteModel, CODE_PREFIX } = require('../models/Book');

// Luong DOC -> BookReadModel
async function renderIndex(res, { status = 200, errors = [], form = {} } = {}) {
  const books = await BookReadModel.find().sort({ createdAt: -1 }).lean();
  res.status(status).render('index', { books, errors, form, prefix: CODE_PREFIX });
}

exports.list = async (req, res, next) => {
  try {
    await renderIndex(res);
  } catch (err) {
    next(err);
  }
};

// Luong GHI -> BookWriteModel
exports.create = async (req, res, next) => {
  const bookCode = String(req.body.bookCode || '').trim();
  const title = String(req.body.title || '').trim();
  const author = String(req.body.author || '').trim();
  const rawPrice = String(req.body.originalPrice ?? '').trim();
  const originalPrice = Number(rawPrice);
  const form = { bookCode, title, author, originalPrice: rawPrice };

  const fail = (errors) => renderIndex(res, { status: 400, errors, form });

  try {
    const errors = [];
    if (!bookCode.startsWith(CODE_PREFIX)) {
      errors.push(`Mã sách "${bookCode}" không hợp lệ: phải bắt đầu bằng "${CODE_PREFIX}".`);
    }
    if (!title) errors.push('Tên sách là bắt buộc.');
    if (!author) errors.push('Tác giả là bắt buộc.');
    if (rawPrice === '' || !Number.isFinite(originalPrice) || originalPrice < 0) {
      errors.push('Giá gốc phải là số không âm.');
    }
    if (errors.length) return await fail(errors);

    await BookWriteModel.create({ bookCode, title, author, originalPrice });

    req.session.flash = { type: 'success', message: `Đã thêm sách "${title}" (${bookCode}).` };
    res.redirect('/');
  } catch (err) {
    if (err.code === 11000) return fail([`Mã sách "${bookCode}" đã tồn tại.`]).catch(next);
    if (err.name === 'ValidationError') {
      return fail(Object.values(err.errors).map((e) => e.message)).catch(next);
    }
    next(err);
  }
};
