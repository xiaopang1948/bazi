const GU_WEIGHT = {
  year: {
    '甲子':1.2,'乙丑':0.9,'丙寅':0.6,'丁卯':0.7,'戊辰':1.2,'己巳':0.5,
    '庚午':0.9,'辛未':0.8,'壬申':0.7,'癸酉':0.8,'甲戌':1.5,'乙亥':0.9,
    '丙子':1.6,'丁丑':0.8,'戊寅':0.8,'己卯':1.9,'庚辰':1.2,'辛巳':0.6,
    '壬午':0.8,'癸未':0.7,'甲申':0.5,'乙酉':1.5,'丙戌':0.6,'丁亥':1.6,
    '戊子':1.5,'己丑':0.7,'庚寅':0.9,'辛卯':1.2,'壬辰':1.0,'癸巳':0.7,
    '甲午':1.5,'乙未':0.6,'丙申':0.5,'丁酉':1.4,'戊戌':1.4,'己亥':0.9,
    '庚子':0.7,'辛丑':0.7,'壬寅':0.9,'癸卯':1.2,'甲辰':0.8,'乙巳':0.7,
    '丙午':1.3,'丁未':0.5,'戊申':1.4,'己酉':0.5,'庚戌':0.9,'辛亥':1.7,
    '壬子':0.5,'癸丑':0.7,'甲寅':1.2,'乙卯':0.8,'丙辰':0.8,'丁巳':0.6,
    '戊午':1.9,'己未':0.6,'庚申':0.8,'辛酉':1.6,'壬戌':1.0,'癸亥':0.6,
  },
  month: [0,0.6,0.7,1.8,0.9,0.5,1.6,0.9,1.5,1.8,0.8,0.9,0.5],
  day: [0,0.5,1.0,0.8,1.5,1.6,1.5,0.8,1.6,0.8,1.6,0.9,1.7,0.8,1.7,1.0,0.8,0.9,1.8,0.5,1.5,1.0,0.9,0.8,0.9,1.5,1.8,0.7,0.8,1.6,0.6],
  hour: [1.6,0.6,0.7,1.0,0.9,1.6,1.0,0.8,0.8,0.9,0.6,0.6],
}

function calcGuKu(solar) {
  const lunar = solar.getLunar()
  const yearGZ = lunar.getYearInGanZhi()
  const month = lunar.getMonth()
  const day = lunar.getDay()
  const hourName = solar.getHour() >= 23 || solar.getHour() < 1 ? 0 : Math.floor((solar.getHour() + 1) / 2)
  const hourIdx = hourName

  const wYear = GU_WEIGHT.year[yearGZ] || 0
  const wMonth = GU_WEIGHT.month[month] || 0
  const wDay = GU_WEIGHT.day[day] || 0
  const wHour = GU_WEIGHT.hour[hourIdx] || 0
  const total = wYear + wMonth + wDay + wHour

  return {
    yearGZ, month, day, hourLabel: ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][hourIdx],
    weights: { year: wYear, month: wMonth, day: wDay, hour: wHour },
    total: Math.round(total * 10) / 10,
    liang: Math.floor(total),
    qian: Math.round((total - Math.floor(total)) * 10),
  }
}

