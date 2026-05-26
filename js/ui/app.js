let lastResult = null;
let timeSelectedDay = new Date().getDate();

const WX_CLASS = { '木':'mu','火':'huo','土':'tu','金':'jin','水':'shui' };
function wxSpan(wx, text) { return `<span class="wx-${WX_CLASS[wx] || ''}">${text}</span>`; }

function showError(msg) {
  const result = document.getElementById('result');
  result.style.display = 'block';
  result.innerHTML = `<div class="card" style="text-align:center;padding:40px;color:#c62828"><p style="font-size:16px;margin-bottom:8px">排盘出错</p><p style="font-size:14px;color:var(--text-light)">${msg}</p><p style="font-size:12px;margin-top:12px;color:var(--text-light)">请确认网络连接正常（需要加载 lunar 库），或刷新页面重试</p></div>`;
}

function initDateSelectors() {
  const yearSel = document.getElementById('year');
  const thisYear = new Date().getFullYear();
  for (let y = 1900; y <= thisYear; y++) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    yearSel.appendChild(opt);
  }
  const monthSel = document.getElementById('month');
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m;
    monthSel.appendChild(opt);
  }
  yearSel.addEventListener('change', updateDays);
  monthSel.addEventListener('change', updateDays);
}

function updateDays() {
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daySel = document.getElementById('day');
  const currentVal = daySel.value;
  daySel.innerHTML = '';
  for (let d = 1; d <= daysInMonth; d++) {
    const opt = document.createElement('option');
    opt.value = d; opt.textContent = d;
    if (d == currentVal) opt.selected = true;
    daySel.appendChild(opt);
  }
}

function initCitySelector() {
  const sel = document.getElementById('city');
  sel.innerHTML = '';
  for (const [key, city] of Object.entries(CITIES)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = city.name;
    sel.appendChild(opt);
  }
}

function initTimeSelectors() {
  const hourSel = document.getElementById('hour');
  for (let h = 0; h <= 23; h++) {
    const opt = document.createElement('option');
    opt.value = h; opt.textContent = String(h).padStart(2,'0');
    hourSel.appendChild(opt);
  }
  const minuteSel = document.getElementById('minute');
  for (let m = 0; m <= 59; m++) {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = String(m).padStart(2,'0');
    minuteSel.appendChild(opt);
  }
}

function doCalc() {
  try {
  const name = document.getElementById('name').value || '未知';
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const day = parseInt(document.getElementById('day').value);
  const hour = parseInt(document.getElementById('hour').value);
  const minute = parseInt(document.getElementById('minute').value);
  const cityKey = document.getElementById('city').value;
  const useSolarTime = document.getElementById('useSolarTime').checked;

  const result = calcBaZi(year, month, day, hour, minute, gender, cityKey, useSolarTime, name);

  document.getElementById('result').style.display = 'block';
  window.scrollTo({ top: document.getElementById('result').offsetTop - 80, behavior: 'smooth' });

  renderInfoBar(name, result);
  renderPillars(result);
  renderGuKu(result);
  renderWuxing(result.wuxingCount);
  renderStars(result.details);
  renderPattern(result);
  if (result.specialPatterns && result.specialPatterns.length > 0) renderSpecialPatterns(result.specialPatterns);
  renderLiuQin(result.liuQin);
  renderExtraPillars(result.extraPillars);
  renderRenYuan(result.renYuan);
  renderPillarDiagram('pillarDiagram', result);
  renderGuJi(result);
  renderReport(result);
  renderQiMing(result);
  renderDaYun(result.dayun);
  renderLifeKLine(result);
  document.getElementById('compactInfo').style.display = 'grid';

  lastResult = result;
  timeSelectedDay = new Date().getDate();
  document.getElementById('timeNav').style.display = 'flex';
  document.getElementById('timeContentCard').style.display = 'block';
  switchTimeView('nian', result);

  saveHistory(name, result);
  } catch(e) {
    console.error('排盘错误:', e);
    let msg = e.message || '未知错误';
    if (msg.includes('Solar') || msg.includes('Lunar')) msg = 'lunar 库加载失败，部分功能不可用';
    else if (msg.includes('undefined')) msg = '数据初始化异常，请刷新页面';
    showError(msg);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 300); }

  if (typeof Lunar === 'undefined' || typeof Solar === 'undefined') {
    document.body.insertAdjacentHTML('afterbegin',
      '<div style="background:#f8d7da;color:#721c24;text-align:center;padding:12px;font-size:14px;border-bottom:2px solid #f5c6cb"><strong>lunar 库加载失败</strong>，所有功能不可用。<br>请检查网络连接后 <a href="javascript:location.reload()" style="color:#721c24;font-weight:600">刷新页面</a>，或换个浏览器试试。</div>');
  }

  initDateSelectors();
  initCitySelector();
  initTimeSelectors();

  document.querySelectorAll('.tab').forEach(el => {
    el.addEventListener('click', () => BaziRouter.go(el.dataset.tab));
  })
  BaziRouter.init(['bazi','hepan','zeri','celebrities','wuyun','history','settings'])

  document.getElementById('btnCalc').addEventListener('click', doCalc);

  document.getElementById('timeNav').addEventListener('click', function(e) {
    const btn = e.target.closest('.time-btn');
    if (btn && lastResult) switchTimeView(btn.dataset.time, lastResult);
  });

  document.getElementById('darkMode').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode', this.checked);
  });

  const copyBtn = document.getElementById('btnCopyReport');
  if (copyBtn) copyBtn.addEventListener('click', copyReport);

  document.getElementById('btnExport').addEventListener('click', function() {
    window.print();
  });

  const now = new Date();
  document.getElementById('year').value = now.getFullYear();
  document.getElementById('month').value = now.getMonth() + 1;
  updateDays();
  document.getElementById('day').value = now.getDate();
});

function copyReport() {
  const reportEl = document.getElementById('reportContent');
  if (!reportEl || !reportEl.textContent) return;
  navigator.clipboard.writeText(reportEl.textContent).then(() => {
    const btn = document.getElementById('btnCopyReport');
    const orig = btn.textContent;
    btn.textContent = '✓ 已复制';
    setTimeout(() => btn.textContent = orig, 2000);
  }).catch(() => {
    const range = document.createRange();
    range.selectNode(reportEl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
  });
}
