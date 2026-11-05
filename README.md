# Star Catcher

Star Catcher adalah game arcade sederhana berbasis HTML5 Canvas dan JavaScript. Pemain menggerakkan pesawat ke kiri dan kanan untuk menangkap bintang, sambil menghindari meteor.

## Cara Menjalankan

1. Ekstrak folder atau ZIP proyek.
2. Buka folder `Star_Catcher` di Visual Studio Code.
3. Jalankan `index.html` menggunakan ekstensi Live Server.
4. Alternatif: jalankan `python -m http.server 8000` dari folder proyek, lalu buka `http://localhost:8000` di browser.

Game ini tidak memerlukan proses build atau instalasi package npm.

## Kontrol

- Panah kiri atau tombol A: bergerak ke kiri.
- Panah kanan atau tombol D: bergerak ke kanan.
- Pada layar sentuh, gunakan tombol kiri dan kanan di bawah area game.

## Aturan Permainan

- Tangkap bintang untuk mendapatkan 10 poin.
- Hindari meteor. Setiap tabrakan dengan meteor mengurangi 1 nyawa.
- Pemain memiliki 3 nyawa.
- Permainan berlangsung selama 60 detik.
- Ketika waktu habis atau nyawa habis, permainan selesai.
- Tekan tombol **Main Lagi** untuk mengulang permainan.

## Struktur File

```text
Star_Catcher/
├── index.html
├── style.css
├── game.js
├── assets/
│   └── star.svg
└── README.md
```

## Catatan Teknis

- Dibuat menggunakan HTML, CSS, JavaScript, dan HTML5 Canvas.
- Tidak menggunakan Phaser dan tidak memerlukan `npm run build`.
- Gambar bintang dimuat menggunakan path relatif `./assets/star.svg`.
- Untuk itch.io, unggah ZIP dan aktifkan opsi **This file will be played in the browser**.
- Untuk GitHub Pages, unggah isi folder proyek ke repository. Letakkan `index.html` di root repository jika menggunakan sumber `main / (root)`.

## Modifikasi

Proyek ini dibuat sebagai contoh praktik publikasi web game. Kamu dapat mengubah judul, warna, tampilan, kecepatan objek, durasi, atau aturan permainan. Catat perubahan yang kamu buat pada bagian ini.

## Kredit

Kode dan aset dasar pada paket latihan ini dibuat untuk contoh pembelajaran publikasi web game.
