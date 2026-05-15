/**
 * 中国城市经纬度数据库
 * 用于真太阳时校正计算
 */
const CITIES = {
  // 直辖市
  beijing:       { name: '北京',   lng: 116.407, lat: 39.904, tz: 8 },
  shanghai:      { name: '上海',   lng: 121.474, lat: 31.230, tz: 8 },
  tianjin:       { name: '天津',   lng: 117.200, lat: 39.120, tz: 8 },
  chongqing:     { name: '重庆',   lng: 106.551, lat: 29.563, tz: 8 },

  // 河北
  shijiazhuang:  { name: '石家庄', lng: 114.469, lat: 38.036, tz: 8 },
  tangshan:      { name: '唐山',   lng: 118.183, lat: 39.651, tz: 8 },
  qinhuangdao:   { name: '秦皇岛', lng: 119.600, lat: 39.935, tz: 8 },
  handan:        { name: '邯郸',   lng: 114.539, lat: 36.625, tz: 8 },
  baoding:       { name: '保定',   lng: 115.485, lat: 38.874, tz: 8 },

  // 山西
  taiyuan:       { name: '太原',   lng: 112.549, lat: 37.870, tz: 8 },
  datong:        { name: '大同',   lng: 113.300, lat: 40.077, tz: 8 },

  // 内蒙古
  huhehaote:     { name: '呼和浩特', lng: 111.751, lat: 40.842, tz: 8 },
  baotou:        { name: '包头',   lng: 109.953, lat: 40.621, tz: 8 },

  // 辽宁
  shenyang:      { name: '沈阳',   lng: 123.432, lat: 41.736, tz: 8 },
  dalian:        { name: '大连',   lng: 121.615, lat: 38.914, tz: 8 },
  anshan:        { name: '鞍山',   lng: 122.994, lat: 41.108, tz: 8 },

  // 吉林
  changchun:     { name: '长春',   lng: 125.324, lat: 43.896, tz: 8 },
  jilin:         { name: '吉林',   lng: 126.550, lat: 43.838, tz: 8 },

  // 黑龙江
  haerbin:       { name: '哈尔滨', lng: 126.642, lat: 45.773, tz: 8 },
  daqing:        { name: '大庆',   lng: 125.104, lat: 46.589, tz: 8 },

  // 江苏
  nanjing:       { name: '南京',   lng: 118.796, lat: 32.060, tz: 8 },
  suzhou:        { name: '苏州',   lng: 120.584, lat: 31.298, tz: 8 },
  wuxi:          { name: '无锡',   lng: 120.305, lat: 31.570, tz: 8 },
  xuzhou:        { name: '徐州',   lng: 117.201, lat: 34.260, tz: 8 },
  yangzhou:      { name: '扬州',   lng: 119.413, lat: 32.394, tz: 8 },

  // 浙江
  hangzhou:      { name: '杭州',   lng: 120.153, lat: 30.274, tz: 8 },
  ningbo:        { name: '宁波',   lng: 121.625, lat: 29.860, tz: 8 },
  wenzhou:       { name: '温州',   lng: 120.700, lat: 28.002, tz: 8 },
  jiaxing:       { name: '嘉兴',   lng: 120.755, lat: 30.746, tz: 8 },
  shaoxing:      { name: '绍兴',   lng: 120.579, lat: 30.030, tz: 8 },

  // 安徽
  hefei:         { name: '合肥',   lng: 117.229, lat: 31.820, tz: 8 },
  wuhu:          { name: '芜湖',   lng: 118.433, lat: 31.352, tz: 8 },
  huangshan:     { name: '黄山',   lng: 118.180, lat: 29.715, tz: 8 },

  // 福建
  fuzhou:        { name: '福州',   lng: 119.297, lat: 26.074, tz: 8 },
  xiamen:        { name: '厦门',   lng: 118.089, lat: 24.479, tz: 8 },
  quanzhou:      { name: '泉州',   lng: 118.589, lat: 24.908, tz: 8 },

  // 江西
  nanchang:      { name: '南昌',   lng: 115.858, lat: 28.683, tz: 8 },
  jiujiang:      { name: '九江',   lng: 115.952, lat: 29.662, tz: 8 },

  // 山东
  jinan:         { name: '济南',   lng: 117.000, lat: 36.675, tz: 8 },
  qingdao:       { name: '青岛',   lng: 120.355, lat: 36.083, tz: 8 },
  yantai:        { name: '烟台',   lng: 121.391, lat: 37.539, tz: 8 },
  weifang:       { name: '潍坊',   lng: 119.162, lat: 36.717, tz: 8 },
  linyi:         { name: '临沂',   lng: 118.340, lat: 35.072, tz: 8 },

  // 河南
  zhengzhou:     { name: '郑州',   lng: 113.665, lat: 34.757, tz: 8 },
  luoyang:       { name: '洛阳',   lng: 112.454, lat: 34.620, tz: 8 },
  kaifeng:       { name: '开封',   lng: 114.307, lat: 34.797, tz: 8 },

  // 湖北
  wuhan:         { name: '武汉',   lng: 114.305, lat: 30.593, tz: 8 },
  yichang:       { name: '宜昌',   lng: 111.290, lat: 30.692, tz: 8 },
  xiangyang:     { name: '襄阳',   lng: 112.123, lat: 32.009, tz: 8 },

  // 湖南
  changsha:      { name: '长沙',   lng: 112.939, lat: 28.228, tz: 8 },
  zhuzhou:       { name: '株洲',   lng: 113.134, lat: 27.828, tz: 8 },
  xiangtan:      { name: '湘潭',   lng: 112.944, lat: 27.830, tz: 8 },

  // 广东
  guangzhou:     { name: '广州',   lng: 113.265, lat: 23.131, tz: 8 },
  shenzhen:      { name: '深圳',   lng: 114.057, lat: 22.543, tz: 8 },
  zhuhai:        { name: '珠海',   lng: 113.577, lat: 22.271, tz: 8 },
  dongguan:      { name: '东莞',   lng: 113.752, lat: 23.021, tz: 8 },
  foshan:        { name: '佛山',   lng: 113.122, lat: 23.029, tz: 8 },
  shantou:       { name: '汕头',   lng: 116.728, lat: 23.384, tz: 8 },
  huizhou:       { name: '惠州',   lng: 114.416, lat: 23.071, tz: 8 },

  // 广西
  nanning:       { name: '南宁',   lng: 108.366, lat: 22.817, tz: 8 },
  guilin:        { name: '桂林',   lng: 110.180, lat: 25.235, tz: 8 },
  liuzhou:       { name: '柳州',   lng: 109.415, lat: 24.326, tz: 8 },

  // 海南
  haikou:        { name: '海口',   lng: 110.331, lat: 20.023, tz: 8 },
  sanya:         { name: '三亚',   lng: 109.508, lat: 18.253, tz: 8 },

  // 四川
  chengdu:       { name: '成都',   lng: 104.066, lat: 30.573, tz: 8 },
  mianyang:      { name: '绵阳',   lng: 104.742, lat: 31.468, tz: 8 },
  deyang:        { name: '德阳',   lng: 104.398, lat: 31.127, tz: 8 },

  // 贵州
  guiyang:       { name: '贵阳',   lng: 106.630, lat: 26.647, tz: 8 },
  zunyi:         { name: '遵义',   lng: 106.927, lat: 27.725, tz: 8 },

  // 云南
  kunming:       { name: '昆明',   lng: 102.833, lat: 24.880, tz: 8 },
  dali:          { name: '大理',   lng: 100.230, lat: 25.592, tz: 8 },
  lijiang:       { name: '丽江',   lng: 100.229, lat: 26.875, tz: 8 },

  // 西藏
  lasa:          { name: '拉萨',   lng: 91.114,  lat: 29.647, tz: 8 },

  // 陕西
  xian:          { name: '西安',   lng: 108.940, lat: 34.262, tz: 8 },
  xianyang:      { name: '咸阳',   lng: 108.709, lat: 34.329, tz: 8 },
  baoji:         { name: '宝鸡',   lng: 107.238, lat: 34.363, tz: 8 },

  // 甘肃
  lanzhou:       { name: '兰州',   lng: 103.834, lat: 36.061, tz: 8 },
  tianshui:      { name: '天水',   lng: 105.725, lat: 34.581, tz: 8 },

  // 青海
  xining:        { name: '西宁',   lng: 101.779, lat: 36.623, tz: 8 },

  // 宁夏
  yinchuan:      { name: '银川',   lng: 106.231, lat: 38.486, tz: 8 },

  // 新疆
  urumqi:        { name: '乌鲁木齐', lng: 87.617,  lat: 43.793, tz: 8 },
  kashi:         { name: '喀什',   lng: 75.993,  lat: 39.468, tz: 8 },

  // 香港
  hongkong:      { name: '香港',   lng: 114.186, lat: 22.293, tz: 8 },

  // 澳门
  macau:         { name: '澳门',   lng: 113.543, lat: 22.191, tz: 8 },

  // 台湾
  taibei:        { name: '台北',   lng: 121.511, lat: 25.052, tz: 8 },
  taizhong:      { name: '台中',   lng: 120.679, lat: 24.138, tz: 8 },
  gaoxiong:      { name: '高雄',   lng: 120.312, lat: 22.620, tz: 8 },
};
