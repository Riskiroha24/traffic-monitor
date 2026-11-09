# Traffic Monitor

Dashboard sistem monitoring dan analisis kendaraan berbasis video rekaman.

Frontend dikembangkan menggunakan React dan Vite untuk menampilkan informasi node kamera, pengelolaan dataset, anotasi gambar, dan modul analisis kendaraan.

## Teknologi

- React 19
- Vite 8
- JavaScript
- CSS
- REST API (FastAPI Backend)

## Fitur

- Dashboard monitoring kendaraan
- Monitoring Edge Node dan kamera
- Camera Calibration
- Load Data
- Image Annotation
- Models
- Run Training
- Run Detection
- Result

Catatan: Beberapa modul masih dalam tahap pengembangan. Run Training belum terhubung dengan proses training model di backend.

## Persyaratan

- Node.js
- npm
- Git

## Instalasi

Clone repository:

```bash
git clone https://github.com/USERNAME/traffic-monitor.git
```

Masuk ke folder proyek:

```bash
cd traffic-monitor-frontend
```

Install dependency:

```bash
npm install
```

## Konfigurasi Backend API

Buat file `.env.local` di folder utama proyek.

Isi dengan alamat backend:

```env
VITE_API_BASE_URL=http://YOUR_SERVER_IP:8000
```

Ganti `YOUR_SERVER_IP` dengan alamat IPv4 server backend.

Contoh:

```env
VITE_API_BASE_URL=http://192.168.1.100:8000
```

Pastikan backend dapat diakses dari browser. Setelah mengubah konfigurasi, jalankan kembali Vite.

## Menjalankan Frontend

```bash
npm run dev
```

Buka:

```text
http://localhost:5173
```

## Build Production

```bash
npm run build
```

## Pemeriksaan Lint

```bash
npm run lint
```

## Backend

Backend menggunakan:

- Python
- FastAPI
- PostgreSQL

Backend FastAPI dan PostgreSQL akan ditempatkan dalam folder `backend/` pada repository ini.

## Project

Traffic Monitor - Computer Vision Based Vehicle Monitoring System
