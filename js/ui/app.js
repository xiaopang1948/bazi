/**
 * 八字排盘 — UI 主逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
  // 检查 lunar 库是否加载成功
  if (typeof Lunar === 'undefined' || typeof Solar === 'undefined') {
    document.body.insertAdjacentHTML('afterbegin',
      '<div style="background:#f8d7da;color:#721c24;text-align:center;padding:12px;font-size:14px;border-bottom:2px solid #f5c6cb"><strong>lunar 库加载失败</strong>，所有功能不可用。<br>请检查网络连接后 <a href="javascript:location.reload()" style="color:#721c24;font-weight:600">刷新页面</a>，或换个浏览器试试。</div>');
  }
  // ── 初始化表单 ──
  initDateSelectors();
  initCitySelector();
  initTimeSelectors();

  // ── Tab 切换 ──
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('tab-' + this.dataset.tab).classList.add('active');
    });
  });

  // ── 排盘按钮 ──
  document.getElementById('btnCalc').addEventListener('click', doCalc);

  // ── 暗黑模式 ──
  document.getElementById('darkMode').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode', this.checked);
  });

  // ── 今天日期设为默认 ──
  const now = new Date();
  document.getElementById('year').value = now.getFullYear();
  document.getElementById('month').value = now.getMonth() + 1;
  updateDays();
  document.getElementById('day').value = now.getDate();
});

/** 初始化年份选择器 (1900-当前年) */
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

/** 更新日期天数（根据年月） */
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

/** 初始化城市选择器 */
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

/** 初始化时间选择器 */
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

/** 显示错误提示 */
function showError(msg) {
  const result = document.getElementById('result');
  result.style.display = 'block';
  result.innerHTML = `<div class="card" style="text-align:center;padding:40px;color:#c62828"><p style="font-size:16px;margin-bottom:8px">排盘出错</p><p style="font-size:14px;color:var(--text-light)">${msg}</p><p style="font-size:12px;margin-top:12px;color:var(--text-light)">请确认网络连接正常（需要加载 lunar 库），或刷新页面重试</p></div>`;
}

/** 执行排盘 */
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

  // 显示结果区
  document.getElementById('result').style.display = 'block';
  window.scrollTo({ top: document.getElementById('result').offsetTop - 80, behavior: 'smooth' });

  // 渲染各部分
  renderInfoBar(name, result);
  renderPillars(result);
  renderWuxing(result.wuxingCount);
  renderStars(result.details);
  renderPattern(result);
  if (result.specialPatterns && result.specialPatterns.length > 0) renderSpecialPatterns(result.specialPatterns);
  renderLiuQin(result.liuQin);
  renderDaYun(result.dayun);
  const liuNianDetail = calcLiuNianDetail(result.pillars, result.dayun, result.pillars.day.stem, result.input.year);
  renderLiuNian(liuNianDetail);

  // 保存历史
  saveHistory(name, result);
  } catch(e) {
    console.error('排盘错误:', e);
    let msg = e.message || '未知错误';
    // 针对常见错误给出中文提示
    if (msg.includes('Solar') || msg.includes('Lunar')) msg = 'lunar 库加载失败，部分功能不可用';
    else if (msg.includes('undefined')) msg = '数据初始化异常，请刷新页面';
    showError(msg);
  }
}

/** 渲染信息栏 */
function renderInfoBar(name, result) {
  const r = result;
  let solarInfo = '';
  if (r.solarTime && r.solarTime.adjusted) {
    solarInfo = ` | 真太阳时: ${String(r.solarTime.hour).padStart(2,'0')}:${String(r.solarTime.minute).padStart(2,'0')} (时差 ${r.solarTime.eot > 0 ? '+' : ''}${r.solarTime.eot}分)`;
  }
  const cityName = r.input.cityKey && CITIES[r.input.cityKey] ? CITIES[r.input.cityKey].name : '未知';
  document.getElementById('infoBar').innerHTML = `
    <span><strong>${name}</strong> · ${r.input.gender === 'male' ? '男' : '女'}</span>
    <span>${r.input.year}-${String(r.input.month).padStart(2,'0')}-${String(r.input.day).padStart(2,'0')} ${String(r.input.hour).padStart(2,'0')}:${String(r.input.minute).padStart(2,'0')}</span>
    <span>${cityName}${solarInfo}</span>
  `;
}

