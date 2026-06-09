(function () {
  window.__test = { results: [], pending: 0, done: false }

  var D = '::'
  function _pass(m) { window.__test.results.push('P:' + m.replace(/[\n\r]/g,'')) }
  function _fail(m, d) { window.__test.results.push('F:' + m.replace(/[\n\r]/g,'') + (d ? D + String(d).replace(/[\n\r]/g,'') : '')) }
  function _check(cond, msg, detail) { cond ? _pass(msg) : _fail(msg, detail) }
  function _step(name, fn) {
    window.__test.pending++
    setTimeout(function () {
      try { fn() } catch (e) { _fail(name, e && e.message ? e.message : 'error') }
      window.__test.pending--
      if (window.__test.pending === 0) { window.__test.done = true }
    }, 300)
  }

  _pass('smoke_started')

  var y = document.getElementById('year')
  y.value = '1988'; y.dispatchEvent(new Event('change'))
  document.getElementById('month').value = '3'; document.getElementById('month').dispatchEvent(new Event('change'))
  document.getElementById('day').value = '27'; document.getElementById('day').dispatchEvent(new Event('change'))
  document.getElementById('hour').value = '23'; document.getElementById('hour').dispatchEvent(new Event('change'))
  document.getElementById('minute').value = '55'; document.getElementById('minute').dispatchEvent(new Event('change'))
  document.getElementById('btnCalc').click()
  _pass('calc_clicked')

  _step('result_visible', function () {
    var r = document.getElementById('result')
    _check(r && r.style.display !== 'none', 'result_visible')
    var stems = document.querySelectorAll('.mg-row-stem .mg-cell')
    var branches = document.querySelectorAll('.mg-row-branch .mg-cell')
    var nayin = document.querySelectorAll('.mg-row-nayin .mg-cell')
    if (stems.length > 6 && branches.length > 6) {
      var dp = (stems[5].textContent || '').trim() + (branches[5].textContent || '').trim()
      var hp = (stems[6].textContent || '').trim() + (branches[6].textContent || '').trim()
      _pass('day_pillar_' + dp)
      _pass('hour_pillar_' + hp)
    } else { _fail('pillars', 'stems=' + stems.length) }
    if (nayin.length > 3) { _pass('nayin_' + (nayin[3].textContent || '').trim()) }
  })

  _step('hepan_tab', function () {
    var tb = document.querySelector('[data-tab="hepan"]')
    if (!tb) { _fail('hepan_tab'); return }
    tb.click(); _pass('hepan_tab_clicked')
    _check(!!document.getElementById('hp1Name'), 'hepan_name')
    _check(!!document.getElementById('hp1Province'), 'hepan_province')
    _check(!!document.getElementById('hp1City'), 'hepan_city')
  })

  _step('harmony_calc', function () {
    document.getElementById('hp1Year').value = '1990'
    document.getElementById('hp1Month').value = '5'
    document.getElementById('hp1Day').value = '15'
    document.getElementById('hp1Hour').value = '12'
    document.getElementById('hp1Minute').value = '0'
    document.getElementById('hp2Year').value = '1992'
    document.getElementById('hp2Month').value = '8'
    document.getElementById('hp2Day').value = '20'
    document.getElementById('hp2Hour').value = '8'
    document.getElementById('hp2Minute').value = '0'
    document.getElementById('btnHarmony').click()
    _pass('harmony_clicked')
  })

  _step('yunshi_tab', function () {
    var tb = document.querySelector('[data-tab="yunshi"]')
    if (!tb) { _fail('yunshi_tab'); return }
    tb.click(); _pass('yunshi_tab_clicked')
    _check(!!document.getElementById('yunshiKLineContent'), 'yunshi_content')
  })

  _step('zeri_tab', function () {
    var tb = document.querySelector('[data-tab="zeri"]')
    if (!tb) { _fail('zeri_tab'); return }
    tb.click(); _pass('zeri_tab_clicked')
    _check(!!document.getElementById('zeriContent'), 'zeri_content')
    var zr = document.getElementById('zeriResult')
    _check(zr && zr.style.display !== 'none', 'zeri_result_visible', zr ? zr.style.display : 'no_el')
  })

  _step('history_tab', function () {
    var tb = document.querySelector('[data-tab="history"]')
    if (!tb) { _fail('history_tab'); return }
    tb.click(); _pass('history_tab_clicked')
    _check(!!document.getElementById('historyList'), 'history_list')
    _check(!!document.getElementById('historySearch'), 'history_search')
    _check(!!document.getElementById('historyEmpty'), 'history_empty')
  })

  _step('settings_tab', function () {
    var tb = document.querySelector('[data-tab="settings"]')
    if (!tb) { _fail('settings_tab'); return }
    tb.click(); _pass('settings_tab_clicked')
    _check(!!document.getElementById('versionHistoryList'), 'settings_version_list')
  })

  _step('bazi_tab_back', function () {
    var tb = document.querySelector('[data-tab="bazi"]')
    if (!tb) { _fail('bazi_tab_back'); return }
    tb.click(); _pass('bazi_tab_back')
  })

  return 'started ' + window.__test.pending + ' steps queued'
})()
