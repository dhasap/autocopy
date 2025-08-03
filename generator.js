const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

// ================= KONFIGURASI =================
// URL API Vercel Anda
const YOUR_VERCEL_API_URL = 'https://komiku-org.vercel.app/api';

// Daftar genre yang ingin disalin datanya
const GENRES_TO_COPY = [
    'action', 'adventure', 'comedy', 'fantasy', 'isekai', 
    'manhwa', 'manhua', 'romance', 'school-life', 'sci-fi',
    'drama', 'harem', 'martial-arts', 'murim', 'reincarnation'
];

// Nama folder untuk menyimpan file JSON
const OUTPUT_DIR = 'hasil_json'; 
// =============================================

/**
 * Fungsi untuk mengambil data JSON dari API Vercel Anda.
 * @param {string} genreId - ID genre (contoh: 'action').
 */
async function copyGenreData(genreId) {
    console.log(`Menyalin data untuk genre: ${genreId}...`);
    // [MODIFIED] URL target sekarang adalah API Vercel Anda
    const apiUrl = `${YOUR_VERCEL_API_URL}/genre/${genreId}`;

    try {
        // Langsung ambil data JSON dari API Anda
        const response = await axios.get(apiUrl);
        
        // Cek jika respons sukses dan memiliki data
        if (response.data && response.data.success && response.data.data) {
            return response.data; // Kembalikan seluruh objek JSON
        } else {
            console.log(`  - API tidak mengembalikan data yang valid untuk genre: ${genreId}`);
            return null;
        }
    } catch (error) {
        console.error(`  - Gagal mengambil data dari ${apiUrl}: ${error.message}`);
        return null;
    }
}

/**
 * Fungsi untuk menjalankan keseluruhan proses.
 */
async function run() {
    console.log('Memulai proses penyalinan data JSON dari API Vercel...');
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    for (const genreId of GENRES_TO_COPY) {
        const result = await copyGenreData(genreId);
        
        if (result) {
            const filePath = path.join(OUTPUT_DIR, `${genreId}.json`);
            // Simpan respons JSON apa adanya, diformat agar rapi
            const jsonData = JSON.stringify(result, null, 2);
            
            await fs.writeFile(filePath, jsonData);
            console.log(`✅ Berhasil! Data genre '${genreId}' disalin ke file ${filePath}\n`);
        } else {
            console.log(`⚠️ Proses untuk genre '${genreId}' dilewati.\n`);
        }
    }

    console.log('Selesai! Semua file JSON telah disalin di dalam folder:', OUTPUT_DIR);
}

// Jalankan skrip
run();
