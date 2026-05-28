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

const SHENG_XIAO = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const TWELVE_GOD_GOOD = ['青龙','明堂','金匮','天德','玉堂','司命'];
const TWELVE_GOD_BAD = ['天刑','朱雀','白虎','天牢','玄武','勾陈'];

function toList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return String(val).split(/[\s,，、]+/).filter(Boolean);
}

function safeGet(fn, fallback = '') { try { const v = fn(); return v != null ? v : fallback; } catch (e) { return fallback; } }

function zeriHtml(lunar, y, m, d) {
  const yi = toList(safeGet(() => lunar.getDayYi()));
  const ji = toList(safeGet(() => lunar.getDayJi()));
  const chong = safeGet(() => lunar.getDayChong());
  const wuXing = safeGet(() => lunar.getDayNaYin());
  const jianChu = safeGet(() => lunar.getDayJianChu());
  const xiu = safeGet(() => lunar.getDayXiu());
  const poZu = safeGet(() => lunar.getDayPengZu());

  const yearGz = lunar.getYearInGanZhi();
  const monthGz = lunar.getMonthInGanZhi();
  const dayGz = lunar.getDayInGanZhi();

  const yearName = lunar.getYearInChinese();
  const monthName = lunar.getMonthInChinese();
  const dayName = lunar.getDayInChinese() + '日';

  const shengXiao = yearGz ? SHENG_XIAO[['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(yearGz[1])] || '' : '';

const twelveGod = safeGet(() => lunar.getDayTwelveDayGod());
const isGoodDay = TWELVE_GOD_GOOD.includes(twelveGod);

const jiShen = toList(safeGet(() => lunar.getDayJiShen()));
const xiongSha = toList(safeGet(() => lunar.getDayXiongSha()));

const posXi = safeGet(() => lunar.getDayPositionXi());
const posCai = safeGet(() => lunar.getDayPositionCai());
const posFu = safeGet(() => lunar.getDayPositionFu());
const posYang = safeGet(() => lunar.getDayPositionYangGui());
const posYin = safeGet(() => lunar.getDayPositionYinGui());
const taiShen = safeGet(() => lunar.getDayTaiShen());

  const dayOfWeek = ['日','一','二','三','四','五','六'][new Date(y, m - 1, d).getDay()];

  let html = '<div class="zeri-header">';
  html += `<div class="zeri-date-main"><span class="zeri-solar">${y}年${m}月${d}日 星期${dayOfWeek}</span></div>`;
  html += `<div class="zeri-lunar-row">${yearName} · ${monthName} · ${dayName}`;
  if (shengXiao) html += ` · <span class="zeri-sx">[${shengXiao}年]</span>`;
  html += '</div>';
  html += `<div class="zeri-ganzhi">${yearGz}年 ${monthGz}月 ${dayGz}日`;
  if (wuXing) html += ` · 纳音${wuXing}`;
  html += '</div>';

  if (twelveGod) {
    const cls = isGoodDay ? 'zeri-god-good' : 'zeri-god-bad';
    html += `<div class="${cls}">${twelveGod} — ${isGoodDay ? '黄道吉日' : '黑道日'}</div>`;
  }
  html += '</div>';

  html += '<div class="zeri-yi-ji">';
  html += `<div class="zeri-yi"><div class="zeri-yi-label">宜</div><div class="zeri-yi-items">${yi.length ? yi.map(t => `<span class="zeri-yi-item">${t}</span>`).join('') : '<span class="zeri-noitem">无所宜</span>'}</div></div>`;
  html += `<div class="zeri-ji"><div class="zeri-ji-label">忌</div><div class="zeri-ji-items">${ji.length ? ji.map(t => `<span class="zeri-ji-item">${t}</span>`).join('') : '<span class="zeri-noitem">无所忌</span>'}</div></div>`;
  html += '</div>';

  html += '<div class="zeri-info">';
  if (chong) {
    const chongZhi = chong.length > 1 ? chong[1] || chong[0] : chong;
    const chongSx = SHENG_XIAO[['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'].indexOf(chongZhi)] || '';
    html += `<div class="zeri-info-row"><span class="zeri-info-label">冲煞</span><span>冲${chong}${chongSx ? '（' + chongSx + '）' : ''}</span></div>`;
  }
  if (jianChu) html += `<div class="zeri-info-row"><span class="zeri-info-label">建除</span><span>${jianChu}</span></div>`;
  if (xiu) html += `<div class="zeri-info-row"><span class="zeri-info-label">星宿</span><span>${xiu}</span></div>`;
  if (poZu) html += `<div class="zeri-info-row"><span class="zeri-info-label">彭祖</span><span>${poZu}</span></div>`;

  const positions = [];
  if (posXi) positions.push(`喜神${posXi}`);
  if (posCai) positions.push(`财神${posCai}`);
  if (posFu) positions.push(`福神${posFu}`);
  if (posYang) positions.push(`阳贵${posYang}`);
  if (posYin) positions.push(`阴贵${posYin}`);
  if (positions.length) html += `<div class="zeri-info-row"><span class="zeri-info-label">吉方</span><span>${positions.join(' · ')}</span></div>`;
  if (taiShen) html += `<div class="zeri-info-row"><span class="zeri-info-label">胎神</span><span>${taiShen}</span></div>`;

  if (jiShen.length) html += `<div class="zeri-info-row"><span class="zeri-info-label">吉神</span><span class="zeri-good-text">${jiShen.join(' ')}</span></div>`;
  if (xiongSha.length) html += `<div class="zeri-info-row"><span class="zeri-info-label">凶煞</span><span class="zeri-bad-text">${xiongSha.join(' ')}</span></div>`;
  html += '</div>';

  return html;
}

function doZeri() {
  try {
    const yEl = document.getElementById('zeriYear');
    const mEl = document.getElementById('zeriMonth');
    const dEl = document.getElementById('zeriDay');
    const zResult = document.getElementById('zeriResult');
    const zContent = document.getElementById('zeriContent');

    const y = parseInt(yEl.value);
    const m = parseInt(mEl.value);
    const d = parseInt(dEl.value);

    zResult.style.display = 'block';

    try {
      const solar = Solar.fromYmd(y, m, d);
      const lunar = solar.getLunar();
      zContent.innerHTML = zeriHtml(lunar, y, m, d);
    } catch (e) {
      console.error('zeriHtml error:', e);
      zContent.innerHTML = '<p style="color:var(--text-light);padding:12px">无法获取该日黄历</p>';
    }

    renderMonthCalendar(y, m);
  } catch (e) {
    console.error('doZeri error:', e);
    document.getElementById('zeriContent').innerHTML = '<p style="color:var(--text-light);padding:12px">黄历加载失败，请检查网络</p>';
  }
}

function renderMonthCalendar(year, month) {
  const container = document.getElementById('zeriMonthView');
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const weekHeaders = ['日','一','二','三','四','五','六'];
  let html = weekHeaders.map(w => `<div class="zeri-cal-header">${w}</div>`).join('');

  for (let i = 0; i < firstDay; i++) {
    html += '<div class="zeri-cal-empty"></div>';
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate();
    try {
      const solar2 = Solar.fromYmd(year, month, day);
      const lunar = solar2.getLunar();
      const yi = toList(safeGet(() => lunar.getDayYi()));
      const ji = toList(safeGet(() => lunar.getDayJi()));
      const twelveGod = safeGet(() => lunar.getDayTwelveDayGod());
      const isGood = TWELVE_GOD_GOOD.includes(twelveGod) || yi.length >= 3;
      const dayName = lunar.getDayInChinese();

      html += `<div class="zeri-cal-day ${isToday ? 'zeri-cal-today' : ''}" onclick="(function(){document.getElementById('zeriDay').value=${day};doZeri()})()">
        <div class="zeri-cal-day-num">${day}</div>
        <div class="zeri-cal-day-lunar ${isToday ? '' : ''}">${dayName}</div>
        ${isGood ? '<div class="zeri-cal-good">吉</div>' : ''}
      </div>`;
    } catch (e) {
      html += `<div class="zeri-cal-day"><div class="zeri-cal-day-num">${day}</div></div>`;
    }
  }
  container.innerHTML = html;
}

initZeriSelectors();
document.getElementById('btnZeri').addEventListener('click', doZeri);
if (typeof Lunar !== 'undefined') doZeri();
