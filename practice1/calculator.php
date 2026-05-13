<?php
$result     = '';
$expression = '';
$error      = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $num1 = $_POST['num1'] ?? '';
    $num2 = $_POST['num2'] ?? '';
    $op   = $_POST['operator'] ?? '';

    if ($num1 === '' || $num2 === '') {
        $error = 'Please enter both numbers.';
    } elseif (!is_numeric($num1) || !is_numeric($num2)) {
        $error = 'Invalid input — numbers only.';
    } else {
        $a = (float)$num1;
        $b = (float)$num2;

        switch ($op) {
            case '+':
                $result     = $a + $b;
                $expression = "$a + $b = $result";
                break;
            case '-':
                $result     = $a - $b;
                $expression = "$a − $b = $result";
                break;
            case '*':
                $result     = $a * $b;
                $expression = "$a × $b = $result";
                break;
            case '/':
                if ($b == 0) {
                    $error = 'Cannot divide by zero.';
                } else {
                    $result     = $a / $b;
                    $expression = "$a ÷ $b = $result";
                }
                break;
            case '%':
                $result     = fmod($a, $b);
                $expression = "$a mod $b = $result";
                break;
            case '**':
                $result     = $a ** $b;
                $expression = "$a ^ $b = $result";
                break;
            default:
                $error = 'Unknown operator.';
        }

        if ($result !== '') {
            // Clean up floating-point noise
            $result = rtrim(rtrim(number_format($result, 10, '.', ''), '0'), '.');
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>PHP Calculator</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      overflow: hidden;
    }

    body::before, body::after {
      content: '';
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.35;
      pointer-events: none;
    }
    body::before {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #7c3aed, transparent);
      top: -100px; left: -100px;
      animation: float1 8s ease-in-out infinite alternate;
    }
    body::after {
      width: 350px; height: 350px;
      background: radial-gradient(circle, #2563eb, transparent);
      bottom: -80px; right: -80px;
      animation: float2 10s ease-in-out infinite alternate;
    }
    @keyframes float1 { to { transform: translate(60px,60px); } }
    @keyframes float2 { to { transform: translate(-60px,-60px); } }

    .calculator {
      position: relative;
      width: 360px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 28px;
      padding: 28px 24px 24px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.15) inset;
      animation: slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes slideUp {
      from { opacity:0; transform:translateY(40px) scale(0.92); }
      to   { opacity:1; transform:translateY(0)    scale(1);    }
    }

    h1 {
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 3px;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 20px;
    }

    /* Display panel */
    .display {
      background: rgba(0,0,0,0.35);
      border-radius: 16px;
      padding: 16px 20px 14px;
      margin-bottom: 24px;
      border: 1px solid rgba(255,255,255,0.07);
      min-height: 90px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-end;
    }
    .expr {
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      min-height: 20px;
      text-align: right;
      word-break: break-all;
    }
    .res {
      font-size: 38px;
      font-weight: 300;
      color: #fff;
      letter-spacing: -1px;
      word-break: break-all;
      text-align: right;
    }
    .res.error { color: #f87171; font-size: 18px; font-weight: 400; }

    /* Form layout */
    .inputs {
      display: flex;
      gap: 10px;
      margin-bottom: 14px;
    }
    input[type="text"] {
      flex: 1;
      height: 52px;
      padding: 0 14px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 18px;
      font-weight: 400;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
      text-align: center;
    }
    input[type="text"]:focus {
      border-color: rgba(124,58,237,0.7);
      background: rgba(255,255,255,0.12);
    }
    input[type="text"]::placeholder { color: rgba(255,255,255,0.25); font-size: 14px; }

    /* Operator grid */
    .ops {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .op-btn {
      height: 50px;
      border: 1px solid rgba(124,58,237,0.3);
      border-radius: 12px;
      background: rgba(124,58,237,0.18);
      color: #a78bfa;
      font-family: 'Inter', sans-serif;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
      position: relative;
      overflow: hidden;
    }
    .op-btn:hover   { background: rgba(124,58,237,0.38); box-shadow: 0 4px 16px rgba(124,58,237,0.3); }
    .op-btn:active  { transform: scale(0.93); }
    .op-btn.selected {
      background: rgba(124,58,237,0.65);
      color: #fff;
      box-shadow: 0 0 0 2px rgba(167,139,250,0.6);
    }

    /* Selected hidden input */
    #selected-op { display:none; }

    /* Calculate button */
    .calc-btn {
      width: 100%;
      height: 56px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 17px;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
      box-shadow: 0 6px 20px rgba(124,58,237,0.5);
    }
    .calc-btn:hover  { background: linear-gradient(135deg,#6d28d9,#4338ca); box-shadow:0 8px 24px rgba(124,58,237,0.65); }
    .calc-btn:active { transform: scale(0.96); }

    /* Ripple */
    .ripple {
      position: absolute; border-radius: 50%;
      background: rgba(255,255,255,0.25);
      transform: scale(0);
      animation: rip 0.5s linear;
      pointer-events: none;
    }
    @keyframes rip { to { transform:scale(4); opacity:0; } }
  </style>
</head>
<body>
<div class="calculator">
  <h1>⚡ PHP Calculator</h1>

  <!-- Display -->
  <div class="display">
    <?php if ($error): ?>
      <div class="expr">Error</div>
      <div class="res error"><?= htmlspecialchars($error) ?></div>
    <?php elseif ($result !== ''): ?>
      <div class="expr"><?= htmlspecialchars($expression) ?></div>
      <div class="res"><?= htmlspecialchars($result) ?></div>
    <?php else: ?>
      <div class="expr">Enter two numbers &amp; pick an operator</div>
      <div class="res">—</div>
    <?php endif; ?>
  </div>

  <!-- Form -->
  <form method="POST" id="calcForm">
    <div class="inputs">
      <input type="text" name="num1" id="num1"
             value="<?= htmlspecialchars($_POST['num1'] ?? '') ?>"
             placeholder="Number 1" autocomplete="off"/>
      <input type="text" name="num2" id="num2"
             value="<?= htmlspecialchars($_POST['num2'] ?? '') ?>"
             placeholder="Number 2" autocomplete="off"/>
    </div>

    <input type="hidden" name="operator" id="selected-op"
           value="<?= htmlspecialchars($_POST['operator'] ?? '') ?>"/>

    <div class="ops">
      <?php
        $ops = [
          '+' => '+', '-' => '−', '*' => '×',
          '/' => '÷', '%' => 'mod', '**' => 'xʸ'
        ];
        $selectedOp = $_POST['operator'] ?? '';
        foreach ($ops as $val => $label):
          $active = ($selectedOp === $val) ? 'selected' : '';
      ?>
        <button type="button" class="op-btn <?= $active ?>"
                data-op="<?= $val ?>"
                onclick="pickOp(this)">
          <?= $label ?>
        </button>
      <?php endforeach; ?>
    </div>

    <button type="submit" class="calc-btn">Calculate</button>
  </form>
</div>

<script>
  function pickOp(btn) {
    document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('selected-op').value = btn.dataset.op;
  }

  // Ripple effect
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const r = document.createElement('span');
      r.classList.add('ripple');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 500);
    });
  });

  // Keyboard: Enter submits
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('calcForm').submit();
  });
</script>
</body>
</html>
