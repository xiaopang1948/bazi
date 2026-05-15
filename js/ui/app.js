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

  // ── 时间轴切换 ──
  document.getElementById('timeNav').addEventListener('click', function(e) {
    const btn = e.target.closest('.time-btn');
    if (btn && lastResult) switchTimeView(btn.dataset.time, lastResult);
  });

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

// 全局状态：最近排盘结果 + 时间轴选中维度和日期
let lastResult = null;
let timeSelectedDay = new Date().getDate();

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
  renderExtraPillars(result.extraPillars);
  renderRenYuan(result.renYuan);
  renderPillarDiagram('pillarDiagram', result);
  renderGuJi(result);
  renderReport(result);
  renderQiMing(result);
  renderDaYun(result.dayun);

  // 时间轴：默认显示流年
  lastResult = result;
  timeSelectedDay = new Date().getDate();
  document.getElementById('timeNav').style.display = 'flex';
  document.getElementById('timeContentCard').style.display = 'block';
  switchTimeView('nian', result);

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
    { cls: 'chs', render: d => d.changSheng },
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

// ── 新增渲染函数 ──

/** 渲染胎元/命宫/身宫 */
function renderExtraPillars(extra) {
  const card = document.getElementById('extraPillarsCard');
  const container = document.getElementById('extraPillarsContent');
  if (!extra || !card) return;
  card.style.display = 'block';
  container.innerHTML = `
    <div class="pattern-row"><span>胎元</span><strong>${extra.taiYuan.ganzhi}</strong></div>
    <div class="pattern-row"><span>命宫</span><strong>${extra.mingGong.ganzhi}</strong></div>
    <div class="pattern-row"><span>身宫</span><strong>${extra.shenGong.ganzhi}</strong></div>
  `;
}

/** 渲染人元司令 */
function renderRenYuan(renYuan) {
  const card = document.getElementById('renYuanCard');
  const container = document.getElementById('renYuanContent');
  if (!renYuan || Object.keys(renYuan).length === 0 || !card) return;
  card.style.display = 'block';
  container.innerHTML = Object.entries(renYuan)
    .map(([stem, days]) => {
      const wx = getStemWuxing(stem);
      return `<div class="pattern-row"><span><span class="pillar-wuxing wuxing-${wx}" style="font-size:11px;padding:0 6px;display:inline-block;color:#fff;border-radius:3px">${stem}</span> 主事 ${days} 日</span><strong style="color:var(--text-light)">${wx}</strong></div>`;
    })
    .join('');
}

