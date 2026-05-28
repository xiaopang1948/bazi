const YUNSHI = { view: 'life', dim: 'overall', result: null }

const DIM_LABELS = { overall:'综合', love:'感情', health:'健康', career:'事业', wealth:'财运' }

const DIM_WEIGHTS = {
  overall: { 正官:20, 七杀:-20, 正印:30, 偏印:20, 正财:10, 偏财:5, 食神:0, 伤官:-10, 比肩:-10, 劫财:-20 },
  love: { 正官:30, 七杀:15, 正财:30, 偏财:20, 食神:5, 伤官:-15, 比肩:-15, 劫财:-30 },
  health: { 正印:25, 偏印:20, 食神:20, 伤官:-10, 七杀:-30, 正官:-15, 劫财:-15, 比肩:-5 },
  career: { 正官:40, 七杀:25, 正印:20, 偏印:10, 正财:10, 偏财:5, 食神:0, 伤官:-5, 比肩:-10, 劫财:-20 },
  wealth: { 正财:40, 偏财:30, 食神:20, 伤官:10, 正官:-10, 七杀:-15, 比肩:-15, 劫财:-25 },
}

function getYunshiResult() {
  if (typeof lastResult !== 'undefined' && lastResult) return lastResult
  return null
}

const SHI_SHEN_QUOTES = {
  正印: { source:'《三命通会》', text:'正印者，乃五行之正库，生我者也，恩荫之浩荡也。' },
  偏印: { source:'《渊海子平》', text:'偏印者，枭神之宿，生我而带孤，智深而性僻。' },
  正官: { source:'《渊海子平》', text:'正官者，贵气之神，管束一身，权威所系。' },
  七杀: { source:'《三命通会》', text:'七杀者，与日主相克之同性，威权之象，号为偏官。' },
  正财: { source:'《渊海子平》', text:'正财者，受我克制之异性，妻财之属，稳而可守。' },
  偏财: { source:'《三命通会》', text:'偏财者，众人之财，横来之福，动而得之。' },
  食神: { source:'《渊海子平》', text:'食神者，日主所生之异性，福寿之星，安享之宿。' },
  伤官: { source:'《三命通会》', text:'伤官者，日主所生之同性，才华之象，傲物之资。' },
  比肩: { source:'《渊海子平》', text:'比肩者，与日主同，兄弟之象，同气连枝。' },
  劫财: { source:'《三命通会》', text:'劫财者，与日主异而同性，财之贼也，主破耗纷争。' },
}

const SHI_SHEN_MODERN = {
  正印: '正印是生你的天干，像母亲一样无条件给养。有正印的人生性沉稳，有贵人缘，适合在体制内或大平台发展。',
  偏印: '偏印也是生你的，但路子比较偏——聪明、孤僻、不走寻常路。适合搞研究、玄学、小众赛道，脑回路清奇是你的天赋。',
  正官: '正官是管你的，代表规则、权威、社会地位。正官旺的人正派靠谱，适合做管理、公务员，但容易给自己太大压力。',
  七杀: '七杀是克你的，但猛。七杀的人天生战士，敢闯敢拼，适合创业、军警、极限行业。缺点是脾气急，容易得罪人。',
  正财: '正财是你控制的，稳稳当当来钱。正财旺的人务实，适合做实体、稳定工作，不太适合投机。',
  偏财: '偏财也是你控制的，但来得快去得也快。偏财旺的人会搞钱，副业、投资、灰色地带的钱都敢碰，但守不住。',
  食神: '食神是你生的，代表才艺和享受。食神旺的人有品味，适合做美食、艺术、设计类工作，心态好不急不躁。',
  伤官: '伤官也是你生的，但更锋利。伤官旺的人才华外露，嘴皮子厉害，适合做创意、表演、自媒体，但容易得罪人而不自知。',
  比肩: '比肩是同辈。比肩旺的人讲义气、朋友多，适合合伙创业。但竞争也多——朋友是贵人也是对手，分钱的事得掰扯清楚。',
  劫财: '劫财也是同辈，但更狠。劫财旺的人社交能力强，但钱留不住，容易替兄弟出头买单。合作要小心，合同比酒局管用。',
}

