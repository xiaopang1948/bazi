const YUNSHI = { view: 'life', dim: 'overall', result: null }

const DIM_LABELS = { overall:'综合', love:'感情', health:'健康', career:'事业', wealth:'财运' }

const DIM_WEIGHTS = {
  overall: { 正官:20, 七杀:-20, 正印:30, 偏印:20, 正财:10, 偏财:5, 食神:0, 伤官:-10, 比肩:-10, 劫财:-20 },
  love: { 正官:30, 七杀:15, 正财:30, 偏财:20, 食神:5, 伤官:-15, 比肩:-15, 劫财:-30 },
  health: { 正印:25, 偏印:20, 食神:20, 伤官:-10, 七杀:-30, 正官:-15, 劫财:-15, 比肩:-5 },
  career: { 正官:40, 七杀:25, 正印:20, 偏印:10, 正财:10, 偏财:5, 食神:0, 伤官:-5, 比肩:-10, 劫财:-20 },
  wealth: { 正财:40, 偏财:30, 食神:20, 伤官:10, 正官:-10, 七杀:-15, 比肩:-15, 劫财:-25 },
}

function getYunshiResult() {
  if (typeof lastResult !== 'undefined' && lastResult) return lastResult
  return null
}

const SHI_SHEN_QUOTES = {
  正印: { source:'《三命通会》', text:'正印者，乃五行之正库，生我者也，恩荫之浩荡也。' },
  偏印: { source:'《渊海子平》', text:'偏印者，枭神之宿，生我而带孤，智深而性僻。' },
  正官: { source:'《渊海子平》', text:'正官者，贵气之神，管束一身，权威所系。' },
  七杀: { source:'《三命通会》', text:'七杀者，与日主相克之同性，威权之象，号为偏官。' },
  正财: { source:'《渊海子平》', text:'正财者，受我克制之异性，妻财之属，稳而可守。' },
  偏财: { source:'《三命通会》', text:'偏财者，众人之财，横来之福，动而得之。' },
  食神: { source:'《渊海子平》', text:'食神者，日主所生之异性，福寿之星，安享之宿。' },
  伤官: { source:'《三命通会》', text:'伤官者，日主所生之同性，才华之象，傲物之资。' },
  比肩: { source:'《渊海子平》', text:'比肩者，与日主同，兄弟之象，同气连枝。' },
  劫财: { source:'《三命通会》', text:'劫财者，与日主异而同性，财之贼也，主破耗纷争。' },
}

const SHI_SHEN_MODERN = {
  正印: '正印是生你的天干，像母亲一样无条件给养。有正印的人生性沉稳，有贵人缘，适合在体制内或大平台发展。',
  偏印: '偏印也是生你的，但路子比较偏——聪明、孤僻、不走寻常路。适合搞研究、玄学、小众赛道，脑回路清奇是你的天赋。',
  正官: '正官是管你的，代表规则、权威、社会地位。正官旺的人正派靠谱，适合做管理、公务员，但容易给自己太大压力。',
  七杀: '七杀是克你的，但猛。七杀的人天生战士，敢闯敢拼，适合创业、军警、极限行业。缺点是脾气急，容易得罪人。',
  正财: '正财是你控制的，稳稳当当来钱。正财旺的人务实，适合做实体、稳定工作，不太适合投机。',
  偏财: '偏财也是你控制的，但来得快去得也快。偏财旺的人会搞钱，副业、投资、灰色地带的钱都敢碰，但守不住。',
  食神: '食神是你生的，代表才艺和享受。食神旺的人有品味，适合做美食、艺术、设计类工作，心态好不急不躁。',
  伤官: '伤官也是你生的，但更锋利。伤官旺的人才华外露，嘴皮子厉害，适合做创意、表演、自媒体，但容易得罪人而不自知。',
  比肩: '比肩是同辈。比肩旺的人讲义气、朋友多，适合合伙创业。但竞争也多——朋友是贵人也是对手，分钱的事得掰扯清楚。',
  劫财: '劫财也是同辈，但更狠。劫财旺的人社交能力强，但钱留不住，容易替兄弟出头买单。合作要小心，合同比酒局管用。',
}

