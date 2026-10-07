const mongoose = require('mongoose');
const { readConnection, writeConnection } = require('../config/db');

const VAT_RATE = 9; // (4 + 5)% voi chu so cuoi MSSV 23IT025 = 5
const CODE_PREFIX = '025';

const bookSchema = new mongoose.Schema({
  bookCode: {
    type: String,
    required: [true, 'Mã sách là bắt buộc'],
    unique: true,
    trim: true,
    validate: {
      validator: (v) => typeof v === 'string' && v.startsWith(CODE_PREFIX),
      message: `Mã sách phải bắt đầu bằng "${CODE_PREFIX}"`,
    },
  },
  title: { type: String, required: [true, 'Tên sách là bắt buộc'], trim: true },
  author: { type: String, required: [true, 'Tác giả là bắt buộc'], trim: true },
  originalPrice: { type: Number, required: [true, 'Giá gốc là bắt buộc'], min: [0, 'Giá gốc phải >= 0'] },
  vatRate: { type: Number, default: VAT_RATE },
  finalPrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

// Server tu tinh gia sau thue: Gia goc * (1 + 9%) = Gia goc * 1.09
bookSchema.pre('save', function () {
  this.vatRate = VAT_RATE; // khong cho client ghi de
  this.finalPrice = Math.round(this.originalPrice * (1 + this.vatRate / 100) * 100) / 100;
});

// Cung 1 schema, gan vao 2 connection doc lap
const BookReadModel = readConnection.model('Book', bookSchema, 'books');
const BookWriteModel = writeConnection.model('Book', bookSchema, 'books');

module.exports = { BookReadModel, BookWriteModel, CODE_PREFIX, VAT_RATE };