const QUOTE_EXT = {
  overall: {
    正印: { source:'《三命通会》', text:'正印者，乃五行之正库，生我者也，恩荫之浩荡也。' },
    偏印: { source:'《渊海子平》', text:'偏印者，枭神之宿，生我而带孤，智深而性僻。' },
    正官: { source:'《渊海子平》', text:'正官者，贵气之神，管束一身，权威所系。' },
    七杀: { source:'《三命通会》', text:'七杀者，与日主相克之同性，威权之象，号为偏官。' },
    正财: { source:'《渊海子平》', text:'正财者，受我克制之异性，妻财之属，稳而可守。' },
    偏财: { source:'《三命通会》', text:'偏财者，众人之财，横来之福，动而得之。' },
    食神: { source:'《渊海子平》', text:'食神者，日主所生之异性，福寿之星，安享之宿。' },
    伤官: { source:'《三命通会》', text:'伤官者，日主所生之同性，才华之象，傲物之资。' },
    比肩: { source:'《渊海子平》', text:'比肩者，与日主同，兄弟之象，同气连枝。' },
    劫财: { source:'《三命通会》', text:'劫财者，与日主异而同性，财之贼也，主破耗纷争。' },
  },
  career: {
    正印: { source:'《千里命稿》', text:'官格用印，自以近贵求名之为宜，尤利于东南。' },
    偏印: { source:'《滴天髓》', text:'偏印为权，不循常理，异路功名，偏房侧室。' },
    正官: { source:'《子平真诠》', text:'官星清透，贵气勃发，登科及第，立身朝堂。' },
    七杀: { source:'《千里命稿》', text:'杀旺得制，位重权高，身杀两停，必为大贵。' },
    正财: { source:'《渊海子平》', text:'财旺生官，既富且贵，财官相生，名利双收。' },
    偏财: { source:'《三命通会》', text:'偏财为用，异路求财，商贾之命，十有九发。' },
    食神: { source:'《穷通宝鉴》', text:'食神生财，贵自艺来，技艺精湛，亦有前程。' },
    伤官: { source:'《滴天髓》', text:'伤官佩印，贵不可言，伤官生财，富自才出。' },
    比肩: { source:'《千里命稿》', text:'比肩帮身，众擎易举，独木难支，得友方成。' },
    劫财: { source:'《三命通会》', text:'劫财助身，争而后得，群雄逐鹿，捷足先登。' },
  },
  wealth: {
    正印: { source:'《渊海子平》', text:'印绶主智，智以生财，学成文武艺，货与帝王家。' },
    偏印: { source:'《滴天髓》', text:'独门技艺，奇货可居，人无我有，利市三倍。' },
    正官: { source:'《千里命稿》', text:'官星护财，俸禄所系，不义之财，取之招祸。' },
    七杀: { source:'《三命通会》', text:'杀星生财，险中求富，刀头舔血，亦得巨利。' },
    正财: { source:'《渊海子平》', text:'正财得地，仓库丰盈，日主健旺，富甲一方。' },
    偏财: { source:'《三命通会》', text:'偏财透出，横发一时，众财争逐，得之大幸。' },
    食神: { source:'《穷通宝鉴》', text:'食神生财，富贵自天，财源如海，用之不竭。' },
    伤官: { source:'《滴天髓》', text:'伤官生财，富从技来，创意变现，利可敌国。' },
    比肩: { source:'《千里命稿》', text:'比肩分财，合作得利，独食难肥，分则共赢。' },
    劫财: { source:'《三命通会》', text:'劫财夺财，破耗多端，兄弟合伙，账目在先。' },
  },
  love: {
    正印: { source:'《渊海子平》', text:'印绶护身，婚姻有靠，父母之命，媒妁之言。' },
    偏印: { source:'《滴天髓》', text:'偏印孤辰，情感多艰，精神之恋，超然物外。' },
    正官: { source:'《子平真诠》', text:'正官为夫（女命），得地则贤，官星清正，夫贵妻荣。' },
    七杀: { source:'《千里命稿》', text:'七杀为偏夫，性情刚烈，一见钟情，亦易反目。' },
    正财: { source:'《渊海子平》', text:'正财为妻（男命），得位则良，妻贤子孝，家道日昌。' },
    偏财: { source:'《三命通会》', text:'偏财为偏妻，外遇之缘，露水之情，得之易失之亦易。' },
    食神: { source:'《穷通宝鉴》', text:'食神主和，夫妻恩爱，和气致祥，家和事兴。' },
    伤官: { source:'《滴天髓》', text:'伤官克官（女命），婚姻多舛，口舌之争，最伤和气。' },
    比肩: { source:'《千里命稿》', text:'比肩争夫（女命），情敌环伺，防火防盗防闺蜜。' },
    劫财: { source:'《三命通会》', text:'劫财夺妻（男命），他人插足，守好家门，防微杜渐。' },
  },
  health: {
    正印: { source:'《渊海子平》', text:'印星护体，福寿绵长，虽有小疾，无碍大康。' },
    偏印: { source:'《滴天髓》', text:'偏印为病，神经过敏，思虑过度，暗耗精神。' },
    正官: { source:'《千里命稿》', text:'官星克身，压力成疾，劳心劳力，筋骨之伤。' },
    七杀: { source:'《三命通会》', text:'七杀攻身，灾厄频仍，刀伤手术，意外横行。' },
    正财: { source:'《渊海子平》', text:'财星耗身，为财所累，过劳成疾，得不偿失。' },
    偏财: { source:'《三命通会》', text:'偏财耗体，酒色伤身，灯红酒绿，病从口入。' },
    食神: { source:'《穷通宝鉴》', text:'食神为福，心宽体胖，能吃是福，过则成灾。' },
    伤官: { source:'《滴天髓》', text:'伤官泄气，心火上炎，口舌生疮，烦躁难安。' },
    比肩: { source:'《千里命稿》', text:'比肩为朋，朋友为药，心情舒畅，百病不侵。' },
    劫财: { source:'《三命通会》', text:'劫财搏斗，因争致伤，是非缠身，气急攻心。' },
  },
}