const SHI_SHEN_YOUTH_ADVICE = {
  正印: '你这几年跟长辈、老师、靠谱的前辈关系处好了，机会自然来。别急着证明自己，先把自己泡在好的环境里。',
  偏印: '你这段时间学东西快，但心情容易自闭。多出门走走，别一个人待着瞎想。你那些奇奇怪怪的点子，说不定就是下一个风口。',
  正官: '压力是好事，说明你在被看见。但别把所有责任往自己身上扛，适当的「撂挑子」也是一种智慧。',
  七杀: '你这种不服就干的性格是天生的，但别当莽夫。想清楚再冲，能把敌人变队友才是真本事。',
  正财: '钱在向你招手。但记住，一手交钱一手交货的生意才是好生意。别信「以后再说」这种话。',
  偏财: '最近来钱的路子挺多，挑一个最稳的深耕。东一榔头西一棒槌最后什么都捞不着。',
  食神: '躺平也能赢的时期。别焦虑，你身上那些看似没用的爱好，搞不好哪天就变现了。',
  伤官: '你的输出欲很强，想表达、想被认可。但话到嘴边留三分，文字比声音更有力量。写下来，发出去。',
  比肩: '朋友多，是非也多。这期间别搞小团体，更别替别人出头。亲兄弟的事让亲兄弟自己解决。',
  劫财: '社交场上你是C位，但钱包瘪得快。买单前问自己一句：这钱值不值？',
}

const SCORE_DESC = {
  high: ['高涨', '信心满满，趁热打铁', '爆棚'],    // > 30
  mid: ['平稳', '按部就班，稳中求进', '在线'],      // 0~30
  low: ['低迷', '以守为攻，韬光养晦', '欠佳'],      // -30~0
  bad: ['严峻', '今年多长个心眼，苟住就是赢', '不给力'], // < -30
}

function scoreLevel(score) {
  if (score > 30) return 'high'
  if (score >= 0) return 'mid'
  if (score >= -30) return 'low'
  return 'bad'
}

function calcDimScore(dayStem, stem, branch, dim) {
  const ss = getShiShen(dayStem, stem)
  const w = DIM_WEIGHTS[dim] || DIM_WEIGHTS.overall
  let score = w[ss] || 0
  const hidden = { 子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','庚','戊'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲'] }
  for (const h of (hidden[branch] || [])) {
    const hss = getShiShen(dayStem, h)
    score += (w[hss] || 0) * 0.3
  }
  return Math.max(-100, Math.min(100, Math.round(score)))
}

function buildPeriods(dayStem, result, view, dim) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1, d2 = now.getDate()

  if (view === 'life') {
    const birthYear = result.input.year
    const data = []
    for (let year = birthYear; year <= birthYear + 80; year++) {
      const stem = STEMS[((year - 4) % 10 + 10) % 10]
      const branch = BRANCHES[((year - 4) % 12 + 12) % 12]
      const score = calcDimScore(dayStem, stem, branch, dim)
      data.push({ label: String(year), sub: stem + branch, score, isGood: score >= 0 })
    }
    return data
  }

  if (view === 'week') {
    const dow = now.getDay()
    const monOff = dow === 0 ? -6 : 1 - dow
    const weekDays = ['日','一','二','三','四','五','六']
    const data = []
    for (let i = 0; i < 7; i++) {
      const dt = new Date(now)
      dt.setDate(now.getDate() + monOff + i)
      const solar = Solar.fromYmd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate())
      const ganzhi = solar.getLunar().getDayInGanZhi()
      const stem = ganzhi.charAt(0), branch = ganzhi.charAt(1)
      const score = calcDimScore(dayStem, stem, branch, dim)
      data.push({ label: `周${weekDays[i]}`, sub: ganzhi, score, isGood: score >= 0 })
    }
    return data
  }

  if (view === 'year') {
    const data = calcLiuYue(dayStem, y)
    return data.map(x => {
      const score = calcDimScore(dayStem, x.stem, x.branch, dim)
      return { label: `${x.month}月`, sub: x.ganzhi, score, isGood: score >= 0 }
    })
  }
  if (view === 'month') {
    const data = calcLiuRi(dayStem, y, m, d2)
    return data.map(x => {
      const score = calcDimScore(dayStem, x.stem, x.branch, dim)
      return { label: `${x.day}日`, sub: x.ganzhi, score, isGood: score >= 0 }
    })
  }
  if (view === 'day') {
    const data = calcLiuShi(dayStem, y, m, d2)
    return data.map(x => {
      const score = calcDimScore(dayStem, x.stem, x.branch, dim)
      return { label: x.label, sub: x.ganzhi, score, isGood: score >= 0 }
    })
  }
  return []
}

