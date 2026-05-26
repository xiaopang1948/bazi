const panelState = {
  activeLevel: 'dayun',
  dayunIdx: 0,
  liunianYear: 0,
  liuyueMonth: 1,
  liuriDay: 1,
  showLiuyue: false,
  showLiuri: false,
  showLiushi: false,
}

const TP_WX = { '木':'mu','火':'huo','土':'tu','金':'jin','水':'shui' }

/* ===== 节气日期 ===== */
function getYearJieDates(year) {
  try {
    const terms = LunarYear.fromYear(year).getJieQi()
    return terms.filter((_, i) => i % 2 === 0).map(jq => ({
      name: jq.getName(),
      solar: jq.getSolar(),
    }))
  } catch (e) {
    return []
  }
}

const JIE_MAP = { '立春':0,'惊蛰':1,'清明':2,'立夏':3,'芒种':4,'小暑':5,'立秋':6,'白露':7,'寒露':8,'立冬':9,'大雪':10,'小寒':11 }

/* ===== 月干计算 (五虎遁) ===== */
function calcYueGan(year, month) {
  const yearGanIdx = (year - 4) % 10
  const startStem = [2, 4, 6, 8, 0][yearGanIdx % 5]
  return STEMS[(startStem + month - 1) % 10]
}

/* ===== Item Builders ===== */