const DIM_MODERN = {
  overall: {
    正印: '正印像母亲一样无条件给养你。有正印的人生性沉稳，有贵人缘，适合在体制内或大平台发展。',
    偏印: '偏印聪明但孤僻，不走寻常路。适合搞研究、玄学、小众赛道，脑回路清奇是你的天赋。',
    正官: '正官代表规则、权威、社会地位。正官旺的人正派靠谱，适合做管理，但容易给自己太大压力。',
    七杀: '七杀克你但猛。天生战士，敢闯敢拼，适合创业、军警、极限行业。缺点是脾气急。',
    正财: '正财稳稳当当来钱。务实，适合做实体、稳定工作，不太适合投机。',
    偏财: '偏财来得快去得也快。会搞钱，副业投资都敢碰，但守不住。',
    食神: '食神代表才艺和享受。有品味，适合美食、艺术、设计，心态好不急不躁。',
    伤官: '伤官才华外露，嘴皮子厉害，适合做创意、表演、自媒体，但容易得罪人而不自知。',
    比肩: '比肩旺的讲义气朋友多，适合合伙。但朋友也是对手，分钱的事得掰扯清楚。',
    劫财: '劫财社交能力强，但钱留不住，容易替兄弟出头买单。合同比酒局管用。',
  },
  career: {
    正印: '印星在事业上代表贵人和平台。正印得力则靠山稳、名声好，适合做幕后统筹或技术深耕。',
    偏印: '偏印在事业上代表冷门专长。适合搞研发、战略、数据分析，越是别人搞不定的你越有优势。',
    正官: '正官在事业上代表职务和权威。官星得地则仕途顺畅，适合在规则清晰的体系内稳步上升。',
    七杀: '七杀在事业上代表竞争和突破。杀星得制则能扛事敢冲锋，适合在激烈竞争中打硬仗。',
    正财: '正财在事业上代表稳定收入和实业经营。适合做长期积累型的工作，稳扎稳打。',
    偏财: '偏财在事业上代表多元收入和跨界机会。适合搞副业、做投资、整合资源。',
    食神: '食神在事业上代表创意和输出。适合做内容、策划、培训，靠才艺和表达能力赚钱。',
    伤官: '伤官在事业上代表技术和革新。适合搞技术攻关、产品创新、个人IP打造。',
    比肩: '比肩在事业上代表团队和合作。适合合伙创业、项目合作，一个人扛不如找人分担。',
    劫财: '劫财在事业上代表竞争和博弈。适合做销售、中介、谈判类工作，社交就是生产力。',
  },
  wealth: {
    正印: '正印在财运上代表靠知识和资历赚钱。考证、深造、学历提升都是对财运的长线投资。',
    偏印: '偏印在财运上代表靠独家技能变现。冷门赛道竞争少，越是稀缺越能卖出高价。',
    正官: '正官在财运上代表正派收入。工资奖金如常，适合做预算和长期理财，不宜灰色收入。',
    七杀: '七杀在财运上代表风险收益。提成、奖金、对赌类收入不错，但别上杠杆。',
    正财: '正财得地则财源广进。主业收入提升，适合谈加薪或推进收费项目，别贪快钱。',
    偏财: '偏财在财运上代表意外之财。投资运不错，但见好就收，落袋为安。',
    食神: '食神在财运上代表靠爱好赚钱。把喜欢的事做成产品，钱自然跟着来。',
    伤官: '伤官在财运上代表靠技术和创意变现。专利、版权、知识付费都适合。',
    比肩: '比肩在财运上代表合伙赚钱。找人一起做项目，分担风险也扩收。',
    劫财: '劫财在财运上代表社交变现。做中间人、中介、资源对接的角色有利可图。',
  },
  love: {
    正印: '正印在感情中代表安全感和家庭支持。双方长辈认可，适合谈婚论嫁，关系稳定。',
    偏印: '偏印在感情中代表精神共鸣。容易被有才华有个性的对象吸引，但也容易猜忌。',
    正官: '正官在婚姻中代表正夫（女命）。官星得地则嫁得靠谱，对方负责任有担当。',
    七杀: '七杀在感情中代表激情和冲突。一见钟情但来得快去得也快，别太上头。',
    正财: '正财在婚姻中代表正妻（男命）。财星得地则老婆务实顾家，适合长久过日子。',
    偏财: '偏财在感情中代表桃花和暧昧。异性缘好但别同时撩太多，容易翻车。',
    食神: '食神在感情中代表甜蜜和谐。一起吃吃喝喝就能增进感情，别太计较。',
    伤官: '伤官在感情中代表挑剔和刻薄。看对方不顺眼时先照照镜子，学会包容。',
    比肩: '比肩在感情中代表平等伴侣。像朋友一样相处，有共同话题，轻松自在。',
    劫财: '劫财在感情中代表竞争者。注意对方身边的异性朋友，保持边界感。',
  },
  health: {
    正印: '正印在健康上代表免疫力和恢复力。底子好，小病小痛扛得住，大病也恢复快。',
    偏印: '偏印在健康上代表神经系统。容易失眠、焦虑、神经衰弱，注意心理调节。',
    正官: '正官在健康上代表压力型问题。头痛、胃病、肩颈僵硬，都是累出来的。',
    七杀: '七杀在健康上代表意外和手术。磕碰受伤的概率高，做危险事要加倍小心。',
    正财: '正财在健康上代表基础体质。吃得下睡得着，没有大问题，但别透支。',
    偏财: '偏财在健康上代表应酬病。酒局饭局能推就推，肝和胃要紧。',
    食神: '食神在健康上代表消化系统。心宽体胖但注意暴饮暴食和过敏。',
    伤官: '伤官在健康上代表心火。容易口腔溃疡、皮肤过敏、情绪波动大。',
    比肩: '比肩在健康上代表社交促进健康。和朋友一起运动效果好，别一个人宅着。',
    劫财: '劫财在健康上代表因社交过度劳累。频繁熬夜应酬，身体在报警。',
  },
}