const GU_POEMS = {
  2.1: { title:'短命非业', poem:'短命非业谓大凶，平生灾难事重重。凶祸频临限逆境，终世困苦事不成。' },
  2.2: { title:'身寒骨冷', poem:'身寒骨冷苦伶仃，此命推来行乞人。劳劳碌碌无度日，中年打拱过平生。' },
  2.3: { title:'此命推来', poem:'此命推来骨格轻，求谋作事事难成。妻儿兄弟应难许，别处他乡作散人。' },
  2.4: { title:'一生薄福', poem:'一生薄福运来迟，功名事业等闲休。奔波劳碌无休息，命中注定少欢乐。' },
  2.5: { title:'六亲无靠', poem:'六亲无靠劳碌夫，门庭未显事多磨。自立成家福寿全，兄弟妻儿不可靠。' },
  2.6: { title:'平生衣禄', poem:'平生衣禄苦中求，独自经营事不休。离祖出门宜早计，晚来衣禄自无忧。' },
  2.7: { title:'一生作事', poem:'一生作事少商量，难靠祖宗作主张。独马单枪空作去，早年晚岁总无长。' },
  2.8: { title:'一生行事', poem:'一生行事似飘蓬，祖宗产业在梦中。若不过房并改姓，也当移徙二三通。' },
  2.9: { title:'初年运限', poem:'初年运限未曾亨，纵有功名在后成。须过四旬方可上，移居改姓始为良。' },
  3.0: { title:'劳碌奔波', poem:'劳碌奔波苦中求，东奔西走何日休。若使终身勤与俭，老来稍可免忧愁。' },
  3.1: { title:'忙忙碌碌', poem:'忙忙碌碌苦中求，何日云开见日头。难得祖基家可立，中年衣食渐无忧。' },
  3.2: { title:'初年运塞', poem:'初年运塞事难谋，渐有财源如水流。到得中年衣食旺，那时名利一齐收。' },
  3.3: { title:'早年做事', poem:'早年做事事难成，百计徒劳枉费心。半世自如流水去，后来运到得黄金。' },
  3.4: { title:'此命福气', poem:'此命福气果如何，僧道门中衣禄多。离祖出家方为妙，朝晚拜佛念弥陀。' },
  3.5: { title:'生平福量', poem:'生平福量不周全，祖业根基觉少传。营事生涯宜守旧，时来衣食胜从前。' },
  3.6: { title:'不须劳碌', poem:'不须劳碌过平生，独自成家福不轻。早有福星常照命，任君行去百般成。' },
  3.7: { title:'此命般般', poem:'此命般般事不成，弟兄少力自孤行。虽然祖业须微有，来者明知去者赢。' },
  3.8: { title:'一身骨肉', poem:'一身骨肉最清高，早入簧门姓氏标。待到年将三十六，蓝衫脱去换红袍。' },
  3.9: { title:'此命终身', poem:'此命终身运不通，劳劳作事尽皆空。苦心竭力成家计，到得那时在梦中。' },
  4.0: { title:'平生衣禄', poem:'平生衣禄是绵长，件件心中自主张。前面风霜多受过，后来必定享安康。' },
  4.1: { title:'此命推来', poem:'此命推来自不同，为人能干异凡庸。中年还有逍遥福，不比前时运未通。' },
  4.2: { title:'得宽怀处', poem:'得宽怀处且宽怀，何用双眉皱不开。若使中年命运济，那时名利一齐来。' },
  4.3: { title:'为人心性', poem:'为人心性最聪明，作事轩昂近贵人。衣禄一生天数定，不须劳碌自然丰。' },
  4.4: { title:'万事由天', poem:'万事由天莫苦求，须知福碌赖人修。当年财帛难如意，晚景欣然便不忧。' },
  4.5: { title:'名利推来', poem:'名利推来竟若何，前番辛苦后奔波。命中难养男和女，骨肉扶持也不多。' },
  4.6: { title:'东岳泰山', poem:'东西南北尽皆通，出姓移居更觉隆。衣禄无穷无数定，中年晚景一般同。' },
  4.7: { title:'此命推来', poem:'此命推来旺末年，妻荣子贵自怡然。平生原有滔滔福，可卜财源若水泉。' },
  4.8: { title:'初年运道', poem:'初年运道未曾通，几许蹉跎命亦穷。兄弟六亲无依靠，一生事业晚来隆。' },
  4.9: { title:'此命推来', poem:'此命推来福不轻，自成自立显门庭。从来富贵人钦敬，使婢差奴过一生。' },
  5.0: { title:'为利为名', poem:'为利为名终日劳，中年福禄也多遭。老来自有财星照，不比前番目下高。' },
  5.1: { title:'一世荣华', poem:'一世荣华事事通，不须劳碌自亨通。兄弟叔侄皆如意，家业成时福禄宏。' },
  5.2: { title:'一世亨通', poem:'一世亨通事事能，不须劳苦自然成。宗族欣然皆如意，家业丰享自称心。' },
  5.3: { title:'此格推来', poem:'此格推来气象真，兴家发达在其中。一生福禄安排定，却是人间一富翁。' },
  5.4: { title:'此命推来', poem:'此命推来厚且清，诗书满腹看功成。丰衣足食自然稳，正是人间有福人。' },
  5.5: { title:'策马扬鞭', poem:'策马扬鞭争名利，少年作事费筹论。一朝福禄源源至，富贵荣华显六亲。' },
  5.6: { title:'此格推来', poem:'此格推来礼义通，一身福禄用无穷。甜酸苦辣皆尝过，滚滚财源稳且丰。' },
  5.7: { title:'福禄丰盈', poem:'福禄丰盈万事全，一身荣耀乐天年。名扬威震人争羡，此世逍遥宛似仙。' },
  5.8: { title:'平生福禄', poem:'平生福禄自然来，名利双全富贵偕。金榜题名登甲第，紫袍玉带走金阶。' },
  5.9: { title:'细推此格', poem:'细推此格秀而清，必定才高学业成。甲第之中应有分，扬鞭走马显威荣。' },
  6.0: { title:'一朝金榜', poem:'一朝金榜快题名，显祖荣宗立大功。衣食定然原欲足，田园财帛更丰盈。' },
  6.1: { title:'不作朝中', poem:'不作朝中金榜客，定为世上大财翁。聪明天付经书熟，名显高袍自是荣。' },
  6.2: { title:'此命生来', poem:'此命生来福不穷，读书必定显亲宗。紫衣玉带为卿相，富贵荣华孰与同。' },
  6.3: { title:'命主为官', poem:'命主为官福禄长，得来富贵实非常。名题雁塔传金榜，大显门庭天下扬。' },
  6.4: { title:'此格威权', poem:'此格威权不可当，紫袍金带坐高堂。荣华富贵谁能及，积玉堆金满储仓。' },
  6.5: { title:'细推此命', poem:'细推此命福非轻，富贵荣华孰与争。定国安邦人极品，威声显赫震边城。' },
  6.6: { title:'此格人间', poem:'此格人间一福人，堆金积玉满堂春。从来富贵由天定，金榜题名更显亲。' },
  6.7: { title:'此命生来', poem:'此命生来福自宏，田园家业最高隆。平生衣禄丰盈足，一世荣华万事通。' },
  6.8: { title:'富贵由天', poem:'富贵由天莫苦求，万金家计不须谋。如今不比前番事，祖业根基百世留。' },
  6.9: { title:'君是人间', poem:'君是人间福禄星，一生富贵众人钦。纵然不把高官做，也积千箱满库金。' },
  7.0: { title:'此命生来', poem:'此命生来福自洪，田园家业最高隆。平生衣禄丰盈足，一世荣华万事通。' },
  7.1: { title:'此命生成', poem:'此命生成大不同，公侯卿相在其中。一生自有逍遥福，富贵荣华极品隆。' },
}

