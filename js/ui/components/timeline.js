const panelState = {
  dayunIdx: 0,
  liunianYear: 0,
  liuyueIdx: 0,
  liuriDay: 1,
  liushiIdx: 0,
  showLiuyue: false,
  showLiuri: false,
  showLiushi: false,
  showXiaoyun: false,
}

const TP_WX = { '木':'mu','火':'huo','土':'tu','金':'jin','水':'shui' }

/* ===== 节气期 ===== */
function getJiePeriods(year) {
  try {
    const lunar = Solar.fromYmd(year, 6, 1).getLunar()
    const jqTable = lunar.getJieQiTable()
    const jqList = lunar.getJieQiList()
    const jieNames = jqList.filter((_, i) => i % 2 === 0)
    const nextLunar = Solar.fromYmd(year + 1, 6, 1).getLunar()
    const nextJqTable = nextLunar.getJieQiTable()
    return jieNames.map((name, i) => {
      const start = jqTable[name]
      const end = i < 11 ? jqTable[jieNames[i + 1]] : nextJqTable[jieNames[0]]
      const ganzhi = start.getLunar().getMonthInGanZhi()
      return { name, start, end, ganzhi }
    })
  } catch (e) {
    return []
  }
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
    const stemWx = getStemWuxing(p.stem)
    const branchWx = getBranchWuxing(p.branch)
    return {
      key: 'dy' + idx,
      idx,
      lines: [
        { text: String(startYear), cls: 'tp-small' },
        { text: age + '岁', cls: 'tp-small' },
        { text: p.stem, wx: stemWx, ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        { text: p.branch, wx: branchWx, ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
      ],
      colData: { stem: p.stem, branch: p.branch, ganzhi: p.stem + p.branch, shishen: ss, stemWx, branchWx },
    }
  })
}