const SCORE_DESC = {
  high: ['高涨', '信心满满，趁热打铁', '爆棚'],    // > 30
  mid: ['平稳', '按部就班，稳中求进', '在线'],      // 0~30
  low: ['低迷', '以守为攻，韬光养晦', '欠佳'],      // -30~0
  bad: ['严峻', '今年多长个心眼，苟住就是赢', '不给力'], // < -30
}

function scoreLevel(score) {
  if (score > 30) return 'high'
  if (score >= 0) return 'mid'
  if (score >= -30) return 'low'
  return 'bad'
}

const DIM_SS_TEXT = {
  overall: {
    正印: { good: '印星护身，整体运势平稳向上。贵人运在暗处发力，遇事自有转机。', bad: '印星过重，容易安于现状。警惕能力跟不上心气，该行动时别犹豫。' },
    偏印: { good: '偏印生身，思路独特不走寻常路。别被主流带偏，你的判断力在线。', bad: '偏印带孤，想法多但落地难。小心陷入精神内耗，做比想重要。' },
    正官: { good: '正官得地，大局稳定有名望。适合稳扎稳打，按规则办事就是捷径。', bad: '官星受制，外部约束感强。规则可能成为枷锁，学会在缝隙中找空间。' },
    七杀: { good: '七杀为权，魄力与行动力兼具。关键时刻能扛事，大胆冲才有突破。', bad: '七杀攻身，压力四面而来。别逞强，该求援时就求援，硬扛会伤根基。' },
    正财: { good: '正财稳固，收入有保障。整体向好，适合做长期规划，别贪快钱。', bad: '财星乏力，手头比较紧。控制非必要开支，开源之前先节流。' },
    偏财: { good: '偏财透出，来钱路子多。投资直觉在线，但见好就收，别贪。', bad: '偏财不显，横财无望。远离投机和借贷，踏实做好主业最稳。' },
    食神: { good: '食神泄秀，整体心态好。气运顺遂，吃好睡好，一切自然向好。', bad: '食神受制，开心不起来。找点让你放松的小事做做，别太紧绷。' },
    伤官: { good: '伤官发力，才华被看见。适合表达和输出，你的作品会说话。', bad: '伤官见官，口舌是非多。少说话多做事，书面沟通比口头更安全。' },
    比肩: { good: '比肩帮身，有朋友有帮手。不是一个人在战斗，团队力量大于个人。', bad: '比肩争锋，同行竞争激烈。别盯着对手，专注自己的节奏才能赢。' },
    劫财: { good: '劫财为用，社交圈扩大。人脉变钱脉，但合作条款要写清楚。', bad: '劫财夺财，花钱如流水。管住钱包，别为了面子当冤大头。' },
  },
  career: {
    正印: { good: '正印生身，事业得贵人提携。适合做幕后策划或巩固现有位置。', bad: '印星过旺，事业上缺乏冲劲。太舒服的位置反而是陷阱，别温水煮青蛙。' },
    偏印: { good: '偏印为用，不走常规路线反而出彩。适合技术攻关、研发、冷门领域。', bad: '偏印夺食，事业思路受限。想法被否定的次数变多，换个方向再试。' },
    正官: { good: '正官得地，事业运走强。宜主动争取晋升或承担更多管理职责。', bad: '官星受克，事业多阻。谨防小人、合同纠纷，以守为主，不动为妙。' },
    七杀: { good: '七杀为权，事业突破期。关键项目别躲，打出名声就是翻身仗。', bad: '七杀压身，事业压力爆棚。工作量超标，学会拒绝和优先级管理。' },
    正财: { good: '正财生官，事业稳步上升。踏实做事就有回报，别想走捷径。', bad: '财星不护官，事业动力不足。收入不涨但活没少干，考虑骑驴找马。' },
    偏财: { good: '偏财助力，事业上意外机会多。副业或跨界合作可能带来惊喜。', bad: '偏财耗身，容易被杂事分心。专注主业，别被短期利益带偏。' },
    食神: { good: '食神泄秀，事业上创意不断。适合策划、提案、内容创作。', bad: '食神受制，才华施展不开。想法好但执行跟不上，找人帮你落地。' },
    伤官: { good: '伤官发力，以才华出名。适合技术输出、演讲、个人品牌建设。', bad: '伤官见官，口舌是非多。顶撞上级或同事传话，谨言慎行为上。' },
    比肩: { good: '比肩帮身，有战友并肩。团队协作效率高，适合合伙或组队作战。', bad: '比肩争官，竞争白热化。别卷入办公室政治，做好本分最安全。' },
    劫财: { good: '劫财为用，人脉开路。饭局社交能带来业务机会，但别喝多误事。', bad: '劫财破财，容易被抢功劳。留好邮件证据，别光靠口头沟通。' },
  },
  wealth: {
    正印: { good: '印星护财，财运稳中有升。靠知识和资历赚钱，考证或深造是投资。', bad: '印星耗财，为房子教育健康花钱多。必要开支避免不了，别心疼。' },
    偏印: { good: '偏印生财，靠独家技能变现。冷门赛道竞争少，利润可观。', bad: '偏印夺食，财路变窄。原有收入渠道可能收缩，提前准备备选方案。' },
    正官: { good: '官星护财，财运正派稳定。工资奖金如常，不宜碰灰色收入。', bad: '官星克财，财运被压制。收入增长慢但固定开销不少，精打细算。' },
    七杀: { good: '七杀生财，风险换收益。提成奖金对赌类收入不错，但别上杠杆。', bad: '七杀夺财，因急事破财。注意健康车辆设备方面的意外支出。' },
    正财: { good: '正财得位，财源广进。主业收入提升，适合谈加薪或推进收费项目。', bad: '正财受克，进账吃力。收入与付出不对等，考虑调整收入结构。' },
    偏财: { good: '偏财透出，投资运不错。股票副业意外之财都有机会，落袋为安。', bad: '偏财不现，投机无望。远离股市基金，存定期都比乱投强。' },
    食神: { good: '食神生财，靠才艺和爱好赚钱。做喜欢且擅长的事，钱自然跟着来。', bad: '食神受制，为健康或享乐花钱多。注意饮食开销和娱乐消费。' },
    伤官: { good: '伤官生财，靠技术和创意变现。专利版权知识付费都适合。', bad: '伤官破财，因冲动或官司花钱。投资合作前多咨询，别脑子一热。' },
    比肩: { good: '比肩帮身，合伙赚钱。找人一起做项目，分担风险也扩收。', bad: '比肩分财，朋友借钱或合作分利。该拒绝就拒绝，钱和交情分开。' },
    劫财: { good: '劫财为用，社交变现金流。中间人中介类角色适合你。', bad: '劫财夺财，破耗最重的一颗星。尤其注意合作方信用和合同条款。' },
  },
  love: {
    正印: { good: '印星护感情，关系稳定有安全感。双方长辈支持，适合谈婚论嫁。', bad: '印星太旺，感情中缺乏激情。太过舒适反而平淡，制造点小惊喜。' },
    偏印: { good: '偏印为用，吸引有才华的对象。精神共鸣比外在条件更重要。', bad: '偏印带孤，感情中容易猜忌。有话直说别试探，对方猜不到你的心思。' },
    正官: { good: '正官为夫星，女命感情运佳。遇到的异性靠谱，值得认真考虑。', bad: '官星受克，感情多波折。容易被挑剔管束，需要空间和自由。' },
    七杀: { good: '七杀为偏夫，有魅力的异性靠近。感情来得快去得也快，别太上头。', bad: '七杀攻身，感情中冲突不断。控制脾气，分手两个字别说出口。' },
    正财: { good: '正财为妻星，男命感情运佳。对象务实顾家，适合长久发展。', bad: '正财受制，感情中计较得失。别太算计，感情不是买卖。' },
    偏财: { good: '偏财为偏妻，社交中桃花多。异性缘不错，但别同时撩太多。', bad: '偏财遭劫，感情易因第三方出问题。保持距离，守住边界。' },
    食神: { good: '食神为福，感情甜蜜和谐。一起吃吃喝喝就能增进感情。', bad: '食神受制，缺乏共同语言。一起找件新鲜事做，打破沉闷。' },
    伤官: { good: '伤官发力，用才华吸引异性。展示你的独特之处，别藏着掖着。', bad: '伤官见官，感情中挑剔刻薄。看对方不顺眼时先照照镜子。' },
    比肩: { good: '比肩帮身，像朋友一样的伴侣关系。有共同话题，相处轻松。', bad: '比肩争夫/妻，感情出现竞争者。注意对方社交圈，保持警惕。' },
    劫财: { good: '劫财为用，因社交认识对象。朋友介绍或聚会认识的人值得了解。', bad: '劫财夺夫/妻，感情中被插足。对方身边的异性朋友是重点。' },
  },
  health: {
    正印: { good: '印星护体，身体状态好。免疫力在线，小病小痛恢复快。', bad: '印星过重，容易发胖或水肿。注意饮食和运动，久坐不动是大忌。' },
    偏印: { good: '偏印生身，精神状态好。思维活跃，适合脑力工作。', bad: '偏印带孤，神经衰弱或失眠。思虑过多影响睡眠，睡前远离手机。' },
    正官: { good: '官星为调候，作息规律。自律的生活习惯让身体处于良性循环。', bad: '官星克身，压力型健康问题。胃病头痛肩颈僵硬，都是累出来的。' },
    七杀: { good: '七杀为权，体力充沛。适当的强度运动反而让你更健康。', bad: '七杀攻身，健康最凶的十神。小心意外受伤手术急性病，安全第一。' },
    正财: { good: '财星为养，身体底子好。吃得下睡得着，没有大问题。', bad: '正财耗身，为工作忙坏身体。透支健康换钱，划不来。' },
    偏财: { good: '偏财为用，身体健康无大碍。注意饮食不过量即可。', bad: '偏财耗体，应酬多伤身。酒局饭局能推就推，肝和胃要紧。' },
    食神: { good: '食神为福，心态最好的时期。能吃能睡能笑，免疫力强。', bad: '食神过旺，暴饮暴食或过敏。忌口比吃药管用，查一下过敏原。' },
    伤官: { good: '伤官泄秀，心情舒畅靠表达。把烦心事说出来，比憋着强。', bad: '伤官耗气，心火旺。容易口腔溃疡皮肤过敏，情绪波动大。' },
    比肩: { good: '比肩帮身，和朋友一起运动效果更好。组个跑步或健身搭子。', bad: '比肩争气，因人际关系气出病。别为不值得的人和事动怒。' },
    劫财: { good: '劫财为用，社交带来好心情。聚会出游能有效解压。', bad: '劫财耗身，因社交过度劳累。频繁熬夜应酬，身体在报警。' },
  },
}

