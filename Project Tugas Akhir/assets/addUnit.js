import { supabase } from './supabase.js';

document.getElementById('addUnitButton').addEventListener('click', async () => {
  const unitName = prompt('Masukkan nama unit baru:');

  if (!unitName) {
    alert('Nama unit tidak boleh kosong.');
    return;
  }

  try {
    const { data, error } = await supabase.from('unit').insert([{ nama_unit: unitName }]);

    if (error) {
      console.error('Error menambahkan unit:', error);
      alert('Gagal menambahkan unit baru.');
    } else {
      alert('Unit berhasil ditambahkan.');
      // Muat ulang data struktur organisasi setelah menambah unit baru
      location.reload();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Terjadi kesalahan saat menambahkan unit.');
  }
});
