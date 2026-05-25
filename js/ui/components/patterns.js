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

function renderSpecialPatterns(specials) {
  const card = document.getElementById('specialPatternCard');
  const container = document.getElementById('specialPatternContent');
  card.style.display = 'block';
  container.innerHTML = specials.map(s =>
    `<div class="pattern-row"><span>${s.name}</span><strong style="color:var(--primary)">${s.desc}</strong></div>`
  ).join('');
}

function renderLiuQin(liuQin) {
  const card = document.getElementById('liuQinCard');
  const container = document.getElementById('liuQinContent');
  card.style.display = 'block';
  const labels = { year: '祖上/父母宫', month: '父母/兄弟宫', day: '自身/配偶宫', hour: '子女宫' };
  container.innerHTML = Object.entries(liuQin).map(([key, val]) =>
    `<div class="pattern-row"><span>${val.label}</span><strong>${val.pillar}</strong></div>`
  ).join('');
}
