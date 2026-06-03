(function(global) {
'use strict';

class XiaoGua {
  constructor(container, options = {}) {
    this.container = container;
    this.apiKey = options.apiKey || 'sk-79c4d7abebdd4a2789c228a3f4c5ea99';
    this.apiUrl = options.apiUrl || 'https://api.deepseek.com/chat/completions';
    this.baziData = null;
    this.messages = [];
    this.streaming = false;
    this.abortController = null;
    this.typewriterTimer = null;
    this.typewriterBuffer = '';
    this.typewriterDisplayed = 0;
    this.currentBubble = null;
    this.fullResponse = '';
    this.triggerPos = { left: null, top: null };
    this.panelPos = { left: null, top: null };
    this.eventController = new AbortController();

    this._createDOM();
    this._initDrag();
    this._bindEvents();
    this.el.trigger.classList.add('hidden');
  }

  setBaziData(data) {
    this.baziData = data ? JSON.parse(JSON.stringify(data)) : null;
    this._updateBaziBar();
    this.messages = [];
    this.el.messages.innerHTML = '';
    if (data) this.el.trigger.classList.remove('hidden');
  }

  open() {
    this._openPanel();
  }

  close() {
    this._closePanel();
  }

  destroy() {
    this.eventController.abort();
    if (this.abortController) this.abortController.abort();
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.container.innerHTML = '';
  }

  // ====================  DOM  ====================
  _createDOM() {
    this.container.innerHTML =
      '<div class="xg-trigger" data-xg="trigger">'
        + '<img class="xg-logo" src="bazi-xiaogua/xiaogua-logo.png" alt="小卦">'
        + '<span>小卦AI</span>'
      + '</div>'
      + '<div class="xg-panel" data-xg="panel">'
        + '<div class="xg-header" data-xg="header">'
          + '<img class="xg-logo" src="bazi-xiaogua/xiaogua-logo.png" alt="小卦">'
          + '<span class="xg-title">小卦</span>'
          + '<button class="xg-close" data-xg="close">✕</button>'
        + '</div>'
        + '<div class="xg-bazi-bar" data-xg="baziBar" style="display:none"></div>'
        + '<div class="xg-messages" data-xg="messages"></div>'
        + '<div class="xg-quick" data-xg="quick">'
          + '<button data-preset="full">来，看看我这盘</button>'
          + '<button data-preset="geju">我这格局啥水平</button>'
          + '<button data-preset="yunshi">最近运气如何</button>'
          + '<button data-preset="yongshen">听点小建议</button>'
          + '<button data-preset="term">名词解释</button>'
        + '</div>'
        + '<div class="xg-input-row">'
          + '<input data-xg="input" placeholder="输入你想问的问题…" autocomplete="off">'
          + '<button class="xg-send" data-xg="send">发送</button>'
        + '</div>'
      + '</div>';

    this.el = {
      trigger: this.container.querySelector('[data-xg="trigger"]'),
      panel: this.container.querySelector('[data-xg="panel"]'),
      header: this.container.querySelector('[data-xg="header"]'),
      close: this.container.querySelector('[data-xg="close"]'),
      baziBar: this.container.querySelector('[data-xg="baziBar"]'),
      messages: this.container.querySelector('[data-xg="messages"]'),
      quick: this.container.querySelector('[data-xg="quick"]'),
      input: this.container.querySelector('[data-xg="input"]'),
      send: this.container.querySelector('[data-xg="send"]'),
    };
  }

  // ====================  Drag  ====================
  _initDrag() {
    this._makeDraggable(this.el.trigger, this.el.trigger, this.triggerPos);
    this._makeDraggable(this.el.panel, this.el.header, this.panelPos);

    const self = this;
    window.addEventListener('resize', function () {
      if (window.innerWidth <= 520) {
        self.panelPos.left = null; self.panelPos.top = null;
        self.el.panel.style.left = ''; self.el.panel.style.top = '';
        self.el.panel.style.right = ''; self.el.panel.style.bottom = '';
        self.triggerPos.left = null; self.triggerPos.top = null;
        self.el.trigger.style.left = ''; self.el.trigger.style.top = '';
        self.el.trigger.style.right = ''; self.el.trigger.style.bottom = '';
      }
    }, { signal: this.eventController.signal });
  }

  _applyPos(el, pos) {
    if (pos.left !== null) {
      const maxX = window.innerWidth - el.offsetWidth;
      const maxY = window.innerHeight - el.offsetHeight;
      const clampedLeft = Math.max(0, Math.min(pos.left, maxX));
      const clampedTop = Math.max(60, Math.min(pos.top, maxY));
      el.style.left = clampedLeft + 'px';
      el.style.top = clampedTop + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      pos.left = clampedLeft;
      pos.top = clampedTop;
    }
  }

  _makeDraggable(el, handle, store) {
    const self = this;
    let on = false, sx, sy, sl, st, dragged = false;

    function start(e) {
      if (e.target.closest('.xg-close')) return;
      el.setAttribute('data-dragging', '1');
      const t = e.touches ? e.touches[0] : e;
      on = true; sx = t.clientX; sy = t.clientY;
      dragged = false;
      const r = el.getBoundingClientRect();
      sl = r.left; st = r.top;
      el.style.left = sl + 'px'; el.style.top = st + 'px';
      el.style.right = 'auto'; el.style.bottom = 'auto';
      store.left = sl; store.top = st;
    }

    function move(e) {
      if (!on) return;
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (!dragged && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) dragged = true;
      if (e.cancelable) e.preventDefault();
      const maxX = window.innerWidth - el.offsetWidth;
      const maxY = window.innerHeight - el.offsetHeight;
      const newLeft = Math.max(0, Math.min(sl + dx, maxX));
      const newTop = Math.max(60, Math.min(st + dy, maxY));
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
      store.left = newLeft;
      store.top = newTop;
    }

    function end() { on = false; dragged = false; }

    function onClickGuard(e) {
      if (dragged) e.stopPropagation();
    }

    handle.addEventListener('mousedown', start, { signal: self.eventController.signal });
    document.addEventListener('mousemove', move, { signal: self.eventController.signal });
    document.addEventListener('mouseup', end, { signal: self.eventController.signal });
    handle.addEventListener('touchstart', start, { passive: false, signal: self.eventController.signal });
    document.addEventListener('touchmove', move, { passive: false, signal: self.eventController.signal });
    document.addEventListener('touchend', end, { signal: self.eventController.signal });
    handle.addEventListener('click', onClickGuard, { capture: true, signal: self.eventController.signal });
    handle.addEventListener('dragstart', function (e) { e.preventDefault(); }, { signal: self.eventController.signal });

    return store;
  }

  // ====================  Bazi data  ====================
  _updateBaziBar() {
    const bar = this.el.baziBar;
    const d = this.baziData;
    if (!d) { bar.style.display = 'none'; return; }

    const name = d.input.name || '未知';
    const solar = d.input.year + '年' + d.input.month + '月' + d.input.day + '日 '
      + String(d.input.hour).padStart(2, '0') + ':' + String(d.input.minute).padStart(2, '0');
    const lunar = d.lunarDate || '';
    const p = d.pillars;
    const pillars = (p.year.stem + p.year.branch) + ' ' + (p.month.stem + p.month.branch) + ' ' + (p.day.stem + p.day.branch) + ' ' + (p.hour.stem + p.hour.branch);

    bar.style.display = 'block';
    bar.innerHTML =
      '<div class="xg-bazi-name">当前命盘：' + this._esc(name) + '</div>'
      + '<div class="xg-bazi-meta">公历：' + this._esc(solar) + '</div>'
      + '<div class="xg-bazi-meta">农历：' + this._esc(lunar) + '</div>'
      + '<div class="xg-bazi-meta">八字：' + this._esc(pillars) + '</div>';
  }

  _buildBaziSection() {
    const d = this.baziData;
    if (!d) return '';

    const now = new Date();
    const gender = d.input.gender === 'female' ? '女' : '男';
    const name = d.input.name || '未知';
    const solar = d.input.year + '年' + d.input.month + '月' + d.input.day + '日 '
      + String(d.input.hour).padStart(2, '0') + ':' + String(d.input.minute).padStart(2, '0');
    const p = d.pillars;
    const pillars = (p.year.stem + p.year.branch) + ' ' + (p.month.stem + p.month.branch) + ' ' + (p.day.stem + p.day.branch) + ' ' + (p.hour.stem + p.hour.branch);
    const rizhu = (d.details.day.stem || '') + '（' + (d.details.day.stemWuxing || '') + '）';
    const geju = d.geJu.name || '';
    const qiangruo = d.pattern.isStrong || '';
    const yongshen = d.pattern.yongShen || '';
    const jishen = d.pattern.jiShen || '';

    let dayunStr = '';
    if (d.dayun && d.dayun.periods && d.dayun.periods.length) {
      const birthYear = d.input.year;
      const age = now.getFullYear() - birthYear;
      const cur = d.dayun.periods.find(function (p) {
        var parts = p.ageRange.split('-');
        return age >= parseInt(parts[0]) && age <= parseInt(parts[1]);
      });
      if (cur) {
        dayunStr = cur.shishen + '（' + cur.ageRange + '岁）';
      } else {
        dayunStr = d.dayun.periods.map(function (p) { return p.ganzhi + '（' + p.ageRange + '）'; }).join('、');
      }
    }

    var liunian = '';
    if (d.liuNian) {
      liunian = d.liuNian.ganzhi || '';
      if (d.liuNian.shishenTianGan || d.liuNian.shishenDiZhi) {
        liunian += '（' + (d.liuNian.shishenTianGan || '') + '+' + (d.liuNian.shishenDiZhi || '') + '）';
      }
    }

    var curMonth = null;
    if (d.liuYue) {
      curMonth = d.liuYue.find(function (m) { return m.month === now.getMonth() + 1; });
    }
    var curDay = null;
    if (d.liuRi) {
      curDay = d.liuRi.find(function (dd) { return dd.day === now.getDate(); });
    }
    var curShi = null;
    if (d.liuShi) {
      var shiIdx = Math.floor((now.getHours() + 1) / 2) % 12;
      curShi = d.liuShi[shiIdx];
    }

    var lines = [
      '【当前命盘】',
      '姓名：' + name,
      '性别：' + gender,
      '公历：' + solar,
      '农历：' + (d.lunarDate || ''),
      '八字：' + pillars,
      '日主：' + rizhu,
      '格局：' + geju,
      '身强弱：' + qiangruo,
      '用神：' + yongshen,
      '忌神：' + jishen,
      '当前大运：' + dayunStr,
      '当前流年：' + liunian,
    ];
    if (curMonth) lines.push('当前流月：' + curMonth.month + '月（' + curMonth.ganzhi + '）');
    if (curDay) lines.push('当前流日：' + curDay.day + '日（' + curDay.ganzhi + '）');
    if (curShi) lines.push('当前流时：' + curShi.label + '时（' + curShi.ganzhi + '）');
    lines.push('查询时间：' + now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0'));
    lines.push('', '---', '');

    return lines.join('\n');
  }

  // ====================  System prompts  ====================
  _buildSysPrompt(mode) {
    var baziSection = this._buildBaziSection();
    if (mode === 'long') {
      return baziSection + [
        '你是小卦，八字排盘 App"卦卦"的 AI 命理助手，由毕大师打造。',
        '用户是刚接触八字命理的普通人，看不懂专业术语。',
        '',
        '说话像朋友一样亲切轻松，偶尔幽默但不轻浮。',
        '用"你"称呼用户。价值观：引导人向善向美向好，不贩卖焦虑。',
        '',
        '输出格式：',
        '- 用【】做段落标题产生结构，结论用【结论】，内容用【工作】、【感情】等',
        '- 先说结论，空行后展开',
        '- 每段 1-2 句，不超过 3 段',
        '- 涉及出处自然提到',
        '- 结合生活场景（工作、感情、搞钱、健康）',
        '- 禁止使用任何 markdown 符号（** * _ ` # > 等），全部用【】代替',
        '',
        '约束：',
        '- 不知道的明确说不知道，不编造',
        '- 不询问用户出生信息',
        '- 所有时间信息（流年/流月/流日/流时）以上方【当前命盘】为准，不要自行计算',
      ].join('\n');
    }
    return baziSection + [
      '你是小卦，八字排盘 App"卦卦"的 AI 命理助手，由毕大师打造。',
      '用"你"称呼用户。',
      '',
      '回答规则：',
      '- 不论问题是什么，回答不超过4句话',
      '- 每句话尽量简短，控制在30字以内',
      '- 如果用户没问命理相关问题，自然回应就行，不硬套命理',
      '- 如果用户问了命理相关内容，简洁说明核心观点即可',
      '- 不要询问用户出生信息',
      '- 不编造，不知道就说不知道',
    ].join('\n');
  }

  _getPreset(key) {
    var presets = {
      full: '瞅瞅我这命盘咋样，先说结论再展开',
      geju: '我这格局厉害不？用大白话讲讲特点',
      yunshi: '看看我最近运势，搞钱/工作/感情有戏没',
      yongshen: '根据我的用神忌神，给点实用的',
      term: '',
    };
    return presets[key];
  }

  // ====================  Panel actions  ====================
  _openPanel() {
    this._applyPos(this.el.panel, this.panelPos);
    this.el.panel.classList.add('open');
    this.el.trigger.classList.add('hidden');
    var self = this;
    setTimeout(function () {
      var greeting = '哟，朋友！我是毕大师的助手小卦，今天想盘点啥？';
      self.typewriterBuffer = greeting;
      self.typewriterDisplayed = 0;
      self.currentBubble = self._renderAIMsg('');
      self.currentBubble.classList.add('typing');
      self._startTypewriter();
    }, 400);
  }

  _closePanel() {
    this.el.panel.classList.remove('open');
    this.el.trigger.classList.remove('hidden');
    this.messages = [];
    if (this.streaming) this._cancelStream();
  }

  _addMessage(role, text) {
    this.messages.push({ role: role, text: text });
  }

  _scrollToBottom() {
    var self = this;
    requestAnimationFrame(function () {
      self.el.messages.scrollTop = self.el.messages.scrollHeight;
    });
  }

  // ====================  Render  ====================
  _esc(t) {
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  _formatAIText(text) {
    if (!text) return '';
    if (/【[^】]+】/.test(text)) {
      var lines = text.split('\n');
      var sections = [], cur = null;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || /^-{3,}$/.test(line)) continue;
        if (/^【[^】]+】/.test(line)) {
          cur = { title: line, body: [] };
          sections.push(cur);
        } else {
          if (!cur) { cur = { title: null, body: [] }; sections.push(cur); }
          cur.body.push(lines[i]);
        }
      }
      var html = '';
      for (var j = 0; j < sections.length; j++) {
        var sec = sections[j];
        var body = this._esc(sec.body.join('\n')).replace(/\n/g, '<br>');
        if (sec.title) {
          html += '<div class="xg-section"><h4>' + this._esc(sec.title) + '</h4><p>' + body + '</p></div>';
        } else {
          html += '<p class="xg-conclusion">' + body + '</p>';
        }
      }
      return html || this._esc(text).replace(/\n/g, '<br>');
    }
    return '<p class="xg-plain-msg">' + this._esc(text).replace(/\n/g, '<br>') + '</p>';
  }

  _renderUserMsg(text) {
    var div = document.createElement('div');
    div.className = 'xg-msg xg-msg-user';
    div.innerHTML = this._esc(text).replace(/\n/g, '<br>');
    this.el.messages.appendChild(div);
    this._scrollToBottom();
  }

  _renderAIMsg(text) {
    var div = document.createElement('div');
    div.className = 'xg-msg xg-msg-ai';
    if (text) div.innerHTML = this._formatAIText(text);
    this.el.messages.appendChild(div);
    this._scrollToBottom();
    return div;
  }

  _renderError(text) {
    var div = document.createElement('div');
    div.className = 'xg-msg xg-msg-err';
    div.textContent = text;
    this.el.messages.appendChild(div);
    this._scrollToBottom();
  }

  // ====================  Typewriter  ====================
  _startTypewriter() {
    if (this.typewriterTimer) return;
    var self = this;
    this.typewriterTimer = setInterval(function () {
      if (self.typewriterDisplayed < self.typewriterBuffer.length) {
        self.typewriterDisplayed++;
        if (self.currentBubble) {
          self.currentBubble.textContent = self.typewriterBuffer.slice(0, self.typewriterDisplayed);
          self._scrollToBottom();
        }
      } else if (!self.streaming) {
        self._finishTypewriter();
      }
    }, 25);
  }

  _onChunk(text) {
    this.fullResponse += text;
    this.typewriterBuffer += text;

    var idx = this.typewriterBuffer.indexOf('\n【');
    if (idx !== -1) {
      var complete = this.typewriterBuffer.slice(0, idx);
      var remaining = this.typewriterBuffer.slice(idx + 1);
      if (this.currentBubble) {
        this.currentBubble.classList.remove('typing');
        this.currentBubble.innerHTML = this._formatAIText(complete);
      }
      this.typewriterBuffer = remaining;
      this.typewriterDisplayed = 0;
      var nb = this._renderAIMsg('');
      nb.classList.add('typing');
      this.currentBubble = nb;
      if (this.typewriterTimer) { clearInterval(this.typewriterTimer); this.typewriterTimer = null; }
      this._startTypewriter();
      return;
    }

    if (!this.typewriterTimer) this._startTypewriter();
  }

  _finishTypewriter() {
    if (this.typewriterDisplayed < this.typewriterBuffer.length) {
      this.typewriterDisplayed = this.typewriterBuffer.length;
    }
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    if (this.currentBubble) {
      this.currentBubble.classList.remove('typing');
      this.currentBubble.innerHTML = this._formatAIText(this.typewriterBuffer);
      this._scrollToBottom();
    }
  }

  _cancelStream() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.streaming = false;
    this._finishTypewriter();
    this.currentBubble = null;
    this.fullResponse = '';
    this._setUIState(false);
  }

  // ====================  UI State  ====================
  _setUIState(isStreaming) {
    this.streaming = isStreaming;
    var btns = this.el.quick.querySelectorAll('button');
    btns.forEach(function (b) { b.disabled = isStreaming; });
    this.el.input.disabled = isStreaming;
    if (isStreaming) {
      this.el.send.textContent = '停止';
      this.el.send.classList.add('stop');
    } else {
      this.el.send.textContent = '发送';
      this.el.send.classList.remove('stop');
    }
  }

  // ====================  API  ====================
  _sendMessage(userText, mode) {
    if (!userText.trim()) return;
    if (this.streaming) { this._cancelStream(); return; }
    mode = mode || 'short';

    this._renderUserMsg(userText);
    this._addMessage('user', userText);

    var sysPrompt = this._buildSysPrompt(mode === 'long' ? 'long' : 'short');
    var msgs = [
      { role: 'system', content: sysPrompt },
    ];
    for (var i = 0; i < this.messages.length; i++) {
      msgs.push({ role: this.messages[i].role, content: this.messages[i].text });
    }

    this.typewriterBuffer = '';
    this.typewriterDisplayed = 0;
    this.fullResponse = '';
    this.currentBubble = this._renderAIMsg('');
    this.currentBubble.classList.add('typing');

    this._setUIState(true);
    this.abortController = new AbortController();

    var self = this;

    fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: msgs,
        stream: true,
      }),
      signal: this.abortController.signal,
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (errText) {
          throw new Error('API ' + res.status + ': ' + errText.slice(0, 100));
        });
      }
      return self._handleStream(res);
    }).catch(function (err) {
      if (err.name === 'AbortError') return;
      console.error('API Error:', err);
      if (self.currentBubble && self.currentBubble.parentNode) {
        self.currentBubble.parentNode.removeChild(self.currentBubble);
      }
      self.currentBubble = null;
      self.streaming = false;
      self._finishTypewriter();
      self._renderError('小卦暂时无法回应。请确认网络正常，稍后重试 ☯');
      self._setUIState(false);
      self.fullResponse = '';
    });
  }

  async _handleStream(res) {
    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var partial = '';

    while (true) {
      var result = await reader.read();
      if (result.done) break;

      var chunk = decoder.decode(result.value, { stream: true });
      var lines = (partial + chunk).split('\n');
      partial = lines.pop() || '';

      for (var i = 0; i < lines.length; i++) {
        var trimmed = lines[i].trim();
        if (!trimmed.startsWith('data:')) continue;
        var data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;
        try {
          var json = JSON.parse(data);
          var content = json.choices?.[0]?.delta?.content || '';
          if (content) this._onChunk(content);
        } catch (_) {}
      }
    }

    this.streaming = false;
    this._finishTypewriter();
    this._addMessage('assistant', this.fullResponse);
    this.currentBubble = null;
    this.fullResponse = '';
    this._setUIState(false);
  }

  // ====================  Events  ====================
  _bindEvents() {
    var self = this;

    this.el.trigger.addEventListener('click', function () { self._openPanel(); }, { signal: this.eventController.signal });
    this.el.close.addEventListener('click', function () { self._closePanel(); }, { signal: this.eventController.signal });

    this.el.quick.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      var preset = btn.dataset.preset;
      if (preset === 'term') {
        self.el.input.focus();
        self.el.input.placeholder = '输入你要查的术语…';
        return;
      }
      var text = self._getPreset(preset);
      if (text) self._sendMessage(text, 'long');
    }, { signal: this.eventController.signal });

    this.el.send.addEventListener('click', function () {
      if (self.streaming) { self._cancelStream(); return; }
      var text = self.el.input.value.trim();
      if (text) { self._sendMessage(text); self.el.input.value = ''; }
    }, { signal: this.eventController.signal });

    this.el.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        self.el.send.click();
      }
    }, { signal: this.eventController.signal });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.el.panel.classList.contains('open')) self._closePanel();
    }, { signal: this.eventController.signal });

    this.el.panel.addEventListener('touchmove', function (e) {
      if (!self.el.messages.contains(e.target)) e.preventDefault();
    }, { signal: this.eventController.signal });
  }
}

global.XiaoGua = XiaoGua;
})(typeof window !== 'undefined' ? window : this);
