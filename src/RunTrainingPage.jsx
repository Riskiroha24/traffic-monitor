import { useState } from 'react'
import './RunTrainingPage.css'

function RunTrainingPage() {
  const [dataset, setDataset] = useState('')
  const [model, setModel] = useState('')
  const [message, setMessage] = useState('')

  function handleTraining() {
    if (!dataset || !model) {
      setMessage('Silakan pilih dataset dan model terlebih dahulu.')
      return
    }

    setMessage(
      'Konfigurasi berhasil dipilih. API training belum dihubungkan.'
    )
  }

  return (
    <div className="training-page">
      <section className="training-intro">
        <h2>Run Training</h2>
        <p>
          Konfigurasikan dataset dan model untuk proses pelatihan
          sistem deteksi dan klasifikasi kendaraan.
        </p>
      </section>

      <section className="training-card">
        <h2>Konfigurasi Training</h2>

        <div className="training-fields">
          <label>
            <span>Pilih Dataset</span>
            <select
              value={dataset}
              onChange={e => {
                setDataset(e.target.value)
                setMessage('')
              }}
            >
              <option value="">Pilih dataset</option>
              <option value="detection">
                Dataset Deteksi Kendaraan
              </option>
              <option value="classification">
                Dataset Klasifikasi Kendaraan
              </option>
            </select>
          </label>

          <label>
            <span>Pilih Model</span>
            <select
              value={model}
              onChange={e => {
                setModel(e.target.value)
                setMessage('')
              }}
            >
              <option value="">Pilih model</option>
              <option value="faster-rcnn">
                Faster R-CNN - Vehicle Detection
              </option>
              <option value="resnet18">
                ResNet18 - Vehicle Classification
              </option>
            </select>
          </label>
        </div>

        <div className="training-info">
          <h3>Informasi Training</h3>
          <p>
            Dataset: {dataset || 'Belum dipilih'}
          </p>
          <p>
            Model: {model || 'Belum dipilih'}
          </p>
        </div>

        <button
          className="training-run-button"
          onClick={handleTraining}
        >
          Run Training
        </button>

        {message && (
          <p className="training-message">{message}</p>
        )}
      </section>

      <section className="training-progress">
        <h2>Training Status</h2>
        <p>Belum ada proses training yang berjalan.</p>
      </section>
    </div>
  )
}

export default RunTrainingPage