function renderDaYun(dayun) {
  const container = document.getElementById('dayunList');
  container.innerHTML = `<div class="dayun-item" style="border-left-color:#666;background:rgba(100,100,100,0.05)">
    <span class="dayun-age">起运 ${dayun.startAge}岁</span>
    <span class="dayun-ganzhi">${dayun.direction}</span>
  </div>`;
  for (const p of dayun.periods) {
    const sWx = getStemWuxing(p.stem);
    const bWx = getBranchWuxing(p.branch);
    container.innerHTML += `
      <div class="dayun-item">
        <span class="dayun-age">${p.ageRange}岁</span>
        <span class="dayun-ganzhi">${wxSpan(sWx, p.stem)}${wxSpan(bWx, p.branch)}</span>
        <span class="dayun-shishen">${p.shishen}</span>
      </div>
    `;
  }
}
