import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ====== Konfigurasi ======
const JWT_SECRET = process.env.JWT_SECRET || "rahasia-default-ganti-ini";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "kaligayam2026";

// ====== Koneksi Supabase ======
// SUPABASE_URL & SUPABASE_SERVICE_KEY diambil dari Project Settings > API di dashboard Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ====== Middleware ======
app.use(cors());
app.use(express.json({ limit: "8mb" })); // limit besar karena foto dikirim base64
app.use(express.static(path.join(__dirname, "public")));

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Belum login." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Sesi tidak valid, silakan login ulang." });
  }
}

// ====== Auth ======
const ADMIN_PASS_HASH = bcrypt.hashSync(ADMIN_PASS, 10);

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi." });
  }
  const userOk = username === ADMIN_USER;
  const passOk = bcrypt.compareSync(password, ADMIN_PASS_HASH);
  if (!userOk || !passOk) {
    return res.status(401).json({ error: "Username atau kata sandi salah." });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});

// ====== API Kegiatan (disimpan di Supabase, permanen) ======
app.get("/api/kegiatan", async (req, res) => {
  const { data, error } = await supabase
    .from("kegiatan")
    .select("*")
    .order("tanggal", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/kegiatan", requireAuth, async (req, res) => {
  const { judul, kategori, tanggal, deskripsi, foto } = req.body || {};
  if (!judul || !kategori || !tanggal || !deskripsi) {
    return res.status(400).json({ error: "Semua field wajib diisi." });
  }
  const { data, error } = await supabase
    .from("kegiatan")
    .insert([{ judul, kategori, tanggal, deskripsi, foto: foto || "" }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.delete("/api/kegiatan/:id", requireAuth, async (req, res) => {
  const { error, count } = await supabase
    .from("kegiatan")
    .delete({ count: "exact" })
    .eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  if (!count) return res.status(404).json({ error: "Kegiatan tidak ditemukan." });
  res.json({ ok: true });
});

// Halaman utama (semua route lain diarahkan ke index.html)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default app;
