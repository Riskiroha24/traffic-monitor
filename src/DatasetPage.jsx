import { useEffect, useState } from 'react'
import './DatasetPage.css'

const manualDefault = { duration: '10', folder: 'option1' }
const automaticDefault = {
  sessionDuration: '3',
  interval: '30',
  date: '2026-11-02',
  time: '16:30',
  folder: 'C:/dataset1/otomatis/',
}

function makeDefault() {
  return {
    manual: { ...manualDefault },
    automatic: { ...automaticDefault },
  }
}

function DatasetPage({ selectedNodeNumber = 1 }) {
  const [mode, setMode] = useState('manual')
  const [configs, setConfigs] = useState({
    1: makeDefault(),
    2: makeDefault(),
    3: makeDefault(),
  })
  const [saved, setSaved] = useState({})
  const [message, setMessage] = useState('')

  const node = Math.min(3, Math.max(1, Number(selectedNodeNumber) || 1))
  const config = configs[node][mode]

  useEffect(() => {
    setMessage('')
  }, [node, mode])

  function update(field, value) {
    setConfigs(current => ({
      ...current,
      [node]: {
        ...current[node],
        [mode]: { ...current[node][mode], [field]: value },
      },
    }))
    setSaved(current => ({ ...current, [node]: false }))
    setMessage('')
  }

  function reset() {
    setConfigs(current => ({
      ...current,
      [node]: {
        ...current[node],
        [mode]: mode === 'manual'
          ? { ...manualDefault }
          : { ...automaticDefault },
      },
    }))
    setSaved(current => ({ ...current, [node]: false }))
    setMessage('Konfigurasi dikembalikan ke pengaturan awal.')
  }

  function save() {
    setSaved(current => ({ ...current, [node]: true }))
    setMessage(`Konfigurasi ${mode === 'manual' ? 'Manual' : 'Otomatis'} Node ${node} berhasil disimpan sementara.`)
  }

  return (
    <div className="dataset-page">
      <div className="dataset-mode-tabs">
        <button className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>
          Manual
        </button>
        <button className={mode === 'automatic' ? 'active' : ''} onClick={() => setMode('automatic')}>
          Otomatis
        </button>
      </div>

      <section className="capture-config-card">
        <h2>
          <span className="config-title-icon">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="5" width="14" height="13" rx="2" />
              <path d="m17 10 4-2v8l-4-2M8 21l3-3m-3-5 3-3" />
            </svg>
          </span>
          Konfigurasi Pengambilan Data
        </h2>

        {mode === 'manual' ? (
          <div className="config-fields">
            <label className="config-row">
              <span>Durasi rekaman</span>
              <select value={config.duration} onChange={e => update('duration', e.target.value)}>
                <option value="3">3 menit</option>
                <option value="5">5 menit</option>
                <option value="10">10 menit</option>
                <option value="15">15 menit</option>
                <option value="30">30 menit</option>
              </select>
            </label>

            <label className="config-folder">
              <span className="folder-path">C:\dataset1\manual\</span>
              <span className="folder-icon">▱</span>
              <select value={config.folder} onChange={e => update('folder', e.target.value)}>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </label>
          </div>
        ) : (
          <div className="config-fields">
            <label className="config-row">
              <span>Durasi rekaman per sesi</span>
              <select value={config.sessionDuration} onChange={e => update('sessionDuration', e.target.value)}>
                <option value="1">1 menit</option>
                <option value="3">3 menit</option>
                <option value="5">5 menit</option>
                <option value="10">10 menit</option>
                <option value="15">15 menit</option>
              </select>
            </label>

            <label className="config-row">
              <span>Interval antar sesi</span>
              <select value={config.interval} onChange={e => update('interval', e.target.value)}>
                <option value="5">5 menit</option>
                <option value="10">10 menit</option>
                <option value="15">15 menit</option>
                <option value="30">30 menit</option>
                <option value="60">60 menit</option>
              </select>
            </label>

            <div className="config-row date-time-row">
              <span>Mulai pengambilan data</span>
              <div className="date-time-inputs">
                <label><span>▦</span><input type="date" value={config.date} onChange={e => update('date', e.target.value)} /></label>
                <label><span>◷</span><input type="time" value={config.time} onChange={e => update('time', e.target.value)} /></label>
              </div>
            </div>

            <label className="config-folder automatic-folder">
              <span className="folder-icon">▱</span>
              <input type="text" value={config.folder} onChange={e => update('folder', e.target.value)} />
            </label>
          </div>
        )}

        <div className="config-actions">
          <button className="config-reset-button" onClick={reset}>
            <span>↻</span> Reset to default
          </button>
          <button className="config-save-button" onClick={save}>
            <span>▣</span> Save Configuration
          </button>
        </div>

        {message && <p className={saved[node] ? 'config-feedback saved' : 'config-feedback'}>{message}</p>}
      </section>
    </div>
  )
}

export default DatasetPage
