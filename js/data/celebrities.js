// 名人八字库
// 来源：公开资料整理
const CELEBRITIES = [
  // ─── 历史人物 ───
  { name:'毛泽东', birth:'1893-12-26 07:30', city:'xiangtan', gender:'male', tags:['政治家','开国领袖'] },
  { name:'周恩来', birth:'1898-03-05 08:00', city:'huaiAn', gender:'male', tags:['政治家'] },
  { name:'邓小平', birth:'1904-08-22 08:00', city:'guangAn', gender:'male', tags:['政治家'] },
  { name:'秦始皇', birth:'公元前259-01-27 00:00', city:'handan', gender:'male', tags:['帝王'] },
  { name:'汉武帝', birth:'公元前156-08-10 00:00', city:'xian', gender:'male', tags:['帝王'] },
  { name:'唐太宗', birth:'599-01-23 00:00', city:'xian', gender:'male', tags:['帝王'] },
  { name:'成吉思汗', birth:'1162-05-31 00:00', city:'huhehaote', gender:'male', tags:['帝王'] },
  { name:'诸葛亮', birth:'181-08-20 00:00', city:'linyi', gender:'male', tags:['历史名人'] },
  { name:'李白', birth:'701-02-28 00:00', city:'chengdu', gender:'male', tags:['文人'] },
  { name:'杜甫', birth:'712-02-12 00:00', city:'gongyi', gender:'male', tags:['文人'] },
  { name:'苏轼', birth:'1037-01-08 00:00', city:'meishan', gender:'male', tags:['文人'] },
  { name:'岳飞', birth:'1103-03-24 00:00', city:'tangyin', gender:'male', tags:['军事家'] },
  { name:'郑和', birth:'1371-09-23 00:00', city:'kunming', gender:'male', tags:['探险家'] },
  { name:'康熙', birth:'1654-05-04 00:00', city:'beijing', gender:'male', tags:['帝王'] },

  // ─── 科技 ───
  { name:'钱学森', birth:'1911-12-11 00:00', city:'shanghai', gender:'male', tags:['科学家'] },
  { name:'袁隆平', birth:'1930-09-07 00:00', city:'beijing', gender:'male', tags:['科学家'] },
  { name:'屠呦呦', birth:'1930-12-30 00:00', city:'ningbo', gender:'female', tags:['科学家'] },
  { name:'马云', birth:'1964-10-15 00:00', city:'hangzhou', gender:'male', tags:['企业家'] },
  { name:'马化腾', birth:'1971-10-29 00:00', city:'chaozhou', gender:'male', tags:['企业家'] },
  { name:'李彦宏', birth:'1968-11-17 00:00', city:'yangquan', gender:'male', tags:['企业家'] },
  { name:'雷军', birth:'1969-12-16 00:00', city:'xiantao', gender:'male', tags:['企业家'] },
  { name:'任正非', birth:'1944-10-25 00:00', city:'zhenning', gender:'male', tags:['企业家'] },
  { name:'刘强东', birth:'1974-02-14 00:00', city:'suqian', gender:'male', tags:['企业家'] },
  { name:'丁磊', birth:'1971-10-01 00:00', city:'ningbo', gender:'male', tags:['企业家'] },
  { name:'张一鸣', birth:'1983-04-13 00:00', city:'longyan', gender:'male', tags:['企业家'] },
  { name:'王兴', birth:'1979-02-18 00:00', city:'longyan', gender:'male', tags:['企业家'] },
  { name:'黄峥', birth:'1980-09-20 00:00', city:'hangzhou', gender:'male', tags:['企业家'] },
  { name:'程维', birth:'1983-05-19 00:00', city:'shangrao', gender:'male', tags:['企业家'] },

  // ─── 文学艺术 ───
  { name:'莫言', birth:'1955-02-17 00:00', city:'gaomi', gender:'male', tags:['作家'] },
  { name:'金庸', birth:'1924-02-06 00:00', city:'haining', gender:'male', tags:['作家'] },
  { name:'张艺谋', birth:'1950-04-02 00:00', city:'xian', gender:'male', tags:['导演'] },
  { name:'周星驰', birth:'1962-06-22 00:00', city:'hongkong', gender:'male', tags:['演员','导演'] },
  { name:'成龙', birth:'1954-04-07 00:00', city:'hongkong', gender:'male', tags:['演员'] },
  { name:'李连杰', birth:'1963-04-26 00:00', city:'beijing', gender:'male', tags:['演员'] },
  { name:'周杰伦', birth:'1979-01-18 00:00', city:'taibei', gender:'male', tags:['歌手'] },
  { name:'王菲', birth:'1969-08-08 00:00', city:'beijing', gender:'female', tags:['歌手'] },
  { name:'刘德华', birth:'1961-09-27 00:00', city:'hongkong', gender:'male', tags:['演员','歌手'] },
  { name:'张国荣', birth:'1956-09-12 00:00', city:'hongkong', gender:'male', tags:['演员','歌手'] },
  { name:'梅艳芳', birth:'1963-10-10 00:00', city:'hongkong', gender:'female', tags:['歌手'] },
  { name:'陈奕迅', birth:'1974-07-27 00:00', city:'hongkong', gender:'male', tags:['歌手'] },
  { name:'邓丽君', birth:'1953-01-29 00:00', city:'yunlin', gender:'female', tags:['歌手'] },
  { name:'蔡依林', birth:'1980-09-15 00:00', city:'taibei', gender:'female', tags:['歌手'] },
  { name:'林志玲', birth:'1974-11-29 00:00', city:'taibei', gender:'female', tags:['演员'] },
  { name:'李安', birth:'1954-10-23 00:00', city:'pingtung', gender:'male', tags:['导演'] },
  { name:'侯孝贤', birth:'1947-04-08 00:00', city:'meizhou', gender:'male', tags:['导演'] },

  // ─── 体育 ───
  { name:'姚明', birth:'1980-09-12 00:00', city:'shanghai', gender:'male', tags:['运动员'] },
  { name:'刘翔', birth:'1983-07-13 00:00', city:'shanghai', gender:'male', tags:['运动员'] },
  { name:'李娜', birth:'1982-02-26 00:00', city:'wuhan', gender:'female', tags:['运动员'] },
  { name:'郎平', birth:'1960-12-10 00:00', city:'tianjin', gender:'female', tags:['运动员'] },

  // ─── 娱乐 ───
  { name:'刘亦菲', birth:'1987-08-25 00:00', city:'wuhan', gender:'female', tags:['演员'] },
  { name:'范冰冰', birth:'1981-09-16 00:00', city:'qingdao', gender:'female', tags:['演员'] },
  { name:'章子怡', birth:'1979-02-09 00:00', city:'beijing', gender:'female', tags:['演员'] },
  { name:'赵薇', birth:'1976-03-12 00:00', city:'wuhu', gender:'female', tags:['演员','导演'] },
  { name:'黄晓明', birth:'1977-11-13 00:00', city:'qingdao', gender:'male', tags:['演员'] },
  { name:'陈坤', birth:'1976-02-04 00:00', city:'chongqing', gender:'male', tags:['演员'] },
  { name:'孙俪', birth:'1982-09-26 00:00', city:'shanghai', gender:'female', tags:['演员'] },
  { name:'杨幂', birth:'1986-09-12 00:00', city:'beijing', gender:'female', tags:['演员'] },
  { name:'胡歌', birth:'1982-09-20 00:00', city:'shanghai', gender:'male', tags:['演员'] },
  { name:'吴京', birth:'1974-04-03 00:00', city:'beijing', gender:'male', tags:['演员','导演'] },
  { name:'沈腾', birth:'1979-10-23 00:00', city:'qikihar', gender:'male', tags:['演员'] },
  { name:'贾玲', birth:'1982-04-29 00:00', city:'xiangyang', gender:'female', tags:['演员','导演'] },

  // ─── 外国名人 ───
  { name:'比尔盖茨', birth:'1955-10-28 00:00', city:'seattle', gender:'male', tags:['企业家'] },
  { name:'乔布斯', birth:'1955-02-24 00:00', city:'sanfrancisco', gender:'male', tags:['企业家'] },
  { name:'马斯克', birth:'1971-06-28 00:00', city:'pretoria', gender:'male', tags:['企业家'] },
  { name:'贝索斯', birth:'1964-01-12 00:00', city:'albuquerque', gender:'male', tags:['企业家'] },
  { name:'扎克伯格', birth:'1984-05-14 00:00', city:'whitplains', gender:'male', tags:['企业家'] },
  { name:'爱因斯坦', birth:'1879-03-14 00:00', city:'ulm', gender:'male', tags:['科学家'] },
];

