(function () {
  var form = document.getElementById('bookForm');
  if (!form) return;
  var prefix = form.dataset.prefix || '025';
  var codeInput = document.getElementById('bookCode');
  var codeError = document.getElementById('bookCodeError');

  function checkCode() {
    var ok = codeInput.value.trim().startsWith(prefix);
    codeError.textContent = ok ? '' : 'Mã sách phải bắt đầu bằng "' + prefix + '"';
    codeInput.classList.toggle('invalid', !ok);
    return ok;
  }

  codeInput.addEventListener('input', checkCode);
  form.addEventListener('submit', function (e) {
    var price = document.getElementById('originalPrice').value;
    if (!checkCode() || price === '' || Number(price) < 0) {
      e.preventDefault();
      if (price === '' || Number(price) < 0) alert('Giá gốc phải là số không âm.');
    }
  });
})();
