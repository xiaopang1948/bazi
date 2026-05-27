function renderPattern(result) {
  const p = result.pattern;
  const t = result.tiaoHou;
  const g = result.geJu;

  if (!g) return;

  let html = '<div class="geju-header">';

  // 格局名称 + 顺/逆用
  const typeClass = g.type === 'zheng' ? 'geju-name-zheng' : 'geju-name-special';
  html += `<div class="geju-name-row">
    <span class="geju-name ${typeClass}">${g.name}</span>
    <span class="geju-yong">${g.yong}</span>
  </div>`;

  // 格局解释
  html += `<div class="geju-desc">${g.desc}</div>`;

  // 顺逆用指引
  html += `<div class="geju-guidance">
    <span class="geju-guidance-label">用忌指引</span>
    <span class="geju-guidance-text">${g.guidance}</span>
  </div>`;

  html += '</div>';

  // 特殊格局（从格/专旺/化气）附加
  html += '<div id="specialPatternInner"></div>';

  document.getElementById('patternContent').innerHTML = html;
}

function renderSpecialPatterns(specials) {
  const container = document.getElementById('specialPatternInner');
  if (!specials || specials.length === 0) {
    if (container) container.innerHTML = '';
    return;
  }
  container.innerHTML = '<div class="geju-special-divider"></div>' +
    specials.map(s =>
      `<div class="geju-special-item"><span class="geju-special-name">${s.name}</span><span class="geju-special-desc">${s.desc}</span></div>`
    ).join('');
}
