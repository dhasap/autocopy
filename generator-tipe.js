const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs/promises');
const path = require('path');

// ================= KONFIGURASI =================
const YOUR_VERCEL_API_URL = 'https://komiku-org.vercel.app/api';
const WEB_URL = 'https://komiku.org';
const OUTPUT_DIR = 'hasil_json'; // Pastikan nama folder sama

// Daftar tipe yang ingin disalin dari halaman "Daftar Komik"
const TYPES_TO_COPY = [
    'manga', 'manhwa', 'manhua'
];
// =============================================

/**
 * Fungsi untuk mem-parsing kartu komik dari halaman "Daftar Komik".
 */
const parseDaftarKomikCard = ($, el) => {
    const anchor = $(el).find('div.ls4j > h4 > a');
    const judul = anchor.text().trim();
    let url = anchor.attr('href');
    let gambar_sampul = $(el).find('div.ls4v img').attr('data-src') || $(el).find('div.ls4v img').attr('src');

    if (gambar_sampul) {
        gambar_sampul = `${YOUR_VERCEL_API_URL}/image?url=${encodeURIComponent(gambar_sampul.trim().split('?')[0])}`;
    }

    return (judul && url) ? { judul, chapter: '', gambar_sampul, tipe: '', url } : null;
};

/**
 * Fungsi untuk menyalin data dari halaman "Daftar Komik" berdasarkan tipe.
 */
async function copyDaftarKomikData(typeId) {
    console.log(`Menyalin data untuk TIPE: ${typeId}...`);
    const targetUrl = `${WEB_URL}/daftar-komik/?tipe=${typeId}`;
    
    try {
        const { data: html } = await axios.get(targetUrl);
        const $ = cheerio.load(html);
        const comics = [];
        
        $('div#history div.ls4').each((i, el) => {
            const comic = parseDaftarKomikCard($, el);
            if (comic) comics.push(comic);
        });

        return {
            success: true,
            source: `Komiku - Tipe ${typeId}`,
            data: comics
        };
    } catch (error) {
        console.error(`  - Gagal mengambil data dari ${targetUrl}: ${error.message}`);
        return null;
    }
}

/**
 * Fungsi untuk menjalankan keseluruhan proses.
 */
async function run() {
    console.log('Memulai proses penyalinan data TIPE (Daftar Komik)...');
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    for (const typeId of TYPES_TO_COPY) {
        const result = await copyDaftarKomikData(typeId);
        if (result && result.data.length > 0) {
            const filePath = path.join(OUTPUT_DIR, `${typeId}.json`);
            const jsonData = JSON.stringify(result, null, 2);
            await fs.writeFile(filePath, jsonData);
            console.log(`✅ Berhasil! Data tipe '${typeId}' disalin ke file ${filePath}\n`);
        } else {
            console.log(`⚠️ Proses untuk tipe '${typeId}' dilewati.\n`);
        }
    }

    console.log('Selesai! Semua file JSON TIPE telah disalin di dalam folder:', OUTPUT_DIR);
}

// Jalankan skrip
run();
