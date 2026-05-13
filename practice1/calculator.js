/**
 * Calculator — pure JavaScript (ES6+)
 * All logic lives here; the HTML file only wires up events.
 */

class Calculator {
  constructor() {
    this.reset();
    this.history = [];
  }

  /* ── State ─────────────────────────────────────────── */
  reset() {
    this.current       = '';
    this.previous      = '';
    this.operator      = null;
    this.justEvaluated = false;
  }

  /* ── Input handlers ────────────────────────────────── */
  appendDigit(d) {
    if (this.justEvaluated) { this.current = ''; this.justEvaluated = false; }
    if (this.current.length >= 15) return;
    this.current += d;
    return this.getState();
  }

  appendDot() {
    if (this.justEvaluated) { this.current = '0'; this.justEvaluated = false; }
    if (this.current.includes('.')) return;
    this.current = this.current === '' ? '0' : this.current;
    this.current += '.';
    return this.getState();
  }

  backspace() {
    if (this.justEvaluated) { this.reset(); return this.getState(); }
    this.current = this.current.slice(0, -1);
    return this.getState();
  }

  setOperator(op) {
    if (this.current === '' && this.operator) {
      this.operator = op;
      return this.getState();
    }
    if (this.previous !== '' && this.current !== '') this._evaluate(true);
    this.operator = op;
    this.previous = this.current !== '' ? this.current : (this.previous || '0');
    this.current  = '';
    this.justEvaluated = false;
    return this.getState();
  }

  toggleSign() {
    if (!this.current || this.current === '0') return;
    this.current = String(parseFloat(this.current) * -1);
    return this.getState();
  }

  percent() {
    if (!this.current) return;
    this.current = String(parseFloat(this.current) / 100);
    return this.getState();
  }

  evaluate() {
    return this._evaluate(false);
  }

  /* ── Core arithmetic ───────────────────────────────── */
  _evaluate(chaining = false) {
    if (!this.operator || this.previous === '') return this.getState();
    const a = parseFloat(this.previous);
    const b = parseFloat(this.current !== '' ? this.current : this.previous);
    let result;

    switch (this.operator) {
      case '+':  result = a + b; break;
      case '−':  result = a - b; break;
      case '×':  result = a * b; break;
      case '÷':
        if (b === 0) return { ...this.getState(), error: true };
        result = a / b; break;
      case '%':  result = a % b; break;
      case 'xʸ': result = Math.pow(a, b); break;
      default:   return this.getState();
    }

    // Remove floating-point noise
    result = parseFloat(result.toPrecision(12));

    const entry = {
      expression : `${this._fmt(a)} ${this.operator} ${this._fmt(b)}`,
      result     : this._fmt(result),
    };

    if (!chaining) {
      this.history.unshift(entry);
      if (this.history.length > 10) this.history.pop();
      this.operator      = null;
      this.justEvaluated = true;
    }

    this.current  = String(result);
    this.previous = String(result);
    return { ...this.getState(), last: entry };
  }

  /* ── Helpers ───────────────────────────────────────── */
  _fmt(n) {
    const s = String(n);
    return s.length > 12 ? parseFloat(n.toPrecision(8)).toString() : s;
  }

  getState() {
    return {
      display    : this.current  || this.previous || '0',
      expression : this.previous && this.operator
                   ? `${this.previous} ${this.operator}`
                   : '',
      operator   : this.operator,
      history    : this.history,
      error      : false,
    };
  }
}


/* ════════════════════════════════════════════════════════
   UI Controller  —  runs after DOM is ready
   ════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const calc       = new Calculator();
  const resultEl   = document.getElementById('result');
  const exprEl     = document.getElementById('expression');
  const histListEl = document.getElementById('hist-list');
  const histPanel  = document.getElementById('history-panel');
  const histToggle = document.getElementById('hist-toggle');

  /* ── Render ──────────────────────────────────────────── */
  function render(state) {
    if (!state) return;

    const val = state.display;
    resultEl.textContent = val;
    resultEl.classList.toggle('small', val.length > 10);
    resultEl.classList.remove('shake', 'error-color');

    exprEl.textContent = state.expression;

    // highlight active op button
    document.querySelectorAll('[data-op]').forEach(b => {
      b.classList.toggle('active-op', b.dataset.op === state.operator);
    });

    renderHistory(state.history);
  }

  function renderError() {
    resultEl.textContent = 'Error';
    resultEl.classList.add('shake', 'error-color');
    setTimeout(() => resultEl.classList.remove('shake'), 350);
    exprEl.textContent = '÷ 0 is undefined';
    calc.reset();
  }

  function renderHistory(items) {
    if (!histListEl) return;
    histListEl.innerHTML = items.length
      ? items.map(i => `<li><span class="h-expr">${i.expression} =</span><span class="h-res">${i.result}</span></li>`).join('')
      : '<li class="empty">No history yet</li>';
  }

  /* ── Button wiring ───────────────────────────────────── */
  document.querySelectorAll('[data-digit]').forEach(b =>
    b.addEventListener('click', () => render(calc.appendDigit(b.dataset.digit))));

  document.querySelectorAll('[data-op]').forEach(b =>
    b.addEventListener('click', () => render(calc.setOperator(b.dataset.op))));

  document.getElementById('btn-dot')?.addEventListener('click', () => render(calc.appendDot()));
  document.getElementById('btn-eq') ?.addEventListener('click', () => {
    const s = calc.evaluate();
    s.error ? renderError() : render(s);
  });
  document.getElementById('btn-ac')  ?.addEventListener('click', () => { calc.reset(); render(calc.getState()); exprEl.textContent=''; });
  document.getElementById('btn-sign')?.addEventListener('click', () => render(calc.toggleSign()));
  document.getElementById('btn-pct') ?.addEventListener('click', () => render(calc.percent()));
  document.getElementById('btn-bsp') ?.addEventListener('click', () => render(calc.backspace()));

  /* ── History toggle ──────────────────────────────────── */
  histToggle?.addEventListener('click', () => {
    histPanel.classList.toggle('open');
    histToggle.textContent = histPanel.classList.contains('open') ? '✕' : '🕐';
  });

  /* ── Keyboard ────────────────────────────────────────── */
  const KEY_MAP = {
    '0':'0','1':'1','2':'2','3':'3','4':'4',
    '5':'5','6':'6','7':'7','8':'8','9':'9',
  };
  document.addEventListener('keydown', e => {
    if (KEY_MAP[e.key])      render(calc.appendDigit(e.key));
    else if (e.key === '.')  render(calc.appendDot());
    else if (e.key === '+')  render(calc.setOperator('+'));
    else if (e.key === '-')  render(calc.setOperator('−'));
    else if (e.key === '*')  render(calc.setOperator('×'));
    else if (e.key === '/') { e.preventDefault(); render(calc.setOperator('÷')); }
    else if (e.key === 'Enter' || e.key === '=') {
      const s = calc.evaluate();
      s.error ? renderError() : render(s);
    }
    else if (e.key === 'Backspace') render(calc.backspace());
    else if (e.key === 'Escape')    { calc.reset(); render(calc.getState()); exprEl.textContent=''; }
    else if (e.key === '%')         render(calc.percent());
  });

  /* ── Ripple ──────────────────────────────────────────── */
  document.querySelectorAll('button').forEach(btn =>
    btn.addEventListener('click', function(e) {
      const r    = document.createElement('span');
      r.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 500);
    })
  );

  // Initial render
  render(calc.getState());
});
