# Shadow Survivors — Prototype 0.2

Game survival action 2D berbasis HTML, CSS, dan JavaScript Canvas. Dapat dipublikasikan melalui GitHub Pages (tanpa server).

## Fitur prototype
- Character Creator: class, skin tone, hairstyle, hair color, armor, armor color, accessory, weapon, dan nama.
- Penyimpanan karakter dan statistik terbaik menggunakan `localStorage`.
- Arena top-down dengan musuh yang mengejar pemain.
- Auto attack dan manual attack (Space / klik).
- Dash (Shift), HP, EXP, level-up, upgrade cards, wave, timer, game over, dan restart.
- Kontrol keyboard dan klik mouse.

## Cara menjalankan di GitHub Pages
1. Buat repository baru bernama `shadow-survivors` di akun GitHub.
2. Ekstrak ZIP ini.
3. Upload `index.html`, `style.css`, `game.js`, dan `README.md` ke root repository (bukan di dalam folder lain).
4. Commit ke branch `main`.
5. Buka **Settings → Pages**.
6. Pada **Build and deployment**, pilih **Deploy from a branch**.
7. Pilih branch `main`, folder `/ (root)`, lalu Save.
8. Tunggu proses deployment selesai. Situs akan tersedia di:
   `https://USERNAME.github.io/shadow-survivors/`
   Ganti `USERNAME` dengan username GitHub kamu.

## Kontrol
- `W A S D` atau tombol panah: bergerak.
- `SPACE` atau klik arena: serangan manual.
- Auto attack: aktif otomatis dan menargetkan musuh terdekat.
- `SHIFT`: dash.
- `ESC` atau tombol pause: jeda.

## Catatan asset
Prototype ini memakai karakter Canvas sementara agar dapat langsung dimainkan. Sprite sheet Human Soldier dan Monster Slime dapat diintegrasikan pada tahap berikutnya untuk animasi idle, walk, attack, hurt, dan death. Simpan asset yang telah diizinkan pengguna di folder `assets/`; jangan mengunggah ulang paket mentah jika lisensinya melarang redistribusi.

## Batasan saat ini
Ini masih prototype single-player lokal. Belum ada multiplayer, server, akun online, inventory permanen, boss khusus, atau sistem equipment berbasis sprite modular.