/** 渲染起名推荐 */
function renderQiMing(result) {
  const card = document.getElementById('qiMingCard');
  const container = document.getElementById('qiMingContent');
  if (!card) return;
  const p = result.pattern;
  if (!p || !p.yongShen) return;
  card.style.display = 'block';
  const suggestions = calcNameSuggestions(p.dayStemWuxing, p.yongShen, 8);
  let html = `<p style="font-size:13px;margin-bottom:8px;color:var(--text-light)">根据八字，宜补五行【${p.yongShen}】，以下推荐名字供参考：</p>`;
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
  for (const s of suggestions) {
    html += `<div style="padding:8px 14px;background:rgba(184,134,11,0.06);border:1px solid var(--border);border-radius:6px;text-align:center">
      <div style="font-size:18px;font-weight:700;color:var(--primary)">${s.name}</div>
      <div style="font-size:11px;color:var(--text-light);margin-top:2px">${s.reason}</div>
    </div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

/** 时间轴切换 */
function switchTimeView(view, result) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.toggle('active', b.dataset.time === view));
  renderTimeContent(view, result);
}

/** 渲染时间内容（流年/流月/流日/流时） */
function renderTimeContent(view, result) {
  const container = document.getElementById('timeContent');
  if (!container || !result) return;
  const dayStem = result.pillars.day.stem;
  const now = new Date();

  switch (view) {
    case 'nian': {
      const detail = calcLiuNianDetail(result.pillars, result.dayun, dayStem, result.input.year);
      let html = `<p style="font-size:15px;font-weight:700;margin-bottom:6px">${detail.year} 年（${detail.liuNianGan}${detail.liuNianZhi}）</p>`;
      html += `<p style="font-size:13px;margin-bottom:10px;color:var(--text-light)">${detail.summary}</p>`;
      html += '<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:var(--border);font-weight:600"><td style="padding:4px 6px;width:90px">项目</td><td style="padding:4px 6px">详情</td><td style="padding:4px 6px;width:50px;text-align:center">吉凶</td></tr>';
      for (const a of detail.analysis) {
        const color = a.effect === '吉' ? '#2e7d32' : a.effect === '凶' ? '#c62828' : '#888';
        html += `<tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 6px;font-weight:600">${a.item}</td><td style="padding:4px 6px;color:var(--text-light)">${a.detail}</td><td style="padding:4px 6px;text-align:center;color:${color};font-weight:600">${a.effect || '-'}</td></tr>`;
      }
      html += '</table>';
      container.innerHTML = html;
      break;
    }
    case 'yue': {
      if (!result.liuYue) break;
      const currentMonth = now.getMonth() + 1;
      let html = '<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:var(--border);font-weight:600"><td style="padding:4px 6px">月</td><td style="padding:4px 6px">干支</td><td style="padding:4px 6px">十神</td><td style="padding:4px 6px">冲合</td></tr>';
      for (const m of result.liuYue) {
        const isCurrent = m.month === currentMonth;
        const chongHe = calcChongXingHe('', m.branch, result.pillars).map(i => i.detail).join('、') || '-';
        html += `<tr style="border-bottom:1px solid var(--border);${isCurrent ? 'background:rgba(184,134,11,0.08)' : ''}">
          <td style="padding:4px 6px;font-weight:600">${m.month}月</td>
          <td style="padding:4px 6px">${m.ganzhi}</td>
          <td style="padding:4px 6px;color:var(--text-light)">${m.shishen}</td>
          <td style="padding:4px 6px;font-size:11px;color:var(--text-light)">${chongHe}</td>
        </tr>`;
      }
      html += '</table>';
      container.innerHTML = html;
      break;
    }
    case 'ri': {
      if (!result.liuRi) break;
      const currentDay = now.getDate();
      let html = '<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:var(--border);font-weight:600"><td style="padding:3px 4px">日</td><td style="padding:3px 4px">干支</td><td style="padding:3px 4px">十神</td><td style="padding:3px 4px">冲合</td></tr>';
      for (const d of result.liuRi) {
        const isToday = d.day === currentDay;
        const chongHe = calcChongXingHe('', d.branch, result.pillars).map(i => i.detail).join('、') || '-';
        html += `<tr style="border-bottom:1px solid var(--border);${isToday ? 'background:rgba(184,134,11,0.08)' : ''}" data-day="${d.day}" style="cursor:pointer">
          <td style="padding:3px 4px;font-weight:600">${d.day}日</td>
          <td style="padding:3px 4px">${d.ganzhi}</td>
          <td style="padding:3px 4px;color:var(--text-light)">${d.shishen}</td>
          <td style="padding:3px 4px;font-size:11px;color:var(--text-light)">${chongHe}</td>
        </tr>`;
      }
      html += '</table>';
      container.innerHTML = html;
      container.addEventListener('click', function(ev) {
        const tr = ev.target.closest('tr[data-day]');
        if (tr) {
          timeSelectedDay = parseInt(tr.dataset.day);
          // 如果当前在流日视图，切换到流时并带上选中日期
          document.querySelector('.time-btn[data-time="shi"]').click();
        }
      });
      break;
    }
    case 'shi': {
      // 用 timeSelectedDay + 当前年月重新算流时
      const sy = result.input.year, sm = result.input.month;
      const hours = calcLiuShi(dayStem, sy, sm, timeSelectedDay);
      const currentHour = now.getHours();
      let html = `<p style="font-size:12px;color:var(--text-light);margin-bottom:6px">${sy}年${sm}月${timeSelectedDay}日 · 十二时辰</p>`;
      html += '<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:var(--border);font-weight:600"><td style="padding:3px 4px">时辰</td><td style="padding:3px 4px">时间</td><td style="padding:3px 4px">干支</td><td style="padding:3px 4px">十神</td><td style="padding:3px 4px">冲合</td></tr>';
      for (const h of hours) {
        const isNow = currentHour >= parseInt(h.timeRange.split(':')[0]) && currentHour < parseInt(h.timeRange.split(':')[0].split('-')[1] || h.timeRange.split(':')[0]) + 2;
        const chongHe = calcChongXingHe(h.stem, h.branch, result.pillars).map(i => i.detail).join('、') || '-';
        html += `<tr style="border-bottom:1px solid var(--border);${isNow ? 'background:rgba(184,134,11,0.08)' : ''}">
          <td style="padding:3px 4px;font-weight:600">${h.label}时</td>
          <td style="padding:3px 4px;font-size:10px;color:var(--text-light)">${h.timeRange}</td>
          <td style="padding:3px 4px">${h.ganzhi}</td>
          <td style="padding:3px 4px;color:var(--text-light)">${h.shishen}</td>
          <td style="padding:3px 4px;font-size:10px;color:var(--text-light)">${chongHe}</td>
        </tr>`;
      }
      html += '</table>';
      container.innerHTML = html;
      break;
    }
  }
}

