function saveHistory(name, result) {
  let history = JSON.parse(localStorage.getItem('bazi_history') || '[]');
  history.unshift({
    name,
    gender: result.input.gender,
    date: `${result.input.year}-${result.input.month}-${result.input.day}`,
    time: `${String(result.input.hour).padStart(2,'0')}:${String(result.input.minute).padStart(2,'0')}`,
    pillars: `${result.pillars.year.stem}${result.pillars.year.branch} ${result.pillars.month.stem}${result.pillars.month.branch} ${result.pillars.day.stem}${result.pillars.day.branch} ${result.pillars.hour.stem}${result.pillars.hour.branch}`,
    timestamp: Date.now(),
  });
  if (history.length > 20) history = history.slice(0, 20);
  localStorage.setItem('bazi_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('bazi_history') || '[]');
  const container = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');
  if (history.length === 0) {
    empty.style.display = 'block';
    container.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  container.innerHTML = history.map((h, i) => `
    <div class="dayun-item" style="cursor:pointer;border-left-color:var(--primary-light)" onclick="loadHistory(${i})">
      <span class="dayun-age">${h.name || '未知'}</span>
      <span class="dayun-ganzhi" style="font-size:14px">${h.pillars}</span>
      <span class="dayun-shishen">${h.date} ${h.time}</span>
    </div>
  `).join('');
}

function loadHistory(index) {
  const history = JSON.parse(localStorage.getItem('bazi_history') || '[]');
  const h = history[index];
  if (!h) return;

  const [y, m, d] = h.date.split('-').map(Number);
  const [hh, mi] = h.time.split(':').map(Number);
  document.getElementById('year').value = y;
  document.getElementById('month').value = m;
  updateDays();
  document.getElementById('day').value = d;
  document.getElementById('hour').value = hh;
  document.getElementById('minute').value = mi;
  setGender(h.gender);

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab[data-tab="bazi"]').classList.add('active');
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-bazi').classList.add('active');

  doCalc();
}

renderHistory();
