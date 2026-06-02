function initCelebrities() {
  renderCelebrities(CELEBRITIES);
}

function renderCelebrities(list) {
  const container = document.getElementById('celebrityList');
  if (!container) return;
  if (list.length === 0) { container.innerHTML = '<div class="placeholder"><p>未找到匹配的名人</p></div>'; return; }
  container.innerHTML = list.map((c, i) => {
    const birth = c.birth.replace(' ', ' ');
    return `<div class="dayun-item" style="cursor:pointer;border-left-color:var(--primary-light)" data-index="${i}">
      <span class="dayun-age"><strong>${c.name}</strong></span>
      <span class="dayun-ganzhi" style="font-size:13px">${birth}</span>
      <span class="dayun-shishen">${(c.tags || []).join(' · ')}</span>
    </div>`;
  }).join('');
}

function filterCelebrities() {
  const query = (document.getElementById('celebritySearch')?.value || '').trim();
  const tag = document.getElementById('celebrityTag')?.value || '';
  let list = CELEBRITIES;
  if (query) list = list.filter(c => c.name.includes(query));
  if (tag) list = list.filter(c => c.tags.includes(tag));
  renderCelebrities(list);
}

function loadCelebrity(index) {
  const c = CELEBRITIES[index];
  if (!c) return;
  const parsed = parseCelebrityBirth(c);
  if (parsed.year < 1900 || parsed.year > 2100) {
    const msg = document.getElementById('celebrityError');
    if (msg) msg.textContent = '该名人生辰不在排盘范围内（1900-2100年）';
    else {
      const errDiv = document.createElement('div');
      errDiv.id = 'celebrityError';
      errDiv.style.cssText = 'background:#f8d7da;color:#721c24;padding:8px 12px;border-radius:6px;margin:8px 0;font-size:13px;text-align:center';
      errDiv.textContent = '该名人生辰不在排盘范围内（1900-2100年）';
      document.getElementById('celebrityList').parentNode.insertBefore(errDiv, document.getElementById('celebrityList'));
      setTimeout(() => errDiv.remove(), 4000);
    }
    return;
  }
  document.getElementById('name').value = c.name;
  document.getElementById('year').value = parsed.year;
  document.getElementById('month').value = parsed.month;
  updateDays();
  document.getElementById('day').value = parsed.day;
  document.getElementById('hour').value = parsed.hour;
  document.getElementById('minute').value = parsed.minute;
  setGender(c.gender);

  window._baziKeepResult = true;
  BaziRouter.go('bazi');
  document.getElementById('tab-bazi').classList.add('active');

  doCalc();
}

document.getElementById('celebritySearch').addEventListener('input', filterCelebrities);
document.getElementById('celebrityTag').addEventListener('change', filterCelebrities);
document.getElementById('celebrityList').addEventListener('click', function(e) {
  const item = e.target.closest('.dayun-item');
  if (item && item.dataset.index !== undefined) {
    loadCelebrity(parseInt(item.dataset.index));
  }
});

initCelebrities();