/** 渲染古籍匹配 */
function renderGuJi(result) {
  const card = document.getElementById('guJiCard');
  const container = document.getElementById('guJiContent');
  if (!card) return;
  const matches = calcGuJiMatches(result);
  if (matches.length === 0) return;
  card.style.display = 'block';
  container.innerHTML = matches.map(m =>
    `<div class="gu-ji-item"><span class="gu-ji-source">${m.source} · ${m.title}</span><p class="gu-ji-text">${m.content}</p></div>`
  ).join('');
}



// ── 名人库初始化 ──
function initCelebrities() {
  renderCelebrities(CELEBRITIES);
}
function renderCelebrities(list) {
  const container = document.getElementById('celebrityList');
  if (!container) return;
  if (list.length === 0) { container.innerHTML = '<div class="placeholder"><p>未找到匹配的名人</p></div>'; return; }
  container.innerHTML = list.map((c, i) => {
    const birth = c.birth.replace(' ', ' ');
    return `<div class="dayun-item" style="cursor:pointer;border-left-color:var(--primary-light)" onclick="loadCelebrity(${i})">
      <span class="dayun-age"><strong>${c.name}</strong></span>
      <span class="dayun-ganzhi" style="font-size:13px">${birth}</span>
      <span class="dayun-shishen">${(c.tags || []).join(' · ')}</span>
    </div>`;
  }).join('');
}
function filterCelebrities() {
  const query = (document.getElementById('celebritySearch')?.value || '').trim();
  const tag = document.getElementById('celebrityTag')?.value || '';
  let list = CELEBRITIES;
  if (query) list = list.filter(c => c.name.includes(query));
  if (tag) list = list.filter(c => c.tags.includes(tag));
  renderCelebrities(list);
}
function loadCelebrity(index) {
  const c = CELEBRITIES[index];
  if (!c) return;
  // 切换到排盘 tab 并填入数据
  const parsed = parseCelebrityBirth(c);
  if (parsed.year < 1900 || parsed.year > 2100) {
    alert('该名人生辰不在排盘范围内（1900-当前年）');
    return;
  }
  document.getElementById('name').value = c.name;
  document.getElementById('year').value = parsed.year;
  document.getElementById('month').value = parsed.month;
  updateDays();
  document.getElementById('day').value = parsed.day;
  document.getElementById('hour').value = parsed.hour;
  document.getElementById('minute').value = parsed.minute;
  document.querySelector('input[name="gender"][value="' + c.gender + '"]').checked = true;

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab[data-tab="bazi"]').classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-bazi').classList.add('active');

  doCalc();
}
initCelebrities();

