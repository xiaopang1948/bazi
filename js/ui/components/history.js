function saveHistory(name, result) {
  BaziStore.history.add({
    id: Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    type: 'bazi',
    name,
    gender: result.input.gender,
    genderLabel: result.input.gender === 'male' ? '乾造' : '坤造',
    date: `${result.input.year}-${String(result.input.month).padStart(2,'0')}-${String(result.input.day).padStart(2,'0')}`,
    time: `${String(result.input.hour).padStart(2,'0')}:${String(result.input.minute).padStart(2,'0')}`,
    pillars: `${result.pillars.year.stem}${result.pillars.year.branch} ${result.pillars.month.stem}${result.pillars.month.branch} ${result.pillars.day.stem}${result.pillars.day.branch} ${result.pillars.hour.stem}${result.pillars.hour.branch}`,
    pillarsObj: result.pillars,
    wuxingCount: result.wuxingCount,
    nayin: [result.details.year.nayin, result.details.month.nayin, result.details.day.nayin, result.details.hour.nayin],
    qiyunStart: result.dayun.startAge,
    qiyunDirection: result.dayun.direction,
    dayunSummary: result.dayun.periods.slice(0, 8).map(p => ({
      ageRange: p.ageRange, ganzhi: p.ganzhi, shishen: p.shishen
    })),
    patternStrength: result.pattern?.strength || '',
    patternYongShen: result.pattern?.yongShen || '',
    patternJiShen: result.pattern?.jiShen || '',
    timestamp: Date.now(),
  });
  renderHistory();
}

function saveHarmonyToHistory(r1, r2, harmony) {
  BaziStore.history.add({
    id: Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    type: 'hepan',
    name: (r1.input.name || '甲方') + ' × ' + (r2.input.name || '乙方'),
    gender: '-',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    pillars: harmony.profile1.ganzhi + ' | ' + harmony.profile2.ganzhi,
    hepanScore: harmony.score,
    hepanLevel: harmony.level,
    hepanSummary: harmony.summary,
    partner1: r1.input.name || '甲方',
    partner2: r2.input.name || '乙方',
    partner1Gender: r1.input.gender === 'male' ? '乾造' : '坤造',
    partner2Gender: r2.input.gender === 'male' ? '乾造' : '坤造',
    timestamp: Date.now(),
  });
  renderHistory();
}

function buildHistoryItem(h) {
  const isHepan = h.type === 'hepan';
  if (isHepan) {
    const scoreColor = h.hepanScore >= 85 ? '#2e7d32' : h.hepanScore >= 70 ? '#f9a825' : h.hepanScore >= 55 ? '#e65100' : '#c62828';
    return `<div class="dayun-item hepan-record" onclick="showHistoryDetail('${h.id}')" style="cursor:pointer;border-left-color:${scoreColor}">
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:11px;background:${scoreColor};color:#fff;padding:1px 6px;border-radius:3px">${h.hepanLevel}</span>
        <span class="dayun-age">${h.name}</span>
      </div>
      <span class="dayun-ganzhi" style="font-size:12px">${h.pillars}</span>
      <span class="dayun-shishen">${h.date} ${h.time}</span>
    </div>`;
  }
  const genderIcon = h.gender === 'male' ? '♂' : '♀';
  return `<div class="dayun-item" onclick="showHistoryDetail('${h.id}')" style="cursor:pointer">
    <span class="dayun-age"><span style="color:var(--primary-light);margin-right:4px">${genderIcon}</span>${h.name}</span>
    <span class="dayun-ganzhi">${h.pillars}</span>
    <span class="dayun-shishen">${h.date} ${h.time}</span>
  </div>`;
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('bazi_history') || '[]');
  const container = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');
  const query = (document.getElementById('historySearch')?.value || '').trim().toLowerCase();

  if (!container) return;

  if (history.length === 0) {
    empty.style.display = 'block';
    container.innerHTML = '';
    return;
  }
  empty.style.display = 'none';

  const filtered = query ? history.filter(h => h.name.toLowerCase().includes(query)) : history;

  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:20px;color:var(--white-dim)">无匹配记录</p>';
    return;
  }

  const groups = {};
  filtered.forEach(h => {
    let monthKey;
    if (h.type === 'hepan') {
      const d = new Date(h.timestamp);
      monthKey = d.getFullYear() + '年' + (d.getMonth() + 1) + '月';
    } else {
      const parts = h.date.split('-');
      monthKey = parts[0] + '年' + parseInt(parts[1]) + '月';
    }
    if (!groups[monthKey]) groups[monthKey] = [];
    groups[monthKey].push(h);
  });

  const sortedMonths = Object.keys(groups).sort((a, b) => {
    const ma = parseInt(a), mb = parseInt(b);
    return mb - ma;
  });

  container.innerHTML = sortedMonths.map(monthKey => `
    <div class="history-group">
      <div style="font-size:12px;color:var(--white-dim);padding:6px 8px;border-bottom:1px solid var(--border)">${monthKey}</div>
      ${groups[monthKey].map(h => buildHistoryItem(h)).join('')}
    </div>
  `).join('');
}

