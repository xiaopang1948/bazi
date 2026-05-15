// 运势报告生成

function generateReport(result) {
  const p = result.pattern;
  const d = result.details;
  const w = result.wuxingCount;
  const gender = result.input.gender === 'male' ? '男' : '女';
  const name = result.input.name || '未知';
  const birth = `${result.input.year}年${result.input.month}月${result.input.day}日 ${String(result.input.hour).padStart(2,'0')}:${String(result.input.minute).padStart(2,'0')}`;

  // 五行统计文本
  const wxText = Object.entries(w)
    .sort((a, b) => b[1] - a[1])
    .map(([wx, c]) => `${wx}: ${c}`)
    .join('，');

  // 大运
  const dayunText = result.dayun.periods.map(p => `${p.ageRange}岁 ${p.ganzhi}`).join(' → ');

  // 调候用神
  const tiaoHouText = result.tiaoHou ? `${result.tiaoHou.yong}（${result.tiaoHou.desc}）` : '无特殊调候';

  // 特殊格局
  const specialText = result.specialPatterns?.length
    ? result.specialPatterns.map(s => s.name).join('、')
    : '无';

  // 流年
  const ly = result.liuNian;
  const liuNianText = `${ly.year}年 ${ly.ganzhi}（${ly.shishenTianGan}）`;

  // 神煞
  const allStars = new Set();
  for (const key of ['year','month','day','hour']) {
    for (const s of d[key].stars) allStars.add(s.name);
  }
  const starsText = allStars.size > 0 ? Array.from(allStars).join('、') : '无';

  return `【命 造】${name} · ${gender}
【出生时间】${birth}
【八　　字】${d.year.ganzhi} ${d.month.ganzhi} ${d.day.ganzhi} ${d.hour.ganzhi}
【胎元命宫】胎元 ${result.extraPillars.taiYuan.ganzhi} · 命宫 ${result.extraPillars.mingGong.ganzhi} · 身宫 ${result.extraPillars.shenGong.ganzhi}
【五行统计】${wxText}
【格　　局】${p.isStrong} · 用神 ${p.yongShen} · 忌神 ${p.jiShen}
【调候用神】${tiaoHouText}
【特殊格局】${specialText}
【神　　煞】${starsText}
【大　　运】${result.dayun.direction} · 起运 ${result.dayun.startAge}岁
${dayunText}
【当前流年】${liuNianText}

--- 以上内容由八字排盘生成，仅供娱乐参考 ---`;
}

function renderReport(result) {
  const card = document.getElementById('reportCard');
  const container = document.getElementById('reportContent');
  if (!card) return;
  card.style.display = 'block';
  const text = generateReport(result);
  container.textContent = text;
}

function copyReport() {
  const container = document.getElementById('reportContent');
  if (!container) return;
  navigator.clipboard.writeText(container.textContent).then(() => {
    const btn = document.querySelector('.copy-report-btn');
    if (btn) { btn.textContent = '✅ 已复制'; setTimeout(() => { btn.textContent = '📋 复制报告'; }, 2000); }
  }).catch(() => {
    alert('复制失败，请手动选择文本复制');
  });
}
