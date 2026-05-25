const BaziRouter = {
  _tabs: [],
  _current: '',

  init(tabIds) {
    this._tabs = tabIds
    const hash = location.hash.replace('#', '')
    const initial = this._tabs.includes(hash) ? hash : this._tabs[0]
    this.go(initial)

    window.addEventListener('hashchange', () => {
      const h = location.hash.replace('#', '')
      if (this._tabs.includes(h) && h !== this._current) {
        this.go(h, false)
      }
    })
  },

  go(tab, pushState = true) {
    if (!this._tabs.includes(tab)) return
    this._current = tab

    document.querySelectorAll('.tab').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab)
    })
    document.querySelectorAll('.tab-content').forEach(el => {
      el.classList.toggle('active', el.id === 'tab-' + tab)
    })

    if (pushState) location.hash = tab
    BaziStore.set('currentTab', tab)
  },

  getCurrent() { return this._current },
}