/** 渲染四柱排盘表 */
function renderPillars(result) {
  const grid = document.getElementById('pillarsGrid');
  const keys = ['year','month','day','hour'];
  const labels = ['年柱','月柱','日柱','时柱'];

  // 清空，保留表头
  grid.innerHTML = labels.map(l => `<div class="pillar-cell header-cell">${l}</div>`).join('');

  const dataRows = [
    { cls: 'stem', render: d => d.stem },
    { cls: 'branch', render: d => d.branch },
    { cls: 'wuxing', render: d => `<span class="pillar-wuxing wuxing-${d.stemWuxing}">${d.stemWuxing}</span>` },
    { cls: 'shishen', render: d => d.shishen },
    { cls: 'hidden', render: d => d.hiddenStems.join(' ') },
    { cls: 'nayin', render: d => d.nayin },
  ];

  for (const row of dataRows) {
    for (const key of keys) {
      const d = result.details[key];
      const cell = document.createElement('div');
      cell.className = `pillar-cell pillar-${key}`;
      cell.innerHTML = `<div class="pillar-${row.cls}">${row.render(d)}</div>`;
      grid.appendChild(cell);
    }
  }
}

/** 渲染五行统计 */
function renderWuxing(counts) {
  const container = document.getElementById('wuxingBars');
  const colors = { 木:'var(--wood)', 火:'var(--fire)', 土:'var(--earth)', 金:'var(--metal)', 水:'var(--water)' };
  const maxVal = Math.max(...Object.values(counts), 1);

  container.innerHTML = '';
  for (const wx of ['木','火','土','金','水']) {
    const val = counts[wx] || 0;
    const pct = Math.round(val / maxVal * 100);
    container.innerHTML += `
      <div class="wuxing-bar-row">
        <div class="wuxing-bar-label">${wx}</div>
        <div class="wuxing-bar-track">
          <div class="wuxing-bar-fill" style="width:${pct}%;background:${colors[wx]}"></div>
        </div>
        <div class="wuxing-bar-count">${val}</div>
      </div>
    `;
  }
}

/** 渲染神煞 */
function renderStars(details) {
  const container = document.getElementById('starsList');
  const allStars = new Map();
  for (const key of ['year','month','day','hour']) {
    for (const star of details[key].stars) {
      if (!allStars.has(star.name)) {
        allStars.set(star.name, star);
      }
    }
  }
  if (allStars.size === 0) {
    container.innerHTML = '<span style="color:var(--text-light)">无特殊神煞</span>';
    return;
  }
  container.innerHTML = '';
  for (const [name, star] of allStars) {
    const tag = document.createElement('span');
    tag.className = `star-tag ${star.type}`;
    tag.textContent = name;
    container.appendChild(tag);
  }
}

/** 渲染格局分析（含调候用神） */
function renderPattern(result) {
  const p = result.pattern;
  const t = result.tiaoHou;
  let html = `
    <div class="pattern-row"><span>日主五行</span><strong>${p.dayStemWuxing}</strong></div>
    <div class="pattern-row"><span>月令状态</span><strong>${p.monthPower}</strong></div>
    <div class="pattern-row"><span>综合判断</span><strong>${p.isStrong}</strong></div>
    <div class="pattern-row"><span>用神（平衡）</span><strong style="color:var(--good-star)">${p.yongShen}</strong></div>
    <div class="pattern-row"><span>忌神（平衡）</span><strong style="color:#888">${p.jiShen}</strong></div>
  `;
  if (t) {
    html += `
      <div class="pattern-row" style="background:rgba(184,134,11,0.06);margin-top:6px;padding:6px 0;border-radius:4px">
        <span>调候用神</span>
        <strong style="color:var(--primary)">${t.yong}</strong>
      </div>
      <div class="pattern-row" style="border:none;font-size:12px;color:var(--text-light)">
        <span>${t.desc}</span>
      </div>
    `;
  }
  document.getElementById('patternContent').innerHTML = html;
}

