const BRANCH_LIUHE = { '子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午' }
const BRANCH_SANHE = { '申':1,'子':1,'辰':1, '亥':1,'卯':1,'未':1, '寅':1,'午':1,'戌':1, '巳':1,'酉':1,'丑':1 }
const BRANCH_CHONG = { '子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳' }
const BRANCH_XING = { '子':'卯','卯':'子','寅':'巳','巳':'申','申':'寅','丑':'戌','戌':'未','未':'丑','辰':'辰','午':'午','酉':'酉','亥':'亥' }

function isSanHe(b1, b2) {
  for (const group of [['申','子','辰'],['亥','卯','未'],['寅','午','戌'],['巳','酉','丑']]) {
    if (group.includes(b1) && group.includes(b2)) return true
  }
  return false
}

function calcDailyScore(birthStem, birthDayGZ, solarDate) {
  const lunar = solarDate.getLunar()
  const dayGZ = lunar.getDayInGanZhi()
  const dayStem = dayGZ[0]
  const dayBranch = dayGZ[1]

  let score = 50
  const relation = getStemRelation(birthStem, dayStem)
  switch (relation) {
    case '比': score += 10; break
    case '印': score += 35; break
    case '食': score += 15; break
    case '财': score -= 5; break
    case '官': score -= 20; break
    case '杀': score -= 25; break
  }

  const birthBranch = birthDayGZ[1]
  if (BRANCH_LIUHE[birthBranch] === dayBranch) score += 15
  else if (isSanHe(birthBranch, dayBranch)) score += 10
  if (BRANCH_CHONG[birthBranch] === dayBranch) score -= 20
  if (BRANCH_XING[birthBranch] === dayBranch || BRANCH_XING[dayBranch] === birthBranch) score -= 10

  return Math.max(0, Math.min(100, Math.round(score)))
}

function getStemRelation(a, b) {
  const wxA = getStemWuxing(a)
  const wxB = getStemWuxing(b)
  if (wxA === wxB) return '比'
  const sheng = { '木':'火','火':'土','土':'金','金':'水','水':'木' }
  const ke = { '木':'土','土':'水','水':'火','火':'金','金':'木' }
  if (sheng[wxA] === wxB) return '食'
  if (sheng[wxB] === wxA) return '印'
  if (ke[wxA] === wxB) return '财'
  if (ke[wxB] === wxA) return '官'
  return ''
}

function calcWeeklyScores(birthStem, birthDayGZ, centerDate) {
  const days = []
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(centerDate)
    d.setDate(d.getDate() + offset)
    const solar = Solar.fromDate(d)
    const score = calcDailyScore(birthStem, birthDayGZ, solar)
    days.push({ date: d, score, label: `${d.getMonth()+1}/${d.getDate()}` })
  }
  return days
}

function drawWeeklyTrend(canvasId, scores) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const rect = canvas.parentElement.getBoundingClientRect()
  const W = rect.width - 20
  const H = 200
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const pad = { top: 20, bottom: 30, left: 40, right: 20 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom

  ctx.clearRect(0, 0, W, H)

  const isDark = document.body.classList.contains('dark-mode')
  const textColor = isDark ? '#ccc' : '#666'
  const gridColor = isDark ? '#333' : '#eee'
  const lineColor = '#b8860b'
  const fillColor = 'rgba(184,134,11,0.12)'
  const dotColor = '#b8860b'
  const baseLineColor = isDark ? '#555' : '#ddd'

  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  for (let y = 0; y <= 4; y++) {
    const yy = pad.top + (ch / 4) * y
    ctx.beginPath()
    ctx.moveTo(pad.left, yy)
    ctx.lineTo(W - pad.right, yy)
    ctx.stroke()
    ctx.fillStyle = textColor
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(String(100 - y * 25), pad.left - 6, yy + 4)
  }

  ctx.strokeStyle = baseLineColor
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  const midY = pad.top + ch / 2
  ctx.moveTo(pad.left, midY)
  ctx.lineTo(W - pad.right, midY)
  ctx.stroke()
  ctx.setLineDash([])

  const step = cw / (scores.length - 1)
  const points = scores.map((s, i) => ({
    x: pad.left + i * step,
    y: pad.top + ch - (s.score / 100) * ch,
    score: s.score,
    label: s.label,
  }))

  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch)
  grad.addColorStop(0, fillColor)
  grad.addColorStop(1, 'transparent')
  ctx.beginPath()
  ctx.moveTo(points[0].x, pad.top + ch)
  for (const p of points) ctx.lineTo(p.x, p.y)
  ctx.lineTo(points[points.length-1].x, pad.top + ch)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()

  ctx.strokeStyle = lineColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
  ctx.stroke()

  const todayIdx = scores.findIndex(d => {
    const now = new Date(); return d.date.getDate() === now.getDate() && d.date.getMonth() === now.getMonth()
  })
  for (let i = 0; i < points.length; i++) {
    ctx.beginPath()
    ctx.arc(points[i].x, points[i].y, i === todayIdx ? 5 : 3, 0, Math.PI * 2)
    ctx.fillStyle = i === todayIdx ? '#c62828' : dotColor
    ctx.fill()
  }

  for (const p of points) {
    ctx.fillStyle = textColor
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(p.label, p.x, pad.top + ch + 16)
    ctx.fillText(p.score, p.x, p.y - 10)
  }
}

function renderWeeklyTrend(result) {
  const container = document.getElementById('weekTrendContent')
  const nav = document.getElementById('weekTrendNav')
  if (!container || !nav) return

  const dayStem = result.pillars.day.stem
  const dayGZ = result.pillars.day.stem + result.pillars.day.branch
  const now = new Date()
  const offset = parseInt(container.dataset.weekOffset || '0')
  const center = new Date(now)
  center.setDate(center.getDate() + offset * 7)

  const scores = calcWeeklyScores(dayStem, dayGZ, center)
  container.innerHTML = ''
  const canvasId = 'weeklyTrendCanvas'
  const canvas = document.createElement('canvas')
  canvas.id = canvasId
  canvas.style.width = '100%'
  container.appendChild(canvas)

  setTimeout(() => drawWeeklyTrend(canvasId, scores), 50)

  nav.innerHTML = ''
  const prev = document.createElement('button')
  prev.className = 'time-btn'
  prev.textContent = '‹ 上周'
  prev.onclick = () => { container.dataset.weekOffset = String(offset - 1); renderWeeklyTrend(result) }
  const title = document.createElement('span')
  title.style.cssText = 'font-size:13px;font-weight:600;padding:0 12px'
  const weekStart = new Date(center); weekStart.setDate(center.getDate() - 3)
  const weekEnd = new Date(center); weekEnd.setDate(center.getDate() + 3)
  title.textContent = `${weekStart.getMonth()+1}/${weekStart.getDate()} - ${weekEnd.getMonth()+1}/${weekEnd.getDate()}`
  const next = document.createElement('button')
  next.className = 'time-btn'
  next.textContent = '下周 ›'
  next.onclick = () => { container.dataset.weekOffset = String(offset + 1); renderWeeklyTrend(result) }
  nav.appendChild(prev)
  nav.appendChild(title)
  nav.appendChild(next)
}
