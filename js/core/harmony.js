/**
 * 合盘分析引擎
 * 基于双方八字结果进行匹配度分析
 */

// 地支六合
const LIU_HE = { 子:'丑',丑:'子',寅:'亥',卯:'戌',辰:'酉',巳:'申',
                午:'未',未:'午',申:'巳',酉:'辰',戌:'卯',亥:'寅' };

// 地支六冲
const LIU_CHONG = { 子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',
                   午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳' };

// 地支三刑 (简化为两两匹配检查)
const SAN_XING_PAIRS = {
  '寅':['巳','申'], '巳':['寅','申'], '申':['寅','巳'],
  '丑':['未','戌'], '未':['丑','戌'], '戌':['丑','未'],
  '子':['卯'], '卯':['子'],
};

// 地支三合
const SAN_HE = {
  '申':['子','辰'], '子':['申','辰'], '辰':['申','子'],
  '亥':['卯','未'], '卯':['亥','未'], '未':['亥','卯'],
  '寅':['午','戌'], '午':['寅','戌'], '戌':['寅','午'],
  '巳':['酉','丑'], '酉':['巳','丑'], '丑':['巳','酉'],
};

// 天干五合
const GAN_HE = { 甲:'己',乙:'庚',丙:'辛',丁:'壬',戊:'癸',
                 己:'甲',庚:'乙',辛:'丙',壬:'丁',癸:'戊' };

// 纳音五行映射
const NAYIN_WUXING = {
  '海中金':'金','炉中火':'火','大林木':'木','路旁土':'土','剑锋金':'金',
  '山头火':'火','涧下水':'水','城头土':'土','白蜡金':'金','杨柳木':'木',
  '泉中水':'水','屋上土':'土','霹雳火':'火','松柏木':'木','长流水':'水',
  '沙中金':'金','山下火':'火','平地木':'木','壁上土':'土','金箔金':'金',
  '覆灯火':'火','天河水':'水','大驿土':'土','钗钏金':'金','桑柘木':'木',
  '大溪水':'水','沙中土':'土','天上火':'火','石榴木':'木','大海水':'水',
};

const WUXING_SHENG = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
const WUXING_KE = { '木':'土','火':'金','土':'水','金':'木','水':'火' };

/**
 * 合盘分析主函数
 * @param {object} r1 - 第一人 calcBaZi 结果
 * @param {object} r2 - 第二人 calcBaZi 结果
 * @returns {object} 合盘分析结果
 */
function calcHarmony(r1, r2) {
  const p1 = r1.pillars, p2 = r2.pillars;
  const d1 = r1.details, d2 = r2.details;

  let score = 60; // 基础分
  const details = [];
  const warnings = [];

  // ── 1. 四柱纳音逐一比较 ──
  const pillarLabels = ['年柱','月柱','日柱','时柱'];
  const pillarKeys = ['year','month','day','hour'];
  let nayinTotal = 0;
  const nayinParts = [];
  for (let i = 0; i < 4; i++) {
    const key = pillarKeys[i];
    const n1 = NAYIN_WUXING[d1[key].nayin] || '';
    const n2 = NAYIN_WUXING[d2[key].nayin] || '';
    if (!n1 || !n2) continue;
    if (WUXING_SHENG[n1] === n2 || WUXING_SHENG[n2] === n1) {
      nayinTotal += i === 0 ? 10 : 3;
      nayinParts.push(`${pillarLabels[i]}: ${d1[key].nayin}(${n1})→${d2[key].nayin}(${n2})相生`);
    } else if (WUXING_KE[n1] === n2 || WUXING_KE[n2] === n1) {
      nayinTotal -= i === 0 ? 5 : 2;
      nayinParts.push(`${pillarLabels[i]}: ${d1[key].nayin}(${n1})→${d2[key].nayin}(${n2})相克`);
    }
  }
  if (nayinParts.length > 0) {
    score += nayinTotal;
    details.push({ item: '四柱纳音', detail: nayinParts.join('；'), effect: nayinTotal > 0 ? '吉' : nayinTotal < 0 ? '凶' : '平' });
  }

  // ── 2. 生肖 (年支) ──
  const b1 = p1.year.branch, b2 = p2.year.branch;
  if (LIU_HE[b1] === b2 || LIU_HE[b2] === b1) {
    score += 15;
    details.push({ item: '生肖', detail: `${b1}${b2}六合，大吉`, effect: '吉' });
  } else if (b1 === b2) {
    score -= 3;
    details.push({ item: '生肖', detail: `${b1}${b2}同属相`, effect: '平' });
  } else {
    let chong = LIU_CHONG[b1] === b2 || LIU_CHONG[b2] === b1;
    let xing = false;
    if (SAN_XING_PAIRS[b1] && SAN_XING_PAIRS[b1].includes(b2)) xing = true;
    if (SAN_XING_PAIRS[b2] && SAN_XING_PAIRS[b2].includes(b1)) xing = true;

    let he = false;
    if (SAN_HE[b1] && SAN_HE[b1].includes(b2)) he = true;
    if (SAN_HE[b2] && SAN_HE[b2].includes(b1)) he = true;

    if (chong) {
      score -= 10;
      details.push({ item: '生肖', detail: `${b1}${b2}六冲`, effect: '凶' });
    } else if (xing) {
      score -= 5;
      details.push({ item: '生肖', detail: `${b1}${b2}相刑`, effect: '凶' });
    } else if (he) {
      score += 8;
      details.push({ item: '生肖', detail: `${b1}${b2}三合`, effect: '吉' });
    } else {
      details.push({ item: '生肖', detail: `${b1}${b2}无特殊关系`, effect: '平' });
    }
  }

  // ── 3. 天干五合（日干） ──
  const g1 = p1.day.stem, g2 = p2.day.stem;
  if ((GAN_HE[g1] === g2) && (GAN_HE[g2] === g1)) {
    score += 10;
    details.push({ item: '天干五合', detail: `${g1}${g2}合化`, effect: '吉' });
  } else if (g1 === g2) {
    score -= 2;
    details.push({ item: '天干五合', detail: `${g1}${g2}同天干`, effect: '平' });
  }

  // ── 4. 日支关系 ──
  const db1 = p1.day.branch, db2 = p2.day.branch;
  if (LIU_HE[db1] === db2) {
    score += 10;
    details.push({ item: '日支配偶宫', detail: `${db1}${db2}六合`, effect: '吉' });
  } else if (LIU_CHONG[db1] === db2) {
    score -= 10;
    details.push({ item: '日支配偶宫', detail: `${db1}${db2}六冲，婚姻易有摩擦`, effect: '凶' });
  } else if (db1 === db2) {
    score -= 3;
    details.push({ item: '日支配偶宫', detail: `${db1}${db2}同地支`, effect: '平' });
  } else {
    let he = false;
    if (SAN_HE[db1] && SAN_HE[db1].includes(db2)) he = true;
    if (he) { score += 5; details.push({ item: '日支配偶宫', detail: `${db1}${db2}三合`, effect: '吉' }); }
  }

  // ── 5. 夫妻星状态 ──
  const maleWifeStars = ['正财','偏财'];
  const femaleHusbandStars = ['正官','七杀'];
  let starScore = 0;
  const starParts = [];
  const g1Gender = r1.input.gender;
  const g2Gender = r2.input.gender;
  // 男方日支配偶宫为财星 → 妻星得位
  if (g1Gender === 'male' && maleWifeStars.includes(d1.day.shishen)) {
    starScore += 3; starParts.push('男方夫妻宫得财星');
  }
  // 女方日支配偶宫为官星 → 夫星得位
  if (g2Gender === 'female' && femaleHusbandStars.includes(d2.day.shishen)) {
    starScore += 3; starParts.push('女方夫妻宫得官星');
  }
  // 男方日干是女方的夫星
  if (g2Gender === 'female' && femaleHusbandStars.includes(getShiShen(p2.day.stem, p1.day.stem))) {
    starScore += 4; starParts.push('男方是女方夫星');
  }
  // 女方日干是男方的妻星
  if (g1Gender === 'male' && maleWifeStars.includes(getShiShen(p1.day.stem, p2.day.stem))) {
    starScore += 4; starParts.push('女方是男方妻星');
  }
  // 双方日干十神关系（生对方日主）
  const s1 = getShiShen(p2.day.stem, p1.day.stem);
  const s2 = getShiShen(p1.day.stem, p2.day.stem);
  if (s1 === '正印' || s1 === '偏印') { starScore += 2; starParts.push('男方生女方'); }
  if (s2 === '正印' || s2 === '偏印') { starScore += 2; starParts.push('女方生男方'); }
  if (starScore > 0) {
    score += Math.min(starScore, 14);
    details.push({ item: '夫妻星', detail: starParts.join('、'), effect: starScore >= 8 ? '吉' : '平' });
  } else {
    score -= 3;
    details.push({ item: '夫妻星', detail: '夫妻星不显，缘分较浅', effect: '凶' });
  }

  // ── 6. 五行互补性 ──
  const wxCount1 = r1.wuxingCount;
  const wxCount2 = r2.wuxingCount;
  let complementScore = 0;
  const compDetails = [];
  for (const wx of ['木','火','土','金','水']) {
    const v1 = wxCount1[wx] || 0;
    const v2 = wxCount2[wx] || 0;
    // 一人缺的五行另一人有，加分
    if ((v1 < 1 && v2 >= 2) || (v2 < 1 && v1 >= 2)) {
      complementScore += 5;
      compDetails.push(`${wx}互补`);
    }
  }
  if (complementScore > 0) {
    score += complementScore;
    details.push({ item: '五行互补', detail: compDetails.join('、'), effect: '吉' });
  }

  // ── 7. 大运同步性 ──
  if (r1.dayun && r2.dayun && r1.dayun.periods.length > 0 && r2.dayun.periods.length > 0) {
    const now = new Date();
    const findCurrentPeriod = (periods, birthYear) => {
      const age = now.getFullYear() - birthYear;
      return periods.find(p => {
        const [s, e] = p.ageRange.split('-').map(Number);
        return age >= s && age <= e;
      }) || periods[0];
    };
    const cur1 = findCurrentPeriod(r1.dayun.periods, r1.input.year);
    const cur2 = findCurrentPeriod(r2.dayun.periods, r2.input.year);
    if (cur1 && cur2) {
      const wx1 = getStemWuxing(cur1.stem);
      const wx2 = getStemWuxing(cur2.stem);
      if (wx1 && wx2) {
        if (wx1 === wx2) {
          score += 5;
          details.push({ item: '大运同步', detail: `当前大运五行同为${wx1}(${cur1.ganzhi}/${cur1.ageRange}岁~${cur2.ganzhi}/${cur2.ageRange}岁)`, effect: '吉' });
        } else if (WUXING_SHENG[wx1] === wx2 || WUXING_SHENG[wx2] === wx1) {
          score += 3;
          details.push({ item: '大运同步', detail: `当前大运五行相生(${wx1}→${wx2})`, effect: '吉' });
        }
      }
    }
  }

  // ── 8. 神煞合婚 ──
  const goodStarNames = ['天乙贵人','文昌贵人','天德','月德','红鸾','天喜'];
  const badStarNames = ['孤辰','寡宿','劫煞','元辰','亡神'];
  const allStars1 = [...d1.year.stars, ...d1.month.stars, ...d1.day.stars, ...d1.hour.stars];
  const allStars2 = [...d2.year.stars, ...d2.month.stars, ...d2.day.stars, ...d2.hour.stars];
  const sharedGood = allStars1.filter(s => goodStarNames.includes(s.name) && allStars2.find(s2 => s2.name === s.name));
  const p1Bad = allStars1.filter(s => badStarNames.includes(s.name) && !allStars2.find(s2 => s2.name === s.name));
  const p2Bad = allStars2.filter(s => badStarNames.includes(s.name) && !allStars1.find(s1 => s1.name === s.name));
  let shenshaScore = 0;
  const shenshaParts = [];
  if (sharedGood.length > 0) {
    shenshaScore += sharedGood.length * 3;
    shenshaParts.push(`同带${sharedGood.map(s => s.name).join('、')}`);
  }
  if (p1Bad.length > 0 || p2Bad.length > 0) {
    const allBad = [...new Set([...p1Bad, ...p2Bad].map(s => s.name))];
    shenshaScore -= allBad.length * 2;
    shenshaParts.push(`${allBad.join('、')}单方带`);
  }
  if (shenshaScore !== 0) {
    score += Math.max(-6, Math.min(9, shenshaScore));
    details.push({ item: '神煞合婚', detail: shenshaParts.join('；'), effect: shenshaScore > 0 ? '吉' : '凶' });
  }

  // ── 9. 总分评定 ──
  score = Math.max(0, Math.min(100, score));
  let level, summary;
  if (score >= 85) { level = '上等婚配'; summary = '天作之合，五行互补，命局相合。'; }
  else if (score >= 70) { level = '中等婚配'; summary = '较为和谐，偶有小摩擦，可以通过沟通改善。'; }
  else if (score >= 55) { level = '一般婚配'; summary = '各有利弊，需要相互包容和经营。'; }
  else { level = '下等婚配'; summary = '冲克较多，婚姻需要更多付出和磨合。'; }

  return {
    score,
    level,
    summary,
    details,
    warnings,
    // 双方概要
    profile1: {
      name: r1.input.name || '甲方',
      ganzhi: `${p1.year.stem}${p1.year.branch} ${p1.month.stem}${p1.month.branch} ${p1.day.stem}${p1.day.branch} ${p1.hour.stem}${p1.hour.branch}`,
      dayStem: p1.day.stem,
    },
    profile2: {
      name: r2.input.name || '乙方',
      ganzhi: `${p2.year.stem}${p2.year.branch} ${p2.month.stem}${p2.month.branch} ${p2.day.stem}${p2.day.branch} ${p2.hour.stem}${p2.hour.branch}`,
      dayStem: p2.day.stem,
    },
  };
}
