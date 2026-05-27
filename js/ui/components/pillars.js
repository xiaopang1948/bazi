const ZODIAC_EMOJI = { '子':'🐭','丑':'🐮','寅':'🐯','卯':'🐰','辰':'🐲','巳':'🐍','午':'🐴','未':'🐑','申':'🐵','酉':'🐔','戌':'🐶','亥':'🐷' }
const ZODIAC_NAME = { '子':'鼠','丑':'牛','寅':'虎','卯':'兔','辰':'龙','巳':'蛇','午':'马','未':'羊','申':'猴','酉':'鸡','戌':'狗','亥':'猪' }
const SHI_SHEN_ABBR = {
  '正印':'印', '偏印':'偏',
  '正官':'官', '七杀':'杀',
  '正财':'财', '偏财':'才',
  '食神':'食', '伤官':'伤',
  '比肩':'比', '劫财':'劫',
}

function formatSolar(y, m, d, h, min) {
  return `${y}年${m}月${d}日 ${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`
}

function renderInfoBar(name, result) {
  const r = result
  const displayName = name || '未知'
  const genderLabel = r.input.gender === 'male' ? '乾造' : '坤造'
  const branch = r.details.year.branch
  const emoji = ZODIAC_EMOJI[branch] || '?'
  const animalName = ZODIAC_NAME[branch] || '?'

  const lunarDate = r.lunarDate || '计算失败'
  const solarDate = formatSolar(r.input.year, r.input.month, r.input.day, r.input.hour, r.input.minute)

  document.getElementById('infoBar').innerHTML = `
    <div class="info-avatar" title="${branch}·${animalName}">${emoji}</div>
    <div class="info-details">
      <div class="info-row info-row-name"><span class="info-name">${displayName}</span><span class="info-gender">${genderLabel}</span></div>
      <div class="info-row">农历：${lunarDate}</div>
      <div class="info-row">阳历：${solarDate}</div>
    </div>
  `
}

/* ===== 空亡计算 ===== */
function calcXunKong(ganzhi) {
  const s = STEMS.indexOf(ganzhi[0])
  const b = BRANCHES.indexOf(ganzhi[1])
  return BRANCHES[(b - s + 10) % 12] + BRANCHES[(b - s + 11) % 12]
}

/* ===== 当前大运 ===== */
function getCurrentDayun(result) {
  const currentYear = new Date().getFullYear()
  const age = currentYear - result.input.year
  const startAge = result.dayun.startAge
  const idx = Math.max(0, Math.min(7, Math.floor((age - startAge) / 10)))
  return { index: idx, data: result.dayun.periods[idx] }
}

/* ===== 构建列数据 ===== */
function buildColData(raw, dayStem, pillars, colKey) {
  const stem = raw.stem, branch = raw.branch
  const ganzhi = raw.ganzhi || stem + branch
  const stemWx = getStemWuxing(stem)
  const branchWx = getBranchWuxing(branch)
  const hiddenStems = getHiddenStems(branch)
  const len = hiddenStems.length
  const order = len === 3 ? [0, 2, 1] : len === 2 ? [1, 0] : [0]
  const orderedHidden = order.map(i => ({
    stem: hiddenStems[i],
    wuxing: getStemWuxing(hiddenStems[i]),
    shishen: getShiShen(dayStem, hiddenStems[i]),
  }))
  return {
    stem, branch, ganzhi, shishen: raw.shishen,
    stemWx, branchWx,
    hidden: orderedHidden,
    changSheng: getShiErChangSheng(dayStem, branch),
    ziZuo: getShiErChangSheng(stem, branch),
    xunKong: calcXunKong(ganzhi),
    nayin: getNaYin(stem, branch),
    stars: getStarsForPillar(ganzhi, stem, branch, pillars),
  }
}

