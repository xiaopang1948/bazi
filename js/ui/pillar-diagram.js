// 智能四柱图示 — Canvas 绘制干支流通生克

const PILLAR_COLORS = {
  year: { bg: 'rgba(46,125,50,0.12)', border: '#2e7d32', label: '年·祖上' },
  month: { bg: 'rgba(198,40,40,0.12)', border: '#c62828', label: '月·父母' },
  day: { bg: 'rgba(249,168,37,0.12)', border: '#f9a825', label: '日·自身' },
  hour: { bg: 'rgba(21,101,192,0.12)', border: '#1565c0', label: '时·子女' },
};

const DIAGRAM_SHENG = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
const DIAGRAM_KE = { '木':'土','火':'金','土':'水','金':'木','水':'火' };
const DIAGRAM_LIU_HE = { 子:'丑',丑:'子',寅:'亥',卯:'戌',辰:'酉',巳:'申',午:'未',未:'午',申:'巳',酉:'辰',戌:'卯',亥:'寅' };
const DIAGRAM_LIU_CHONG = { 子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳' };
const DIAGRAM_GAN_HE = { 甲:'己',乙:'庚',丙:'辛',丁:'壬',戊:'癸',己:'甲',庚:'乙',辛:'丙',壬:'丁',癸:'戊' };
// 相刑简化
const DIAGRAM_XING = {};
  for (const [k, v] of Object.entries({ 寅:['巳','申'], 丑:['未','戌'], 巳:['寅','申'], 申:['寅','巳'], 未:['丑','戌'], 戌:['丑','未'], 子:['卯'], 卯:['子'] })) {
    for (const t of v) DIAGRAM_XING[k + t] = true;
  }

function renderPillarDiagram(canvasId, result) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(rect.width - 4, 400);
  const h = 420;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const pillars = result.details;
  const keys = ['year','month','day','hour'];
  const boxW = (w - 100) / 4;
  const boxH = 64;
  const stemY = 180;
  const labelY = 340;

  // 绘制各柱
  for (let i = 0; i < 4; i++) {
    const key = keys[i];
    const d = pillars[key];
    const cx = 30 + i * (boxW + 8) + boxW / 2;
    const x = 30 + i * (boxW + 8);
    const color = PILLAR_COLORS[key];

    // 柱框
    ctx.fillStyle = color.bg;
    ctx.strokeStyle = color.border;
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, stemY, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // 天干（大号）
    ctx.fillStyle = '#333';
    ctx.font = 'bold 26px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.stem, x + boxW / 2, stemY + 32);

    // 地支（大号，下方稍分开，加五行色）
    const wxColors = { '木':'#2e7d32','火':'#c62828','土':'#f9a825','金':'#78909c','水':'#1565c0' };
    ctx.fillStyle = wxColors[d.branchWuxing] || '#333';
    ctx.font = 'bold 26px "Noto Sans SC", sans-serif';
    ctx.fillText(d.branch, x + boxW / 2, stemY + 58);

    // 宫位标签
    ctx.fillStyle = '#888';
    ctx.font = '12px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(color.label, x + boxW / 2, labelY);

    // 十二长生
    ctx.fillStyle = '#b8860b';
    ctx.font = '11px "Noto Sans SC", sans-serif';
    ctx.fillText(d.changSheng || '', x + boxW / 2, labelY + 18);
  }

  // 天干之间的关系（箭头）
  for (let i = 0; i < 3; i++) {
    const d1 = pillars[keys[i]];
    const d2 = pillars[keys[i + 1]];
    const x1 = 30 + i * (boxW + 8) + boxW;
    const x2 = 30 + (i + 1) * (boxW + 8);
    const cy = stemY + 32;

    const stem1 = d1.stem, stem2 = d2.stem;
    const wx1 = d1.stemWuxing, wx2 = d2.stemWuxing;

    // 生
    if (DIAGRAM_SHENG[wx1] === wx2) {
      drawArrow(ctx, x1 + 2, cy, x2 - 2, cy, '#2e7d32', '生');
    }
    // 克
    else if (DIAGRAM_KE[wx1] === wx2) {
      drawArrow(ctx, x1 + 2, cy, x2 - 2, cy, '#c62828', '克');
    }
    // 合
    if (DIAGRAM_GAN_HE[stem1] === stem2) {
      drawArcLine(ctx, x1, cy - 4, x2, cy - 4, '#b8860b', '合');
    }
  }

  // 地支之间的关系
  for (let i = 0; i < 3; i++) {
    const d1 = pillars[keys[i]];
    const d2 = pillars[keys[i + 1]];
    const x1 = 30 + i * (boxW + 8) + boxW;
    const x2 = 30 + (i + 1) * (boxW + 8);
    const cy = stemY + 50;

    const b1 = d1.branch, b2 = d2.branch;

    // 六冲
    if (DIAGRAM_LIU_CHONG[b1] === b2) {
      drawArrow(ctx, x1 + 2, cy, x2 - 2, cy, '#c62828', '冲');
    }
    // 六合
    if (DIAGRAM_LIU_HE[b1] === b2) {
      drawArrow(ctx, x1 + 2, cy, x2 - 2, cy, '#2e7d32', '合');
    }
    // 相刑
    if (DIAGRAM_XING[b1 + b2]) {
      drawDashArrow(ctx, x1 + 2, cy, x2 - 2, cy, '#e65100', '刑');
    }
  }

  // 五行统计（底部迷你条形）
  const counts = result.wuxingCount;
  const barY = labelY + 40;
  const maxVal = Math.max(...Object.values(counts), 1);
  const barH = 12;
  const wxColorsMap = { '木':'#2e7d32','火':'#c62828','土':'#f9a825','金':'#78909c','水':'#1565c0' };
  ctx.font = '11px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  let bx = 40;
  for (const wx of ['木','火','土','金','水']) {
    const val = counts[wx] || 0;
    const bw = Math.max(20, (val / maxVal) * (w - 80) / 5);
    ctx.fillStyle = wxColorsMap[wx];
    roundRect(ctx, bx, barY, bw, barH, 4);
    ctx.fill();
    ctx.fillStyle = '#666';
    ctx.fillText(wx, bx + bw / 2, barY + barH + 14);
    bx += bw + 6;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawArrow(ctx, x1, y1, x2, y2, color, label) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 5) return;
  const nx = dx / len, ny = dy / len;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - 8, y2);
  ctx.stroke();

  // 箭头
  ctx.beginPath();
  ctx.moveTo(x2 - 8, y2);
  ctx.lineTo(x2 - 8 - 6 * nx + 4 * ny, y2 - 6 * ny - 4 * nx);
  ctx.lineTo(x2 - 8 - 6 * nx - 4 * ny, y2 - 6 * ny + 4 * nx);
  ctx.closePath();
  ctx.fill();

  // 标签
  ctx.fillStyle = color;
  ctx.font = '10px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, (x1 + x2) / 2, y1 - 6);

  ctx.restore();
}

function drawArcLine(ctx, x1, y1, x2, y2, color, label) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = color;
  ctx.font = '10px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, (x1 + x2) / 2, y1 - 4);
  ctx.restore();
}

function drawDashArrow(ctx, x1, y1, x2, y2, color, label) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);

  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 5) return;
  const nx = dx / len, ny = dy / len;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - 8, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(x2 - 8, y2);
  ctx.lineTo(x2 - 8 - 5 * nx + 3 * ny, y2 - 5 * ny - 3 * nx);
  ctx.lineTo(x2 - 8 - 5 * nx - 3 * ny, y2 - 5 * ny + 3 * nx);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = '9px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, (x1 + x2) / 2, y1 - 6);
  ctx.restore();
}
