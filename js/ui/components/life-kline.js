function renderLifeKLine(result) {
  const card = document.getElementById('lifeKLineCard')
  const container = document.getElementById('lifeKLineContent')
  if (!card || !container) return
  if (!result.dayun || !result.dayun.periods || result.dayun.periods.length === 0) { card.style.display = 'none'; return }

  card.style.display = 'block'

  const dayStem = result.pillars.day.stem
  const periods = result.dayun.periods.map(d => {
    const stemWx = getStemWuxing(d.stem)
    const branchWx = getBranchWuxing(d.branch)
    const relation = getStemRelation(dayStem, d.stem)
    let baseScore = 0
    switch (relation) {
      case '比': baseScore = 60; break
      case '印': baseScore = 70; break
      case '食': baseScore = 40; break
      case '财': baseScore = 10; break
      case '官': baseScore = -20; break
      case '杀': baseScore = -40; break
    }
    const branchRelation = getBranchRelation(dayStem, d.branch)
    baseScore += branchRelation
    const volatility = 20 + Math.abs(baseScore) * 0.3
    const [ageStart, ageEnd] = d.ageRange.split('-').map(Number)
    return {
      ageStart, ageEnd,
      stem: d.stem,
      branch: d.branch,
      stemWx, branchWx,
      relation,
      score: Math.max(-100, Math.min(100, Math.round(baseScore))),
      open: Math.max(-100, Math.min(100, Math.round(baseScore + volatility))),
      close: Math.max(-100, Math.min(100, Math.round(baseScore - volatility))),
      high: Math.max(-100, Math.min(100, Math.round(baseScore + volatility * 1.5))),
      low: Math.max(-100, Math.min(100, Math.round(baseScore - volatility * 1.5))),
      isGood: baseScore >= 0,
    }
  })

  container.innerHTML = ''
  const canvas = document.createElement('canvas')
  canvas.id = 'lifeKLineCanvas'
  canvas.style.width = '100%'
  container.appendChild(canvas)
  setTimeout(() => drawLifeKLine('lifeKLineCanvas', periods), 50)
}

function getBranchRelation(dayStem, branch) {
  const branchStems = {
    '子':['癸'],'丑':['己','癸','辛'],'寅':['甲','丙','戊'],'卯':['乙'],
    '辰':['戊','乙','癸'],'巳':['丙','庚','戊'],'午':['丁','己'],
    '未':['己','丁','乙'],'申':['庚','壬','戊'],'酉':['辛'],
    '戌':['戊','辛','丁'],'亥':['壬','甲'],
  }
  const hidden = branchStems[branch] || []
  let score = 0
  for (const s of hidden) {
    const r = getStemRelation(dayStem, s)
    if (r === '比' || r === '印') score += 5
    else if (r === '官' || r === '杀') score -= 5
    else if (r === '财') score += 0
    else if (r === '食') score += 2
  }
  return score
}

function drawLifeKLine(canvasId, periods) {
  const canvas = document.getElementById(canvasId)
  if (!canvas || periods.length === 0) return
  const rect = canvas.parentElement.getBoundingClientRect()
  const W = Math.max(rect.width - 20, 200)
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
    ctx.beginPath()
    ctx.moveTo(pad.left, yy)
    ctx.lineTo(W - pad.right, yy)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = textColor
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(String(y), pad.left - 4, yy + 3)
  }

  const step = cw / periods.length
  const midY = pad.top + ch / 2

  periods.forEach((p, i) => {
    const x = pad.left + i * step + step * 0.5
    const candleW = Math.max(step * 0.6, 8)
    const halfW = candleW / 2

    const openY = midY - (p.open / 100) * (ch / 2)
    const closeY = midY - (p.close / 100) * (ch / 2)
    const highY = midY - (p.high / 100) * (ch / 2)
    const lowY = midY - (p.low / 100) * (ch / 2)

    const color = p.isGood ? '#c62828' : '#1565c0'

    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x, highY)
    ctx.lineTo(x, lowY)
    ctx.stroke()

    ctx.fillStyle = color
    const bodyTop = Math.min(openY, closeY)
    const bodyBot = Math.max(openY, closeY)
    const bodyH = Math.max(bodyBot - bodyTop, 2)
    ctx.fillRect(x - halfW, bodyTop, candleW, bodyH)

    ctx.fillStyle = textColor
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${p.ageStart}-${p.ageEnd}岁`, x, pad.top + ch + 14)

    ctx.fillStyle = textColor
    ctx.font = '9px sans-serif'
    ctx.fillText(`${p.stem}${p.branch}`, x, pad.top + ch + 26)
  })
}
