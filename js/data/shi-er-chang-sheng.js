// 十二长生表
// 阳干顺行十二支，阴干逆行十二支
// 仅存"长生"起点，实际从起点开始顺/逆数12位

const SHI_ER_ZHANG_SHENG = {
  // 阳干：顺行（从长生位开始顺时针数12地支）
  yang: {
    '甲': { start: '亥', order: 'shun' },
    '丙': { start: '寅', order: 'shun' },
    '戊': { start: '寅', order: 'shun' },  // 阳土同丙火
    '庚': { start: '巳', order: 'shun' },
    '壬': { start: '申', order: 'shun' },
  },
  // 阴干：逆行
  yin: {
    '乙': { start: '午', order: 'ni' },
    '丁': { start: '酉', order: 'ni' },
    '己': { start: '酉', order: 'ni' },   // 阴土同丁火
    '辛': { start: '子', order: 'ni' },
    '癸': { start: '卯', order: 'ni' },
  },
};

const SHI_ER_MING = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];

/** 获取某天干在某地支的十二长生状态 */
function getShiErChangSheng(stem, branch) {
  const ganIdx = STEMS.indexOf(stem);
  const isYang = ganIdx % 2 === 0;
  const group = isYang ? SHI_ER_ZHANG_SHENG.yang : SHI_ER_ZHANG_SHENG.yin;
  const meta = group[stem];
  if (!meta) return '';
  const startIdx = BRANCHES.indexOf(meta.start);
  const branchIdx = BRANCHES.indexOf(branch);
  const offset = isYang
    ? (branchIdx - startIdx + 12) % 12
    : (startIdx - branchIdx + 12) % 12;
  return SHI_ER_MING[offset];
}
