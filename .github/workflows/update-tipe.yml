name: Perbarui Data Tipe Komik Secara Otomatis

on:
  schedule:
    # Jadwal untuk tipe: Setiap hari jam 6 pagi WIB (berbeda dari genre)
    - cron: '0 23 * * *'
  workflow_dispatch:

jobs:
  build-and-commit-tipe:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: node generator-tipe.js # Menjalankan skrip tipe
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore(tipe): Perbarui data tipe komik'
          file_pattern: hasil_json/*.json