function showHistoryDetail(id) {
  const h = BaziStore.history.getAll().find(e => e.id === id);
  if (!h) return;

  document.getElementById('detailTitle').textContent = h.type === 'hepan' ? '合盘详情' : '排盘详情';
  document.getElementById('btnLoadFromDetail').dataset.id = id;
  document.getElementById('btnLoadFromDetail').textContent = h.type === 'hepan' ? '切换到合盘' : '载入排盘';

  let html = '';
  if (h.type === 'bazi') {
    html += `<div style="margin-bottom:12px">
      <div style="font-size:16px;font-weight:600;color:#fff">${h.name} <span style="font-size:13px;color:var(--white-dim);font-weight:400">${h.genderLabel}</span></div>
      <div style="font-size:13px;color:var(--text-light);margin-top:4px">${h.date} ${h.time}</div>
    </div>`;
    html += `<div style="font-size:20px;font-family:var(--font-serif);text-align:center;padding:12px;background:rgba(0,230,118,0.08);border-radius:8px;margin-bottom:12px;letter-spacing:2px">${h.pillars}</div>`;

    if (h.wuxingCount) {
      const wxColors = { '木':'#4caf50', '火':'#f44336', '土':'#ff9800', '金':'#ffeb3b', '水':'#2196f3' };
      const wxNames = { '木':'木', '火':'火', '土':'土', '金':'金', '水':'水' };
      const total = Object.values(h.wuxingCount).reduce((a, b) => a + b, 0) || 1;
      html += `<div style="margin-bottom:12px">
        <div style="font-size:12px;color:var(--white-dim);margin-bottom:4px">五行统计</div>
        <div style="display:flex;gap:4px;height:8px;border-radius:4px;overflow:hidden">`;
      for (const wx of ['木','火','土','金','水']) {
        const cnt = h.wuxingCount[wx] || 0;
        if (cnt > 0) html += `<div style="flex:${cnt};background:${wxColors[wx]};min-width:4px" title="${wxNames[wx]}: ${cnt}"></div>`;
      }
      html += `</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;font-size:11px">`;
      for (const wx of ['木','火','土','金','水']) {
        const cnt = h.wuxingCount[wx] || 0;
        html += `<span style="color:${wxColors[wx]}">● ${wxNames[wx]} ${cnt}</span>`;
      }
      html += `</div></div>`;
    }

    if (h.nayin) {
      html += `<div style="margin-bottom:12px">
        <div style="font-size:12px;color:var(--white-dim);margin-bottom:4px">纳音</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:13px">`;
      const ganZhiNames = ['年柱','月柱','日柱','时柱'];
      h.nayin.forEach((n, i) => {
        html += `<span style="background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:4px">${ganZhiNames[i]}: ${n}</span>`;
      });
      html += `</div></div>`;
    }

    if (h.patternStrength || h.patternYongShen) {
      html += `<div style="margin-bottom:12px;font-size:13px">
        <span style="color:var(--white-dim)">格局：</span>${h.patternStrength || '-'}`;
      if (h.patternYongShen) html += ` ｜ <span style="color:var(--white-dim)">用神：</span>${h.patternYongShen}`;
      if (h.patternJiShen) html += ` ｜ <span style="color:var(--white-dim)">忌神：</span>${h.patternJiShen}`;
      html += `</div>`;
    }

    if (h.qiyunStart != null) {
      html += `<div style="margin-bottom:8px;font-size:13px">
        <span style="color:var(--white-dim)">起运：</span>${h.qiyunStart}岁 ${h.qiyunDirection || ''}
      </div>`;
    }

    if (h.dayunSummary && h.dayunSummary.length) {
      html += `<div style="margin-bottom:12px">
        <div style="font-size:12px;color:var(--white-dim);margin-bottom:4px">大运（前8步）</div>`;
      h.dayunSummary.forEach(p => {
        html += `<div class="dayun-item" style="font-size:12px">
          <span class="dayun-age">${p.ageRange}</span>
          <span class="dayun-ganzhi">${p.ganzhi}</span>
          <span class="dayun-shishen">${p.shishen || ''}</span>
        </div>`;
      });
      html += `</div>`;
    }

    html += `<div style="margin-top:8px;text-align:right">
      <button onclick="deleteHistoryItem('${h.id}')" style="background:rgba(198,40,40,0.2);border:1px solid #c62828;color:#ef5350;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">删除记录</button>
    </div>`;

  } else if (h.type === 'hepan') {
    html += `<div style="text-align:center;margin-bottom:16px">
      <div style="font-size:36px;font-weight:700;color:#00E676">${h.hepanScore}</div>
      <div style="font-size:14px;color:var(--white-dim)">${h.partner1} × ${h.partner2}</div>
      <div style="font-size:13px;margin-top:4px">
        <span style="background:${h.hepanScore >= 85 ? '#2e7d32' : h.hepanScore >= 70 ? '#f9a825' : h.hepanScore >= 55 ? '#e65100' : '#c62828'};color:#fff;padding:2px 10px;border-radius:4px">${h.hepanLevel}</span>
      </div>
    </div>`;
    if (h.hepanSummary) {
      html += `<div style="margin-bottom:12px;font-size:13px;color:var(--text-light);padding:8px;background:rgba(255,255,255,0.04);border-radius:6px">${h.hepanSummary}</div>`;
    }
    html += `<div style="margin-bottom:8px;font-size:13px">
      <div><span style="color:var(--white-dim)">${h.partner1}</span> ${h.partner1Gender} — ${harmonyProfile1Ganzhi(h) || h.pillars.split(' | ')[0] || ''}</div>
      <div><span style="color:var(--white-dim)">${h.partner2}</span> ${h.partner2Gender} — ${harmonyProfile2Ganzhi(h) || h.pillars.split(' | ')[1] || ''}</div>
    </div>`;
    html += `<div style="margin-top:8px;text-align:right">
      <button onclick="deleteHistoryItem('${h.id}')" style="background:rgba(198,40,40,0.2);border:1px solid #c62828;color:#ef5350;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">删除记录</button>
    </div>`;
  }

  document.getElementById('detailContent').innerHTML = html;
  document.getElementById('historyDetailPanel').style.display = 'block';
  document.getElementById('historyDetailOverlay').style.display = 'block';
}

