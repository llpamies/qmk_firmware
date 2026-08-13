/*
 * lengths.js - parse, add and subtract feet/inch/fraction measurements
 * found inside free-form text.
 *
 * Works both as a plain browser script (window.Lengths) and in Node
 * (require('./lengths.js')), so the same file backs the page and the tests.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.Lengths = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Exact rational arithmetic.
   *
   * Measurements are kept as exact fractions of an inch so that repeated
   * edits never accumulate binary floating point error: 1/3 + 1/3 + 1/3
   * is exactly 1, not 0.9999999999999998.
   * ------------------------------------------------------------------ */

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      var t = a % b;
      a = b;
      b = t;
    }
    return a;
  }

  function rat(n, d) {
    if (d === 0) throw new Error('zero denominator');
    if (d < 0) {
      n = -n;
      d = -d;
    }
    var g = gcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }

  function add(a, b) { return rat(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return rat(a.n * b.d - b.n * a.d, a.d * b.d); }
  function scale(a, k) { return rat(a.n * k, a.d); }
  function toNumber(a) { return a.n / a.d; }
  function isZero(a) { return a.n === 0; }

  var ZERO = { n: 0, d: 1 };

  /* ------------------------------------------------------------------ *
   * Lexing
   * ------------------------------------------------------------------ */

  // A number is a mixed number ("3 1/2"), a bare fraction ("1/2"),
  // a decimal ("3.5", ".5") or an integer ("3"). Order matters: the
  // longest forms have to be tried first.
  var NUM =
    '(?:\\d+\\s+\\d+\\s*\\/\\s*\\d+|\\d+\\s*\\/\\s*\\d+|\\d*\\.\\d+|\\d+)';

  // Word units must not run into a longer word ("6 int" is not 6 inches).
  // The trailing period of "ft." is deliberately NOT consumed so that a
  // sentence-ending period survives outside the measurement.
  var UNIT =
    "(?:(?:feet|foot|ft|inches|inch|in)(?![a-z0-9])|''|[\"'‘’“”′″])";

  // The space and the unit are optional *together*: an unattached number
  // must not consume the whitespace that follows it, or replacing the
  // measurement would eat the gap before the next word.
  var TOKEN_RE = new RegExp('(' + NUM + ')(?:(\\s*)(' + UNIT + '))?', 'gi');

  // Text allowed to sit between two parts of a single measurement:
  // "6ft 3in", "6', 3\"", "6 ft. 3 in", "6 ft and 1/2", "5'-6\"".
  var CONNECTOR_RE = /^[\s,.]*(?:and|&|plus|\+|[-–])?[\s,.]*$/i;

  var FULL_NUM_RE = new RegExp('^' + NUM + '$');

  function unitKind(text) {
    if (!text) return null;
    var s = text.toLowerCase();
    if (s === 'ft' || s === 'feet' || s === 'foot' ||
        s === "'" || s === '‘' || s === '’' || s === '′') {
      return 'ft';
    }
    return 'in';
  }

  function numberToRat(text) {
    var t = text.trim().replace(/\s*\/\s*/g, '/');
    var m;
    if ((m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(t))) {
      return add(rat(+m[1], 1), rat(+m[2], +m[3]));
    }
    if ((m = /^(\d+)\/(\d+)$/.exec(t))) {
      return rat(+m[1], +m[2]);
    }
    if ((m = /^(\d*)\.(\d+)$/.exec(t))) {
      var den = Math.pow(10, m[2].length);
      var whole = m[1] === '' ? 0 : +m[1];
      return rat(whole * den + +m[2], den);
    }
    return rat(+t, 1);
  }

  function isFractionText(text) {
    return text.indexOf('/') !== -1;
  }

  function tokenize(text) {
    var tokens = [];
    var m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(text)) !== null) {
      // A zero-width match would spin forever; the number pattern always
      // consumes at least one character, but stay defensive.
      if (m[0].length === 0) {
        TOKEN_RE.lastIndex++;
        continue;
      }
      var value;
      try {
        value = numberToRat(m[1]);
      } catch (e) {
        continue; // e.g. "1/0"
      }
      tokens.push({
        start: m.index,
        end: m.index + m[0].length,
        numText: m[1],
        space: m[2] || '',
        unitText: m[3] || '',
        unit: unitKind(m[3]),
        fraction: isFractionText(m[1]),
        value: value
      });
    }
    return tokens;
  }

  /* ------------------------------------------------------------------ *
   * Grouping tokens into measurements
   * ------------------------------------------------------------------ */

  function startGroup(token) {
    var g = {
      start: token.start,
      end: token.end,
      parts: { ft: null, in: null },
      lastUnit: token.unit,
      style: { ft: null, in: null, sep: null },
      tokens: [token]
    };
    g.parts[token.unit] = token.value;
    g.style[token.unit] = { mark: token.unitText, space: token.space };
    return g;
  }

  function canExtend(group, token, gap) {
    if (!CONNECTOR_RE.test(gap)) return false;
    if (token.unit === 'ft') {
      // A second feet value means a second measurement.
      return false;
    }
    if (token.unit === 'in') {
      return group.parts.in === null;
    }
    // Unitless: only a bare fraction folds into the previous part, so that
    // stray numbers in the surrounding prose are never swallowed.
    return token.fraction && toNumber(token.value) < 1 && group.lastUnit !== null;
  }

  function extend(group, token, gap) {
    if (token.unit) {
      group.parts[token.unit] = token.value;
      group.style[token.unit] = { mark: token.unitText, space: token.space };
      if (group.style.sep === null) group.style.sep = gap;
      group.lastUnit = token.unit;
    } else {
      group.parts[group.lastUnit] = add(group.parts[group.lastUnit], token.value);
    }
    group.end = token.end;
    group.tokens.push(token);
  }

  function findMeasurements(text) {
    var tokens = tokenize(text);
    var groups = [];
    var cur = null;

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (cur) {
        var gap = text.slice(cur.end, t.start);
        if (canExtend(cur, t, gap)) {
          extend(cur, t, gap);
          continue;
        }
        groups.push(cur);
        cur = null;
      }
      // Only a token carrying an explicit unit may open a measurement.
      if (t.unit) cur = startGroup(t);
    }
    if (cur) groups.push(cur);

    groups.forEach(function (g) {
      g.text = text.slice(g.start, g.end);
      g.inches = totalInches(g);
    });
    return groups;
  }

  function totalInches(group) {
    var total = ZERO;
    if (group.parts.ft) total = add(total, scale(group.parts.ft, 12));
    if (group.parts.in) total = add(total, group.parts.in);
    return total;
  }

  /* ------------------------------------------------------------------ *
   * Formatting
   * ------------------------------------------------------------------ */

  var FT_TO_IN_MARK = { "'": '"', '‘': '“', '’': '”', '′': '″' };
  var IN_TO_FT_MARK = { '"': "'", '“': '‘', '”': '’', '″': '′' };

  function matchCase(sample, word) {
    return /[A-Z]/.test(sample) ? word.toUpperCase() : word;
  }

  // Derive the inch marker to use when the source measurement had feet only.
  function deriveInchStyle(ftStyle) {
    if (!ftStyle) return { mark: 'in', space: ' ' };
    var mark = FT_TO_IN_MARK[ftStyle.mark];
    if (mark) return { mark: mark, space: ftStyle.space };
    return { mark: matchCase(ftStyle.mark, 'in'), space: ftStyle.space || ' ' };
  }

  // ...and the feet marker when the source had inches only.
  function deriveFootStyle(inStyle) {
    if (!inStyle) return { mark: 'ft', space: ' ' };
    var mark = IN_TO_FT_MARK[inStyle.mark];
    if (mark) return { mark: mark, space: inStyle.space };
    return { mark: matchCase(inStyle.mark, 'ft'), space: inStyle.space || ' ' };
  }

  function renderPart(whole, fracNum, fracDen, style) {
    var num = String(whole);
    if (fracNum > 0) {
      num = whole === 0 ? fracNum + '/' + fracDen
                        : whole + ' ' + fracNum + '/' + fracDen;
    }
    return num + style.space + style.mark;
  }

  /**
   * Render an exact inch value using the notation of the source measurement.
   *
   * style  - the `style` object of the parsed group (marks and spacing to echo)
   * denom  - fraction resolution, e.g. 16 for 1/16"
   */
  function formatInches(inches, style, denom) {
    denom = denom || 16;
    style = style || { ft: null, in: null, sep: null };

    var negative = inches.n < 0;
    var absN = Math.abs(inches.n);

    // Snap to the nearest 1/denom of an inch and work in those units.
    var ticks = Math.round((absN * denom) / inches.d);
    var perFoot = 12 * denom;

    var showFeet = style.ft !== null && ticks >= perFoot;
    var ftStyle = style.ft || deriveFootStyle(style.in);
    var inStyle = style.in || deriveInchStyle(style.ft);
    // With no separator to echo, symbol notation joins tight (8'3") while
    // word notation needs a space (8 ft 3 in).
    var sep = style.sep;
    if (sep === null || sep === undefined) {
      sep = /[a-z]/i.test(ftStyle.mark) ? ' ' : '';
    }

    var pieces = [];
    var inchTicks = ticks;

    if (showFeet) {
      var feet = Math.floor(ticks / perFoot);
      inchTicks = ticks - feet * perFoot;
      pieces.push(renderPart(feet, 0, 1, ftStyle));
    }

    if (inchTicks > 0 || pieces.length === 0) {
      var whole = Math.floor(inchTicks / denom);
      var remainder = inchTicks - whole * denom;
      var g = gcd(remainder, denom) || 1;
      pieces.push(renderPart(whole, remainder / g, denom / g, inStyle));
    }

    return (negative && ticks !== 0 ? '-' : '') + pieces.join(sep);
  }

  /* ------------------------------------------------------------------ *
   * Public API
   * ------------------------------------------------------------------ */

  /**
   * Find the single measurement in `text`.
   *
   * options.allowBareNumber - when the text holds no unit at all but is
   *   nothing more than a number, read it as inches. Used for the "amount
   *   to add" field, where "3 1/2" unambiguously means inches.
   */
  function parse(text, options) {
    options = options || {};
    var groups = findMeasurements(text || '');

    if (groups.length > 1) {
      return {
        ok: false,
        error: 'multiple',
        found: groups.map(function (g) { return g.text; })
      };
    }
    if (groups.length === 1) {
      return { ok: true, measurement: groups[0], inches: groups[0].inches };
    }

    if (options.allowBareNumber) {
      var t = (text || '').trim();
      if (FULL_NUM_RE.test(t)) {
        var value = numberToRat(t);
        return { ok: true, inches: value, assumedUnit: 'in', bare: true };
      }
    }
    return { ok: false, error: 'none', found: [] };
  }

  /**
   * Add or subtract `deltaInches` from the one measurement inside `text`,
   * leaving every other character of `text` untouched.
   */
  function applyDelta(text, deltaInches, operation, denom) {
    var parsed = parse(text, { allowBareNumber: false });
    if (!parsed.ok) return parsed;

    var g = parsed.measurement;
    var result = operation === 'subtract'
      ? sub(g.inches, deltaInches)
      : add(g.inches, deltaInches);

    var replacement = formatInches(result, g.style, denom);

    return {
      ok: true,
      text: text.slice(0, g.start) + replacement + text.slice(g.end),
      replacement: replacement,
      original: g.text,
      start: g.start,
      end: g.start + replacement.length,
      before: g.inches,
      after: result,
      negative: result.n < 0
    };
  }

  return {
    rat: rat,
    add: add,
    sub: sub,
    scale: scale,
    toNumber: toNumber,
    isZero: isZero,
    numberToRat: numberToRat,
    tokenize: tokenize,
    findMeasurements: findMeasurements,
    formatInches: formatInches,
    parse: parse,
    applyDelta: applyDelta
  };
});
