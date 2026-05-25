const BaziComponents = {}

BaziComponents.renderInfoBar = function (name, result) {
  const r = result
  let solarInfo = ''
  if (r.solarTime && r.solarTime.adjusted) {
    solarInfo = ` | 真太阳时: ${String(r.solarTime.hour).padStart(2, '0')}:${String(r.solarTime.minute).padStart(2, '0')} (时差 ${r.solarTime.eot > 0 ? '+' : ''}${r.solarTime.eot}分)`
  }
  const cityName = r.input.cityKey && CITIES[r.input.cityKey] ? CITIES[r.input.cityKey].name : '未知'
  document.getElementById('infoBar').innerHTML = `
    <span><strong>${name}</strong> · ${r.input.gender === 'male' ? '男' : '女'}</span>
    <span>${r.input.year}-${String(r.input.month).padStart(2, '0')}-${String(r.input.day).padStart(2, '0')} ${String(r.input.hour).padStart(2, '0')}:${String(r.input.minute).padStart(2, '0')}</span>
    <span>${cityName}${solarInfo}</span>
  `
}

BaziComponents.renderPillars = function (result) {
  const grid = document.getElementById('pillarsGrid')
  const keys = ['year', 'month', 'day', 'hour']
  const labels = ['年柱', '月柱', '日柱', '时柱']
  const wxMap = { '木': 'mu', '火': 'huo', '土': 'tu', '金': 'jin', '水': 'shui' }

  grid.innerHTML = labels.map(l => `<div class="pillar-cell header-cell">${l}</div>`).join('')

  const dataRows = [
    { cls: 'stem', render: d => `<span class="wx-${wxMap[d.stemWuxing] || ''}">${d.stem}</span>` },
    { cls: 'branch', render: d => `<span class="wx-${wxMap[d.branchWuxing] || ''}">${d.branch}</span>` },
    {
      cls: 'wuxing', render: d =>
        `<span class="pillar-wuxing wuxing-${d.stemWuxing === '木' ? 'wood' : d.stemWuxing === '火' ? 'fire' : d.stemWuxing === '土' ? 'earth' : d.stemWuxing === '金' ? 'metal' : 'water'}">${d.stemWuxing}</span>`
    },
    { cls: 'shishen', render: d => d.shishen },
    { cls: 'hidden', render: d => d.hiddenShishen.map(h => `<span class="wx-${wxMap[h.wuxing] || ''}">${h.stem}</span>`).join(' ') },
    { cls: 'nayin', render: d => d.nayin },
    { cls: 'chs', render: d => d.changSheng },
  ]

  for (const row of dataRows) {
    for (const key of keys) {
      const d = result.details[key]
      const cell = document.createElement('div')
      cell.className = `pillar-cell pillar-${key}`
      cell.innerHTML = `<div class="pillar-${row.cls}">${row.render(d)}</div>`
      grid.appendChild(cell)
    }
  }
}

BaziComponents.renderWuxing = function (counts) {
  const container = document.getElementById('wuxingBars')
  const colors = { 木: 'var(--wood)', 火: 'var(--fire)', 土: 'var(--earth)', 金: 'var(--metal)', 水: 'var(--water)' }
  const maxVal = Math.max(...Object.values(counts), 1)

  container.innerHTML = ''
  for (const wx of ['木', '火', '土', '金', '水']) {
    const val = counts[wx] || 0
    const pct = Math.round(val / maxVal * 100)
    container.innerHTML += `
      <div class="wuxing-bar-row">
        <div class="wuxing-bar-label">${wx}</div>
        <div class="wuxing-bar-track">
          <div class="wuxing-bar-fill" style="width:${pct}%;background:${colors[wx]}"></div>
        </div>
        <div class="wuxing-bar-count">${val}</div>
      </div>`
  }
}

BaziComponents.renderStars = function (details) {
  const container = document.getElementById('starsList')
  const allStars = new Map()
  for (const key of ['year', 'month', 'day', 'hour']) {
    for (const star of details[key].stars) {
      if (!allStars.has(star.name)) allStars.set(star.name, star)
    }
  }
  if (allStars.size === 0) {
    container.innerHTML = '<span style="color:var(--text-light)">无特殊神煞</span>'
    return
  }
  container.innerHTML = ''
  for (const [, star] of allStars) {
    const tag = document.createElement('span')
    tag.className = `star-tag ${star.type}`
    tag.textContent = star.name
    container.appendChild(tag)
  }
}

BaziComponents.renderExtraPillars = function (extra) {
  const card = document.getElementById('extraPillarsCard')
  const container = document.getElementById('extraPillarsContent')
  if (!extra || !card) return
  card.style.display = 'block'
  container.innerHTML = `
    <div class="pattern-row"><span>胎元</span><strong>${extra.taiYuan.ganzhi}</strong></div>
    <div class="pattern-row"><span>命宫</span><strong>${extra.mingGong.ganzhi}</strong></div>
    <div class="pattern-row"><span>身宫</span><strong>${extra.shenGong.ganzhi}</strong></div>`
}

BaziComponents.renderRenYuan = function (renYuan) {
  const card = document.getElementById('renYuanCard')
  const container = document.getElementById('renYuanContent')
  if (!renYuan || Object.keys(renYuan).length === 0 || !card) return
  card.style.display = 'block'
  container.innerHTML = Object.entries(renYuan)
    .map(([stem, days]) => {
      const wx = getStemWuxing(stem)
      return `<div class="pattern-row"><span><span class="pillar-wuxing wuxing-${wx}" style="font-size:11px;padding:0 6px;display:inline-block;color:#fff;border-radius:3px">${stem}</span> 主事 ${days} 日</span><strong style="color:var(--text-light)">${wx}</strong></div>`
    }).join('')
}

BaziComponents.renderQiMing = function (result) {
  const card = document.getElementById('qiMingCard')
  const container = document.getElementById('qiMingContent')
  if (!card) return
  const p = result.pattern
  if (!p || !p.yongShen) return
  card.style.display = 'block'
  const suggestions = calcNameSuggestions(p.dayStemWuxing, p.yongShen, 8)
  let html = `<p style="font-size:13px;margin-bottom:8px;color:var(--text-light)">根据八字，宜补五行【${p.yongShen}】，以下推荐名字供参考：</p>`
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px">'
  for (const s of suggestions) {
    html += `<div style="padding:8px 14px;background:rgba(184,134,11,0.06);border:1px solid var(--border);border-radius:6px;text-align:center">
      <div style="font-size:18px;font-weight:700;color:var(--primary)">${s.name}</div>
      <div style="font-size:11px;color:var(--text-light);margin-top:2px">${s.reason}</div>
    </div>`
  }
  html += '</div>'
  container.innerHTML = html
}

BaziComponents.renderGuJi = function (result) {
  const card = document.getElementById('guJiCard')
  const container = document.getElementById('guJiContent')
  if (!card) return
  const matches = calcGuJiMatches(result)
  if (matches.length === 0) return
  card.style.display = 'block'
  container.innerHTML = matches.map(m =>
    `<div class="gu-ji-item"><span class="gu-ji-source">${m.source} · ${m.title}</span><p class="gu-ji-text">${m.content}</p></div>`
  ).join('')
}

BaziComponents.renderDiagram = function (result) {
  const canvas = document.getElementById('pillarDiagram')
  if (!canvas) return
  document.getElementById('diagramCard').style.display = 'block'
  renderPillarDiagram('pillarDiagram', result)
}
