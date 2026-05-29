const TAG_STYLES = {
  feat: { cls: 'vh-tag-feat', text: '功能' },
  fix: { cls: 'vh-tag-fix', text: '修复' },
  ui: { cls: 'vh-tag-ui', text: '界面' },
  refactor: { cls: 'vh-tag-refactor', text: '重构' },
};

function renderVersionHistory() {
  const list = document.getElementById('versionHistoryList');
  if (!list) return;
  let html = '';
  for (const v of VERSION_HISTORY) {
    const tagStyle = TAG_STYLES[v.tag] || TAG_STYLES.feat;
    html += '<div class="vh-version">';
    html += '<div class="vh-header">';
    html += `<span class="vh-tag ${tagStyle.cls}">${tagStyle.text}</span>`;
    html += `<span class="vh-version-label">${v.version}</span>`;
    html += `<span class="vh-label">${v.label}</span>`;
    html += `<span class="vh-date">${v.date}</span>`;
    html += '</div>';
    html += '<ul class="vh-items">';
    for (const item of v.items) {
      html += `<li>${item}</li>`;
    }
    html += '</ul>';
    html += '</div>';
  }
  list.innerHTML = html;
}

function renderSettings() {
  renderVersionHistory();
}

function initSettings() {
  const settingsTab = document.getElementById('tab-settings');
  if (!settingsTab) return;
  if (settingsTab.classList.contains('active')) {
    renderSettings();
  } else {
    const observer = new MutationObserver(() => {
      if (settingsTab.classList.contains('active')) {
        renderSettings();
        observer.disconnect();
      }
    });
    observer.observe(settingsTab, { attributes: true, attributeFilter: ['class'] });
  }
}
document.addEventListener('DOMContentLoaded', initSettings);