function calcDimScore(dayStem, stem, branch, dim) {
  const ss = getShiShen(dayStem, stem)
  const w = DIM_WEIGHTS[dim] || DIM_WEIGHTS.overall
  let score = w[ss] || 0
  const hidden = { 子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','庚','戊'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲'] }
  for (const h of (hidden[branch] || [])) {
    const hss = getShiShen(dayStem, h)
    score += (w[hss] || 0) * 0.3
  }
  return Math.max(-100, Math.min(100, Math.round(score)))
}

function buildPeriods(dayStem, result, view, dim) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1, d2 = now.getDate()

  if (view === 'life') {
    const birthYear = result.input.year
    const data = []
    for (let year = birthYear; year <= birthYear + 80; year++) {
      const stem = STEMS[((year - 4) % 10 + 10) % 10]
      const branch = BRANCHES[((year - 4) % 12 + 12) % 12]
      const score = calcDimScore(dayStem, stem, branch, dim)
      data.push({ label: String(year), sub: stem + branch, score, isGood: score >= 0 })
    }
    return data
  }

  if (view === 'week') {
    const dow = now.getDay()
    const monOff = dow === 0 ? -6 : 1 - dow
    const weekDays = ['日','一','二','三','四','五','六']
    const data = []
    for (let i = 0; i < 7; i++) {
      const dt = new Date(now)
      dt.setDate(now.getDate() + monOff + i)
      const solar = Solar.fromYmd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate())
      const ganzhi = solar.getLunar().getDayInGanZhi()
      const stem = ganzhi.charAt(0), branch = ganzhi.charAt(1)
      const score = calcDimScore(dayStem, stem, branch, dim)
      data.push({ label: `周${weekDays[i]}`, sub: ganzhi, score, isGood: score >= 0 })
    }
    return data
  }

  if (view === 'year') {
    const data = calcLiuYue(dayStem, y)
    return data.map(x => {
      const score = calcDimScore(dayStem, x.stem, x.branch, dim)
      return { label: `${x.month}月`, sub: x.ganzhi, score, isGood: score >= 0 }
    })
  }
  if (view === 'month') {
    const data = calcLiuRi(dayStem, y, m, d2)
    return data.map(x => {
      const score = calcDimScore(dayStem, x.stem, x.branch, dim)
      return { label: `${x.day}日`, sub: x.ganzhi, score, isGood: score >= 0 }
    })
  }
  if (view === 'day') {
    const data = calcLiuShi(dayStem, y, m, d2)
    return data.map(x => {
      const score = calcDimScore(dayStem, x.stem, x.branch, dim)
      return { label: x.label, sub: x.ganzhi, score, isGood: score >= 0 }
    })
  }
  return []
}