/** 渲染特殊格局 */
function renderSpecialPatterns(specials) {
  const card = document.getElementById('specialPatternCard');
  const container = document.getElementById('specialPatternContent');
  card.style.display = 'block';
  container.innerHTML = specials.map(s =>
    `<div class="pattern-row"><span>${s.name}</span><strong style="color:var(--primary)">${s.desc}</strong></div>`
  ).join('');
}

/** 渲染六亲排盘 */
function renderLiuQin(liuQin) {
  const card = document.getElementById('liuQinCard');
  const container = document.getElementById('liuQinContent');
  card.style.display = 'block';
  const labels = { year: '祖上/父母宫', month: '父母/兄弟宫', day: '自身/配偶宫', hour: '子女宫' };
  container.innerHTML = Object.entries(liuQin).map(([key, val]) =>
    `<div class="pattern-row"><span>${val.label}</span><strong>${val.pillar}</strong></div>`
  ).join('');
}

/** 渲染大运 */
function renderDaYun(dayun) {
  const container = document.getElementById('dayunList');
  container.innerHTML = `<div class="dayun-item" style="border-left-color:#666;background:rgba(100,100,100,0.05)">
    <span class="dayun-age">起运 ${dayun.startAge}岁</span>
    <span class="dayun-ganzhi">${dayun.direction}</span>
  </div>`;
  for (const p of dayun.periods) {
    container.innerHTML += `
      <div class="dayun-item">
        <span class="dayun-age">${p.ageRange}岁</span>
        <span class="dayun-ganzhi">${p.ganzhi}</span>
        <span class="dayun-shishen">${p.shishen}</span>
      </div>
    `;
  }
}

/** 渲染流年详批 */
function renderLiuNian(detail) {
  const container = document.getElementById('currentYearContent');
  if (!detail || !detail.analysis) { container.innerHTML = '<p>无法计算</p>'; return; }

  let html = `<p style="font-size:16px;font-weight:600;margin-bottom:8px">${detail.year} 年（${detail.liuNianGan}${detail.liuNianZhi}）</p>`;
  html += `<p style="font-size:14px;margin-bottom:10px;color:var(--text-light)">${detail.summary}</p>`;

  html += `<table style="width:100%;border-collapse:collapse;font-size:13px">`;
  html += `<tr style="background:var(--border);font-weight:600">
    <td style="padding:4px 6px;width:90px">项目</td>
    <td style="padding:4px 6px">详情</td>
    <td style="padding:4px 6px;width:50px;text-align:center">吉凶</td>
  </tr>`;
  for (const a of detail.analysis) {
    const color = a.effect === '吉' ? '#2e7d32' : a.effect === '凶' ? '#c62828' : '#888';
    html += `<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:4px 6px;font-weight:600">${a.item}</td>
      <td style="padding:4px 6px;color:var(--text-light)">${a.detail}</td>
      <td style="padding:4px 6px;text-align:center;color:${color}">${a.effect || '-'}</td>
    </tr>`;
  }
  html += `</table>`;
  container.innerHTML = html;
}

/** 保存排盘历史 */
function saveHistory(name, result) {
  let history = JSON.parse(localStorage.getItem('bazi_history') || '[]');
  history.unshift({
    name,
    gender: result.input.gender,
    date: `${result.input.year}-${result.input.month}-${result.input.day}`,
    time: `${String(result.input.hour).padStart(2,'0')}:${String(result.input.minute).padStart(2,'0')}`,
    pillars: `${result.pillars.year.stem}${result.pillars.year.branch} ${result.pillars.month.stem}${result.pillars.month.branch} ${result.pillars.day.stem}${result.pillars.day.branch} ${result.pillars.hour.stem}${result.pillars.hour.branch}`,
    timestamp: Date.now(),
  });
  // 只保留最近 20 条
  if (history.length > 20) history = history.slice(0, 20);
  localStorage.setItem('bazi_history', JSON.stringify(history));
  renderHistory();
}