function renderWuxingText(result) {
  const container = document.getElementById('wuxingDesc')
  if (!container) return
  const p = result.pattern
  const t = result.tiaoHou
  if (!p) return
  const WX_CLASS = { '木':'mu','火':'huo','土':'tu','金':'jin','水':'shui' };
  const toWx = (c) => WX_CLASS[c] || (typeof getStemWuxing === 'function' && WX_CLASS[getStemWuxing(c)]) || (typeof getBranchWuxing === 'function' && WX_CLASS[getBranchWuxing(c)]) || ''
  const wx = (s) => { if (!s) return ''; return [...s].map(c => `<span class="wx-${toWx(c)}">${c}</span>`).join('') }
  let html = `<div class="wuxing-desc-row"><span>日主五行</span><strong>${wx(p.dayStemWuxing)}</strong></div>`
  html += `<div class="wuxing-desc-row"><span>月令状态</span><strong>${p.monthPower}</strong></div>`
  html += `<div class="wuxing-desc-row"><span>综合判断</span><strong>${p.isStrong}</strong></div>`
  html += `<div class="wuxing-desc-row"><span>用神</span><strong>${wx(p.yongShen)}</strong></div>`
  html += `<div class="wuxing-desc-row"><span>忌神</span><strong>${wx(p.jiShen)}</strong></div>`
  if (t) {
    html += `<div class="wuxing-desc-row tiaohou-desc-row"><span>调候用神</span><strong>${t.yong ? wx(t.yong) : t.yong}</strong></div>`
  }
  container.innerHTML = html
}