function renderYunshi() {
  const result = getYunshiResult()
  if (!result) {
    document.getElementById('yunshiKLineContent').innerHTML = '<div class="ys-empty">请先在「排盘」中输入出生信息并点击排盘</div>'
    document.getElementById('yunshiReportCard').style.display = 'none'
    document.getElementById('yunshiAdviceCard').style.display = 'none'
    return
  }
  YUNSHI.result = result
  const dayStem = result.pillars.day.stem
  const periods = buildPeriods(dayStem, result, YUNSHI.view, YUNSHI.dim)

  const container = document.getElementById('yunshiKLineContent')
  container.innerHTML = ''
  const canvas = document.createElement('canvas')
  canvas.id = 'yunshiKLineCanvas'
  canvas.style.width = '100%'
  container.appendChild(canvas)
  setTimeout(() => drawYunshiKLine('yunshiKLineCanvas', periods), 50)

  renderYunshiReport(result)
  renderYunshiAdvice(result)
}

function drawYunshiKLine(canvasId, periods) {
  const canvas = document.getElementById(canvasId)
  if (!canvas || periods.length === 0) return
  const rect = canvas.parentElement.getBoundingClientRect()
  const dense = periods.length > 30
  const W = dense ? Math.max(periods.length * 22, rect.width - 20) : Math.max(rect.width - 20, 200)
  const H = 240
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const pad = { top: 20, bottom: 36, left: 40, right: 20 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom

  ctx.clearRect(0, 0, W, H)
  const isDark = document.body.classList.contains('dark-mode')
  const textColor = isDark ? '#ccc' : '#666'
  const gridColor = isDark ? '#333' : '#eee'

  for (let y = -100; y <= 100; y += 50) {
    const yy = pad.top + ch / 2 - (y / 100) * (ch / 2)
    ctx.strokeStyle = y === 0 ? (isDark ? '#555' : '#ccc') : gridColor
    ctx.lineWidth = y === 0 ? 1.5 : 0.5
    ctx.setLineDash(y === 0 ? [] : [3, 3])
    ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(W - pad.right, yy); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = textColor; ctx.font = '10px sans-serif'; ctx.textAlign = 'right'
    ctx.fillText(String(y), pad.left - 4, yy + 3)
  }

  const step = cw / periods.length
  const midY = pad.top + ch / 2
  const labelStep = dense ? Math.ceil(periods.length / 15) : 1

  periods.forEach((p, i) => {
    const x = pad.left + i * step + step * 0.5
    const candleW = Math.max(step * 0.6, 4)
    const halfW = candleW / 2
    const volatility = 20 + Math.abs(p.score) * 0.3
    const open = Math.max(-100, Math.min(100, p.score + volatility))
    const close = Math.max(-100, Math.min(100, p.score - volatility))
    const high = Math.max(-100, Math.min(100, p.score + volatility * 1.5))
    const low = Math.max(-100, Math.min(100, p.score - volatility * 1.5))

    const oy = midY - (open / 100) * (ch / 2)
    const cy = midY - (close / 100) * (ch / 2)
    const hy = midY - (high / 100) * (ch / 2)
    const ly = midY - (low / 100) * (ch / 2)

    const color = p.isGood ? '#c62828' : '#2e7d32'
    ctx.strokeStyle = color; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, ly); ctx.stroke()

    ctx.fillStyle = color
    const bodyTop = Math.min(oy, cy)
    const bodyBot = Math.max(oy, cy)
    const bodyH = Math.max(bodyBot - bodyTop, 2)
    ctx.fillRect(x - halfW, bodyTop, candleW, bodyH)

    if (i % labelStep === 0) {
      ctx.fillStyle = textColor; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(p.label, x, pad.top + ch + 14)
      ctx.font = '9px sans-serif'
      ctx.fillText(p.sub, x, pad.top + ch + 26)
    }
  })
}

