// 古籍匹配数据
// 来源：滴天髓、渊海子平、神峰通考、穷通宝鉴

const GU_JI_MATCHES = [
  // ═══ 滴天髓 · 天干论 ═══
  { source:'滴天髓', title:'甲木', match:{ dayGan:'甲' },
    content:'甲木参天，脱胎要火。火旺则焚，水旺则浮。' },
  { source:'滴天髓', title:'乙木', match:{ dayGan:'乙' },
    content:'乙木虽柔，刲羊解牛。怀丁抱丙，跨凤乘猴。' },
  { source:'滴天髓', title:'丙火', match:{ dayGan:'丙' },
    content:'丙火猛烈，欺霜侮雪。能煅庚金，逢辛反怯。' },
  { source:'滴天髓', title:'丁火', match:{ dayGan:'丁' },
    content:'丁火柔中，内性昭融。抱乙而孝，合壬而忠。' },
  { source:'滴天髓', title:'戊土', match:{ dayGan:'戊' },
    content:'戊土固重，既中且正。静翕动辟，万物司命。' },
  { source:'滴天髓', title:'己土', match:{ dayGan:'己' },
    content:'己土卑湿，中正蓄藏。不愁木盛，不畏水狂。' },
  { source:'滴天髓', title:'庚金', match:{ dayGan:'庚' },
    content:'庚金带煞，刚健为最。得水而清，得火而锐。' },
  { source:'滴天髓', title:'辛金', match:{ dayGan:'辛' },
    content:'辛金软弱，温润而清。畏土之多，乐水之盈。' },
  { source:'滴天髓', title:'壬水', match:{ dayGan:'壬' },
    content:'壬水通河，能泄金气。刚中之德，周流不滞。' },
  { source:'滴天髓', title:'癸水', match:{ dayGan:'癸' },
    content:'癸水至弱，达于天津。得龙而运，功化斯神。' },

  // ═══ 滴天髓 · 格局 ═══
  { source:'滴天髓', title:'身旺', match:{ pattern:'shenQiang' },
    content:'旺者宜泄不宜克，泄之反为美。克之则激，激则生祸。' },
  { source:'滴天髓', title:'身弱', match:{ pattern:'shenRuo' },
    content:'弱者宜扶不宜抑，扶之则有益。抑之则伤，伤则灾生。' },
  { source:'滴天髓', title:'从格', match:{ special:'cong' },
    content:'从得真者只论从，从神又有吉和凶。' },
  { source:'滴天髓', title:'专旺', match:{ special:'zhuanWang' },
    content:'一者为独，难为用事。全局一气，乃成专旺。' },

  // ═══ 渊海子平 · 五行 ═══
  { source:'渊海子平', title:'木', match:{ wxStrong:'木' },
    content:'木性腾上而无所止，气重则欲金，而木成材。' },
  { source:'渊海子平', title:'火', match:{ wxStrong:'火' },
    content:'火性炎上而不可遏，气重则欲水，而火成用。' },
  { source:'渊海子平', title:'土', match:{ wxStrong:'土' },
    content:'土性重厚而无所不通，气重则欲木，而土成功。' },
  { source:'渊海子平', title:'金', match:{ wxStrong:'金' },
    content:'金性刚硬而有所执，气重则欲火，而金成器。' },
  { source:'渊海子平', title:'水', match:{ wxStrong:'水' },
    content:'水性润下而有所归，气重则欲土，而水成止。' },

  // ═══ 神峰通考 · 五行生克 ═══
  { source:'神峰通考', title:'用神', match:{ type:'yongShen' },
    content:'用神者，八字中所用之神也。用神若旺，一生福厚。' },
  { source:'神峰通考', title:'忌神', match:{ type:'jiShen' },
    content:'忌神者，八字中所忌之神也。忌神若旺，一生多滞。' },
  { source:'神峰通考', title:'调候', match:{ type:'tiaoHou' },
    content:'天道有寒暑，地道有燥湿。寒则要暖，湿则要燥。' },
];

/** 匹配古籍条目 */
function calcGuJiMatches(result) {
  const p = result.pattern;
  const dayStem = result.pillars.day.stem;
  const monthBranch = result.pillars.month.branch;
  const matches = [];

  for (const entry of GU_JI_MATCHES) {
    const m = entry.match;
    let ok = true;

    if (m.dayGan && m.dayGan !== dayStem) ok = false;
    if (m.monthZhi && m.monthZhi !== monthBranch) ok = false;
    if (m.pattern === 'shenQiang' && p.isStrong !== '身强') ok = false;
    if (m.pattern === 'shenRuo' && p.isStrong !== '身弱') ok = false;
    if (m.special === 'zhuanWang' && (!result.specialPatterns || !result.specialPatterns.some(s => s.name.includes('专旺')))) ok = false;
    if (m.special === 'cong' && (!result.specialPatterns || !result.specialPatterns.some(s => s.name.includes('从')))) ok = false;
    if (m.wxStrong && m.wxStrong !== p.strongWx) ok = false;
    if (m.type === 'yongShen' && !p.yongShen) ok = false;
    if (m.type === 'jiShen' && !p.jiShen) ok = false;
    if (m.type === 'tiaoHou' && !result.tiaoHou) ok = false;

    if (ok) matches.push(entry);
  }
  return matches;
}
