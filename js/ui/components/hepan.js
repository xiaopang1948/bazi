function initHepanSelectors() {
  ['hp1','hp2'].forEach(prefix => {
    const yearSel = document.getElementById(prefix + 'Year');
    const thisYear = new Date().getFullYear();
    for (let y = 1900; y <= thisYear; y++) {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      yearSel.appendChild(opt);
    }
    const monthSel = document.getElementById(prefix + 'Month');
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement('option');
      opt.value = m; opt.textContent = m;
      monthSel.appendChild(opt);
    }
    const daySel = document.getElementById(prefix + 'Day');
    function updateHpDays() {
      const y = parseInt(yearSel.value);
      const m = parseInt(monthSel.value);
      const days = new Date(y, m, 0).getDate();
      daySel.innerHTML = '';
      for (let d = 1; d <= days; d++) {
        const opt = document.createElement('option');
        opt.value = d; opt.textContent = d;
        daySel.appendChild(opt);
      }
    }
    yearSel.addEventListener('change', updateHpDays);
    monthSel.addEventListener('change', updateHpDays);
    updateHpDays();

    const hourSel = document.getElementById(prefix + 'Hour');
    for (let h = 0; h <= 23; h++) {
      const opt = document.createElement('option');
      opt.value = h; opt.textContent = String(h).padStart(2,'0');
      hourSel.appendChild(opt);
    }
    const minSel = document.getElementById(prefix + 'Minute');
    for (let m = 0; m <= 59; m++) {
      const opt = document.createElement('option');
      opt.value = m; opt.textContent = String(m).padStart(2,'0');
      minSel.appendChild(opt);
    }
    const citySel = document.getElementById(prefix + 'City');
    const defaultOpt = document.createElement('option');
    defaultOpt.value = ''; defaultOpt.textContent = '— 请选择城市 —';
    defaultOpt.disabled = true; defaultOpt.selected = true;
    citySel.appendChild(defaultOpt);
    for (const [key, city] of Object.entries(CITIES)) {
      const opt = document.createElement('option');
      opt.value = key; opt.textContent = city.name;
      citySel.appendChild(opt);
    }
  });

  const now = new Date();
  document.getElementById('hp1Year').value = now.getFullYear();
  document.getElementById('hp1Month').value = now.getMonth() + 1;
  document.getElementById('hp2Year').value = now.getFullYear();
  document.getElementById('hp2Month').value = now.getMonth() + 1;
  ['hp1','hp2'].forEach(p => {
    document.getElementById(p + 'Day').value = now.getDate();
  });
}

function readHpInput(prefix) {
  const name = document.getElementById(prefix + 'Name').value || (prefix === 'hp1' ? '甲方' : '乙方');
  const gender = document.querySelector(`input[name="${prefix}Gender"]:checked`).value;
  const year = parseInt(document.getElementById(prefix + 'Year').value);
  const month = parseInt(document.getElementById(prefix + 'Month').value);
  const day = parseInt(document.getElementById(prefix + 'Day').value);
  const hour = parseInt(document.getElementById(prefix + 'Hour').value);
  const minute = parseInt(document.getElementById(prefix + 'Minute').value);
  const city = document.getElementById(prefix + 'City').value;
  return { name, gender, year, month, day, hour, minute, city };
}

function doHarmony() {
  const hp1 = readHpInput('hp1');
  const hp2 = readHpInput('hp2');

  if (!hp1.city || !hp2.city) {
    showError('请为双方选择出生城市（用于真太阳时校正）');
    document.getElementById('harmonyResult').style.display = 'block';
    document.getElementById('harmonyScoreDisplay').innerHTML = '<p style="color:var(--text-light);padding:20px">请选择城市后重试</p>';
    return;
  }

  const r1 = calcBaZi(hp1.year, hp1.month, hp1.day, hp1.hour, hp1.minute, hp1.gender, hp1.city, document.getElementById('hpUseSolar').checked, hp1.name);
  const r2 = calcBaZi(hp2.year, hp2.month, hp2.day, hp2.hour, hp2.minute, hp2.gender, hp2.city, document.getElementById('hpUseSolar').checked, hp2.name);

  const harmony = calcHarmony(r1, r2);

  document.getElementById('harmonyResult').style.display = 'block';

  const scoreDisplay = document.getElementById('harmonyScoreDisplay');
  const scoreColor = harmony.score >= 85 ? '#2e7d32' : harmony.score >= 70 ? '#f9a825' : harmony.score >= 55 ? '#e65100' : '#c62828';
  scoreDisplay.innerHTML = `
    <div style="font-size:48px;font-weight:700;color:${scoreColor}">${harmony.score}</div>
    <div style="font-size:20px;font-weight:600;color:${scoreColor};margin:4px 0">${harmony.level}</div>
    <div style="font-size:14px;color:var(--text-light);margin:8px 0">${harmony.summary}</div>
    <div style="display:flex;justify-content:space-around;margin-top:12px;font-size:13px;color:var(--text-light)">
      <span><strong>${harmony.profile1.name}</strong> ${harmony.profile1.ganzhi}</span>
      <span><strong>${harmony.profile2.name}</strong> ${harmony.profile2.ganzhi}</span>
    </div>
  `;

  const detailsDiv = document.getElementById('harmonyDetails');
  let html = `<table style="width:100%;border-collapse:collapse;font-size:14px">`;
  html += `<tr style="background:var(--border);font-weight:600">
    <td style="padding:6px 8px;width:100px">项目</td>
    <td style="padding:6px 8px">详情</td>
    <td style="padding:6px 8px;width:60px;text-align:center">吉凶</td>
  </tr>`;
  for (const d of harmony.details) {
    const color = d.effect === '吉' ? '#2e7d32' : d.effect === '凶' ? '#c62828' : '#888';
    html += `<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:6px 8px;font-weight:600">${d.item}</td>
      <td style="padding:6px 8px;color:var(--text-light)">${d.detail}</td>
      <td style="padding:6px 8px;text-align:center;color:${color};font-weight:600">${d.effect}</td>
    </tr>`;
  }
  html += `</table>`;
  detailsDiv.innerHTML = html;

  window.scrollTo({ top: document.getElementById('harmonyScoreCard').offsetTop - 80, behavior: 'smooth' });
}

document.getElementById('btnHarmony').addEventListener('click', doHarmony);
initHepanSelectors();