function buildXiaoyunItems(result) {
  const birthYear = result.input.year
  const dayStem = result.pillars.day.stem
  const hourStem = result.pillars.hour.stem
  const hourBranch = result.pillars.hour.branch
  const startAge = result.dayun.startAge
  if (startAge <= 0) return []

  const yearGan = result.pillars.year.stem
  const isYang = STEMS.indexOf(yearGan) % 2 === 0
  const isMale = result.input.gender === 'male'
  const isForward = (isYang && isMale) || (!isYang && !isMale)

  const items = []
  for (let age = 0; age < startAge; age++) {
    const offset = isForward ? age : -age
    const ganIdx = ((STEMS.indexOf(hourStem) + offset) % 10 + 10) % 10
    const zhiIdx = ((BRANCHES.indexOf(hourBranch) + offset) % 12 + 12) % 12
    const stem = STEMS[ganIdx]
    const branch = BRANCHES[zhiIdx]
    const year = birthYear + age
    const ss = getShiShen(dayStem, stem)
    const stemWx = getStemWuxing(stem)
    const branchWx = getBranchWuxing(branch)
    items.push({
      key: 'xy' + age,
      age,
      year,
      lines: [
        { text: String(year), cls: 'tp-small' },
        { text: age + '岁', cls: 'tp-small' },
        { text: stem, wx: stemWx, ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        { text: branch, wx: branchWx, ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
      ],
      colData: { stem, branch, ganzhi: stem + branch, shishen: ss, stemWx, branchWx },
    })
  }
  return items
}

function buildLiunianItems(result, dayunIdx, years = null) {
  if (years) {
    const dayStem = result.pillars.day.stem
    return years.map(y => {
      const stem = STEMS[(y - 4) % 10]
      const branch = BRANCHES[(y - 4) % 12]
      const ss = getShiShen(dayStem, stem)
      return {
        key: 'ln' + y, year: y,
        lines: [
          { text: String(y), cls: 'tp-small' },
          { text: stem, wx: getStemWuxing(stem), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
          { text: branch, wx: getBranchWuxing(branch), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        ],
        colData: { stem, branch, ganzhi: stem + branch, shishen: ss, stemWx: getStemWuxing(stem), branchWx: getBranchWuxing(branch) },
      }
    })
  }
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

function buildLiuyueItems(result, periods) {
  const dayStem = result.pillars.day.stem
  const items = []
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i]
    const stem = p.ganzhi.charAt(0)
    const branch = p.ganzhi.charAt(1)
    const ss = getShiShen(dayStem, stem)
    const s = p.start
    items.push({
      key: 'ly' + i,
      lines: [
        { text: p.ganzhi, cls: 'tp-small' },
        { text: `${p.name} ${s.getMonth()}-${s.getDay()}`, cls: 'tp-small tp-faint' },
        { text: stem, wx: getStemWuxing(stem), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        { text: branch, wx: getBranchWuxing(branch), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
      ],
      colData: { stem, branch, ganzhi: p.ganzhi, shishen: ss, stemWx: getStemWuxing(stem), branchWx: getBranchWuxing(branch) },
    })
  }
  return items
}

function buildLiuriItems(result, period) {
  const dayStem = result.pillars.day.stem
  const items = []
  let cur = period.start
  const endYmd = period.end.toYmd()
  let dayIdx = 0
  while (cur.toYmd() < endYmd) {
    const lunar = cur.getLunar()
    const dGZ = lunar.getDayInGanZhi()
    const stem = dGZ.charAt(0)
    const branch = dGZ.charAt(1)
    const ss = getShiShen(dayStem, stem)
    items.push({
      key: 'lr' + dayIdx,
      lines: [
        { text: String(cur.getDay()), cls: 'tp-small' },
        { text: lunar.getDayInChinese(), cls: 'tp-small tp-faint' },
        { text: stem, wx: getStemWuxing(stem), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
        { text: branch, wx: getBranchWuxing(branch), ss: SHI_SHEN_ABBR[ss] || ss, cls: 'tp-ganzhi' },
      ],
      colData: { stem, branch, ganzhi: dGZ, shishen: ss, stemWx: getStemWuxing(stem), branchWx: getBranchWuxing(branch) },
    })
    dayIdx++
    cur = cur.nextDay(1)
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

  const xiaoyunItems = buildXiaoyunItems(result)

  let liunianItems
  if (ps.showXiaoyun && xiaoyunItems.length > 0) {
    liunianItems = buildLiunianItems(result, ps.dayunIdx, xiaoyunItems.map(i => i.year))
  } else {
    liunianItems = buildLiunianItems(result, ps.dayunIdx)
  }
  const xiaoyunYears = xiaoyunItems.map(i => i.year)
  const firstLnYear = xiaoyunYears.length > 0 ? Math.min(xiaoyunYears[0], parseInt(liunianItems[0].lines[0].text)) : parseInt(liunianItems[0].lines[0].text)
  const lastLnYear = parseInt(liunianItems[liunianItems.length - 1].lines[0].text)
  if (!ps.liunianYear || ps.liunianYear < firstLnYear || ps.liunianYear > lastLnYear) {
    ps.liunianYear = firstLnYear
  }

  const periods = getJiePeriods(ps.liunianYear)
  const liuyueItems = buildLiuyueItems(result, periods)
  function getPeriodIdxByDate(date) {
    const ymd = Solar.fromDate(date).toYmd()
    return periods.findIndex(p => ymd >= p.start.toYmd() && ymd < p.end.toYmd())
  }
  if (periods.length > 0) {
    if (ps.liuyueIdx < 0 || ps.liuyueIdx >= periods.length) {
      const idx = getPeriodIdxByDate(now)
      ps.liuyueIdx = idx >= 0 ? idx : 0
    }
  }

  const curPeriod = periods.length > 0 ? (periods[ps.liuyueIdx] || periods[0]) : null
  const liuriItems = curPeriod ? buildLiuriItems(result, curPeriod) : []
  if (curPeriod && (ps.liuriDay < 1 || ps.liuriDay > liuriItems.length)) {
    const startDt = new Date(curPeriod.start.getYear(), curPeriod.start.getMonth() - 1, curPeriod.start.getDay())
    const nowDt = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diff = Math.round((nowDt - startDt) / 86400000)
    ps.liuriDay = diff >= 0 && diff < liuriItems.length ? diff + 1 : 1
  }

  const selDt = curPeriod
    ? new Date(curPeriod.start.getYear(), curPeriod.start.getMonth() - 1, curPeriod.start.getDay() + ps.liuriDay - 1)
    : now
  const selSolar = Solar.fromDate(selDt)
  const liushiItems = buildLiushiItems(result, selSolar.getYear(), selSolar.getMonth(), selSolar.getDay())

  function renderTpRow(containerId, items, activeKey, label, onClick) {
    const row = document.querySelector(`[data-level="${label}"]`)
    if (!row) return
    const content = row.querySelector('.tp-content')
    if (!content) return
    const activeIdx = typeof activeKey === 'number' ? activeKey : items.findIndex(i => i.key === activeKey)
    content.innerHTML = items.map((item, idx) => tpItemHtml(item, idx === activeIdx)).join('')
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
  const lyActive = ps.liuyueIdx

  function renderDayunRow() {
    const row = document.querySelector('[data-level="dayun"]')
    if (!row) return
    const content = row.querySelector('.tp-content')
    if (!content) return
    const dyIdx = dayunItems.findIndex(i => i.idx === ps.dayunIdx)
    let html = ''
    if (xiaoyunItems.length > 0) {
      const xyFirst = xiaoyunItems[0].year
      const xyAgeEnd = xiaoyunItems.length - 1
      html += `<div class="tp-item tp-item-xy${ps.showXiaoyun ? ' tp-item-active' : ''}" data-key="xy">`
      html += `<div class="tp-small">${xyFirst}年</div>`
      html += `<div class="tp-small">0~${xyAgeEnd}岁</div>`
      html += `<div class="tp-line"><span class="tp-xy-text">小</span></div>`
      html += `<div class="tp-line"><span class="tp-xy-text">运</span></div>`
      html += `</div>`
    }
    html += dayunItems.map((item, idx) => tpItemHtml(item, idx === dyIdx)).join('')
    content.innerHTML = html
    content.querySelectorAll('.tp-item').forEach((el, idx) => {
      const isXy = el.dataset.key === 'xy'
      el.addEventListener('click', function (e) {
        e.stopPropagation()
          if (isXy) {
            ps.showXiaoyun = !ps.showXiaoyun
            if (ps.showXiaoyun && xiaoyunItems.length > 0) {
              ps.liunianYear = xiaoyunItems[0].year
            }
            ps.liuyueIdx = getPeriodIdxByDate(new Date())
            ps.showLiuyue = false
            ps.showLiuri = false
            ps.showLiushi = false
          } else {
            ps.showXiaoyun = false
            ps.dayunIdx = dayunItems[idx - (xiaoyunItems.length > 0 ? 1 : 0)].idx
            ps.liunianYear = result.input.year + result.dayun.startAge + ps.dayunIdx * 10
            ps.liuyueIdx = getPeriodIdxByDate(new Date())
            ps.showLiuyue = false
            ps.showLiuri = false
            ps.showLiushi = false
        }
        renderTimePanel(result)
        updateMainTable(result)
      })
    })
  }
  renderDayunRow()

  renderTpRow('', liunianItems, lnActive, 'liunian', (idx) => {
    ps.liunianYear = parseInt(liunianItems[idx].lines[0].text)
    ps.liuyueIdx = getPeriodIdxByDate(new Date())
    ps.showLiuyue = false
    ps.showLiuri = false
    ps.showLiushi = false
    renderTimePanel(result)
    updateMainTable(result)
  })

  renderTpRow('', liuyueItems, lyActive, 'liuyue', (idx) => {
    ps.liuyueIdx = idx
    ps.showLiuyue = true
    renderTimePanel(result)
    updateMainTable(result)
  })

  renderTpRow('', liuriItems, ps.liuriDay - 1, 'liuri', (idx) => {
    ps.liuriDay = idx + 1
    ps.showLiuri = true
    renderTimePanel(result)
    updateMainTable(result)
  })

  renderTpRow('', liushiItems, ps.liushiIdx, 'liushi', (idx) => {
    ps.liushiIdx = idx
    ps.showLiushi = true
    renderTimePanel(result)
    updateMainTable(result)
  })

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

  if (ps.showLiushi && ps.liushiItemsCache) {
    const item = ps.liushiItemsCache[ps.liushiIdx]
    if (item) extraCols.push({ key: 'extra_liushi', label: '流时', data: buildTpColData(item, dayStem, pillars) })
  }
  if (ps.showLiuri && ps.liuriItemsCache) {
    const item = ps.liuriItemsCache[ps.liuriDay - 1]
    if (item) extraCols.push({ key: 'extra_liuri', label: '流日', data: buildTpColData(item, dayStem, pillars) })
  }
  if (ps.showLiuyue && ps.liuyueItemsCache) {
    const item = ps.liuyueItemsCache[ps.liuyueIdx]
    if (item) extraCols.push({ key: 'extra_liuyue', label: '流月', data: buildTpColData(item, dayStem, pillars) })
  }

  renderMainTable(result, extraCols, ps.dayunIdx, ps.liunianYear)
}

/* ===== 兼容旧引用 ===== */
function switchTimeView() {}
function renderTimeContent() {}
function renderLiuNian() {}
