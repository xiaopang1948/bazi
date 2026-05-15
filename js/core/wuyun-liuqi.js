// 五运六气计算

// 岁运（大运）：年干化运
const SUI_YUN = { '甲':'土','乙':'金','丙':'水','丁':'木','戊':'火',
                  '己':'土','庚':'金','辛':'水','壬':'木','癸':'火' };

// 司天在泉：年支定气
const SI_TIAN = {
  '子':'少阴君火','丑':'太阴湿土','寅':'少阳相火','卯':'阳明燥金','辰':'太阳寒水','巳':'厥阴风木',
  '午':'少阴君火','未':'太阴湿土','申':'少阳相火','酉':'阳明燥金','戌':'太阳寒水','亥':'厥阴风木'
};
const ZAI_QUAN = {
  '子':'阳明燥金','丑':'太阳寒水','寅':'厥阴风木','卯':'少阴君火','辰':'太阴湿土','巳':'少阳相火',
  '午':'阳明燥金','未':'太阳寒水','申':'厥阴风木','酉':'少阴君火','戌':'太阴湿土','亥':'少阳相火'
};

// 主运（五音建运，每年固定）
const ZHU_YUN = [
  { name:'初运木', wx:'木', yin:'太角', time:'大寒至春分后' },
  { name:'二运火', wx:'火', yin:'少徵', time:'清明至芒种后' },
  { name:'三运土', wx:'土', yin:'太宫', time:'夏至至处暑后' },
  { name:'四运金', wx:'金', yin:'少商', time:'白露至霜降后' },
  { name:'终运水', wx:'水', yin:'太羽', time:'立冬至小寒' },
];

// 客运（随岁运变化）
function calcKeYun(suiYunWx) {
  const order = ['木','火','土','金','水'];
  const startIdx = order.indexOf(suiYunWx);
  if (startIdx === -1) return ZHU_YUN;
  return ZHU_YUN.map((_, i) => {
    const wx = order[(startIdx + i) % 5];
    const names = { '木':'初运木','火':'二运火','土':'三运土','金':'四运金','水':'终运水' };
    return { name: names[wx] || '', wx };
  });
}

// 主气（每年固定六气）
const ZHU_QI = [
  { name:'厥阴风木', wx:'木', time:'大寒至春分' },
  { name:'少阴君火', wx:'火', time:'春分至小满' },
  { name:'少阳相火', wx:'火', time:'小满至大暑' },
  { name:'太阴湿土', wx:'土', time:'大暑至秋分' },
  { name:'阳明燥金', wx:'金', time:'秋分至小雪' },
  { name:'太阳寒水', wx:'水', time:'小雪至大寒' },
];

// 客气（随司天变化）
function calcKeQi(siTian) {
  const order = ['厥阴风木','少阴君火','太阴湿土','少阳相火','阳明燥金','太阳寒水'];
  const startIdx = order.indexOf(siTian);
  if (startIdx === -1) return ZHU_QI;
  return ZHU_QI.map((_, i) => {
    const idx = (startIdx + i) % 6;
    return { name: order[idx], wx: order[idx].slice(-1) === '火' ? '火' : (order[idx].includes('木') ? '木' : order[idx].includes('土') ? '土' : order[idx].includes('金') ? '金' : '水') };
  });
}

// 简化版五行从六气名称提取
function wxFromQiName(name) {
  if (name.includes('风木')) return '木';
  if (name.includes('君火') || name.includes('相火')) return '火';
  if (name.includes('湿土')) return '土';
  if (name.includes('燥金')) return '金';
  if (name.includes('寒水')) return '水';
  return '';
}

/** 计算某年的五运六气 */
function calcWuYunLiuQi(year) {
  const ganIdx = ((year - 4) % 10 + 10) % 10;
  const zhiIdx = ((year - 4) % 12 + 12) % 12;
  const yearGan = STEMS[ganIdx];
  const yearZhi = BRANCHES[zhiIdx];

  const suiYunWx = SUI_YUN[yearGan] || '';
  const siTian = SI_TIAN[yearZhi] || '';
  const zaiQuan = ZAI_QUAN[yearZhi] || '';
  const keYun = calcKeYun(suiYunWx);
  const keQi = calcKeQi(siTian);

  // 客主加临：客气与主气的关系
  const jiaLin = ZHU_QI.map((zq, i) => ({
    zhu: zq.name,
    ke: keQi[i]?.name || '',
    zhuWx: wxFromQiName(zq.name),
    keWx: wxFromQiName(keQi[i]?.name || ''),
  }));

  return {
    year,
    yearGanZhi: yearGan + yearZhi,
    suiYun: suiYunWx,
    siTian,
    zaiQuan,
    zhuYun: ZHU_YUN,
    keYun,
    zhuQi: ZHU_QI,
    keQi,
    jiaLin,
  };
}