function renderYunshi() {
  const result = getYunshiResult()
  if (!result) {
    document.getElementById('yunshiKLineContent').innerHTML = '<div class="ys-empty">请先在「排盘」中输入出生信息并点击排盘</div>'
    document.getElementById('yunshiReportCard').style.display = 'none'
    document.getElementById('yunshiAdviceCard').style.display = 'none'
    return
  }
  YUNSHI.result = result
  const dayStem = result.pillars.day.stem
  const periods = buildPeriods(dayStem, result, YUNSHI.view, YUNSHI.dim)

  const container = document.getElementById('yunshiKLineContent')
  container.innerHTML = ''
  const canvas = document.createElement('canvas')
  canvas.id = 'yunshiKLineCanvas'
  canvas.style.width = '100%'
  container.appendChild(canvas)
  setTimeout(() => drawYunshiKLine('yunshiKLineCanvas', periods), 50)

  renderYunshiReport(result)
  renderYunshiAdvice(result)
}

function drawYunshiKLine(canvasId, periods) {
  const canvas = document.getElementById(canvasId)
  if (!canvas || periods.length === 0) return
  const rect = canvas.parentElement.getBoundingClientRect()
  const dense = periods.length > 30
  const W = dense ? Math.max(periods.length * 22, rect.width - 20) : Math.max(rect.width - 20, 200)
  const H = 240
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const pad = { top: 20, bottom: 36, left: 40, right: 20 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom

  ctx.clearRect(0, 0, W, H)
  const isDark = document.body.classList.contains('dark-mode')
  const textColor = isDark ? '#ccc' : '#666'
  const gridColor = isDark ? '#333' : '#eee'

  for (let y = -100; y <= 100; y += 50) {
    const yy = pad.top + ch / 2 - (y / 100) * (ch / 2)
    ctx.strokeStyle = y === 0 ? (isDark ? '#555' : '#ccc') : gridColor
    ctx.lineWidth = y === 0 ? 1.5 : 0.5
    ctx.setLineDash(y === 0 ? [] : [3, 3])
    ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(W - pad.right, yy); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = textColor; ctx.font = '10px sans-serif'; ctx.textAlign = 'right'
    ctx.fillText(String(y), pad.left - 4, yy + 3)
  }

  const step = cw / periods.length
  const midY = pad.top + ch / 2
  const labelStep = dense ? Math.ceil(periods.length / 15) : 1

  periods.forEach((p, i) => {
    const x = pad.left + i * step + step * 0.5
    const candleW = Math.max(step * 0.6, 4)
    const halfW = candleW / 2
    const volatility = 20 + Math.abs(p.score) * 0.3
    const open = Math.max(-100, Math.min(100, p.score + volatility))
    const close = Math.max(-100, Math.min(100, p.score - volatility))
    const high = Math.max(-100, Math.min(100, p.score + volatility * 1.5))
    const low = Math.max(-100, Math.min(100, p.score - volatility * 1.5))

    const oy = midY - (open / 100) * (ch / 2)
    const cy = midY - (close / 100) * (ch / 2)
    const hy = midY - (high / 100) * (ch / 2)
    const ly = midY - (low / 100) * (ch / 2)

    const color = p.isGood ? '#c62828' : '#2e7d32'
    ctx.strokeStyle = color; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, ly); ctx.stroke()

    ctx.fillStyle = color
    const bodyTop = Math.min(oy, cy)
    const bodyBot = Math.max(oy, cy)
    const bodyH = Math.max(bodyBot - bodyTop, 2)
    ctx.fillRect(x - halfW, bodyTop, candleW, bodyH)

    if (i % labelStep === 0) {
      ctx.fillStyle = textColor; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(p.label, x, pad.top + ch + 14)
      ctx.font = '9px sans-serif'
      ctx.fillText(p.sub, x, pad.top + ch + 26)
    }
  })
}

