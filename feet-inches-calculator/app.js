/* UI wiring for the feet & inches calculator. */
(function () {
  'use strict';

  var L = window.Lengths;

  var el = {
    text: document.getElementById('text'),
    textNote: document.getElementById('text-note'),
    amount: document.getElementById('amount'),
    amountNote: document.getElementById('amount-note'),
    precision: document.getElementById('precision'),
    opAdd: document.getElementById('op-add'),
    opSub: document.getElementById('op-sub'),
    result: document.getElementById('result'),
    math: document.getElementById('math'),
    copy: document.getElementById('copy'),
    examples: document.getElementById('examples')
  };

  var operation = 'add';
  var copyable = '';

  var EXAMPLES = [
    { text: 'I am 6ft, 3in and 1/2 tall', amount: '1/2 in', op: 'add' },
    { text: 'The beam is 5\'-6" long', amount: '3 1/2 in', op: 'add' },
    { text: 'Cut the 8 ft 0 in stud to fit', amount: '3 1/4 in', op: 'subtract' },
    { text: 'Order 3 of the 6 ft 2 in posts', amount: '1 ft', op: 'add' },
    { text: 'Door rough opening 6 feet 8 inches', amount: '1 1/2', op: 'subtract' }
  ];

  /* ---------------- helpers ---------------- */

  // A neutral "6 ft 3 1/2 in" rendering, used for the readout line where we
  // are describing a value rather than echoing the user's own notation.
  var PLAIN_STYLE = {
    ft: { mark: 'ft', space: ' ' },
    in: { mark: 'in', space: ' ' },
    sep: ' '
  };

  function plain(inches, denom) {
    return L.formatInches(inches, PLAIN_STYLE, denom);
  }

  function round(x, places) {
    var f = Math.pow(10, places);
    return String(Math.round(x * f) / f);
  }

  function quoteList(items) {
    return items.map(function (s) { return '“' + s.trim() + '”'; }).join(', ');
  }

  function setNote(noteEl, message, isError) {
    noteEl.textContent = message || '';
    noteEl.classList.toggle('error', !!isError);
    noteEl.parentNode.classList.toggle('has-error', !!isError);
  }

  function describeError(parsed, what) {
    if (parsed.error === 'multiple') {
      return 'Found ' + parsed.found.length + ' measurements in ' + what +
             ' — it must contain exactly one: ' + quoteList(parsed.found);
    }
    return 'No measurement found in ' + what + '.';
  }

  function showResult(message, kind) {
    el.result.textContent = message;
    el.result.className = 'result' + (kind ? ' is-' + kind : '');
    el.math.textContent = '';
    copyable = '';
    el.copy.disabled = true;
  }

  /* ---------------- main ---------------- */

  function update() {
    var text = el.text.value;
    var amountText = el.amount.value;
    var denom = parseInt(el.precision.value, 10);

    resetCopyLabel();

    // --- the amount to add or subtract ---
    var amount = null;
    if (amountText.trim() === '') {
      setNote(el.amountNote, '', false);
    } else {
      var a = L.parse(amountText, { allowBareNumber: true });
      if (!a.ok) {
        setNote(el.amountNote, describeError(a, 'the amount'), true);
      } else {
        amount = a.inches;
        setNote(el.amountNote,
          '= ' + plain(amount, denom) +
          (a.bare ? '  (a plain number is read as inches)' : ''),
          false);
      }
    }

    // --- the text holding the measurement ---
    var source = null;
    if (text.trim() === '') {
      setNote(el.textNote, '', false);
    } else {
      var s = L.parse(text, { allowBareNumber: false });
      if (!s.ok) {
        setNote(el.textNote, describeError(s, 'the text'), true);
      } else {
        source = s.inches;
        setNote(el.textNote,
          'Found “' + s.measurement.text.trim() + '” = ' + plain(source, denom),
          false);
      }
    }

    // --- the answer ---
    if (text.trim() === '' || amountText.trim() === '') {
      showResult('Fill in both boxes to see the result.', 'empty');
      return;
    }
    if (source === null || amount === null) {
      showResult('Fix the highlighted box above.', 'error');
      return;
    }

    var applied = L.applyDelta(text, amount, operation, denom);
    if (!applied.ok) {
      showResult(describeError(applied, 'the text'), 'error');
      return;
    }

    renderResult(applied, amount, denom);
  }

  function renderResult(applied, amount, denom) {
    el.result.className = 'result';
    el.result.textContent = '';

    var head = document.createTextNode(applied.text.slice(0, applied.start));
    var hit = document.createElement('span');
    hit.className = 'hit';
    hit.textContent = applied.replacement;
    var tail = document.createTextNode(applied.text.slice(applied.end));

    el.result.appendChild(head);
    el.result.appendChild(hit);
    el.result.appendChild(tail);

    var totalInches = L.toNumber(applied.after);
    el.math.textContent =
      plain(applied.before, denom) + (operation === 'subtract' ? '  −  ' : '  +  ') +
      plain(amount, denom) + '  =  ' + plain(applied.after, denom) +
      ' · ' + round(totalInches, 4) + ' in' +
      ' · ' + round(totalInches / 12, 4) + ' ft' +
      ' · ' + round(totalInches * 0.0254, 4) + ' m' +
      (applied.negative ? ' ·  result is below zero' : '');

    copyable = applied.text;
    el.copy.disabled = false;
  }

  /* ---------------- events ---------------- */

  function setOperation(next) {
    operation = next;
    var isAdd = next === 'add';
    el.opAdd.classList.toggle('is-on', isAdd);
    el.opSub.classList.toggle('is-on', !isAdd);
    el.opAdd.setAttribute('aria-pressed', String(isAdd));
    el.opSub.setAttribute('aria-pressed', String(!isAdd));
    update();
  }

  function resetCopyLabel() {
    el.copy.textContent = 'Copy';
    el.copy.classList.remove('copied');
  }

  function copyResult() {
    if (!copyable) return;

    var done = function () {
      el.copy.textContent = 'Copied';
      el.copy.classList.add('copied');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyable).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      var scratch = document.createElement('textarea');
      scratch.value = copyable;
      scratch.setAttribute('readonly', '');
      scratch.style.position = 'fixed';
      scratch.style.opacity = '0';
      document.body.appendChild(scratch);
      scratch.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(scratch);
    }
  }

  function buildExamples() {
    EXAMPLES.forEach(function (ex) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = (ex.op === 'subtract' ? '− ' : '+ ') + ex.amount + '  ·  ' + ex.text;
      b.addEventListener('click', function () {
        el.text.value = ex.text;
        el.amount.value = ex.amount;
        setOperation(ex.op);
      });
      el.examples.appendChild(b);
    });
  }

  el.text.addEventListener('input', update);
  el.amount.addEventListener('input', update);
  el.precision.addEventListener('change', update);
  el.opAdd.addEventListener('click', function () { setOperation('add'); });
  el.opSub.addEventListener('click', function () { setOperation('subtract'); });
  el.copy.addEventListener('click', copyResult);

  buildExamples();
  update();
})();
