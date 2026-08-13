/* Browser smoke test. Run: NODE_PATH=/opt/node22/lib/node_modules node test/browser.smoke.js */
'use strict';

var path = require('path');
var { chromium } = require('playwright');

var URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

(async function () {
  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: 720, height: 1180 } });

  var consoleErrors = [];
  page.on('console', function (m) { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', function (e) { consoleErrors.push(String(e)); });

  await page.goto(URL);

  var failures = [];
  async function check(name, actual, expected) {
    if (actual !== expected) {
      failures.push(name + '\n    expected: ' + JSON.stringify(expected) +
                    '\n    actual:   ' + JSON.stringify(actual));
    }
  }

  var result = page.locator('#result');
  var hit = page.locator('#result .hit');

  // Default state, as shipped in the markup.
  await check('default result', await result.textContent(), 'I am 6ft, 4in tall');
  // The highlight spans the whole rewritten measurement, not just the part
  // that changed — "6ft, 3in and 1/2" collapsed into "6ft, 4in".
  await check('default highlight', await hit.textContent(), '6ft, 4in');

  // Typing updates live.
  await page.fill('#text', 'The beam is 5\'-6" long');
  await page.fill('#amount', '3 1/2 in');
  await check('symbol notation echoed', await result.textContent(),
              'The beam is 5\'-9 1/2" long');

  // Subtract.
  await page.click('#op-sub');
  await check('subtract', await result.textContent(), 'The beam is 5\'-2 1/2" long');
  await page.click('#op-add');

  // Precision selector.
  await page.fill('#text', '1 in');
  await page.fill('#amount', '1/32');
  await page.selectOption('#precision', '4');
  await check('coarse rounding', await result.textContent(), '1 in');
  await page.selectOption('#precision', '32');
  await check('fine rounding', await result.textContent(), '1 1/32 in');
  await page.selectOption('#precision', '16');

  // Two measurements in the text is an error, not a guess.
  await page.fill('#text', 'an 8 ft wall and a 3 ft door');
  await page.fill('#amount', '1 in');
  var note = await page.locator('#text-note').textContent();
  await check('ambiguous text errors', /Found 2 measurements/.test(note), true);
  await check('error names both', /“8 ft”, “3 ft”/.test(note), true);
  await check('no stale answer shown', await result.textContent(),
              'Fix the highlighted box above.');
  await check('error styling', await result.getAttribute('class'), 'result is-error');
  await check('copy disabled on error', await page.locator('#copy').isDisabled(), true);

  // Ambiguity in the amount box is reported against that box.
  await page.fill('#text', 'a 6 ft post');
  await page.fill('#amount', '1 in and 2 ft');
  await check('amount error flagged on its field',
              await page.locator('#amount').locator('xpath=..').getAttribute('class'),
              'field has-error');

  // Example chips populate both boxes and the operation.
  await page.fill('#amount', '1 in');
  await page.locator('.chip').nth(2).click();
  await check('chip sets text', await page.inputValue('#text'), 'Cut the 8 ft 0 in stud to fit');
  await check('chip sets amount', await page.inputValue('#amount'), '3 1/4 in');
  await check('chip sets operation', await page.locator('#op-sub').getAttribute('aria-pressed'), 'true');
  await check('chip result', await result.textContent(), 'Cut the 7 ft 8 3/4 in stud to fit');

  // Restore the showcase state and capture a screenshot.
  await page.locator('.chip').nth(0).click();
  await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshot.png'), fullPage: true });

  await browser.close();

  if (consoleErrors.length) {
    failures.push('console errors:\n    ' + consoleErrors.join('\n    '));
  }

  console.log((failures.length ? 'FAILED' : 'browser smoke test passed') +
              ' (' + failures.length + ' failures)');
  failures.forEach(function (f) { console.log('\n  FAIL ' + f); });
  process.exit(failures.length ? 1 : 0);
})();