/** 渲染历史记录列表 */
function renderHistory() {
  const history = JSON.parse(localStorage.getItem('bazi_history') || '[]');
  const container = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');
  if (history.length === 0) {
    empty.style.display = 'block';
    container.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  container.innerHTML = history.map((h, i) => `
    <div class="dayun-item" style="cursor:pointer;border-left-color:var(--primary-light)" onclick="loadHistory(${i})">
      <span class="dayun-age">${h.name || '未知'}</span>
      <span class="dayun-ganzhi" style="font-size:14px">${h.pillars}</span>
      <span class="dayun-shishen">${h.date} ${h.time}</span>
    </div>
  `).join('');
}

/** 加载历史记录 */
function loadHistory(index) {
  const history = JSON.parse(localStorage.getItem('bazi_history') || '[]');
  const h = history[index];
  if (!h) return;

  const [y, m, d] = h.date.split('-').map(Number);
  const [hh, mi] = h.time.split(':').map(Number);
  document.getElementById('year').value = y;
  document.getElementById('month').value = m;
  updateDays();
  document.getElementById('day').value = d;
  document.getElementById('hour').value = hh;
  document.getElementById('minute').value = mi;
  if (h.gender === 'male') document.querySelector('input[name="gender"][value="male"]').checked = true;
  else document.querySelector('input[name="gender"][value="female"]').checked = true;

  // 切换到排盘 tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab[data-tab="bazi"]').classList.add('active');
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-bazi').classList.add('active');

  doCalc();
}

// ── 合盘初始化 ──
function initHepanSelectors() {
  ['hp1','hp2'].forEach(prefix => {
    const yearSel = document.getElementById(prefix + 'Year');
    const thisYear = new Date().getFullYear();
    for (let y = 1900; y <= thisYear; y++) {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      yearSel.appendChild(opt);
    }
    const monthSel = document.getElementById(prefix + 'Month');
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement('option');
      opt.value = m; opt.textContent = m;
      monthSel.appendChild(opt);
    }
    // 日期随年月联动
    const daySel = document.getElementById(prefix + 'Day');
    function updateHpDays() {
      const y = parseInt(yearSel.value);
      const m = parseInt(monthSel.value);
      const days = new Date(y, m, 0).getDate();
      daySel.innerHTML = '';
      for (let d = 1; d <= days; d++) {
        const opt = document.createElement('option');
        opt.value = d; opt.textContent = d;
        daySel.appendChild(opt);
      }
    }
    yearSel.addEventListener('change', updateHpDays);
    monthSel.addEventListener('change', updateHpDays);
    updateHpDays();

    // 小时
    const hourSel = document.getElementById(prefix + 'Hour');
    for (let h = 0; h <= 23; h++) {
      const opt = document.createElement('option');
      opt.value = h; opt.textContent = String(h).padStart(2,'0');
      hourSel.appendChild(opt);
    }
    // 分钟
    const minSel = document.getElementById(prefix + 'Minute');
    for (let m = 0; m <= 59; m++) {
      const opt = document.createElement('option');
      opt.value = m; opt.textContent = String(m).padStart(2,'0');
      minSel.appendChild(opt);
    }
    // 城市
    const citySel = document.getElementById(prefix + 'City');
    for (const [key, city] of Object.entries(CITIES)) {
      const opt = document.createElement('option');
      opt.value = key; opt.textContent = city.name;
      citySel.appendChild(opt);
    }
  });

  // 默认值设为今天
  const now = new Date();
  document.getElementById('hp1Year').value = now.getFullYear();
  document.getElementById('hp1Month').value = now.getMonth() + 1;
  document.getElementById('hp2Year').value = now.getFullYear();
  document.getElementById('hp2Month').value = now.getMonth() + 1;
  // 触发天数更新
  ['hp1','hp2'].forEach(p => {
    document.getElementById(p + 'Day').value = now.getDate();
  });
}

document.getElementById('btnHarmony').addEventListener('click', doHarmony);
initHepanSelectors();

