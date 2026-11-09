
import { useEffect, useState } from 'react'
import './App.css'
import DatasetPage from './DatasetPage'
import RunTrainingPage from './RunTrainingPage'
import AnnotationPage from './AnnotationPage'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const VEHICLE_CLASSES = [
  { key: 'Truck', label: 'Truck', icon: '🚚' },
  { key: 'Sedan', label: 'Sedan', icon: '🚗' },
  { key: 'Bus', label: 'Bus', icon: '🚌' },
  { key: 'Pickup/Van', label: 'Pickup/Van', icon: '🚐' },
]

function App() {
  const [nodes, setNodes] = useState([])
  const [videos, setVideos] = useState([])
  const [detections, setDetections] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [apiStatus, setApiStatus] = useState('Menghubungkan...')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [activeNodeId, setActiveNodeId] = useState(null)

  useEffect(() => {
    let active = true

    async function loadMonitoringData() {
      try {
        const [nodeResponse, videoResponse, detectionResponse] =
          await Promise.all([
            fetch(`${API}/api/edge-nodes`),
            fetch(`${API}/api/videos`),
            fetch(`${API}/api/detections`),
          ])

        if (!nodeResponse.ok) {
          throw new Error(`API node: HTTP ${nodeResponse.status}`)
        }
        if (!videoResponse.ok) {
          throw new Error(`API video: HTTP ${videoResponse.status}`)
        }
        if (!detectionResponse.ok) {
          throw new Error(`API deteksi: HTTP ${detectionResponse.status}`)
        }

        const [nodeData, videoData, detectionData] = await Promise.all([
          nodeResponse.json(),
          videoResponse.json(),
          detectionResponse.json(),
        ])

        if (!active) return

        const mappedNodes = (nodeData.nodes ?? []).map((node, index) => ({
          id: node.node_id,
          cameraId: node.camera_id,
          name: node.node_name || `Edge Node ${index + 1}`,
          location: node.location_name || 'Lokasi belum diatur',
          status: node.status === 'online' ? 'Online' : 'Menunggu data',
        }))
        setNodes(mappedNodes)
        setActiveNodeId(current => current ?? mappedNodes[0]?.id ?? null)

        setVideos(videoData.videos ?? [])
        setDetections(detectionData.detections ?? [])
        setApiStatus('Terhubung')
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Gagal mengambil data monitoring:', error)
        if (active) setApiStatus('Server tidak terhubung')
      }
    }

    loadMonitoringData()
    const timer = setInterval(loadMonitoringData, 10000)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  function getNodeVideos(node) {
    return videos.filter(
      video => video.node_id === node.id ||
        video.node_id === node.cameraId
    )
  }

  function getCount(node, vehicleClass) {
    const nodeVideos = getNodeVideos(node)
    const videoIds = new Set(nodeVideos.map(video => video.video_id))

    // Hanya hitung kendaraan yang ditandai sudah dihitung.
    // Track ID yang sama dalam satu video dihitung satu kali.
    const uniqueTracks = new Set(
      detections
        .filter(item =>
          videoIds.has(item.video_id) &&
          item.counted === true &&
          item.track_id &&
          item.vehicle_class === vehicleClass
        )
        .map(item => `${item.video_id}:${item.track_id}`)
    )

    return uniqueTracks.size
  }

  const activeNode = nodes.find(node => node.id === activeNodeId)

  return (
    <div className="app-layout">
      <aside className="node-rail">
        <div className="node-rail-brand">
          <strong>TM</strong>
        </div>
        <div className="node-rail-list">
          {nodes.map((node, index) => (
            <button
              key={node.id}
              className={activeNodeId === node.id ? 'active' : ''}
              onClick={() => {
                setActiveNodeId(node.id)
                setSelectedNode(null)
                setActivePage('dashboard')
              }}
              title={node.name}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22s8-7.2 8-13a8 8 0 1 0-16 0c0 5.8 8 13 8 13Z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span>Node {index + 1}</span>
            </button>
          ))}
        </div>
      </aside>
      <main className="monitor">
      <header className="topbar">
        <div>
          <h1>Traffic Monitor</h1>
          <p>Smart Traffic Monitoring System</p>
        </div>
        <span className="system-status">
          ● API: {apiStatus}
        </span>
      </header>

      <nav className="top-navigation">
        {[
          ['calibration', 'Camera Calibration'],
          ['dataset', 'Load Data'],
          ['annotation', 'Image Annotation'],
          ['models', 'Models'],
          ['training', 'Run Training'],
          ['detection', 'Run Detection'],
          ['result', 'Result'],
        ].map(([id, label]) => (
          <button
            key={id}
            className={activePage === id ? 'active' : ''}
            onClick={() => {
              setActivePage(id)
              setSelectedNode(null)
            }}
          >
            {label}
          </button>
        ))}
      </nav>





      {activePage === 'dashboard' ? (
        <>
      <section className="intro">
        <div>
          <h2>Monitoring Kendaraan</h2>
          <p>Pemantauan hasil analisis kendaraan dari setiap node kamera.</p>
          {lastUpdated && (
            <small>
              Pembaruan terakhir: {lastUpdated.toLocaleTimeString('id-ID')}
            </small>
          )}
        </div>
        <span className="date-label">Traffic Monitoring</span>
      </section>

      {apiStatus === 'Server tidak terhubung' && (
        <p className="node-detail">
          Server belum dapat diakses. Periksa VM Ubuntu dan koneksi API.
        </p>
      )}

      {selectedNode && (
  <section className="node-detail-panel">
    <div className="node-detail-header">
      <div>
        <h2>Detail {selectedNode.name}</h2>
        <p>
          {selectedNode.cameraId} · {selectedNode.location}
        </p>
      </div>

      <button
        className="detail-button"
        onClick={() => setSelectedNode(null)}
      >
        Kembali ke Dashboard
      </button>
    </div>

    <div className="node-detail-info">
      <p>
        <strong>ID Node:</strong> {selectedNode.id}
      </p>
      <p>
        <strong>ID Kamera:</strong> {selectedNode.cameraId}
      </p>
      <p>
        <strong>Lokasi:</strong> {selectedNode.location}
      </p>
      <p>
        <strong>Status:</strong> {selectedNode.status}
      </p>
      <p>
        <strong>Status analisis:</strong> Belum tersedia
      </p>
    </div>
    <div className="detail-video-section">
  <h3>Video Kendaraan</h3>

  <video
    key={selectedNode.cameraId}
    controls
    muted
    preload="metadata"
    className="detail-video"
  >
    <source
      src={
        selectedNode.cameraId === 'CAM-01'
          ? '/traffic-demo.mp4'
          : selectedNode.cameraId === 'CAM-02'
          ? '/vidssave.com Highway Traffic 360P.mp4'
          : '/vidssave.com Road Traffic 360P.mp4'
      }
      type="video/mp4"
    />
    Browser kamu tidak mendukung pemutaran video.
  </video>
</div>
  </section>
)}

      {!selectedNode && (
  <section className="node-grid">
        {nodes.filter(node => activeNodeId === null || node.id === activeNodeId).map(node => {
          const nodeVideos = getNodeVideos(node)
          const latestVideo = nodeVideos[0]
          const hasCompletedVideo = nodeVideos.some(
            video => video.status === 'completed'
          )

          return (
            <article className="node-card" key={node.id}>
              <div className="node-heading">
                <div>
                  <h2>{node.name}</h2>
                  <p>{node.cameraId || node.id} · {node.location}</p>
                </div>
                <span className="waiting">{node.status}</span>
              </div>

              
<div className="node-content">
<div className="video-placeholder">
  <video
    key={node.id}
    controls
    muted
    preload="metadata"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      borderRadius: '10px',
      backgroundColor: '#111827',
    }}
  >
    <source
      src={
        node.cameraId === 'CAM-01'
          ? '/traffic-demo.mp4'
          : node.cameraId === 'CAM-02'
          ? '/vidssave.com Highway Traffic 360P.mp4'
          : '/vidssave.com Road Traffic 360P.mp4'
      }
      type="video/mp4"
    />
    Browser kamu tidak mendukung pemutaran video.
  </video>
</div>  


                <div className="vehicle-grid">
                  {VEHICLE_CLASSES.map(vehicle => (
                    <div className="vehicle-count" key={vehicle.key}>
                      <span>{vehicle.icon} {vehicle.label}</span>
                      <strong>
                        {hasCompletedVideo
                          ? getCount(node, vehicle.key)
                          : '—'}
                      </strong>
                    </div>
                  ))}

                  <div className="node-detail">
                    {hasCompletedVideo
                      ? 'Jumlah kendaraan berdasarkan hasil analisis yang telah selesai.'
                      : 'Jumlah kendaraan akan ditampilkan setelah analisis video selesai.'}
                  </div>
                  
                </div>
              </div>
            </article>
          )
        })}
      </section>
    )}

        </>
      ) : activePage === 'dataset' ? (
        <DatasetPage selectedNodeNumber={Math.max(1, nodes.findIndex(node => node.id === activeNodeId) + 1)} />
      ) : activePage === 'annotation' ? (
        <AnnotationPage />
      ) : activePage === 'training' ? (
        <RunTrainingPage />
      ) : (
        <section className="node-detail-panel">
          <h2>{activePage}</h2>
          <p>Modul ini akan dikembangkan pada tahap berikutnya.</p>
        </section>
      )}

      <footer>
        Traffic Monitor · Sistem monitoring kendaraan berbasis video
      </footer>
      </main>
    </div>
  )
}

export default App