function renderYunshiReport(result) {
  const card = document.getElementById('yunshiReportCard')
  const container = document.getElementById('yunshiReportContent')
  if (!card || !container) return
  card.style.display = 'block'

  const dayStem = result.pillars.day.stem
  const dayGZ = result.pillars.day.ganzhi
  const dimLabel = DIM_LABELS[YUNSHI.dim] || '综合'
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate()

  const currentDY = getCurrentDayun(result)
  const currentLN = result.liuNian

  const curMonth = result.liuYue.find(x => x.month === m) || result.liuYue[0]
  const curDay = result.liuRi.find(x => x.day === d) || result.liuRi[0]
  const shiIdx = Math.floor((now.getHours() + 1) / 2) % 12
  const curShi = result.liuShi[shiIdx]

  const dyScore = calcDimScore(dayStem, currentDY.data.stem, currentDY.data.branch, YUNSHI.dim)
  const lnScore = calcDimScore(dayStem, currentLN.stem, currentLN.branch, YUNSHI.dim)
  const monthScore = calcDimScore(dayStem, curMonth.stem, curMonth.branch, YUNSHI.dim)
  const dayScore = calcDimScore(dayStem, curDay.stem, curDay.branch, YUNSHI.dim)
  const shiScore = calcDimScore(dayStem, curShi.stem, curShi.branch, YUNSHI.dim)

  const dySS = getShiShen(dayStem, currentDY.data.stem)
  const lnSS = getShiShen(dayStem, currentLN.stem)
  const monthSS = getShiShen(dayStem, curMonth.stem)
  const daySS = getShiShen(dayStem, curDay.stem)
  const shiSS = getShiShen(dayStem, curShi.stem)

  let html = `<div class="ys-report">`

  html += buildReportSection('当前流时', `${curShi.label}（${curShi.timeRange}）`, shiScore, dimLabel, shiSS, dayStem, 'shi')
  html += buildReportSection('当前流日', `${curDay.day}日（${curDay.ganzhi}）`, dayScore, dimLabel, daySS, dayStem, 'day')
  html += buildReportSection('当前流月', `${curMonth.month}月（${curMonth.ganzhi}）`, monthScore, dimLabel, monthSS, dayStem, 'month')
  html += buildReportSection('当前流年', `${currentLN.year}年（${currentLN.ganzhi}）`, lnScore, dimLabel, lnSS, dayStem, 'year')
  html += buildReportSection('当前大运', `${currentDY.data.ageRange}（${currentDY.data.stem}${currentDY.data.branch}）`, dyScore, dimLabel, dySS, dayStem, 'dayun')

  html += `<div class="ys-report-section ys-section-advice"><div class="ys-report-title">综合建议</div>`
  html += `<div class="ys-report-body">${buildAdvice(result, dyScore, lnScore, dySS, lnSS)}</div></div>`

  html += `</div>`
  container.innerHTML = html
}

function colorizeGanzhi(s) {
  if (!s) return ''
  const WX_CLASS = { '木':'mu','火':'huo','土':'tu','金':'jin','水':'shui' }
  const toWx = (c) => WX_CLASS[c] || (typeof getStemWuxing === 'function' && WX_CLASS[getStemWuxing(c)]) || (typeof getBranchWuxing === 'function' && WX_CLASS[getBranchWuxing(c)]) || ''
  return [...s].map(c => {
    const cls = toWx(c)
    return cls ? `<span class="wx-${cls}">${c}</span>` : c
  }).join('')
}