function renderYunshiReport(result) {
  const card = document.getElementById('yunshiReportCard')
  const container = document.getElementById('yunshiReportContent')
  if (!card || !container) return
  card.style.display = 'block'

  const dayStem = result.pillars.day.stem
  const dayGZ = result.pillars.day.ganzhi
  const dimLabel = DIM_LABELS[YUNSHI.dim] || '综合'
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate()

  const currentDY = getCurrentDayun(result)
  const currentLN = result.liuNian

  const curMonth = result.liuYue.find(x => x.month === m) || result.liuYue[0]
  const curDay = result.liuRi.find(x => x.day === d) || result.liuRi[0]
  const shiIdx = Math.floor((now.getHours() + 1) / 2) % 12
  const curShi = result.liuShi[shiIdx]

  const dyScore = calcDimScore(dayStem, currentDY.data.stem, currentDY.data.branch, YUNSHI.dim)
  const lnScore = calcDimScore(dayStem, currentLN.stem, currentLN.branch, YUNSHI.dim)
  const monthScore = calcDimScore(dayStem, curMonth.stem, curMonth.branch, YUNSHI.dim)
  const dayScore = calcDimScore(dayStem, curDay.stem, curDay.branch, YUNSHI.dim)
  const shiScore = calcDimScore(dayStem, curShi.stem, curShi.branch, YUNSHI.dim)

  const dySS = getShiShen(dayStem, currentDY.data.stem)
  const lnSS = getShiShen(dayStem, currentLN.stem)
  const monthSS = getShiShen(dayStem, curMonth.stem)
  const daySS = getShiShen(dayStem, curDay.stem)
  const shiSS = getShiShen(dayStem, curShi.stem)

  let html = `<div class="ys-report">`

  html += buildReportSection('当前流时', `${curShi.label}（${curShi.timeRange}）`, shiScore, dimLabel, shiSS, dayStem, 'shi', YUNSHI.dim)
  html += buildReportSection('当前流日', `${curDay.day}日（${curDay.ganzhi}）`, dayScore, dimLabel, daySS, dayStem, 'day', YUNSHI.dim)
  html += buildReportSection('当前流月', `${curMonth.month}月（${curMonth.ganzhi}）`, monthScore, dimLabel, monthSS, dayStem, 'month', YUNSHI.dim)
  html += buildReportSection('当前流年', `${currentLN.year}年（${currentLN.ganzhi}）`, lnScore, dimLabel, lnSS, dayStem, 'year', YUNSHI.dim)
  html += buildReportSection('当前大运', `${currentDY.data.ageRange}（${currentDY.data.stem}${currentDY.data.branch}）`, dyScore, dimLabel, dySS, dayStem, 'dayun', YUNSHI.dim)

  html += `<div class="ys-report-section ys-section-advice"><div class="ys-report-title">综合建议（${dimLabel}）</div>`
  html += `<div class="ys-report-body">${buildAdvice(result, dyScore, lnScore, dySS, lnSS, YUNSHI.dim)}</div></div>`

  html += `</div>`
  container.innerHTML = html
}

