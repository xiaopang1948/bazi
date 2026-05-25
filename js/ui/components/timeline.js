const _liuNianCache = new Map()

function renderLiuNian(detail) {
  const container = document.getElementById('currentYearContent');
  if (!detail || !detail.analysis) { container.innerHTML = '<p>无法计算</p>'; return; }

  const lnGanWx = getStemWuxing(detail.liuNianGan);
  const lnZhiWx = getBranchWuxing(detail.liuNianZhi);
  let html = `<p style="font-size:16px;font-weight:600;margin-bottom:8px">${detail.year} 年（${wxSpan(lnGanWx, detail.liuNianGan)}${wxSpan(lnZhiWx, detail.liuNianZhi)}）</p>`;
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

function switchTimeView(view, result) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.toggle('active', b.dataset.time === view));
  renderTimeContent(view, result);
}

function renderTimeContent(view, result) {
  const container = document.getElementById('timeContent');
  if (!container || !result) return;
  const dayStem = result.pillars.day.stem;
  const now = new Date();

  const wc = document.getElementById('weekTrendCard')
  if (wc) wc.style.display = view === 'week' ? 'block' : 'none'

  switch (view) {
    case 'nian': {
      const _liuCacheKey = result.input.year + '-' + result.input.name
      if (!_liuNianCache.has(_liuCacheKey)) {
        _liuNianCache.set(_liuCacheKey, calcLiuNianDetail(result.pillars, result.dayun, dayStem, result.input.year))
      }
      const detail = _liuNianCache.get(_liuCacheKey)
      const nGanWx = getStemWuxing(detail.liuNianGan);
      const nZhiWx = getBranchWuxing(detail.liuNianZhi);
      let html = `<p style="font-size:15px;font-weight:700;margin-bottom:6px">${detail.year} 年（${wxSpan(nGanWx, detail.liuNianGan)}${wxSpan(nZhiWx, detail.liuNianZhi)}）</p>`;
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
        const mGanWx = getStemWuxing(m.stem);
        const mZhiWx = getBranchWuxing(m.branch);
        html += `<tr style="border-bottom:1px solid var(--border);${isCurrent ? 'background:rgba(184,134,11,0.08)' : ''}">
          <td style="padding:4px 6px;font-weight:600">${m.month}月</td>
          <td style="padding:4px 6px">${wxSpan(mGanWx, m.stem)}${wxSpan(mZhiWx, m.branch)}</td>
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
        const rGanWx = getStemWuxing(d.stem);
        const rZhiWx = getBranchWuxing(d.branch);
        html += `<tr style="border-bottom:1px solid var(--border);cursor:pointer${isToday ? ';background:rgba(184,134,11,0.08)' : ''}" data-day="${d.day}">
          <td style="padding:3px 4px;font-weight:600">${d.day}日</td>
          <td style="padding:3px 4px">${wxSpan(rGanWx, d.stem)}${wxSpan(rZhiWx, d.branch)}</td>
          <td style="padding:3px 4px;color:var(--text-light)">${d.shishen}</td>
          <td style="padding:3px 4px;font-size:11px;color:var(--text-light)">${chongHe}</td>
        </tr>`;
      }
      html += '</table>';
      container.innerHTML = html;
      if (!container.dataset.listener) {
        container.dataset.listener = '1';
        container.addEventListener('click', function(ev) {
          const tr = ev.target.closest('tr[data-day]');
          if (tr) {
            timeSelectedDay = parseInt(tr.dataset.day);
            document.querySelector('.time-btn[data-time="shi"]').click();
          }
        });
      }
      break;
    }
    case 'week': {
      renderWeeklyTrend(result)
      break
    }
    case 'shi': {
      const sy = result.input.year, sm = result.input.month;
      const hours = calcLiuShi(dayStem, sy, sm, timeSelectedDay);
      const currentHour = now.getHours();
      let html = `<p style="font-size:12px;color:var(--text-light);margin-bottom:6px">${sy}年${sm}月${timeSelectedDay}日 · 十二时辰</p>`;
      html += '<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:var(--border);font-weight:600"><td style="padding:3px 4px">时辰</td><td style="padding:3px 4px">时间</td><td style="padding:3px 4px">干支</td><td style="padding:3px 4px">十神</td><td style="padding:3px 4px">冲合</td></tr>';
      for (const h of hours) {
        const isNow = currentHour >= parseInt(h.timeRange.split(':')[0]) && currentHour < parseInt(h.timeRange.split(':')[0].split('-')[1] || h.timeRange.split(':')[0]) + 2;
        const chongHe = calcChongXingHe(h.stem, h.branch, result.pillars).map(i => i.detail).join('、') || '-';
        const sGanWx = getStemWuxing(h.stem);
        const sZhiWx = getBranchWuxing(h.branch);
        html += `<tr style="border-bottom:1px solid var(--border);${isNow ? 'background:rgba(184,134,11,0.08)' : ''}">
          <td style="padding:3px 4px;font-weight:600">${h.label}时</td>
          <td style="padding:3px 4px;font-size:10px;color:var(--text-light)">${h.timeRange}</td>
          <td style="padding:3px 4px">${wxSpan(sGanWx, h.stem)}${wxSpan(sZhiWx, h.branch)}</td>
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
