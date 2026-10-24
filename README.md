# Projek PBP

Website undangan pernikahan menggunakan HTML, CSS, dan JavaScript.

## Menjalankan

Buka `index.html` atau gunakan server statis:

```sh
npx serve .
```

## Nama tamu

Tambahkan parameter nama pada URL, misalnya `?to=Budi` atau `?to=Bapak%20Budi`.

## Berkas utama

- `index.html`: struktur halaman undangan.
- `styles.css`: tampilan dan tata letak responsif.
- `app.js`: interaksi halaman, musik, galeri, hitung mundur, dan formulir.
- `vercel.json`: konfigurasi deployment dan sumber media.
- `source/`: font, musik, dan aset pendukung.

## Formulir

Formulir menyiapkan ringkasan konfirmasi yang dapat disalin atau diunduh. Pesan tidak dikirim otomatis.

## Deployment

Gunakan preset Other di Vercel, tanpa build command, dengan output directory `.`. Gambar tambahan dimuat melalui konfigurasi rewrites pada `vercel.json`.
