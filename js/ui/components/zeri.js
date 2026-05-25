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

function doZeri() {
  try {
  const y = parseInt(document.getElementById('zeriYear').value);
  const m = parseInt(document.getElementById('zeriMonth').value);
  const d = parseInt(document.getElementById('zeriDay').value);
  document.getElementById('zeriResult').style.display = 'block';

  try {
    const lunar = Lunar.fromYmd(y, m, d);
    const yi = lunar.getDayYi();
    const ji = lunar.getDayJi();
    const chong = lunar.getDayChong();
    const wuXing = lunar.getDayNaYin() || '';
    const dayGz = lunar.getDayInGanZhi();

    let html = `<p><strong>${y}年${m}月${d}日</strong></p>`;
    html += `<p>农历：${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}</p>`;
    html += `<p>干支：${lunar.getYearInGanZhi()} ${lunar.getMonthInGanZhi()} ${dayGz}</p>`;
    if (wuXing) html += `<p>纳音：${wuXing}</p>`;
    if (chong) html += `<p>冲煞：冲${chong}</p>`;

    const jianChu = lunar.getDayJianChu();
    const xiu = lunar.getDayXiu();
    const poZu = lunar.getDayPengZu();
    if (jianChu) html += `<p>建除十二神：${jianChu}</p>`;
    if (xiu) html += `<p>二十八宿：${xiu}</p>`;
    if (poZu) html += `<p>彭祖百忌：${poZu}</p>`;

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

initZeriSelectors();
document.getElementById('btnZeri').addEventListener('click', doZeri);
if (typeof Lunar !== 'undefined') doZeri();