function renderQiMing(result) {
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

function renderGuJi(result) {
  const container = document.getElementById('guJiCompact')
  const divider = document.getElementById('guJiDivider')
  if (!container) return
  const matches = calcGuJiMatches(result)
  if (matches.length === 0) return
  if (divider) divider.style.display = 'block'
  container.innerHTML = matches.map(m =>
    `<div class="gu-ji-card"><span class="gu-ji-source">${m.source}</span><span class="gu-ji-body">${m.content}</span></div>`
  ).join('')
}

function renderQiYun(result) {
  const card = document.getElementById('qiyunCard')
  if (!card) return
  card.style.display = 'block'

  const d = result.dayun
  const diffDays = d.diffDays || 0
  const totalHours = diffDays * 24

  // 3天 = 1岁, 1天 = 4个月, 1时辰(2小时) = 10天
  const qyYears = Math.floor(totalHours / 72)
  let remainHours = totalHours - qyYears * 72
  const qyMonths = Math.floor(remainHours / 6)
  remainHours -= qyMonths * 6
  const qyShichen = Math.floor(remainHours / 2)
  const qyDaysFromShichen = qyShichen * 10

  let startText = ''
  if (qyYears > 0) startText += `${qyYears}年`
  if (qyMonths > 0) startText += `${qyMonths}个月`
  if (qyDaysFromShichen > 0) startText += `${qyDaysFromShichen}天`
  if (!startText) startText = '0时'
  startText += '起运'
  document.getElementById('qiyunStart').textContent = '出生后 ' + startText

  const jieName = d.jieName || ''
  const direction = d.direction || ''
  const startYear = result.input.year + qyYears
  const startGan = STEMS[(startYear - 4) % 10]
  const jiaoText = jieName ? `${startGan}年 立春后 ${jieName}交运` : ''
  document.getElementById('qiyunJiao').textContent = jiaoText

  const currentYear = new Date().getFullYear()
  const age = currentYear - result.input.year
  document.getElementById('qiyunAge').textContent = age + '岁'
}

function renderWuxing(counts) {
  const container = document.getElementById('wuxingBars')
  const WX_CLS = { 木:'mu', 火:'huo', 土:'tu', 金:'jin', 水:'shui' }
  const colors = { 木: 'var(--wood)', 火: 'var(--fire)', 土: 'var(--earth)', 金: 'var(--metal)', 水: 'var(--water)' }
  const maxVal = Math.max(...Object.values(counts), 1)
  container.innerHTML = ''
  for (const wx of ['木', '火', '土', '金', '水']) {
    const val = counts[wx] || 0
    const pct = Math.round(val / maxVal * 100)
    container.innerHTML += `
      <div class="wuxing-bar-row">
        <div class="wuxing-bar-label"><span class="wx-${WX_CLS[wx]}">${wx}</span></div>
        <div class="wuxing-bar-track">
          <div class="wuxing-bar-fill" style="width:${pct}%;background:${colors[wx]}"></div>
        </div>
        <div class="wuxing-bar-count">${val}</div>
      </div>`
  }
}

function renderMainTable(result, extraCols = [], dayunIdx = null, liunianYear = null) {
  const WX = { '木':'mu','火':'huo','土':'tu','金':'jin','水':'shui' }
  const dayStem = result.details.day.stem
  const gender = result.input.gender
  const dayShishen = gender === 'male' ? '元男' : '元女'

  let currentDayun
  if (dayunIdx !== null) {
    currentDayun = { index: dayunIdx, data: result.dayun.periods[dayunIdx] }
  } else {
    currentDayun = getCurrentDayun(result)
  }

  let liuNianData, liuNianShishen
  if (liunianYear !== null) {
    const stem = STEMS[(liunianYear - 4) % 10]
    const branch = BRANCHES[(liunianYear - 4) % 12]
    liuNianShishen = getShiShen(dayStem, stem)
    liuNianData = { stem, branch, ganzhi: stem + branch, shishen: liuNianShishen }
  } else {
    liuNianShishen = getShiShen(dayStem, result.liuNian.stem)
    liuNianData = { ...result.liuNian, shishen: liuNianShishen }
  }
  const daYunShishen = getShiShen(dayStem, currentDayun.data.stem)
  const columns = {
    liuNian: buildColData(liuNianData, dayStem, result.pillars, 'liuNian'),
    daYun: buildColData({ ...currentDayun.data, shishen: daYunShishen }, dayStem, result.pillars, 'daYun'),
    year: buildColData({ ...result.details.year, shishen: result.details.year.shishen }, dayStem, result.pillars, 'year'),
    month: buildColData({ ...result.details.month, shishen: result.details.month.shishen }, dayStem, result.pillars, 'month'),
    day: buildColData({ ...result.details.day, shishen: dayShishen }, dayStem, result.pillars, 'day'),
    hour: buildColData({ ...result.details.hour, shishen: result.details.hour.shishen }, dayStem, result.pillars, 'hour'),
  }

  const baseKeys = ['liuNian', 'daYun', 'year', 'month', 'day', 'hour']
  const baseLabels = ['流年', '大运', '年柱', '月柱', '日柱', '时柱']
  const extraKeys = extraCols.map(c => c.key)
  const extraLabels = extraCols.map(c => c.label)
  const colKeys = [...extraKeys, ...baseKeys]
  const colLabels = [...extraLabels, ...baseLabels]
  for (const ec of extraCols) {
    columns[ec.key] = ec.data
  }
  const rows = [
    { key: 'shishen', label: '主星' },
    { key: 'stem', label: '天干' },
    { key: 'branch', label: '地支' },
    { key: 'canggan', label: '藏干' },
    { key: 'chs', label: '星运' },
    { key: 'zizuo', label: '自坐' },
    { key: 'xunkong', label: '空亡' },
    { key: 'nayin', label: '纳音' },
    { key: 'stars', label: '神煞' },
  ]

  function colHtml(col, row) {
    switch (row.key) {
      case 'shishen': return `<span class="mg-shishen">${col.shishen}</span>`
      case 'stem': return `<span class="wx-${WX[col.stemWx]||''}">${col.stem}</span>`
      case 'branch': return `<span class="wx-${WX[col.branchWx]||''}">${col.branch}</span>`
      case 'canggan':
        return col.hidden.map(h =>
          `<span class="mg-cg-item"><span class="wx-${WX[h.wuxing]||''} mg-cg-gan">${h.stem}</span><span class="mg-cg-ss">${h.shishen}</span></span>`
        ).join('')
      case 'chs': return col.changSheng
      case 'zizuo': return col.ziZuo
      case 'xunkong': return col.xunKong
      case 'nayin': return col.nayin
      case 'stars': return col.stars.map(s => `<span class="mg-star">${s.name}</span>`).join('')
    }
  }

  function cellClass(row) {
    switch (row.key) {
      case 'stem': case 'branch': return 'mg-cell-ganzhi'
      case 'canggan': return 'mg-cell-cg'
      case 'stars': return 'mg-cell-star'
      default: return ''
    }
  }

  let html = `<div class="mg-row mg-row-hd">`
  html += `<div class="mg-cell mg-cell-label">日期</div>`
  for (const label of colLabels) {
    html += `<div class="mg-cell mg-cell-hd">${label}</div>`
  }
  html += `</div>`

  for (const row of rows) {
    html += `<div class="mg-row mg-row-${row.key}">`
    html += `<div class="mg-cell mg-cell-label">${row.label}</div>`
    for (const key of colKeys) {
      html += `<div class="mg-cell ${cellClass(row)}">${colHtml(columns[key], row)}</div>`
    }
    html += `</div>`
  }

  const grid = document.getElementById('pillarsGrid')
  grid.style.gridTemplateColumns = `48px repeat(${colKeys.length}, 1fr)`
  grid.innerHTML = html
}
