import { supabase } from './supabase.js';

// Fungsi untuk menambahkan kategori baru
async function tambahKategori() {
  try {
    // Meminta input nama kategori dari pengguna
    const namaKategori = prompt('Masukkan nama kategori baru:');
    
    // Validasi input
    if (!namaKategori) {
      alert('Nama kategori tidak boleh kosong.');
      return;
    }

    // Menambahkan data ke tabel kategori_aset
    const { data, error } = await supabase
      .from('kategori_aset')
      .insert([{ nama_kategori: namaKategori }]); // Hanya masukkan nama_kategori, id_kategori diisi otomatis

    if (error) {
      console.error('Error Supabase:', error);
      if (error.code === '23505') { // Constraint unik
        alert('Kategori dengan nama ini sudah ada. Silakan gunakan nama lain.');
      } else {
        alert(`Gagal menambahkan kategori: ${error.message}`);
      }
      return;
    }

    // Beri tahu pengguna bahwa kategori berhasil ditambahkan
    alert('Kategori berhasil ditambahkan!');
    location.reload(); // Refresh halaman untuk memuat data baru
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Terjadi kesalahan saat menambahkan kategori.');
  }
}

// Menambahkan event listener ke tombol "Tambah Kategori"
document.addEventListener('DOMContentLoaded', () => {
  const addKategoriButton = document.getElementById('addUnitButton');

  if (addKategoriButton) {
    addKategoriButton.addEventListener('click', tambahKategori);
  } else {
    console.error('Tombol Tambah Kategori tidak ditemukan di halaman.');
  }
});
