/**
 * 八字核心计算引擎
 * 基于 6tail/lunar 封装
 */
const WUXING = ['木','火','土','金','水'];
const STEM_WUXING  = { 甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水' };
const BRANCH_WUXING = { 子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',
                        午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水' };
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const SHISHEN_MAP = [
  // 日干为甲
  { stem:'甲', shishen:{ 甲:'比肩',乙:'劫财',丙:'食神',丁:'伤官',戊:'偏财',己:'正财',庚:'七杀',辛:'正官',壬:'偏印',癸:'正印' } },
  { stem:'乙', shishen:{ 甲:'劫财',乙:'比肩',丙:'伤官',丁:'食神',戊:'正财',己:'偏财',庚:'正官',辛:'七杀',壬:'正印',癸:'偏印' } },
  { stem:'丙', shishen:{ 甲:'偏印',乙:'正印',丙:'比肩',丁:'劫财',戊:'食神',己:'伤官',庚:'偏财',辛:'正财',壬:'七杀',癸:'正官' } },
  { stem:'丁', shishen:{ 甲:'正印',乙:'偏印',丙:'劫财',丁:'比肩',戊:'伤官',己:'食神',庚:'正财',辛:'偏财',壬:'正官',癸:'七杀' } },
  { stem:'戊', shishen:{ 甲:'七杀',乙:'正官',丙:'偏印',丁:'正印',戊:'比肩',己:'劫财',庚:'食神',辛:'伤官',壬:'偏财',癸:'正财' } },
  { stem:'己', shishen:{ 甲:'正官',乙:'七杀',丙:'正印',丁:'偏印',戊:'劫财',己:'比肩',庚:'伤官',辛:'食神',壬:'正财',癸:'偏财' } },
  { stem:'庚', shishen:{ 甲:'偏财',乙:'正财',丙:'七杀',丁:'正官',戊:'偏印',己:'正印',庚:'比肩',辛:'劫财',壬:'食神',癸:'伤官' } },
  { stem:'辛', shishen:{ 甲:'正财',乙:'偏财',丙:'正官',丁:'七杀',戊:'正印',己:'偏印',庚:'劫财',辛:'比肩',壬:'伤官',癸:'食神' } },
  { stem:'壬', shishen:{ 甲:'食神',乙:'伤官',丙:'偏财',丁:'正财',戊:'七杀',己:'正官',庚:'偏印',辛:'正印',壬:'比肩',癸:'劫财' } },
  { stem:'癸', shishen:{ 甲:'伤官',乙:'食神',丙:'正财',丁:'偏财',戊:'正官',己:'七杀',庚:'正印',辛:'偏印',壬:'劫财',癸:'比肩' } },
];
const HIDDEN_STEMS = {
  子: ['癸'],
  丑: ['己','癸','辛'],
  寅: ['甲','丙','戊'],
  卯: ['乙'],
  辰: ['戊','乙','癸'],
  巳: ['丙','庚','戊'],
  午: ['丁','己'],
  未: ['己','丁','乙'],
  申: ['庚','壬','戊'],
  酉: ['辛'],
  戌: ['戊','辛','丁'],
  亥: ['壬','甲'],
};
const NAYIN_MAP = {
  '甲子乙丑': '海中金', '丙寅丁卯': '炉中火', '戊辰己巳': '大林木',
  '庚午辛未': '路旁土', '壬申癸酉': '剑锋金', '甲戌乙亥': '山头火',
  '丙子丁丑': '涧下水', '戊寅己卯': '城头土', '庚辰辛巳': '白蜡金',
  '壬午癸未': '杨柳木', '甲申乙酉': '泉中水', '丙戌丁亥': '屋上土',
  '戊子己丑': '霹雳火', '庚寅辛卯': '松柏木', '壬辰癸巳': '长流水',
  '甲午乙未': '沙中金', '丙申丁酉': '山下火', '戊戌己亥': '平地木',
  '庚子辛丑': '壁上土', '壬寅癸卯': '金箔金', '甲辰乙巳': '覆灯火',
  '丙午丁未': '天河水', '戊申己酉': '大驿土', '庚戌辛亥': '钗钏金',
  '壬子癸丑': '桑柘木', '甲寅乙卯': '大溪水', '丙辰丁巳': '沙中土',
  '戊午己未': '天上火', '庚申辛酉': '石榴木', '壬戌癸亥': '大海水',
};

const SHICHEN = [
  { name:'子时', start:23, end:1 },
  { name:'丑时', start:1, end:3 },
  { name:'寅时', start:3, end:5 },
  { name:'卯时', start:5, end:7 },
  { name:'辰时', start:7, end:9 },
  { name:'巳时', start:9, end:11 },
  { name:'午时', start:11, end:13 },
  { name:'未时', start:13, end:15 },
  { name:'申时', start:15, end:17 },
  { name:'酉时', start:17, end:19 },
  { name:'戌时', start:19, end:21 },
  { name:'亥时', start:21, end:23 },
];

// ── 穷通宝鉴 · 调候用神表 ──
// 每个日干在 12 个月（寅~丑）的推荐调候用神
// 来源：《穷通宝鉴》（余春台）
const TIAO_HOU_TABLE = {
  // 甲木
  甲: [
    { month: '寅', yong: '丙火',   desc: '初春余寒，丙火暖局' },
    { month: '卯', yong: '庚金',   desc: '春木正旺，庚金修剪' },
    { month: '辰', yong: '庚金壬水', desc: '春末土重，庚壬并用' },
    { month: '巳', yong: '癸水丁火', desc: '火旺木焚，癸水调候' },
    { month: '午', yong: '癸水庚金', desc: '火炎土燥，癸庚并用' },
    { month: '未', yong: '癸水庚金', desc: '土旺金相，癸庚为用' },
    { month: '申', yong: '丁火庚金', desc: '秋木渐衰，丁庚兼用' },
    { month: '酉', yong: '丁火丙火', desc: '金旺木凋，火来制金' },
    { month: '戌', yong: '癸水丁火', desc: '秋末土燥，癸丁并用' },
    { month: '亥', yong: '丙火庚金', desc: '冬初水旺，丙庚为用' },
    { month: '子', yong: '丙火丁火', desc: '寒冬水冷，火来暖局' },
    { month: '丑', yong: '丙火丁火', desc: '腊月寒凝，火力为先' },
  ],
  // 乙木
  乙: [
    { month: '寅', yong: '丙火',   desc: '初春寒木，丙火向阳' },
    { month: '卯', yong: '丙火',   desc: '仲春木旺，向阳为宜' },
    { month: '辰', yong: '癸水丙火', desc: '春末土湿，癸丙并用' },
    { month: '巳', yong: '癸水',   desc: '火旺木泄，癸水滋润' },
    { month: '午', yong: '癸水丙火', desc: '火炎土燥，癸丙调候' },
    { month: '未', yong: '癸水丙火', desc: '土重木抑，癸丙为用' },
    { month: '申', yong: '丙火癸水', desc: '金旺木衰，丙癸并用' },
    { month: '酉', yong: '丙火丁火', desc: '金锐木凋，火来制金' },
    { month: '戌', yong: '癸水辛金', desc: '土旺金相，癸辛并用' },
    { month: '亥', yong: '丙火戊土', desc: '水旺木浮，丙戊为用' },
    { month: '子', yong: '丙火',   desc: '寒木向阳，火暖为宜' },
    { month: '丑', yong: '丙火',   desc: '腊月寒深，火来解冻' },
  ],
  // 丙火
  丙: [
    { month: '寅', yong: '壬水',   desc: '初春火相，壬水既济' },
    { month: '卯', yong: '壬水',   desc: '春火渐旺，壬水调候' },
    { month: '辰', yong: '壬水',   desc: '土旺晦火，壬水为用' },
    { month: '巳', yong: '壬水庚金', desc: '夏火炎炎，壬庚并用' },
    { month: '午', yong: '壬水庚金', desc: '火势最旺，壬庚制火' },
    { month: '未', yong: '壬水',   desc: '火炎土燥，壬水调候' },
    { month: '申', yong: '壬水',   desc: '金水进气，壬水为用' },
    { month: '酉', yong: '壬水',   desc: '金旺火弱，壬水调候' },
    { month: '戌', yong: '壬水',   desc: '土重晦火，壬水为用' },
    { month: '亥', yong: '甲木',   desc: '冬水旺火弱，甲木生火' },
    { month: '子', yong: '甲木',   desc: '寒冬火绝，甲木生火' },
    { month: '丑', yong: '甲木',   desc: '寒土冻火，甲木为用' },
  ],
  // 丁火
  丁: [
    { month: '寅', yong: '甲木庚金', desc: '初春火弱，甲庚并用' },
    { month: '卯', yong: '甲木庚金', desc: '春火渐升，甲庚并用' },
    { month: '辰', yong: '甲木庚金', desc: '土晦火光，甲庚为用' },
    { month: '巳', yong: '壬水庚金', desc: '夏火炎炎，壬庚制火' },
    { month: '午', yong: '壬水庚金', desc: '火势最旺，壬庚为用' },
    { month: '未', yong: '甲木壬水', desc: '火炎土燥，甲壬并用' },
    { month: '申', yong: '甲木庚金', desc: '金水进气，甲庚并用' },
    { month: '酉', yong: '甲木庚金', desc: '金旺火弱，甲庚为用' },
    { month: '戌', yong: '甲木庚金', desc: '土重晦火，甲庚并用' },
    { month: '亥', yong: '甲木庚金', desc: '冬初水旺，甲庚生火' },
    { month: '子', yong: '甲木庚金', desc: '寒冬火绝，甲庚并用' },
    { month: '丑', yong: '甲木庚金', desc: '寒土冻火，甲庚为用' },
  ],
  // 戊土
  戊: [
    { month: '寅', yong: '丙火甲木', desc: '初春土寒，丙甲并用' },
    { month: '卯', yong: '丙火甲木', desc: '春土渐暖，丙甲并用' },
    { month: '辰', yong: '甲木丙火', desc: '土旺木疏，甲丙为用' },
    { month: '巳', yong: '壬水甲木', desc: '夏土火炎，壬甲调候' },
    { month: '午', yong: '壬水甲木', desc: '土燥火炎，壬甲为先' },
    { month: '未', yong: '癸水',   desc: '夏末土燥，癸水滋润' },
    { month: '申', yong: '癸水丙火', desc: '土金相生，癸丙并用' },
    { month: '酉', yong: '丙火癸水', desc: '土生金旺，丙癸并用' },
    { month: '戌', yong: '甲木丙火', desc: '土旺宜疏，甲丙为用' },
    { month: '亥', yong: '丙火甲木', desc: '冬土寒湿，丙甲并用' },
    { month: '子', yong: '丙火甲木', desc: '寒冬冻土，丙甲暖局' },
    { month: '丑', yong: '丙火甲木', desc: '寒土冻凝，丙甲为用' },
  ],
  // 己土
  己: [
    { month: '寅', yong: '丙火庚金', desc: '春木克土，丙庚并用' },
    { month: '卯', yong: '丙火庚金', desc: '木旺土虚，丙庚为用' },
    { month: '辰', yong: '丙火癸水', desc: '土湿宜晒，丙癸并用' },
    { month: '巳', yong: '癸水丙火', desc: '火旺土燥，癸丙调候' },
    { month: '午', yong: '癸水丙火', desc: '火炎土焦，癸丙为先' },
    { month: '未', yong: '癸水丙火', desc: '土重宜润，癸丙并用' },
    { month: '申', yong: '癸水丙火', desc: '金土相生，癸丙并用' },
    { month: '酉', yong: '癸水丙火', desc: '土金旺相，癸丙调候' },
    { month: '戌', yong: '甲木丙火', desc: '土旺宜疏，甲丙为用' },
    { month: '亥', yong: '丙火甲木', desc: '冬土寒湿，丙甲并用' },
    { month: '子', yong: '丙火甲木', desc: '寒冬冻土，丙甲暖局' },
    { month: '丑', yong: '丙火',   desc: '腊月寒土，丙火为用' },
  ],
  // 庚金
  庚: [
    { month: '寅', yong: '丁火甲木', desc: '春金弱，丁火炼金甲木引' },
    { month: '卯', yong: '丁火甲木', desc: '金弱木旺，丁甲并用' },
    { month: '辰', yong: '甲木丁火', desc: '土旺生金，甲丁并用' },
    { month: '巳', yong: '壬水丁火', desc: '火旺金熔，壬丁并用' },
    { month: '午', yong: '壬水丁火', desc: '火炎金熔，壬丁调候' },
    { month: '未', yong: '丁火甲木', desc: '土生金，丁甲并用' },
    { month: '申', yong: '丁火',   desc: '金旺宜炼，丁火为用' },
    { month: '酉', yong: '丁火',   desc: '金气最旺，丁火煅金' },
    { month: '戌', yong: '甲木丁火', desc: '土金旺相，甲丁并用' },
    { month: '亥', yong: '丁火丙火', desc: '冬金寒，丁丙暖金' },
    { month: '子', yong: '丁火丙火', desc: '寒冬金冷，丁丙暖局' },
    { month: '丑', yong: '丙火丁火', desc: '腊月寒金，丙丁并用' },
  ],
  // 辛金
  辛: [
    { month: '寅', yong: '己土壬水', desc: '春金弱，己壬并用' },
    { month: '卯', yong: '壬水己土', desc: '木旺金衰，壬己并用' },
    { month: '辰', yong: '壬水甲木', desc: '土金相生，壬甲并用' },
    { month: '巳', yong: '壬水',   desc: '火旺金熔，壬水救应' },
    { month: '午', yong: '壬水己土', desc: '火炎金熔，壬己并用' },
    { month: '未', yong: '壬水庚金', desc: '土厚埋金，壬庚为用' },
    { month: '申', yong: '壬水甲木', desc: '金水相生，壬甲并用' },
    { month: '酉', yong: '壬水甲木', desc: '金旺水相，壬甲并用' },
    { month: '戌', yong: '壬水甲木', desc: '土旺金相，壬甲并用' },
    { month: '亥', yong: '丙火壬水', desc: '冬金水冷，丙壬并用' },
    { month: '子', yong: '丙火',   desc: '寒冬水冷，丙火暖局' },
    { month: '丑', yong: '丙火壬水', desc: '腊月寒金，丙壬并用' },
  ],
  // 壬水
  壬: [
    { month: '寅', yong: '庚金丙火', desc: '春水弱，庚丙并用' },
    { month: '卯', yong: '庚金辛金', desc: '水泄于木，庚辛生水' },
    { month: '辰', yong: '甲木庚金', desc: '土旺克水，甲庚并用' },
    { month: '巳', yong: '庚金辛金', desc: '火旺水蒸，庚辛生水' },
    { month: '午', yong: '庚金辛金', desc: '火炎水枯，庚辛为用' },
    { month: '未', yong: '辛金甲木', desc: '土克水弱，辛甲并用' },
    { month: '申', yong: '戊土丁火', desc: '水旺宜制，戊丁并用' },
    { month: '酉', yong: '戊土丁火', desc: '金水两旺，戊丁制衡' },
    { month: '戌', yong: '甲木庚金', desc: '土旺克水，甲庚并用' },
    { month: '亥', yong: '戊土丁火', desc: '水势浩大，戊丁并用' },
    { month: '子', yong: '戊土',   desc: '水旺宜堤，戊土制水' },
    { month: '丑', yong: '丙火戊土', desc: '寒水冻凝，丙戊并用' },
  ],
  // 癸水
  癸: [
    { month: '寅', yong: '辛金丙火', desc: '春水润，辛丙并用' },
    { month: '卯', yong: '庚金辛金', desc: '水泄于木，庚辛生水' },
    { month: '辰', yong: '甲木庚金', desc: '土湿晦水，甲庚并用' },
    { month: '巳', yong: '辛金庚金', desc: '火旺水蒸，庚辛为用' },
    { month: '午', yong: '庚金辛金', desc: '火旺水枯，庚辛生水' },
    { month: '未', yong: '庚金辛金', desc: '土克水弱，庚辛为用' },
    { month: '申', yong: '丁火',   desc: '金水相生，丁火调候' },
    { month: '酉', yong: '丁火辛金', desc: '金水两旺，丁辛并用' },
    { month: '戌', yong: '辛金甲木', desc: '土旺克水，辛甲并用' },
    { month: '亥', yong: '戊土丁火', desc: '水势泛滥，戊丁并用' },
    { month: '子', yong: '戊土',   desc: '水旺宜堤，戊土制水' },
    { month: '丑', yong: '丙火',   desc: '寒水冻凝，丙火暖局' },
  ],
};

const MONTH_BRANCH_ORDER = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

/** 获取调候用神（穷通宝鉴） */
function calcTiaoHouYongShen(dayStem, monthBranch) {
  const stem = dayStem;
  const table = TIAO_HOU_TABLE[stem];
  if (!table) return null;
  const entry = table.find(r => r.month === monthBranch);
  return entry || null;
}

/** 六亲关系排盘 */
function calcLiuQin(pillars, details, gender) {
  const dayStem = pillars.day.stem;
  // 年柱：祖上/父母宫
  // 月柱：父母/兄弟宫
  // 日柱：自身/配偶宫
  // 时柱：子女宫
  const liuQin = {
    year: { label: '祖上/父母宫', pillar: `${pillars.year.stem}${pillars.year.branch}` },
    month: { label: '父母/兄弟宫', pillar: `${pillars.month.stem}${pillars.month.branch}` },
    day: { label: '自身/配偶宫', pillar: `${pillars.day.stem}${pillars.day.branch}` },
    hour: { label: '子女宫', pillar: `${pillars.hour.stem}${pillars.hour.branch}` },
  };

  // 男命/女命看夫妻星
  // 男：正财为妻，偏财为情人
  // 女：正官为夫，七杀为情人/偏夫
  const maleSpouse = ['正财','偏财'];
  const femaleSpouse = ['正官','七杀'];
  const spouseStars = gender === 'male' ? maleSpouse : femaleSpouse;

  // 看日支（配偶宫）的十神
  const spouseGong = details.day.shishen;
  const spouseHidden = details.day.hiddenShishen;

  return liuQin;
}

/** 特殊格局判断 */
function calcSpecialPattern(pillars, details, wuxingCount, pattern) {
  const specials = [];
  const dayStem = pillars.day.stem;
  const dayStemWx = getStemWuxing(dayStem);

  // 1. 专旺格：某一种五行特别旺
  const total = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
  for (const [wx, count] of Object.entries(wuxingCount)) {
    if (count / total >= 0.6 && wx === dayStemWx) {
      specials.push({ name: `${wx}专旺格`, desc: `${wx}气专，日主极旺` });
    }
  }

  // 2. 从格：日主极弱，满局异党
  if (pattern.totalScore < 1.5) {
    // 哪种五行最旺就从哪种
    let maxWx = '', maxCount = 0;
    for (const [wx, count] of Object.entries(wuxingCount)) {
      if (wx !== dayStemWx && count > maxCount) { maxCount = count; maxWx = wx; }
    }
    if (maxWx) {
      specials.push({ name: `从${maxWx}格`, desc: `日主极弱，全局${maxWx}气盛，弃命相从` });
    }
  }

  // 3. 化气格（简化检测）
  // 日干与月干/时干天干五合，且月令当旺
  const ganHe = { 甲:'己',乙:'庚',丙:'辛',丁:'壬',戊:'癸',己:'甲',庚:'乙',辛:'丙',壬:'丁',癸:'戊' };
  const huaQiMap = { '甲己':'土','乙庚':'金','丙辛':'水','丁壬':'木','戊癸':'火' };
  for (const otherKey of ['month', 'hour']) {
    const otherStem = pillars[otherKey].stem;
    if (ganHe[dayStem] === otherStem) {
      const pair = [dayStem, otherStem].sort().join('');
      const huaWx = huaQiMap[pair];
      if (huaWx && pattern.monthPower === '旺') {
        specials.push({ name: `${dayStem}${otherStem}化${huaWx}格`, desc: `天干合化${huaWx}，月令当旺` });
      }
    }
  }

  return specials;
}

/** 获取天干五行 */
function getStemWuxing(s) { return STEM_WUXING[s] || ''; }

/** 获取地支五行 */
function getBranchWuxing(b) { return BRANCH_WUXING[b] || ''; }

/** 获取地支藏干 */
function getHiddenStems(b) { return HIDDEN_STEMS[b] || []; }

/** 获取某天干的十神（以日干为参考） */
function getShiShen(dayStem, targetStem) {
  const row = SHISHEN_MAP.find(r => r.stem === dayStem);
  return row ? (row.shishen[targetStem] || '') : '';
}

/** 获取纳音（遍历匹配，支持前后半对） */
function getNaYin(stem, branch) {
  const gz = stem + branch;
  for (const [key, value] of Object.entries(NAYIN_MAP)) {
    if (key.startsWith(gz) || key.endsWith(gz)) return value;
  }
  return '';
}

/** 获取时辰名称 */
function getShiChenName(hour, minute) {
  const totalMin = hour * 60 + minute;
  for (const sc of SHICHEN) {
    if (sc.start === 23) {
      if (totalMin >= 23*60 || totalMin < 1*60) return sc.name;
    } else {
      if (totalMin >= sc.start * 60 && totalMin < sc.end * 60) return sc.name;
    }
  }
  return '子时';
}

/** 获取时辰地支索引 */
function getShiChenZhi(hour, minute) {
  const name = getShiChenName(hour, minute);
  const idx = SHICHEN.findIndex(s => s.name === name);
  return idx; // 0-11 对应 子-亥
}

/** 计算真太阳时 - Equation of Time 近似公式 */
function calcSolarTime(year, month, day, hour, minute, cityKey) {
  const city = CITIES[cityKey];
  if (!city) return { hour, minute, eot: 0, adjusted: false };

  // N: 一年中的第几天
  const date = new Date(year, month - 1, day);
  const start = new Date(year, 0, 0);
  const diff = date - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // EoT 近似公式
  const B = (360 / 365) * (dayOfYear - 81) * Math.PI / 180;
  const eot = 9.87 * Math.sin(2*B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // 本地平太阳时 = 标准时间 + (城市经度 - 120°) / 15° * 60分钟
  const lmtOffset = (city.lng - 120) * 4; // 分钟
  const localMeanMin = hour * 60 + minute + lmtOffset;
  const solarMin = localMeanMin + eot;

  let h = Math.floor(solarMin / 60);
  let m = Math.round(solarMin % 60);
  // 分钟为负 → 向小时借位
  while (m < 0) { m += 60; h -= 1; }
  // 分钟溢出 → 进位
  while (m >= 60) { m -= 60; h += 1; }
  // 小时为负 → 向前天借位
  while (h < 0) { h += 24; }
  // 小时溢出
  while (h >= 24) { h -= 24; }

  return { hour: h, minute: m, eot: Math.round(eot*10)/10, lmtOffset: Math.round(lmtOffset*10)/10, adjusted: true };
}

/**
 * 核心排盘函数
 * @returns {object} 完整的排盘结果
 */
function calcBaZi(year, month, day, hour, minute, gender, cityKey, useSolarTime, personName) {
  // 真太阳时校正
  let solarTime = null;
  let calcHour = hour, calcMin = minute;
  if (useSolarTime && cityKey && CITIES[cityKey]) {
    solarTime = calcSolarTime(year, month, day, hour, minute, cityKey);
    calcHour = solarTime.hour;
    calcMin = solarTime.minute;
  }

  // ── 全部使用 lunar 库计算四柱 ──
  if (typeof Solar === 'undefined' || typeof Lunar === 'undefined') {
    throw new Error('lunar 库未加载，无法排盘');
  }
  // Solar 包含时分秒，确保日柱/时柱精确
  const solar = Solar.fromYmdHms(year, month, day, calcHour, calcMin, 0);
  const lunar = solar.getLunar();
  const bazi = lunar.getBaZi();

  // 年柱
  const yGZ = bazi[0];
  const yStem = yGZ.charAt(0);
  const yBranch = yGZ.charAt(1);

  // 月柱（节气精确）
  const mGZ = bazi[1];
  const mStem = mGZ.charAt(0);
  const mBranch = mGZ.charAt(1);

  // 日柱
  const dGZ = bazi[2];
  const dStem = dGZ.charAt(0);
  const dBranch = dGZ.charAt(1);

  // 时柱
  const hGZ = bazi[3];
  const hStem = hGZ.charAt(0);
  const hBranch = hGZ.charAt(1);

  const pillars = {
    year: { stem: yStem, branch: yBranch },
    month: { stem: mStem, branch: mBranch },
    day: { stem: dStem, branch: dBranch },
    hour: { stem: hStem, branch: hBranch },
  };

  // 各柱详细信息
  const pillarKeys = ['year','month','day','hour'];
  const details = {};
  for (const key of pillarKeys) {
    const p = pillars[key];
    const hiddenStems = getHiddenStems(p.branch);
    const shishen = key === 'day' ? '日元' : getShiShen(pillars.day.stem, p.stem);
    const nayin = getNaYin(p.stem, p.branch);

    // 各藏干的十神
    const hiddenShishen = hiddenStems.map(hs => ({
      stem: hs,
      wuxing: getStemWuxing(hs),
      shishen: getShiShen(pillars.day.stem, hs),
    }));

    // 神煞
    const stars = getStarsForPillar(p.stem + p.branch, p.stem, p.branch, pillars);

    details[key] = {
      ganzhi: p.stem + p.branch,
      stem: p.stem,
      branch: p.branch,
      stemWuxing: getStemWuxing(p.stem),
      branchWuxing: getBranchWuxing(p.branch),
      hiddenStems,
      hiddenShishen,
      shishen,
      nayin,
      stars,
    };
  }

  // 五行统计
  const wuxingCount = { 木:0, 火:0, 土:0, 金:0, 水:0 };
  for (const key of pillarKeys) {
    const d = details[key];
    if (d.stemWuxing) wuxingCount[d.stemWuxing]++;
    if (d.branchWuxing) wuxingCount[d.branchWuxing]++;
    for (const hs of d.hiddenStems) {
      const wx = getStemWuxing(hs);
      if (wx) wuxingCount[wx] += 0.5; // 藏干计半
    }
  }

  // 格局分析（简化版）
  const pattern = analyzePattern(pillars, details, wuxingCount);

  // 调候用神（穷通宝鉴）
  const tiaoHou = calcTiaoHouYongShen(pillars.day.stem, pillars.month.branch);

  // 六亲排盘
  const liuQin = calcLiuQin(pillars, details, gender);

  // 特殊格局
  const specialPatterns = calcSpecialPattern(pillars, details, wuxingCount, pattern);

  // 大运
  const dayun = calcDaYun(pillars, gender, year, month, day, calcHour, calcMin);

  // 当前流年
  const now = new Date();
  const currentYear = now.getFullYear();
  const liuNianGanIdx = ((currentYear - 4) % 10 + 10) % 10;
  const liuNianZhiIdx = ((currentYear - 4) % 12 + 12) % 12;
  const liuNian = {
    year: currentYear,
    stem: STEMS[liuNianGanIdx],
    branch: BRANCHES[liuNianZhiIdx],
    ganzhi: STEMS[liuNianGanIdx] + BRANCHES[liuNianZhiIdx],
    shishenTianGan: getShiShen(pillars.day.stem, STEMS[liuNianGanIdx]),
    shishenDiZhi: getShiShen(pillars.day.stem, BRANCHES[liuNianZhiIdx]),
  };

  return {
    input: { year, month, day, hour, minute, gender, cityKey, name: personName || '' },
    solarTime,
    pillars,
    details,
    wuxingCount,
    pattern,
    tiaoHou,
    liuQin,
    specialPatterns,
    dayun,
    liuNian,
  };
}

/** 格局分析（身强/身弱、用神/忌神） */
function analyzePattern(pillars, details, wuxingCount) {
  const dayStemWx = details.day.stemWuxing;
  const dayBranchWx = details.day.branchWuxing;

  // 月令得分
  const monthBranch = pillars.month.branch;
  const monthWx = getBranchWuxing(monthBranch);

  // 日主五行在月令的旺相休囚死
  const wangXiang = {
    '木': { '寅':'旺','卯':'旺','辰':'休','巳':'囚','午':'休','未':'休','申':'死','酉':'死','戌':'囚','亥':'相','子':'相','丑':'休' },
    '火': { '寅':'相','卯':'相','辰':'囚','巳':'旺','午':'旺','未':'休','申':'休','酉':'死','戌':'囚','亥':'死','子':'死','丑':'休' },
    '土': { '寅':'死','卯':'死','辰':'旺','巳':'相','午':'相','未':'旺','申':'休','酉':'囚','戌':'旺','亥':'囚','子':'囚','丑':'旺' },
    '金': { '寅':'囚','卯':'囚','辰':'相','巳':'休','午':'死','未':'相','申':'旺','酉':'旺','戌':'休','亥':'休','子':'休','丑':'相' },
    '水': { '寅':'休','卯':'休','辰':'死','巳':'囚','午':'囚','未':'死','申':'相','酉':'相','戌':'囚','亥':'旺','子':'旺','丑':'相' },
  }[dayStemWx] || {};

  const monthPower = wangXiang[monthBranch] || '休';
  const monthScore = { '旺':3, '相':2, '休':1, '囚':0.5, '死':0 }[monthPower] || 0;

  // 天干比劫
  let helpScore = 0;
  for (const key of ['year','month','day','hour']) {
    if (getStemWuxing(details[key].stem) === dayStemWx) helpScore++;
    if (getBranchWuxing(details[key].branch) === dayStemWx) helpScore += 0.5;
    for (const hs of details[key].hiddenStems) {
      if (getStemWuxing(hs) === dayStemWx) helpScore += 0.3;
    }
  }

  const totalScore = monthScore + helpScore;
  const isStrong = totalScore >= 3.5;

  // 用神 = 支持日主的五行（身弱）或克制日主的五行（身强）
  const wxCycle = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
  const restrictCycle = { '木':'土','火':'金','土':'水','金':'木','水':'火' };

  // 找出最强和最弱的五行
  let maxWx = '', maxCount = 0, minWx = '', minCount = 999;
  for (const [wx, count] of Object.entries(wuxingCount)) {
    if (count > maxCount) { maxCount = count; maxWx = wx; }
    if (count < minCount) { minCount = count; minWx = wx; }
  }

  // 简单用神判断
  let yongShen = ''; // 用神
  let jiShen = '';   // 忌神
  if (isStrong) {
    // 身强：取克泄
    yongShen = restrictCycle[dayStemWx] || '';
    jiShen = wxCycle[dayStemWx] || '';
  } else {
    // 身弱：取生扶
    yongShen = wxCycle[restrictCycle[dayStemWx]] || '';
    jiShen = restrictCycle[dayStemWx] || '';
  }
  // 如果用神是空（土生金...），用缺的五行修正
  if (!yongShen || yongShen === dayStemWx) {
    yongShen = minWx;
    jiShen = maxWx;
  }

  return {
    dayStemWuxing: dayStemWx,
    monthPower,
    monthScore,
    helpScore,
    totalScore: Math.round(totalScore*10)/10,
    isStrong: isStrong ? '身强' : '身弱',
    yongShen,
    jiShen,
    strongWx: maxWx,
    weakWx: minWx,
  };
}

/** 流年详批 */
function calcLiuNianDetail(pillars, dayun, dayStem, birthYear) {
  const now = new Date();
  const year = now.getFullYear();
  const liuNianGan = STEMS[((year - 4) % 10 + 10) % 10];
  const liuNianZhi = BRANCHES[((year - 4) % 12 + 12) % 12];

  // 根据实际年龄找到当前大运段
  const age = year - birthYear;
  let currentDayun = null;
  if (dayun && dayun.periods.length > 0) {
    for (const p of dayun.periods) {
      const [start] = p.ageRange.split('-').map(Number);
      if (age >= start) {
        currentDayun = p;
      } else {
        break;
      }
    }
    if (!currentDayun) currentDayun = dayun.periods[0];
  }

  const analysis = [];

  // 1. 流年天干 × 大运天干
  if (currentDayun) {
    const dyGan = currentDayun.stem;
    const dyZhi = currentDayun.branch;
    const dyWx = getStemWuxing(dyGan);
    const lnWx = getStemWuxing(liuNianGan);
    const lnZhiWx = getBranchWuxing(liuNianZhi);

    // 天干生克
    const WX_SHENG = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
    const WX_KE = { '木':'土','火':'金','土':'水','金':'木','水':'火' };
    if (WX_SHENG[lnWx] === dyWx) {
      analysis.push({ item: '流年天干→大运', detail: `${liuNianGan}(${lnWx})生${dyGan}(${dyWx})，大运受生`, effect: '吉' });
    } else if (WX_SHENG[dyWx] === lnWx) {
      analysis.push({ item: '流年天干→大运', detail: `${dyGan}(${dyWx})生${liuNianGan}(${lnWx})，流年受生`, effect: '吉' });
    } else if (WX_KE[lnWx] === dyWx) {
      analysis.push({ item: '流年天干→大运', detail: `${liuNianGan}(${lnWx})克${dyGan}(${dyWx})`, effect: '凶' });
    } else if (WX_KE[dyWx] === lnWx) {
      analysis.push({ item: '流年天干→大运', detail: `${dyGan}(${dyWx})克${liuNianGan}(${lnWx})`, effect: '凶' });
    }

    // 地支刑冲合
    const liuHe = { 子:'丑',丑:'子',寅:'亥',卯:'戌',辰:'酉',巳:'申',午:'未',未:'午',申:'巳',酉:'辰',戌:'卯',亥:'寅' };
    const liuChong = { 子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳' };
    const sanHe = {
      '申':['子','辰'], '子':['申','辰'], '辰':['申','子'],
      '亥':['卯','未'], '卯':['亥','未'], '未':['亥','卯'],
      '寅':['午','戌'], '午':['寅','戌'], '戌':['寅','午'],
      '巳':['酉','丑'], '酉':['巳','丑'], '丑':['巳','酉'],
    };
    const ganHe = { 甲:'己',乙:'庚',丙:'辛',丁:'壬',戊:'癸',己:'甲',庚:'乙',辛:'丙',壬:'丁',癸:'戊' };

    if (liuHe[liuNianZhi] === dyZhi) {
      analysis.push({ item: '流年地支→大运', detail: `${liuNianZhi}${dyZhi}六合`, effect: '吉' });
    } else if (liuChong[liuNianZhi] === dyZhi) {
      analysis.push({ item: '流年地支→大运', detail: `${liuNianZhi}${dyZhi}六冲`, effect: '凶' });
    }

    // 天干合
    if (ganHe[liuNianGan] === dyGan) {
      analysis.push({ item: '流年天干→大运', detail: `${liuNianGan}${dyGan}天干五合`, effect: '吉' });
    }

    // 地支三合
    if (sanHe[liuNianZhi] && sanHe[liuNianZhi].includes(dyZhi)) {
      analysis.push({ item: '流年地支→大运', detail: `${liuNianZhi}${dyZhi}三合`, effect: '吉' });
    }
  }

  // 2. 流年 × 原局四柱
  const pillarNames = ['year','month','day','hour'];
  const pillarLabels = ['年柱','月柱','日柱','时柱'];
  for (let i = 0; i < 4; i++) {
    const p = pillars[pillarNames[i]];
    if (!p) continue;
    const liuHe = { 子:'丑',丑:'子',寅:'亥',卯:'戌',辰:'酉',巳:'申',午:'未',未:'午',申:'巳',酉:'辰',戌:'卯',亥:'寅' };
    const liuChong = { 子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳' };
    const sanXingPairs = {
      '寅':['巳','申'], '巳':['寅','申'], '申':['寅','巳'],
      '丑':['未','戌'], '未':['丑','戌'], '戌':['丑','未'],
      '子':['卯'], '卯':['子'],
    };
    if (liuHe[liuNianZhi] === p.branch) {
      analysis.push({ item: `${pillarLabels[i]}×流年`, detail: `${p.branch}${liuNianZhi}六合，${pillarLabels[i]}被合动`, effect: '吉' });
    } else if (liuChong[liuNianZhi] === p.branch) {
      const chongEffect = i === 2 ? '婚姻宫逢冲' : i === 1 ? '月令被冲动' : '';
      analysis.push({ item: `${pillarLabels[i]}×流年`, detail: `${p.branch}${liuNianZhi}六冲，${chongEffect}`, effect: '凶' });
    } else if (sanXingPairs[liuNianZhi] && sanXingPairs[liuNianZhi].includes(p.branch)) {
      analysis.push({ item: `${pillarLabels[i]}×流年`, detail: `${p.branch}${liuNianZhi}相刑`, effect: '凶' });
    }
  }

  // 3. 十神汇总
  const shishenTianGan = getShiShen(dayStem, liuNianGan);
  const shishenDiZhi = getShiShen(dayStem, liuNianZhi);
  analysis.unshift({ item: '流年十神', detail: `天干 ${liuNianGan} → ${shishenTianGan}，地支 ${liuNianZhi} → ${shishenDiZhi}`, effect: '' });

  // 总体建议
  let summary = '';
  const hasGood = analysis.some(a => a.effect === '吉');
  const hasBad = analysis.some(a => a.effect === '凶');
  if (hasGood && !hasBad) summary = '今年吉星高照，运势顺畅，宜把握机会。';
  else if (hasBad && !hasGood) summary = '今年冲克较多，宜稳守为主，谨慎决策。';
  else if (hasGood && hasBad) summary = '今年吉凶互见，有好有坏，需审时度势。';
  else summary = '今年运势平淡，无大波澜，平稳度过。';

  return { year, liuNianGan, liuNianZhi, analysis, summary, shishenTianGan, shishenDiZhi };
}

/** 大运计算 */
function calcDaYun(pillars, gender, year, month, day, hour, minute) {
  const yearGan = pillars.year.stem;
  const yearZhi = pillars.year.branch;
  const yearGanIdx = STEMS.indexOf(yearGan);
  const isYang = yearGanIdx % 2 === 0; // 甲丙戊庚壬为阳

  const isMale = gender === 'male';
  const isForward = (isYang && isMale) || (!isYang && !isMale);

  // 月柱为基准
  const monthGan = pillars.month.stem;
  const monthZhi = pillars.month.branch;
  const monthGanIdx = STEMS.indexOf(monthGan);
  const monthZhiIdx = BRANCHES.indexOf(monthZhi);

  // 起运年龄：从出生日到下一个/上一个节气的天数 ÷ 3
  let startAge = 8;
  try {
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    const jie = isForward ? lunar.getNextJie() : lunar.getPrevJie();
    if (jie) {
      const js = jie.getSolar();
      const birthDt = new Date(year, month - 1, day, hour, minute);
      const jieDt = new Date(js.getYear(), js.getMonth() - 1, js.getDay(), js.getHour(), js.getMinute());
      const diffDays = Math.abs(jieDt - birthDt) / (1000 * 60 * 60 * 24);
      startAge = Math.round(diffDays / 3);
      if (startAge < 0) startAge = 0;
    }
  } catch (e) {
    startAge = 8;
  }

  const periods = [];

  for (let i = 0; i < 8; i++) {
    const offset = isForward ? (i + 1) : -(i + 1);
    const ganIdx = ((monthGanIdx + offset) % 10 + 10) % 10;
    const zhiIdx = ((monthZhiIdx + offset) % 12 + 12) % 12;
    const ageStart = startAge + i * 10;
    const ageEnd = ageStart + 9;

    periods.push({
      ageRange: `${ageStart}-${ageEnd}`,
      stem: STEMS[ganIdx],
      branch: BRANCHES[zhiIdx],
      ganzhi: STEMS[ganIdx] + BRANCHES[zhiIdx],
      shishen: getShiShen(pillars.day.stem, STEMS[ganIdx]),
    });
  }

  return {
    startAge,
    direction: isForward ? '顺排' : '逆排',
    periods,
  };
}