function harmonyProfile1Ganzhi(h) {
  return h.pillars ? h.pillars.split(' | ')[0] : '';
}

function harmonyProfile2Ganzhi(h) {
  return h.pillars ? h.pillars.split(' | ')[1] : '';
}

function loadHistoryFromDetail(id) {
  const h = BaziStore.history.getAll().find(e => e.id === id);
  if (!h || h.type !== 'bazi') return;
  const [y, m, d] = h.date.split('-').map(Number);
  const [hh, mi] = h.time.split(':').map(Number);
  document.getElementById('year').value = y;
  document.getElementById('month').value = m;
  updateDays();
  document.getElementById('day').value = d;
  document.getElementById('hour').value = hh;
  document.getElementById('minute').value = mi;
  setGender(h.gender);
  closeHistoryDetail();
  BaziStore.set('keepResult', true);
  BaziRouter.go('bazi');
  const calcBtn = document.querySelector('#tab-bazi .btn-primary') || document.getElementById('btnCalc');
  if (calcBtn) calcBtn.click();
}

function deleteHistoryItem(id) {
  BaziStore.history.delete(id);
  closeHistoryDetail();
  renderHistory();
}

function clearAllHistory() {
  if (!confirm('确定清空所有记录？此操作不可恢复。')) return;
  BaziStore.history.clear();
  renderHistory();
}

function closeHistoryDetail() {
  document.getElementById('historyDetailPanel').style.display = 'none';
  document.getElementById('historyDetailOverlay').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('historySearch').addEventListener('input', renderHistory);
  document.getElementById('btnClearHistory').addEventListener('click', clearAllHistory);
  document.getElementById('btnLoadFromDetail').addEventListener('click', function() {
    const id = this.dataset.id;
    if (!id) return;
    const h = BaziStore.history.getAll().find(e => e.id === id);
    if (!h) return;
    if (h.type === 'bazi') {
      loadHistoryFromDetail(id);
    } else if (h.type === 'hepan') {
      closeHistoryDetail();
      BaziRouter.go('hepan');
    }
  });
});
renderHistory();
