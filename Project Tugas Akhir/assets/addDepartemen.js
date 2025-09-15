import { supabase } from './supabase.js';

async function getUnits() {
  try {
    const { data, error } = await supabase.from('unit').select('id_unit, nama_unit');

    if (error) {
      console.error('Error fetching units:', error);
      alert('Gagal memuat data unit.');
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Terjadi kesalahan saat memuat data unit.');
    return [];
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const addDepartmentButtons = document.querySelectorAll('.add-department-button');

  addDepartmentButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const unitId = event.target.dataset.unitId; // Dapatkan ID unit dari atribut data
      const departmentName = prompt('Masukkan nama departemen baru:');

      if (!departmentName) {
        alert('Nama departemen tidak boleh kosong.');
        return;
      }

      try {
        const { data, error } = await supabase.from('departemen').insert([
          {
            nama_dept: departmentName,
            unit_id: unitId, // Menghubungkan ke unit yang relevan
          },
        ]);

        if (error) {
          console.error('Error menambahkan departemen:', error);
          alert('Gagal menambahkan departemen baru.');
        } else {
          alert('Departemen berhasil ditambahkan.');
          // Muat ulang data struktur organisasi setelah menambah departemen baru
          location.reload();
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('Terjadi kesalahan saat menambahkan departemen.');
      }
    });
  });
});