// 城市映射（部分特殊城市）
const CELEBRITY_CITIES = {
  ...CITIES,
  huaiAn: { name:'淮安', lng:119.015, lat:33.610, tz:8 },
  guangAn: { name:'广安', lng:106.633, lat:30.456, tz:8 },
  tangyin: { name:'汤阴', lng:114.357, lat:35.924, tz:8 },
  gongyi: { name:'巩义', lng:113.022, lat:34.748, tz:8 },
  chaozhou: { name:'潮州', lng:116.622, lat:23.657, tz:8 },
  yangquan: { name:'阳泉', lng:113.581, lat:37.856, tz:8 },
  xiantao: { name:'仙桃', lng:113.443, lat:30.375, tz:8 },
  zhenning: { name:'镇宁', lng:105.768, lat:26.057, tz:8 },
  suqian: { name:'宿迁', lng:118.275, lat:33.963, tz:8 },
  longyan: { name:'龙岩', lng:117.017, lat:25.075, tz:8 },
  shangrao: { name:'上饶', lng:117.943, lat:28.454, tz:8 },
  gaomi: { name:'高密', lng:119.755, lat:36.382, tz:8 },
  haining: { name:'海宁', lng:120.680, lat:30.511, tz:8 },
  meizhou: { name:'梅州', lng:116.122, lat:24.288, tz:8 },
  meishan: { name:'眉山', lng:103.848, lat:30.077, tz:8 },
  pingtung: { name:'屏东', lng:120.488, lat:22.676, tz:8 },
  yunlin: { name:'云林', lng:120.527, lat:23.717, tz:8 },
  qikihar: { name:'齐齐哈尔', lng:123.917, lat:47.354, tz:8 },
  seattle: { name:'西雅图', lng:-122.332, lat:47.606, tz:-8 },
  sanfrancisco: { name:'旧金山', lng:-122.419, lat:37.775, tz:-8 },
  pretoria: { name:'比勒陀利亚', lng:28.188, lat:-25.747, tz:2 },
  albuquerque: { name:'阿尔伯克基', lng:-106.650, lat:35.084, tz:-7 },
  whitplains: { name:'白原市', lng:-73.773, lat:41.034, tz:-5 },
  ulm: { name:'乌尔姆', lng:9.993, lat:48.401, tz:1 },
};

// 合并名人专用城市到主城市表，使太阳时矫正对名人生效
Object.assign(CITIES, CELEBRITY_CITIES);

/** 解析名人出生日期 */
function parseCelebrityBirth(item) {
  // 格式: "公元年-月-日 时:分" 或 "公元前年-月-日 时:分"
  const parts = item.birth.split(' ');
  const datePart = parts[0];
  const timePart = parts[1] || '00:00';
  let year, month, day;
  if (datePart.startsWith('公元前')) {
    year = -parseInt(datePart.replace('公元前',''));
    month = parseInt(datePart.split('-')[1]);
    day = parseInt(datePart.split('-')[2]);
  } else {
    year = parseInt(datePart.split('-')[0]);
    month = parseInt(datePart.split('-')[1]);
    day = parseInt(datePart.split('-')[2]);
  }
  const hour = parseInt(timePart.split(':')[0]);
  const minute = parseInt(timePart.split(':')[1]);
  return { year, month, day, hour, minute };
}
