import { useEffect, useRef, useState } from 'react'
import './AnnotationPage.css'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const VEHICLE_CLASSES = [
  'Sedan',
  'Pickup_Van',
  'Truck',
  'Bus',
]

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

function makeBox(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  }
}

function AnnotationPage() {
  const [images, setImages] = useState([])
  const [selectedImageId, setSelectedImageId] = useState('')
  const [annotations, setAnnotations] = useState([])
  const [selectedClass, setSelectedClass] = useState('Sedan')
  const [imageSize, setImageSize] = useState(null)
  const [draftBox, setDraftBox] = useState(null)
  const [startPoint, setStartPoint] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const imageElement = useRef(null)

  const selectedImage = images.find(
    image => String(image.image_id) === String(selectedImageId)
  )

  async function loadImages() {
    const response = await fetch(
      `${API}/api/dataset/images?stage=dataset_1&limit=200`
    )

    if (!response.ok) {
      throw new Error('Gagal mengambil daftar dataset.')
    }

    const data = await response.json()

    const pendingImages = (data.images || []).filter(
      image => image.validation_status === 'pending'
    )

    setImages(pendingImages)

    if (pendingImages.length > 0) {
      setSelectedImageId(current => {
        const exists = pendingImages.some(
          image => String(image.image_id) === current
        )

        return exists ? current : String(pendingImages[0].image_id)
      })
    } else {
      setSelectedImageId('')
    }
  }

  async function loadAnnotations(imageId) {
    const response = await fetch(
      `${API}/api/dataset/images/${imageId}/annotations`
    )

    if (!response.ok) {
      throw new Error('Gagal mengambil anotasi gambar.')
    }

    const data = await response.json()
    setAnnotations(data.annotations || [])
  }

  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true)
        setError('')
        await loadImages()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  useEffect(() => {
    if (!selectedImageId) {
      setAnnotations([])
      setImageSize(null)
      setDraftBox(null)
      return
    }

    async function initializeAnnotations() {
      try {
        setError('')
        setMessage('')
        setImageSize(null)
        setDraftBox(null)

        await loadAnnotations(selectedImageId)
      } catch (err) {
        setError(err.message)
      }
    }

    initializeAnnotations()
  }, [selectedImageId])

  function getImagePoint(event) {
    const bounds = event.currentTarget.getBoundingClientRect()

    return {
      x: clamp(
        (event.clientX - bounds.left) *
          imageSize.width / bounds.width,
        0,
        imageSize.width
      ),
      y: clamp(
        (event.clientY - bounds.top) *
          imageSize.height / bounds.height,
        0,
        imageSize.height
      ),
    }
  }

  function handlePointerDown(event) {
    if (!imageSize || !selectedImageId) return

    event.preventDefault()

    const point = getImagePoint(event)

    setStartPoint(point)
    setDraftBox({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
    })

    setIsDrawing(true)
    setMessage('Lepaskan mouse untuk menyelesaikan bounding box.')

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    if (!isDrawing || !startPoint) return

    const point = getImagePoint(event)

    setDraftBox(makeBox(startPoint, point))
  }

  function handlePointerUp(event) {
    if (!isDrawing || !startPoint) return

    const point = getImagePoint(event)
    const box = makeBox(startPoint, point)

    setIsDrawing(false)
    setStartPoint(null)

    if (box.width < 3 || box.height < 3) {
      setDraftBox(null)
      setMessage('')
      return
    }

    setDraftBox(box)
    setMessage('Bounding box selesai. Periksa kelas kendaraan lalu simpan.')
  }

  async function saveAnnotation() {
    if (!draftBox || !imageSize || !selectedImageId) {
      setError('Buat bounding box terlebih dahulu.')
      return
    }

    try {
      setError('')
      setMessage('Menyimpan anotasi...')

      const payload = {
        vehicle_class: selectedClass,
        bbox_x: draftBox.x / imageSize.width,
        bbox_y: draftBox.y / imageSize.height,
        bbox_width: draftBox.width / imageSize.width,
        bbox_height: draftBox.height / imageSize.height,
      }

      const response = await fetch(
        `${API}/api/dataset/images/${selectedImageId}/annotations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Gagal menyimpan anotasi.')
      }

      setDraftBox(null)
      await loadAnnotations(selectedImageId)

      setMessage('Anotasi berhasil disimpan.')
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  async function validateImage() {
    if (annotations.length === 0) {
      setError('Tambahkan minimal satu anotasi terlebih dahulu.')
      return
    }

    const confirmed = window.confirm(
      'Validasi gambar ini dan pindahkan ke Dataset 2?'
    )

    if (!confirmed) return

    try {
      setError('')
      setMessage('Memvalidasi gambar...')

      const response = await fetch(
        `${API}/api/dataset/images/${selectedImageId}/validate`,
        {
          method: 'POST',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Validasi gagal.')
      }

      setMessage(data.message)
      setAnnotations([])
      setDraftBox(null)

      await loadImages()
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  if (loading) {
    return (
      <div className="annotation-page">
        Memuat dataset...
      </div>
    )
  }

  return (
    <div className="annotation-page">

      <section className="annotation-heading">
        <h2>Image Annotation</h2>
        <p>
          Berikan bounding box dan label kelas pada gambar kendaraan.
        </p>
      </section>

      <section className="annotation-card">

        <div className="annotation-toolbar">

          <div>
            <label>Pilih Dataset</label>

            <select
              value={selectedImageId}
              onChange={event => {
                setSelectedImageId(event.target.value)
                setMessage('')
                setError('')
              }}
            >
              <option value="">Pilih gambar</option>

              {images.map(image => (
                <option
                  key={image.image_id}
                  value={image.image_id}
                >
                  {image.file_name} - ID {image.image_id}
                </option>
              ))}
            </select>
          </div>

          {selectedImage && (
            <div className="annotation-image-info">
              <span>Resolusi</span>
              <strong>
                {selectedImage.width} × {selectedImage.height}
              </strong>
            </div>
          )}

        </div>

        {!selectedImage ? (
          <div className="annotation-empty">
            <h3>Belum ada gambar untuk dianotasi</h3>
            <p>
              Unggah gambar melalui halaman Load Data terlebih dahulu.
            </p>
          </div>
        ) : (
          <>
            <div className="annotation-instruction">
              Klik dan tarik mouse pada kendaraan untuk membuat
              bounding box.
            </div>

            <div className="annotation-canvas">

              <div className="annotation-image-wrap">

                <img
                  ref={imageElement}
                  src={`${API}/api/dataset/images/${selectedImageId}/file`}
                  alt="Gambar untuk anotasi"
                  onLoad={event => {
                    setImageSize({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    })
                  }}
                />

                {imageSize && (
                  <svg
                    className="annotation-overlay"
                    viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                    preserveAspectRatio="none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{ touchAction: 'none' }}
                  >

                    {annotations.map(annotation => (
                      <g key={annotation.annotation_id}>

                        <rect
                          x={annotation.bbox_x * imageSize.width}
                          y={annotation.bbox_y * imageSize.height}
                          width={annotation.bbox_width * imageSize.width}
                          height={annotation.bbox_height * imageSize.height}
                          fill="rgba(29, 85, 165, 0.13)"
                          stroke="#1d55a5"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />

                        <text
                          x={annotation.bbox_x * imageSize.width}
                          y={Math.max(
                            14,
                            annotation.bbox_y * imageSize.height - 5
                          )}
                          fill="#ffffff"
                          stroke="#173b70"
                          strokeWidth="3"
                          paintOrder="stroke"
                          fontSize="14"
                        >
                          {annotation.vehicle_class}
                        </text>

                      </g>
                    ))}

                    {draftBox && (
                      <rect
                        x={draftBox.x}
                        y={draftBox.y}
                        width={draftBox.width}
                        height={draftBox.height}
                        fill="rgba(22, 163, 74, 0.16)"
                        stroke="#16a34a"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}

                  </svg>
                )}

              </div>
            </div>

            <div className="annotation-controls">

              <div>
                <label>Kelas Kendaraan</label>

                <select
                  value={selectedClass}
                  onChange={event => setSelectedClass(event.target.value)}
                >
                  {VEHICLE_CLASSES.map(vehicle => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle === 'Pickup_Van'
                        ? 'Pickup/Van'
                        : vehicle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="annotation-actions">

                <button
                  className="annotation-save"
                  onClick={saveAnnotation}
                  disabled={!draftBox || isDrawing}
                >
                  Simpan Anotasi
                </button>

                <button
                  className="annotation-validate"
                  onClick={validateImage}
                  disabled={
                    annotations.length === 0 ||
                    Boolean(draftBox) ||
                    isDrawing
                  }
                >
                  Validasi Gambar
                </button>

              </div>

            </div>

            <div className="annotation-summary">
              <strong>Jumlah Anotasi: {annotations.length}</strong>

              {annotations.map(annotation => (
                <div key={annotation.annotation_id}>
                  {annotation.vehicle_class} — Anotasi #
                  {annotation.annotation_id}
                </div>
              ))}
            </div>

          </>
        )}

        {message && (
          <div className="annotation-message">
            {message}
          </div>
        )}

        {error && (
          <div className="annotation-error">
            {error}
          </div>
        )}

      </section>
    </div>
  )
}

export default AnnotationPage