/** 执行合盘 */
function doHarmony() {
  // 读取双方信息
  const hp1 = readHpInput('hp1');
  const hp2 = readHpInput('hp2');

  // 分别排盘
  const r1 = calcBaZi(hp1.year, hp1.month, hp1.day, hp1.hour, hp1.minute, hp1.gender, hp1.city, document.getElementById('hpUseSolar').checked, hp1.name);
  const r2 = calcBaZi(hp2.year, hp2.month, hp2.day, hp2.hour, hp2.minute, hp2.gender, hp2.city, document.getElementById('hpUseSolar').checked, hp2.name);

  // 合盘计算
  const harmony = calcHarmony(r1, r2);

  // 显示结果
  document.getElementById('harmonyResult').style.display = 'block';

  // 渲染评分
  const scoreDisplay = document.getElementById('harmonyScoreDisplay');
  const scoreColor = harmony.score >= 85 ? '#2e7d32' : harmony.score >= 70 ? '#f9a825' : harmony.score >= 55 ? '#e65100' : '#c62828';
  scoreDisplay.innerHTML = `
    <div style="font-size:48px;font-weight:700;color:${scoreColor}">${harmony.score}</div>
    <div style="font-size:20px;font-weight:600;color:${scoreColor};margin:4px 0">${harmony.level}</div>
    <div style="font-size:14px;color:var(--text-light);margin:8px 0">${harmony.summary}</div>
    <div style="display:flex;justify-content:space-around;margin-top:12px;font-size:13px;color:var(--text-light)">
      <span><strong>${harmony.profile1.name}</strong> ${harmony.profile1.ganzhi}</span>
      <span><strong>${harmony.profile2.name}</strong> ${harmony.profile2.ganzhi}</span>
    </div>
  `;

  // 渲染详细分析
  const detailsDiv = document.getElementById('harmonyDetails');
  let html = `<table style="width:100%;border-collapse:collapse;font-size:14px">`;
  html += `<tr style="background:var(--border);font-weight:600">
    <td style="padding:6px 8px;width:100px">项目</td>
    <td style="padding:6px 8px">详情</td>
    <td style="padding:6px 8px;width:60px;text-align:center">吉凶</td>
  </tr>`;
  for (const d of harmony.details) {
    const color = d.effect === '吉' ? '#2e7d32' : d.effect === '凶' ? '#c62828' : '#888';
    html += `<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:6px 8px;font-weight:600">${d.item}</td>
      <td style="padding:6px 8px;color:var(--text-light)">${d.detail}</td>
      <td style="padding:6px 8px;text-align:center;color:${color};font-weight:600">${d.effect}</td>
    </tr>`;
  }
  html += `</table>`;
  detailsDiv.innerHTML = html;

  window.scrollTo({ top: document.getElementById('harmonyScoreCard').offsetTop - 80, behavior: 'smooth' });
}

/** 读取合盘输入 */
function readHpInput(prefix) {
  const name = document.getElementById(prefix + 'Name').value || (prefix === 'hp1' ? '甲方' : '乙方');
  const gender = document.querySelector(`input[name="${prefix}Gender"]:checked`).value;
  const year = parseInt(document.getElementById(prefix + 'Year').value);
  const month = parseInt(document.getElementById(prefix + 'Month').value);
  const day = parseInt(document.getElementById(prefix + 'Day').value);
  const hour = parseInt(document.getElementById(prefix + 'Hour').value);
  const minute = parseInt(document.getElementById(prefix + 'Minute').value);
  const city = document.getElementById(prefix + 'City').value;
  return { name, gender, year, month, day, hour, minute, city };
}

// ── 择日黄历初始化 ──
function initZeriSelectors() {
  const yearSel = document.getElementById('zeriYear');
  const monthSel = document.getElementById('zeriMonth');
  const thisYear = new Date().getFullYear();
  for (let y = thisYear - 3; y <= thisYear + 3; y++) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    if (y === thisYear) opt.selected = true;
    yearSel.appendChild(opt);
  }
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m;
    if (m === new Date().getMonth() + 1) opt.selected = true;
    monthSel.appendChild(opt);
  }
  function updateZeriDays() {
    const y = parseInt(yearSel.value);
    const m = parseInt(monthSel.value);
    const daysInMonth = new Date(y, m, 0).getDate();
    const daySel = document.getElementById('zeriDay');
    const curVal = daySel.value;
    daySel.innerHTML = '';
    for (let d = 1; d <= daysInMonth; d++) {
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      if (d == curVal) opt.selected = true;
      daySel.appendChild(opt);
    }
  }
  yearSel.addEventListener('change', updateZeriDays);
  monthSel.addEventListener('change', updateZeriDays);
  updateZeriDays();
  document.getElementById('zeriDay').value = new Date().getDate();
}
initZeriSelectors();
document.getElementById('btnZeri').addEventListener('click', doZeri);
doZeri(); // 展示今天黄历