function buildReportSection(title, subtitle, score, dimLabel, ss, dayStem, type) {
  const level = scoreLevel(score)
  const sl = SCORE_DESC[level]
  const good = score >= 0
  const q = SHI_SHEN_QUOTES[ss]
  const modern = SHI_SHEN_MODERN[ss]
  const youth = SHI_SHEN_YOUTH_ADVICE[ss]

  let body = `<div class="ys-report-score ${good ? 'ys-score-up' : 'ys-score-down'}">${dimLabel}运势指数：${score > 0 ? '+' : ''}${score}（${sl[0]}）</div>`
  body += `<div class="ys-report-detail">`
  body += `日主${colorizeGanzhi(dayStem)}遇天干${colorizeGanzhi(ss)}。`
  if (q) body += ` ${q.source}云：「${colorizeGanzhi(q.text)}」`
  body += `</div>`
  body += `<div class="ys-report-detail">${colorizeGanzhi(modern)}</div>`
  body += `<div class="ys-report-advice">${colorizeGanzhi(youth)}</div>`

  return `<div class="ys-report-section"><div class="ys-report-title">${title}（${subtitle}）</div>${body}</div>`
}

function buildAdvice(result, dyScore, lnScore, dySS, lnSS) {
  const tips = []
  const dyLevel = scoreLevel(dyScore), lnLevel = scoreLevel(lnScore)

  tips.push(`【十年大运】当前${dySS}运。${SHI_SHEN_YOUTH_ADVICE[dySS] || ''}`)
  tips.push(`【流年】今年${lnSS}之年。${SHI_SHEN_YOUTH_ADVICE[lnSS] || ''}`)

  if (dyLevel === 'high' && lnLevel === 'high') tips.push('🔥 双红行情！大运和流年都在高位，可以大胆冲锋，今年是你大展拳脚的年份。')
  else if (dyLevel === 'high' && lnLevel === 'low') tips.push('⚡ 大运好但流年有点坎坷，步子别迈太大，抓得住的机会才是真机会。')
  else if (dyLevel === 'low' && lnLevel === 'high') tips.push('🌤️ 大运一般但流年还行，这一年适合做短线规划和执行，别想太远的事。')
  else if (dyLevel === 'low' && lnLevel === 'low') tips.push('🧘 双重压力期，别硬扛。减少不必要的社交和投资，把精力放在自我提升上。')
  else if (dyLevel === 'high' || lnLevel === 'high') tips.push('📈 整体向上，乘势而为。遇到机会别犹豫，速度比完美更重要。')
  else tips.push('🌊 稳一稳，不着急。这段时间适合打磨自己，好事多磨。')

  return `<ul class="ys-advice-list">${tips.map((t, i) => i === tips.length - 1 ? `<li class="ys-advice-final"><strong>${t}</strong></li>` : `<li>${t}</li>`).join('')}</ul>`
}

function renderYunshiAdvice(result) {
  const card = document.getElementById('yunshiAdviceCard')
  const container = document.getElementById('yunshiAdviceContent')
  if (!card || !container) return
  card.style.display = 'none'
}

function buildDailyAdvice() {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate()
  const solar = Solar.fromYmd(y, m, d)
  const lunar = solar.getLunar()
  const yi = lunar.getDayYi()
  const ji = lunar.getDayJi()
  let html = `<div class="ys-day-info"><span class="ys-day-gz">${lunar.getDayInGanZhi()}日</span>`
  html += `<span class="ys-day-lunar">农历${lunar.getMonth()}月${lunar.getDay()}</span></div>`
  html += `<div class="ys-yi-ji"><div class="ys-yi"><span class="ys-yi-ji-label">宜</span><span>${yi.join('、') || '无'}</span></div>`
  html += `<div class="ys-ji"><span class="ys-yi-ji-label">忌</span><span>${ji.join('、') || '无'}</span></div></div>`
  return html
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.ys-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.ys-btn[data-view]').forEach(b => b.classList.remove('active'))
      this.classList.add('active')
      YUNSHI.view = this.dataset.view
      renderYunshi()
    })
  })
  document.querySelectorAll('.ys-btn[data-dim]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.ys-btn[data-dim]').forEach(b => b.classList.remove('active'))
      this.classList.add('active')
      YUNSHI.dim = this.dataset.dim
      renderYunshi()
    })
  })
})
