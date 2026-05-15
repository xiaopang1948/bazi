// 胎元、命宫、身宫计算
// 依赖: bazi-engine.js 中的 STEMS, BRANCHES, getStemWuxing, getShiShen

// 命宫地支查表（从寅起月，逆数至生月）
const MING_GONG_BRANCH = {
  '寅': '寅', '卯': '丑', '辰': '子', '巳': '亥',
  '午': '戌', '未': '酉', '申': '申', '酉': '未',
  '戌': '午', '亥': '巳', '子': '辰', '丑': '卯'
};

// 五虎遁（年干 → 正月寅的天干）
const WU_HU_DUN = {
  '甲': '丙', '乙': '戊', '丙': '庚', '丁': '壬', '戊': '甲',
  '己': '丙', '庚': '戊', '辛': '庚', '壬': '壬', '癸': '甲'
};

/** 用五虎遁推算某地支对应的天干 */
function calcStemByWuHuDun(yearGan, targetBranch) {
  const yinStem = WU_HU_DUN[yearGan];
  const yinIdx = STEMS.indexOf(yinStem);
  const targetIdx = BRANCHES.indexOf(targetBranch);
  const yinBranchIdx = BRANCHES.indexOf('寅');
  const offset = (targetIdx - yinBranchIdx + 12) % 12;
  const stemIdx = (yinIdx + offset) % 10;
  return STEMS[stemIdx];
}

/** 胎元：月柱天干进一位，地支进三位 */
function calcTaiYuan(monthStem, monthBranch) {
  const stemIdx = (STEMS.indexOf(monthStem) + 1) % 10;
  const branchIdx = (BRANCHES.indexOf(monthBranch) + 3) % 12;
  const stem = STEMS[stemIdx];
  const branch = BRANCHES[branchIdx];
  return { stem, branch, ganzhi: stem + branch };
}

/** 命宫：月支查表 + 五虎遁定天干 */
function calcMingGong(yearGan, monthBranch) {
  const branch = MING_GONG_BRANCH[monthBranch] || '寅';
  const stem = calcStemByWuHuDun(yearGan, branch);
  return { stem, branch, ganzhi: stem + branch };
}

/** 身宫：命宫对宫（地支+6） */
function calcShenGong(yearGan, mingGongBranch) {
  const branchIdx = (BRANCHES.indexOf(mingGongBranch) + 6) % 12;
  const branch = BRANCHES[branchIdx];
  const stem = calcStemByWuHuDun(yearGan, branch);
  return { stem, branch, ganzhi: stem + branch };
}

/** 计算胎元/命宫/身宫（全部） */
function calcExtraPillars(yearGan, monthStem, monthBranch) {
  const taiYuan = calcTaiYuan(monthStem, monthBranch);
  const mingGong = calcMingGong(yearGan, monthBranch);
  const shenGong = calcShenGong(yearGan, mingGong.branch);
  return { taiYuan, mingGong, shenGong };
}