function doZeri() {
  try {
  const y = parseInt(document.getElementById('zeriYear').value);
  const m = parseInt(document.getElementById('zeriMonth').value);
  const d = parseInt(document.getElementById('zeriDay').value);
  document.getElementById('zeriResult').style.display = 'block';

  // 单日黄历
  try {
    const lunar = Lunar.fromYmd(y, m, d);
    const yi = lunar.getDayYi();
    const ji = lunar.getDayJi();
    const chong = lunar.getDayChong();
    const wuXing = lunar.getDayNaYin() || '';

    let html = `<p><strong>${y}年${m}月${d}日</strong></p>`;
    html += `<p>农历：${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}</p>`;
    html += `<p>干支：${lunar.getYearInGanZhi()} ${lunar.getMonthInGanZhi()} ${lunar.getDayInGanZhi()}</p>`;
    if (wuXing) html += `<p>纳音：${wuXing}</p>`;
    if (chong) html += `<p>冲煞：冲${chong}</p>`;

    const yiArr = yi ? (typeof yi === 'string' ? yi.split(' ') : yi) : [];
    const jiArr = ji ? (typeof ji === 'string' ? ji.split(' ') : ji) : [];
    if (yiArr.length > 0) {
      html += `<p style="margin-top:8px"><strong style="color:#2e7d32">宜：</strong>${yiArr.join('、')}</p>`;
    }
    if (jiArr.length > 0) {
      html += `<p><strong style="color:#c62828">忌：</strong>${jiArr.join('、')}</p>`;
    }
    document.getElementById('zeriContent').innerHTML = html;
  } catch(e) {
    document.getElementById('zeriContent').innerHTML = `<p>无法获取该日黄历</p>`;
  }

  // 本月日历
  renderMonthCalendar(y, m);
  } catch(e) {
    document.getElementById('zeriContent').innerHTML = '<p>黄历加载失败，请检查网络</p>';
  }
}

function renderMonthCalendar(year, month) {
  const container = document.getElementById('zeriMonthView');
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const weekHeaders = ['日','一','二','三','四','五','六'];
  let html = weekHeaders.map(w => `<div style="text-align:center;font-weight:600;padding:4px;background:var(--border);border-radius:2px">${w}</div>`).join('');

  // 空白
  for (let i = 0; i < firstDay; i++) {
    html += `<div style="padding:4px"></div>`;
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = (year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate());
    try {
      const lunar = Lunar.fromYmd(year, month, day);
      const yi = lunar.getDayYi();
      const yiArr = yi ? (typeof yi === 'string' ? yi.split(' ') : yi) : [];
      // 吉日标记：宜≥3条
      const isGood = yiArr.length >= 3;
      html += `<div style="padding:6px 2px;text-align:center;border-radius:4px;background:${isToday ? 'var(--primary)' : isGood ? '#e8f5e9' : '#fff'};color:${isToday ? '#fff' : 'var(--text)'};border:1px solid ${isGood ? '#a5d6a7' : 'transparent'};cursor:pointer" onclick="document.getElementById('zeriDay').value=${day};doZeri()">
        <div style="font-weight:${isToday ? 700 : 400}">${day}</div>
        <div style="font-size:10px;color:${isToday ? 'rgba(255,255,255,0.8)' : isGood ? '#2e7d32' : '#aaa'}">${lunar.getDayInChinese()}</div>
      </div>`;
    } catch(e) {
      html += `<div style="padding:6px;text-align:center"><div>${day}</div></div>`;
    }
  }
  container.innerHTML = html;
}

// 初始化历史列表
renderHistory();
