let lastResult = null;
let timeSelectedDay = new Date().getDate();

const WX_CLASS = { '木':'mu','火':'huo','土':'tu','金':'jin','水':'shui' };
function wxSpan(wx, text) { return `<span class="wx-${WX_CLASS[wx] || ''}">${text}</span>`; }

function getGender() {
  return document.querySelector('#genderGroup .pill.active').dataset.value
}
function setGender(val) {
  document.querySelectorAll('#genderGroup .pill').forEach(b => b.classList.toggle('active', b.dataset.value === val))
}
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
  const provinces = Object.keys(PROVINCE_CITIES);
  const provSel = document.getElementById('province');
  provSel.innerHTML = provinces.map(p => `<option value="${p}">${p}</option>`).join('');

  function updateCities() {
    const selProv = provSel.value;
    const cityKeys = PROVINCE_CITIES[selProv] || [];
    const citySel = document.getElementById('city');
    citySel.innerHTML = cityKeys.map(k => `<option value="${k}">${CITIES[k].name}</option>`).join('');
  }

  provSel.addEventListener('change', updateCities);
  updateCities();
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
  const gender = getGender();
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const day = parseInt(document.getElementById('day').value);
  const hour = parseInt(document.getElementById('hour').value);
  const minute = parseInt(document.getElementById('minute').value);
  const cityKey = document.getElementById('city').value;
  const useSolarTime = document.getElementById('useSolarTime').checked;

  const result = calcBaZi(year, month, day, hour, minute, gender, cityKey, useSolarTime, name);

  document.getElementById('inputView').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  window.scrollTo({ top: document.getElementById('result').offsetTop - 80, behavior: 'smooth' });

  renderInfoBar(name, result);
  renderMainTable(result);
  renderWuxing(result.wuxingCount);
  renderWuxingText(result);
  renderPattern(result);
  renderSpecialPatterns(result.specialPatterns);
  renderGuJi(result);
  renderGuKu(result);
  renderQiYun(result);
  renderTimePanel(result);
  renderReport(result);
  renderLifeKLine(result);

  lastResult = result;
  timeSelectedDay = new Date().getDate();
  saveHistory(name, result);
  } catch(e) {
    console.error('排盘错误:', e);
    let msg = e.message || '未知错误';
    if (msg.includes('Solar') || msg.includes('Lunar')) msg = 'lunar 库加载失败，部分功能不可用';
    else if (msg.includes('undefined')) msg = '数据初始化异常，请刷新页面';
    showError(msg);
  }
}

function backToInput() {
  document.getElementById('result').style.display = 'none';
  document.getElementById('inputView').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  document.getElementById('btnBack').addEventListener('click', backToInput);

  document.querySelectorAll('.pill-group').forEach(group => {
    group.addEventListener('click', function(e) {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      this.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    })
  })

  document.getElementById('darkMode').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode', this.checked);
  });

  const copyBtn = document.getElementById('btnCopyReport');
  if (copyBtn) copyBtn.addEventListener('click', copyReport);

  document.getElementById('btnExport').addEventListener('click', function() {
    window.print();
  });

  document.getElementById('btnToday').addEventListener('click', function() {
    if (!lastResult) return
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate()
    const h = now.getHours(), min = now.getMinutes()
    const name = document.getElementById('name').value
    const gender = getGender()
    const useSolarTime = document.getElementById('useSolarTime').checked
    const citySelect = document.getElementById('city')
    const cityKey = citySelect.value || 'beijing'
    const result = calcBaZi(y, m, d, h, min, gender, cityKey, useSolarTime, name)
    lastResult = result
    renderMainTable(result)
    renderQiYun(result)
    renderTimePanel(result)
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