function colorizeGanzhi(s) {
  if (!s) return ''
  const WX_CLASS = { '木':'mu','火':'huo','土':'tu','金':'jin','水':'shui' }
  const toWx = (c) => WX_CLASS[c] || (typeof getStemWuxing === 'function' && WX_CLASS[getStemWuxing(c)]) || (typeof getBranchWuxing === 'function' && WX_CLASS[getBranchWuxing(c)]) || ''
  return [...s].map(c => {
    const cls = toWx(c)
    return cls ? `<span class="wx-${cls}">${c}</span>` : c
  }).join('')
}

function buildReportSection(title, subtitle, score, dimLabel, ss, dayStem, type, dim) {
  const level = scoreLevel(score)
  const sl = SCORE_DESC[level]
  const good = score >= 0
  const q = (QUOTE_EXT[dim] && QUOTE_EXT[dim][ss]) || SHI_SHEN_QUOTES[ss]
  const modern = (DIM_MODERN[dim] && DIM_MODERN[dim][ss]) || SHI_SHEN_MODERN[ss]
  const ssData = DIM_SS_TEXT[dim] && DIM_SS_TEXT[dim][ss]
  const youth = ssData ? ssData[good ? 'good' : 'bad'] : ''

  let body = `<div class="ys-report-score ${good ? 'ys-score-up' : 'ys-score-down'}">${dimLabel}运势指数：${score > 0 ? '+' : ''}${score}（${sl[0]}）</div>`
  body += `<div class="ys-report-detail">`
  body += `日主${colorizeGanzhi(dayStem)}遇天干${colorizeGanzhi(ss)}。`
  if (q) body += ` ${q.source}云：「${colorizeGanzhi(q.text)}」`
  body += `</div>`
  body += `<div class="ys-report-detail">${colorizeGanzhi(modern)}</div>`
  body += `<div class="ys-report-advice">${colorizeGanzhi(youth)}</div>`

  return `<div class="ys-report-section"><div class="ys-report-title">${title}（${subtitle}）</div>${body}</div>`
}

function buildAdvice(result, dyScore, lnScore, dySS, lnSS, dim) {
  const tips = []
  const dyLevel = scoreLevel(dyScore), lnLevel = scoreLevel(lnScore)

  const dimData = DIM_SS_TEXT[dim] || DIM_SS_TEXT.overall
  const dyGood = dyLevel !== 'bad' && dyLevel !== 'low'
  const lnGood = lnLevel !== 'bad' && lnLevel !== 'low'
  const dySSData = dimData[dySS]
  const lnSSData = dimData[lnSS]
  const dimName = DIM_LABELS[dim] || '综合'
  tips.push(`【十年大运·${dimName}】当前${dySS}运。${dySSData ? dySSData[dyGood ? 'good' : 'bad'] : ''}`)
  tips.push(`【流年·${dimName}】今年${lnSS}之年。${lnSSData ? lnSSData[lnGood ? 'good' : 'bad'] : ''}`)

  return `<ul class="ys-advice-list">${tips.map((t, i) => i === tips.length - 1 ? `<li class="ys-advice-final"><strong>${t}</strong></li>` : `<li>${t}</li>`).join('')}</ul>`
}

function renderYunshiAdvice(result) {
  const card = document.getElementById('yunshiAdviceCard')
  if (!card) return
  card.style.display = 'none'
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.ys-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.ys-btn[data-view]').forEach(b => b.classList.remove('active'))
      this.classList.add('active')
      YUNSHI.view = this.dataset.view
      renderYunshi()
    })
  })
  document.querySelectorAll('.ys-btn[data-dim]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.ys-btn[data-dim]').forEach(b => b.classList.remove('active'))
      this.classList.add('active')
      YUNSHI.dim = this.dataset.dim
      renderYunshi()
    })
  })
})