function getGuPoem(total) {
  const keys = Object.keys(GU_POEMS).map(Number).sort((a, b) => a - b)
  let closest = keys[0]
  for (const k of keys) {
    if (Math.abs(k - total) < Math.abs(closest - total)) closest = k
  }
  return GU_POEMS[closest] || GU_POEMS[keys[0]]
}

function renderGuKu(result) {
  const card = document.getElementById('guKuCard')
  const container = document.getElementById('guKuContent')
  if (!card || !container) return

  const solar = Solar.fromYmdHms(result.input.year, result.input.month, result.input.day, result.input.hour, result.input.minute, 0)
  const gu = calcGuKu(solar)
  const poem = getGuPoem(gu.total)

  card.style.display = 'block'

  let html = `<div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">`
  html += `<div style="font-size:36px;font-weight:800;color:var(--primary);line-height:1">${gu.liang}<span style="font-size:16px">两</span>`
  if (gu.qian > 0) html += ` ${gu.qian}<span style="font-size:16px">钱</span>`
  html += `</div>`
  html += `<div style="font-size:12px;color:var(--text-light)">`
  html += `<div>年干 ${gu.yearGZ}：${fw(gu.weights.year)}</div>`
  html += `<div>月 ${gu.month}月：${fw(gu.weights.month)}</div>`
  html += `<div>日 ${gu.day}日：${fw(gu.weights.day)}</div>`
  html += `<div>时 ${gu.hourLabel}时：${fw(gu.weights.hour)}</div>`
  html += `</div></div>`
  html += `<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">${poem.title}</div>`
  html += `<div style="font-size:12px;color:var(--text-light);line-height:1.7">${poem.poem}</div>`

  container.innerHTML = html
}

function fw(w) {
  const liang = Math.floor(w)
  const qian = Math.round((w - liang) * 10)
  return qian > 0 ? `${liang}两${qian}钱` : `${liang}两整`
}
