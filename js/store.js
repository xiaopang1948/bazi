const BaziStore = {
  _state: {},
  _subs: {},

  get(key) {
    return key ? this._state[key] : this._state
  },

  set(key, val) {
    this._state[key] = val
    const fns = this._subs[key] || []
    for (const fn of fns) fn(val, key)
  },

  sub(key, fn) {
    ;(this._subs[key] = this._subs[key] || []).push(fn)
    return () => { this._subs[key] = this._subs[key].filter(f => f !== fn) }
  },

  history: {
    getAll() {
      return JSON.parse(localStorage.getItem('bazi_history') || '[]')
    },
    add(entry) {
      const h = this.getAll()
      h.unshift(entry)
      if (h.length > 100) h.length = 100
      localStorage.setItem('bazi_history', JSON.stringify(h))
      BaziStore.set('history', h)
    },
    delete(id) {
      const h = this.getAll()
      const idx = h.findIndex(e => e.id === id)
      if (idx > -1) {
        h.splice(idx, 1)
        localStorage.setItem('bazi_history', JSON.stringify(h))
        BaziStore.set('history', h)
      }
    },
    getById(id) {
      const h = this.getAll()
      return h.find(e => e.id === id) || null
    },
    clear() {
      localStorage.removeItem('bazi_history')
      BaziStore.set('history', [])
    },
  },

  prefs: {
    get() {
      return JSON.parse(localStorage.getItem('bazi_prefs') || '{"darkMode":false}')
    },
    set(key, val) {
      const p = this.get()
      p[key] = val
      localStorage.setItem('bazi_prefs', JSON.stringify(p))
      BaziStore.set('prefs', p)
    },
  },
}
