/**
 * 神煞规则库
 * 规则来源：子平法常见神煞
 */
const STAR_RULES = {
  // ── 天干类神煞（以年干或日干查） ──

  // 天乙贵人 - 日干查
  tianyi: {
    name: '天乙贵人', type: 'good',
    by: 'day-gan',
    lookup: { 甲: ['丑','未'], 乙: ['子','申'], 丙: ['酉','亥'], 丁: ['酉','亥'],
              戊: ['丑','未'], 己: ['子','申'], 庚: ['午','寅'], 辛: ['午','寅'],
              壬: ['卯','巳'], 癸: ['卯','巳'] }
  },
  // 文昌贵人 - 日干查
  wenchang: {
    name: '文昌贵人', type: 'good',
    by: 'day-gan',
    lookup: { 甲:'巳', 乙:'午', 丙:'申', 丁:'酉', 戊:'申', 己:'酉', 庚:'亥', 辛:'子', 壬:'寅', 癸:'卯' }
  },
  // 天厨贵人 - 日干查
  tianchu: {
    name: '天厨贵人', type: 'good',
    by: 'day-gan',
    lookup: { 甲:'巳', 乙:'午', 丙:'子', 丁:'巳', 戊:'午', 己:'子', 庚:'申', 辛:'酉', 壬:'寅', 癸:'卯' }
  },
  // 天官贵人 - 日干查
  tianguan: {
    name: '天官贵人', type: 'good',
    by: 'day-gan',
    lookup: { 甲:'未', 乙:'辰', 丙:'巳', 丁:'寅', 戊:'卯', 己:'酉', 庚:'亥', 辛:'戌', 壬:'申', 癸:'午' }
  },
  // 天福贵人 - 日干查
  tianfu: {
    name: '天福贵人', type: 'good',
    by: 'day-gan',
    lookup: { 甲:'寅', 乙:'卯', 丙:'子', 丁:'亥', 戊:'戌', 己:'酉', 庚:'申', 辛:'未', 壬:'午', 癸:'巳' }
  },
  // 天德 - 月干查（但实际以日干简化）
  tiande: {
    name: '天德', type: 'good',
    by: 'day-gan',
    lookup: { 甲:'寅', 乙:'申', 丙:'辰', 丁:'戌', 戊:'寅', 己:'申', 庚:'辰', 辛:'戌', 壬:'寅', 癸:'申' }
  },
  // 月德
  yuede: {
    name: '月德', type: 'good',
    by: 'day-gan',
    lookup: { 甲:'寅', 乙:'午', 丙:'辰', 丁:'子', 戊:'寅', 己:'午', 庚:'辰', 辛:'子', 壬:'寅', 癸:'午' }
  },

  // ── 地支类神煞（以年支或日支查） ──

  // 桃花 - 年支/日支查
  taohua: {
    name: '桃花', type: 'good',
    by: 'year-zhi',
    lookup: { 子:'酉', 丑:'午', 寅:'卯', 卯:'子', 辰:'酉', 巳:'午',
              午:'卯', 未:'子', 申:'酉', 酉:'午', 戌:'卯', 亥:'子' }
  },
  // 华盖 - 日支查
  huagai: {
    name: '华盖', type: 'good',
    by: 'year-zhi',
    lookup: { 子:'辰', 丑:'丑', 寅:'戌', 卯:'未', 辰:'辰', 巳:'丑',
              午:'戌', 未:'未', 申:'辰', 酉:'丑', 戌:'戌', 亥:'未' }
  },
  // 驿马 - 日支/年支查
  yima: {
    name: '驿马', type: 'good',
    by: 'year-zhi',
    lookup: { 子:'寅', 丑:'亥', 寅:'申', 卯:'巳', 辰:'寅', 巳:'亥',
              午:'申', 未:'巳', 申:'寅', 酉:'亥', 戌:'申', 亥:'巳' }
  },
  // 孤辰 - 年支查
  guchen: {
    name: '孤辰', type: 'bad',
    by: 'year-zhi',
    lookup: { 子:'寅', 丑:'寅', 寅:'巳', 卯:'巳', 辰:'巳', 巳:'申',
              午:'申', 未:'申', 申:'亥', 酉:'亥', 戌:'亥', 亥:'寅' }
  },
  // 寡宿 - 年支查
  guaxiu: {
    name: '寡宿', type: 'bad',
    by: 'year-zhi',
    lookup: { 子:'戌', 丑:'戌', 寅:'丑', 卯:'丑', 辰:'丑', 巳:'辰',
              午:'辰', 未:'辰', 申:'未', 酉:'未', 戌:'未', 亥:'戌' }
  },
  // 亡神 - 年支查
  wangshen: {
    name: '亡神', type: 'bad',
    by: 'year-zhi',
    lookup: { 子:'亥', 丑:'申', 寅:'巳', 卯:'寅', 辰:'亥', 巳:'申',
              午:'巳', 未:'寅', 申:'亥', 酉:'申', 戌:'巳', 亥:'寅' }
  },
  // 劫煞 - 年支查
  jiesha: {
    name: '劫煞', type: 'bad',
    by: 'year-zhi',
    lookup: { 子:'巳', 丑:'寅', 寅:'亥', 卯:'申', 辰:'巳', 巳:'寅',
              午:'亥', 未:'申', 申:'巳', 酉:'寅', 戌:'亥', 亥:'申' }
  },
  // 元辰 - 年支查
  yuanchen: {
    name: '元辰', type: 'bad',
    by: 'year-zhi',
    lookup: { 子:'未', 丑:'申', 寅:'酉', 卯:'戌', 辰:'亥', 巳:'子',
              午:'丑', 未:'寅', 申:'卯', 酉:'辰', 戌:'巳', 亥:'午' }
  },
  // 红鸾 - 年支查
  hongluan: {
    name: '红鸾', type: 'good',
    by: 'year-zhi',
    lookup: { 子:'卯', 丑:'寅', 寅:'丑', 卯:'子', 辰:'亥', 巳:'戌',
              午:'酉', 未:'申', 申:'未', 酉:'午', 戌:'巳', 亥:'辰' }
  },
  // 天喜 - 年支查
  tianxi: {
    name: '天喜', type: 'good',
    by: 'year-zhi',
    lookup: { 子:'酉', 丑:'申', 寅:'未', 卯:'午', 辰:'巳', 巳:'辰',
              午:'卯', 未:'寅', 申:'丑', 酉:'子', 戌:'亥', 亥:'戌' }
  },
};

/**
 * 获取某柱匹配的神煞
 * @param {string} ganZhi - 如 "甲子"
 * @param {string} stem - 天干
 * @param {string} branch - 地支
 * @param {object} refPillars - 参考柱 { year, month, day, hour }
 * @returns {Array<{name:string, type:string}>}
 */
function getStarsForPillar(ganZhi, stem, branch, refPillars) {
  const result = [];
  for (const [key, rule] of Object.entries(STAR_RULES)) {
    let lookupValue;
    if (rule.by === 'day-gan') {
      lookupValue = rule.lookup[refPillars.day.stem];
    } else if (rule.by === 'year-zhi') {
      lookupValue = rule.lookup[refPillars.year.branch];
    }
    if (!lookupValue) continue;

    const targets = Array.isArray(lookupValue) ? lookupValue : [lookupValue];
    if (targets.includes(branch) || targets.includes(stem)) {
      result.push({ name: rule.name, type: rule.type });
    }
  }
  return result;
}
