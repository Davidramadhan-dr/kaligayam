// Dipakai untuk menjalankan server di lokal komputer atau di Replit.
// (Di Vercel, yang dipakai adalah api/index.js — lihat README.md)
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Desa Kaligayam berjalan di http://localhost:${PORT}`);
});