// ── 五运六气初始化 ──
function initWuYun() {
  const yearSel = document.getElementById('wuyunYear');
  if (!yearSel) return;
  const thisYear = new Date().getFullYear();
  for (let y = thisYear - 10; y <= thisYear + 10; y++) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    if (y === thisYear) opt.selected = true;
    yearSel.appendChild(opt);
  }
}
initWuYun();
document.getElementById('btnWuYun')?.addEventListener('click', doWuYun);

function doWuYun() {
  const year = parseInt(document.getElementById('wuyunYear').value);
  const result = calcWuYunLiuQi(year);
  document.getElementById('wuyunResult').style.display = 'block';

  // 概览
  document.getElementById('wuyunOverview').innerHTML = `
    <div class="pattern-row"><span>年份</span><strong>${year}年（${result.yearGanZhi}）</strong></div>
    <div class="pattern-row"><span>岁运</span><strong style="color:var(--primary)">${result.suiYun}</strong></div>
    <div class="pattern-row"><span>司天</span><strong>${result.siTian}</strong></div>
    <div class="pattern-row"><span>在泉</span><strong>${result.zaiQuan}</strong></div>
  `;

  // 客运
  document.getElementById('wuyunKeYun').innerHTML =
    '<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:var(--border);font-weight:600"><td style="padding:4px 6px">运</td><td style="padding:4px 6px">五行</td></tr>' +
    result.keYun.map(k => `<tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 6px">${k.name}</td><td style="padding:4px 6px"><span class="pillar-wuxing wuxing-${k.wx}" style="color:#fff;padding:0 8px;border-radius:3px;font-size:11px">${k.wx}</span></td></tr>`).join('') +
    '</table>';

  // 客气
  document.getElementById('wuyunKeQi').innerHTML =
    '<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:var(--border);font-weight:600"><td style="padding:4px 6px">气</td><td style="padding:4px 6px">名称</td></tr>' +
    result.keQi.map((k, i) => `<tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 6px">${['初气','二气','三气','四气','五气','终气'][i]}</td><td style="padding:4px 6px">${k.name}</td></tr>`).join('') +
    '</table>';

  // 客主加临
  document.getElementById('wuyunJiaLin').innerHTML =
    '<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:var(--border);font-weight:600"><td style="padding:4px 6px">气</td><td style="padding:4px 6px">主气</td><td style="padding:4px 6px">客气</td><td style="padding:4px 6px">生克</td></tr>' +
    result.jiaLin.map((j, i) => {
      const shengKe = j.zhuWx && j.keWx ? (j.zhuWx === j.keWx ? '同气' : ({ '木':'火','火':'土','土':'金','金':'水','水':'木' })[j.keWx] === j.zhuWx ? '客生主（顺）' : ({ '木':'土','火':'金','土':'水','金':'木','水':'火' })[j.keWx] === j.zhuWx ? '客克主（逆）' : '平和') : '';
      const color = shengKe.includes('顺') ? '#2e7d32' : shengKe.includes('逆') ? '#c62828' : '#888';
      return `<tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 6px">${['初气','二气','三气','四气','五气','终气'][i]}</td><td style="padding:4px 6px">${j.zhu}</td><td style="padding:4px 6px">${j.ke}</td><td style="padding:4px 6px;color:${color}">${shengKe}</td></tr>`;
    }).join('') +
    '</table>';

  window.scrollTo({ top: document.getElementById('wuyunResult').offsetTop - 80, behavior: 'smooth' });
}

// 初始化历史列表
renderHistory();