function buildDayunItems(result) {
  const birthYear = result.input.year
  const dayun = result.dayun
  const dayStem = result.pillars.day.stem
  return dayun.periods.map((p, idx) => {
    const startYear = birthYear + dayun.startAge + idx * 10
    const age = dayun.startAge + idx * 10
    const ss = getShiShen(dayStem, p.stem)
    return {
      key: 'dy' + idx,
      idx,
      lines: [
        { text: String(startYear), cls: 'tp-small' },
        { text: age + '岁', cls: 'tp-small' },
        { text: p.stem, wx: p.stemWx, ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        { text: p.branch, wx: p.branchWx, ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
      ],
      colData: { stem: p.stem, branch: p.branch, ganzhi: p.stem + p.branch, shishen: ss, stemWx: p.stemWx, branchWx: p.branchWx },
    }
  })
}

function buildLiunianItems(result, dayunIdx) {
  const birthYear = result.input.year
  const dayun = result.dayun
  const dayStem = result.pillars.day.stem
  const startAge = dayun.startAge + dayunIdx * 10
  const startYear = birthYear + startAge
  const items = []
  for (let i = 0; i < 10; i++) {
    const y = startYear + i
    const stem = STEMS[(y - 4) % 10]
    const branch = BRANCHES[(y - 4) % 12]
    const ss = getShiShen(dayStem, stem)
    items.push({
      key: 'ln' + y,
      lines: [
        { text: String(y), cls: 'tp-small' },
        { text: stem, wx: getStemWuxing(stem), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        { text: branch, wx: getBranchWuxing(branch), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
      ],
      colData: { stem, branch, ganzhi: stem + branch, shishen: ss, stemWx: getStemWuxing(stem), branchWx: getBranchWuxing(branch) },
    })
  }
  return items
}

function buildLiuyueItems(result, year) {
  const dayStem = result.pillars.day.stem
  const jieDates = getYearJieDates(year)
  const items = []
  for (let m = 1; m <= 12; m++) {
    const stem = calcYueGan(year, m)
    const branch = BRANCHES[(m + 1) % 12]
    const ss = getShiShen(dayStem, stem)
    let jieInfo = { name: '', date: '' }
    if (jieDates.length > 0) {
      const idx = m - 1
      const jd = jieDates[idx]
      if (jd) {
        const s = jd.solar
        jieInfo = { name: jd.name, date: `${s.getMonth()}-${s.getDay()}` }
      }
    }
    items.push({
      key: 'ly' + m,
      lines: [
        { text: jieInfo.name || (m + '月'), cls: 'tp-small' },
        { text: jieInfo.date, cls: 'tp-small tp-faint' },
        { text: stem, wx: getStemWuxing(stem), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        { text: branch, wx: getBranchWuxing(branch), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
      ],
      colData: { stem, branch, ganzhi: stem + branch, shishen: ss, stemWx: getStemWuxing(stem), branchWx: getBranchWuxing(branch) },
    })
  }
  return items
}

function buildLiuriItems(result, year, month) {
  const dayStem = result.pillars.day.stem
  const daysInMonth = new Date(year, month, 0).getDate()
  const items = []
  for (let d = 1; d <= daysInMonth; d++) {
    const solar = Solar.fromYmd(year, month, d)
    const lunar = solar.getLunar()
    const lunarDay = lunar.getDayInChinese()
    const dGZ = lunar.getDayInGanZhi()
    const stem = dGZ.charAt(0)
    const branch = dGZ.charAt(1)
    const ss = getShiShen(dayStem, stem)
    items.push({
      key: 'lr' + d,
      lines: [
        { text: String(d), cls: 'tp-small' },
        { text: lunarDay, cls: 'tp-small tp-faint' },
        { text: stem, wx: getStemWuxing(stem), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        { text: branch, wx: getBranchWuxing(branch), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
      ],
      colData: { stem, branch, ganzhi: dGZ, shishen: ss, stemWx: getStemWuxing(stem), branchWx: getBranchWuxing(branch) },
    })
  }
  return items
}

const SHI_CHEN = [
  { label: '子', range: '23-1' },
  { label: '丑', range: '1-3' },
  { label: '寅', range: '3-5' },
  { label: '卯', range: '5-7' },
  { label: '辰', range: '7-9' },
  { label: '巳', range: '9-11' },
  { label: '午', range: '11-13' },
  { label: '未', range: '13-15' },
  { label: '申', range: '15-17' },
  { label: '酉', range: '17-19' },
  { label: '戌', range: '19-21' },
  { label: '亥', range: '21-23' },
]

function buildLiushiItems(result, year, month, day) {
  const dayStem = result.pillars.day.stem
  const hours = calcLiuShi(dayStem, year, month, day)
  return hours.map((h, idx) => {
    const ss = getShiShen(dayStem, h.stem)
    return {
      key: 'ls' + idx,
      lines: [
        { text: h.label + '时', cls: 'tp-small' },
        { text: h.timeRange, cls: 'tp-small tp-faint' },
        { text: h.stem, wx: getStemWuxing(h.stem), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        { text: h.branch, wx: getBranchWuxing(h.branch), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
      ],
      colData: { stem: h.stem, branch: h.branch, ganzhi: h.stem + h.branch, shishen: ss, stemWx: getStemWuxing(h.stem), branchWx: getBranchWuxing(h.branch) },
    }
  })
}

/* ===== Item HTML ===== */
function tpItemHtml(item, isActive) {
  let html = `<div class="tp-item${isActive ? ' tp-item-active' : ''}" data-key="${item.key}">`
  for (const line of item.lines) {
    if (line.cls === 'tp-ganzhi') {
      html += `<div class="tp-line"><span class="wx-${TP_WX[line.wx] || ''}">${line.text}</span><span class="tp-ss">${line.ss}</span></div>`
    } else {
      html += `<div class="${line.cls}">${line.text}</div>`
    }
  }
  html += '</div>'
  return html
}

function buildTpColData(item, dayStem, pillars) {
  const cd = item.colData
  return buildColData({ ...cd, ganzhi: cd.stem + cd.branch }, dayStem, pillars, cd.stem + cd.branch)
}

/* ===== Render ===== */
function renderTimePanel(result) {
  const ps = panelState
  const card = document.getElementById('timePanelCard')
  if (!card) return
  card.style.display = 'block'

  const dayStem = result.pillars.day.stem
  const now = new Date()
  const currentYear = now.getFullYear()

  const dayunItems = buildDayunItems(result)
  if (ps.dayunIdx >= dayunItems.length) ps.dayunIdx = 0

  const liunianItems = buildLiunianItems(result, ps.dayunIdx)
  const firstLnYear = parseInt(liunianItems[0].lines[0].text)
  const lastLnYear = parseInt(liunianItems[liunianItems.length - 1].lines[0].text)
  if (!ps.liunianYear || ps.liunianYear < firstLnYear || ps.liunianYear > lastLnYear) {
    ps.liunianYear = firstLnYear
  }

  const liuyueItems = buildLiuyueItems(result, ps.liunianYear)
  if (ps.liuyueMonth < 1 || ps.liuyueMonth > 12) ps.liuyueMonth = now.getMonth() + 1

  const liuriItems = buildLiuriItems(result, ps.liunianYear, ps.liuyueMonth)
  if (ps.liuriDay < 1 || ps.liuriDay > liuriItems.length) ps.liuriDay = now.getDate()

  const liushiItems = buildLiushiItems(result, ps.liunianYear, ps.liuyueMonth, ps.liuriDay)

  function renderTpRow(containerId, items, activeKey, label, onClick) {
    const row = document.querySelector(`[data-level="${label}"]`)
    if (!row) return
    const content = row.querySelector('.tp-content')
    if (!content) return
    const activeIdx = typeof activeKey === 'number' ? activeKey : items.findIndex(i => i.key === activeKey)
    content.innerHTML = items.map((item, idx) => tpItemHtml(item, idx === activeIdx)).join('')
    const labelEl = row.querySelector('.tp-label')
    if (labelEl) {
      labelEl.classList.toggle('tp-label-active', ps['show' + label.charAt(0).toUpperCase() + label.slice(1)] || label === 'dayun' || label === 'liunian')
    }
    const items_el = content.querySelectorAll('.tp-item')
    items_el.forEach((el, idx) => {
      el.addEventListener('click', function (e) {
        e.stopPropagation()
        onClick(idx)
      })
    })
  }

  const dyActive = dayunItems.findIndex(i => i.idx === ps.dayunIdx)
  const lnActive = liunianItems.findIndex(i => parseInt(i.lines[0].text) === ps.liunianYear)
  const lyActive = ps.liuyueMonth - 1

  renderTpRow('', dayunItems, dyActive, 'dayun', (idx) => {
    ps.dayunIdx = idx
    renderTimePanel(result)
    updateMainTable(result)
  })

  renderTpRow('', liunianItems, lnActive, 'liunian', (idx) => {
    ps.liunianYear = parseInt(liunianItems[idx].lines[0].text)
    ps.liuyueMonth = now.getMonth() + 1
    renderTimePanel(result)
    updateMainTable(result)
  })

  renderTpRow('', liuyueItems, lyActive, 'liuyue', (idx) => {
    ps.liuyueMonth = idx + 1
    ps.liuriDay = 1
    renderTimePanel(result)
    updateMainTable(result)
  })

  renderTpRow('', liuriItems, ps.liuriDay - 1, 'liuri', (idx) => {
    ps.liuriDay = idx + 1
    renderTimePanel(result)
    updateMainTable(result)
  })

  renderTpRow('', liushiItems, -1, 'liushi', () => {})

  ps.dayunItemsCache = dayunItems
  ps.liunianItemsCache = liunianItems
  ps.liuyueItemsCache = liuyueItems
  ps.liuriItemsCache = liuriItems
  ps.liushiItemsCache = liushiItems
  ps.resultCache = result
}

/* ===== 主表联动 ===== */
function updateMainTable(result) {
  const ps = panelState
  const dayStem = result.pillars.day.stem
  const pillars = result.pillars
  const extraCols = []

  if (ps.showLiuyue && ps.liuyueItemsCache) {
    const item = ps.liuyueItemsCache[ps.liuyueMonth - 1]
    if (item) extraCols.push({ key: 'extra_liuyue', label: '流月', data: buildTpColData(item, dayStem, pillars) })
  }
  if (ps.showLiuri && ps.liuriItemsCache) {
    const item = ps.liuriItemsCache[ps.liuriDay - 1]
    if (item) extraCols.push({ key: 'extra_liuri', label: '流日', data: buildTpColData(item, dayStem, pillars) })
  }
  if (ps.showLiushi && ps.liushiItemsCache) {
    const item = ps.liushiItemsCache[0]
    if (item) extraCols.push({ key: 'extra_liushi', label: '流时', data: buildTpColData(item, dayStem, pillars) })
  }

  renderMainTable(result, extraCols)
}

/* ===== 标签点击切换 ===== */
document.addEventListener('click', function (e) {
  const label = e.target.closest('.tp-label')
  if (!label) return
  const row = label.closest('.tp-row')
  if (!row) return
  const level = row.dataset.level
  if (level === 'dayun' || level === 'liunian') return

  const ps = panelState
  const map = { liuyue: 'showLiuyue', liuri: 'showLiuri', liushi: 'showLiushi' }
  ps[map[level]] = !ps[map[level]]

  if (ps.resultCache) {
    label.classList.toggle('tp-label-active', ps[map[level]])
    updateMainTable(ps.resultCache)
  }
})

/* ===== 兼容旧引用 ===== */
function switchTimeView() {}
function renderTimeContent() {}
function renderLiuNian() {}
