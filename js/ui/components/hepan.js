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
  });
  initHpCitySelector('hp1');
  initHpCitySelector('hp2');

  const now = new Date();
  document.getElementById('hp1Year').value = now.getFullYear();
  document.getElementById('hp1Month').value = now.getMonth() + 1;
  document.getElementById('hp2Year').value = now.getFullYear();
  document.getElementById('hp2Month').value = now.getMonth() + 1;
  ['hp1','hp2'].forEach(p => {
    document.getElementById(p + 'Day').value = now.getDate();
  });
}

function initHpCitySelector(prefix) {
  const provSel = document.getElementById(prefix + 'Province');
  const citySel = document.getElementById(prefix + 'City');
  const searchInput = document.getElementById(prefix + 'CitySearch');
  const suggestions = document.getElementById(prefix + 'CitySuggestions');

  const provinces = Object.keys(PROVINCE_CITIES);
  provSel.innerHTML = '<option value="">省份</option>' + provinces.map(p => `<option value="${p}">${p}</option>`).join('');

  provSel.addEventListener('change', function() {
    const keys = PROVINCE_CITIES[this.value] || [];
    citySel.innerHTML = '<option value="">城市</option>' + keys.map(k => `<option value="${k}">${CITIES[k].name}</option>`).join('');
    citySel.disabled = !this.value;
    searchInput.value = '';
    suggestions.style.display = 'none';
  });

  citySel.addEventListener('change', function() {
    searchInput.value = '';
    suggestions.style.display = 'none';
  });

  searchInput.addEventListener('input', function() {
    const q = this.value.trim();
    if (!q) { suggestions.style.display = 'none'; return; }
    const matches = Object.entries(CITIES)
      .filter(([k, v]) => v.name.includes(q))
      .slice(0, 10);
    if (matches.length === 0) { suggestions.style.display = 'none'; return; }
    suggestions.innerHTML = matches.map(([k, v]) =>
      `<div style="padding:6px 8px;cursor:pointer;color:var(--text-light);font-size:13px;border-bottom:1px solid var(--border)"
            onmouseover="this.style.background='rgba(0,230,118,0.1)'"
            onmouseout="this.style.background=''"
            onclick="selectHpCity('${prefix}','${k}','${v.name}')">${v.name}</div>`
    ).join('');
    suggestions.style.display = 'block';
  });

  searchInput.addEventListener('blur', function() {
    setTimeout(() => { suggestions.style.display = 'none'; }, 200);
  });
  searchInput.addEventListener('focus', function() {
    if (this.value.trim() && suggestions.children.length > 0) {
      suggestions.style.display = 'block';
    }
  });
}

function selectHpCity(prefix, cityKey, cityName) {
  document.getElementById(prefix + 'CitySearch').value = cityName;
  document.getElementById(prefix + 'City').value = cityKey;
  document.getElementById(prefix + 'CitySuggestions').style.display = 'none';
  const provSel = document.getElementById(prefix + 'Province');
  for (const [prov, keys] of Object.entries(PROVINCE_CITIES)) {
    if (keys.includes(cityKey)) {
      provSel.value = prov;
      const event = new Event('change');
      provSel.dispatchEvent(event);
      document.getElementById(prefix + 'City').value = cityKey;
      break;
    }
  }
}

function readHpInput(prefix) {
  const name = document.getElementById(prefix + 'Name')?.value || (prefix === 'hp1' ? '甲方' : '乙方');
  const gender = document.querySelector(`#${prefix}Gender .pill.active`).dataset.value;
  const year = parseInt(document.getElementById(prefix + 'Year').value);
  const month = parseInt(document.getElementById(prefix + 'Month').value);
  const day = parseInt(document.getElementById(prefix + 'Day').value);
  const hour = parseInt(document.getElementById(prefix + 'Hour').value);
  const minute = parseInt(document.getElementById(prefix + 'Minute').value);
  const city = document.getElementById(prefix + 'City').value;
  return { name, gender, year, month, day, hour, minute, city };
}

function doHarmony() {
  try {
    const hp1 = readHpInput('hp1');
    const hp2 = readHpInput('hp2');

    if (!hp1.city || !hp2.city) {
      document.querySelector('#tab-hepan > .input-card').style.display = 'none';
      document.getElementById('harmonyResult').style.display = 'block';
      const container = document.getElementById('harmonyScoreDisplay');
      container.querySelector('.gauge-container').style.display = 'none';
      document.getElementById('harmonyScoreText').innerHTML = '<p style="color:#c62828;padding:20px">请为双方选择出生城市（用于真太阳时校正）</p>';
      return;
    }

    const r1 = calcBaZi(hp1.year, hp1.month, hp1.day, hp1.hour, hp1.minute, hp1.gender, hp1.city, true, hp1.name);
    const r2 = calcBaZi(hp2.year, hp2.month, hp2.day, hp2.hour, hp2.minute, hp2.gender, hp2.city, true, hp2.name);

    const harmony = calcHarmony(r1, r2);

  document.querySelector('#tab-hepan > .input-card').style.display = 'none';
  document.getElementById('harmonyResult').style.display = 'block';

  const container = document.getElementById('harmonyScoreDisplay');
  container.querySelector('.gauge-container').style.display = 'inline-block';
  document.getElementById('harmonyScoreText').innerHTML = '';

  const scoreColor = harmony.score >= 85 ? '#2e7d32' : harmony.score >= 70 ? '#f9a825' : harmony.score >= 55 ? '#e65100' : '#c62828';
  const arc = document.getElementById('gaugeArc');
  const gaugeScore = document.getElementById('gaugeScore');
  const gaugeLabel = document.getElementById('gaugeLabel');

  arc.setAttribute('stroke', scoreColor);
  const circumference = 326.7;
  const offset = circumference * (1 - harmony.score / 100);

  if (typeof gsap !== 'undefined') {
    gsap.set(arc, { strokeDashoffset: circumference });
    gsap.set(gaugeScore, { textContent: 0 });
    gsap.to(arc, { strokeDashoffset: offset, duration: 1, ease: 'power2.out' });
    gsap.to(gaugeScore, { textContent: harmony.score, duration: 1, ease: 'power2.out', snap: { textContent: 1 } });
  } else {
    arc.setAttribute('stroke-dashoffset', offset);
    gaugeScore.textContent = harmony.score;
  }
  gaugeLabel.textContent = harmony.level;

  document.getElementById('harmonyScoreText').innerHTML = `<div style="font-size:14px;color:var(--text-light);margin-top:4px">${harmony.summary}</div>`;
  document.getElementById('harmonyProfileDisplay').innerHTML = `
    <span><strong>${harmony.profile1.name}</strong> ${harmony.profile1.ganzhi}</span>
    <span><strong>${harmony.profile2.name}</strong> ${harmony.profile2.ganzhi}</span>
  `;

  BaziStore.set('lastHarmonyData', { r1, r2, harmony });

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
  } catch (e) {
    console.error('合盘出错', e);
    document.getElementById('harmonyScoreText').innerHTML = '<p style="color:#c62828;padding:20px">合盘计算出错，请检查输入</p>';
  }
}

function backToHepanInput() {
  document.getElementById('harmonyResult').style.display = 'none';
  document.querySelector('#tab-hepan > .input-card').style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('btnHarmony').addEventListener('click', doHarmony);
document.getElementById('btnHarmonyBack').addEventListener('click', backToHepanInput);
initHepanSelectors();
