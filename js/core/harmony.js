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

  // ── 1. 年柱纳音 ──
  const nayin1 = d1.year.nayin;
  const nayin2 = d2.year.nayin;
  const wx1 = NAYIN_WUXING[nayin1] || '';
  const wx2 = NAYIN_WUXING[nayin2] || '';
  if (wx1 && wx2) {
    if (WUXING_SHENG[wx1] === wx2 || WUXING_SHENG[wx2] === wx1) {
      score += 10;
      details.push({ item: '年柱纳音', detail: `${nayin1}(${wx1}) → ${nayin2}(${wx2})，相生`, effect: '吉' });
    } else if (WUXING_KE[wx1] === wx2 || WUXING_KE[wx2] === wx1) {
      score -= 5;
      details.push({ item: '年柱纳音', detail: `${nayin1}(${wx1}) → ${nayin2}(${wx2})，相克`, effect: '凶' });
    } else {
      details.push({ item: '年柱纳音', detail: `${nayin1}(${wx1}) → ${nayin2}(${wx2})，平和`, effect: '平' });
    }
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

  // ── 5. 夫妻星状态（日干 × 日支的十神） ──
  const fq1 = d1.day.shishen;
  const fq2 = d2.day.shishen;
  // 女命以正官为夫，男命以正财为妻
  const maleWifeStars = ['正财','偏财'];
  const femaleHusbandStars = ['正官','七杀'];
  
  // 检查双方夫妻星是否在地支有强根
  // (简化：只看是否存在)

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

  // ── 7. 大运同步性（简版） ──
  // 如果两人当前大运的五行一致，说明人生节奏同步
  if (r1.dayun && r2.dayun && r1.dayun.periods.length > 0 && r2.dayun.periods.length > 0) {
    // 找当前年龄对应的大运
    const now = new Date();
    const age = now.getFullYear() - r1.input.year;
    // 用第一个大运的五行做粗略比较
    const wxDaYun1 = getStemWuxing(r1.dayun.periods[0].stem);
    const wxDaYun2 = getStemWuxing(r2.dayun.periods[0].stem);
    if (wxDaYun1 && wxDaYun2) {
      if (wxDaYun1 === wxDaYun2) {
        score += 5;
        details.push({ item: '大运同步', detail: `当前大运五行同为${wxDaYun1}`, effect: '吉' });
      } else if (WUXING_SHENG[wxDaYun1] === wxDaYun2 || WUXING_SHENG[wxDaYun2] === wxDaYun1) {
        score += 3;
        details.push({ item: '大运同步', detail: `大运五行相生`, effect: '吉' });
      }
    }
  }

  // ── 8. 总分评定 ──
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
