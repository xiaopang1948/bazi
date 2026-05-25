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

function doWuYun() {
  const year = parseInt(document.getElementById('wuyunYear').value);
  const result = calcWuYunLiuQi(year);
  document.getElementById('wuyunResult').style.display = 'block';

  document.getElementById('wuyunOverview').innerHTML = `
    <div class="pattern-row"><span>年份</span><strong>${year}年（${result.yearGanZhi}）</strong></div>
    <div class="pattern-row"><span>岁运</span><strong style="color:var(--primary)">${result.suiYun}</strong></div>
    <div class="pattern-row"><span>司天</span><strong>${result.siTian}</strong></div>
    <div class="pattern-row"><span>在泉</span><strong>${result.zaiQuan}</strong></div>
  `;

  document.getElementById('wuyunKeYun').innerHTML =
    '<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:var(--border);font-weight:600"><td style="padding:4px 6px">运</td><td style="padding:4px 6px">五行</td></tr>' +
    result.keYun.map(k => `<tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 6px">${k.name}</td><td style="padding:4px 6px"><span class="pillar-wuxing wuxing-${k.wx}" style="color:#fff;padding:0 8px;border-radius:3px;font-size:11px">${k.wx}</span></td></tr>`).join('') +
    '</table>';

  document.getElementById('wuyunKeQi').innerHTML =
    '<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:var(--border);font-weight:600"><td style="padding:4px 6px">气</td><td style="padding:4px 6px">名称</td></tr>' +
    result.keQi.map((k, i) => `<tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 6px">${['初气','二气','三气','四气','五气','终气'][i]}</td><td style="padding:4px 6px">${k.name}</td></tr>`).join('') +
    '</table>';

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

initWuYun();
document.getElementById('btnWuYun')?.addEventListener('click', doWuYun);
