// Koneksi ke Supabase
import { supabase } from './supabase.js';

let currentPageJabatan = 1; // Halaman saat ini untuk data jabatan
const rowsPerPageJabatan = 5; // Data per halaman

// Fungsi untuk memuat data kontrak
async function loadDataJabatan() {
  try {
    const offset = (currentPageJabatan - 1) * rowsPerPageJabatan;

    const { data, error, count } = await supabase
      .from('jabatan')
      .select(
        'id_jabatan, nama_jabatan, level', {count: 'exact'}
      )
      .order('id_jabatan', { ascending: true })
      .range(offset, offset + rowsPerPageJabatan - 1);

    const tableJabatanBody = document.getElementById('jabatan-body');
    tableJabatanBody.innerHTML = ''; // Reset tabel sebelum memuat data baru

    if (error) throw error;

    if (data.length === 0) {
      tableJabatanBody.innerHTML = `<tr><td colspan="15">Tidak ada data yang tersedia</td></tr>`;
      return;
    }

    // Render data ke dalam tabel
    data.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.nama_jabatan}</td>
        <td>${row.level}</td>
        <td>
          <button class="btn btn-primary btn-edit" data-id="${row.id_jabatan}"></button>
          <button class="btn btn-danger btn-delete" data-id="${row.id_jabatan}"></button>
        </td>
      `;
      tableJabatanBody.appendChild(tr);
    });

    // Menambahkan kontrol navigasi pagination
    const totalPages = Math.ceil(count / rowsPerPageJabatan);
    const paginationContainerJabatan = document.getElementById('pagination-jabatan');
    paginationContainerJabatan.innerHTML = '';

    // Tombol panah kiri
    const prevButtonJabatan = document.createElement('button');
    prevButtonJabatan.innerHTML = '&#9664;'; // Simbol panah kiri
    prevButtonJabatan.classList.add('btn', 'btn-secondary');
    prevButtonJabatan.disabled = currentPageJabatan === 1;
    prevButtonJabatan.onclick = () => {
      if (currentPageJabatan > 1) {
        currentPageJabatan--;
        loadDataJabatan();
      }
    };
    paginationContainerJabatan.appendChild(prevButtonJabatan);

    // Tombol panah kanan
    const nextButtonJabatan = document.createElement('button');
    nextButtonJabatan.innerHTML = '&#9654;'; // Simbol panah kanan
    nextButtonJabatan.classList.add('btn', 'btn-secondary');
    nextButtonJabatan.disabled = currentPageJabatan === totalPages;
    nextButtonJabatan.onclick = () => {
      if (currentPageJabatan < totalPages) {
        currentPageJabatan++;
        loadDataJabatan();
      }
    };
    paginationContainerJabatan.appendChild(nextButtonJabatan);

  } catch (err) {
    console.error('Error fetching jabatan data:', err);
    alert('Gagal memuat data jabatan.');
  }
}

// Fungsi untuk menambahkan data kontrak
document.getElementById('addRowButton').addEventListener('click', () => {
  const tableJabatanBody = document.getElementById('jabatan-body');

  // Tambahkan baris kosong untuk input data
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" placeholder="Nama Jabatan" class="new-nama_jabatan"></td>
    <td><input type="text" placeholder="Level" class="new-level"></td>
    <td><button class="saveRowButton btn btn-success"></button></td>
  `;
  tableJabatanBody.appendChild(newRow);
});

// Delegasi Event untuk tombol Simpan, Edit, dan Hapus
document.getElementById('jabatan-body').addEventListener('click', async (event) => {
  const target = event.target;

  if (target.classList.contains('saveRowButton')) {
    // Simpan data baru
    const row = target.closest('tr');
    const newData = {
      nama_jabatan: row.querySelector('.new-nama_jabatan').value,
      level: row.querySelector('.new-level').value,
    };

    try {
      const { error } = await supabase.from('jabatan').insert([newData]);
      if (error) throw error;

      alert('Data berhasil ditambahkan!');
      loadDataJabatan();
    } catch (err) {
      console.error('Error adding data:', err);
      alert('Gagal menambahkan data.');
    }
  } else if (target.classList.contains('btn-edit')) {
    handleEdit(event);
  } else if (target.classList.contains('btn-delete')) {
    handleDeleteJabatan(event);
  }
});

// Fungsi untuk handle edit
async function handleEdit(event) {
  const id_jabatan = event.target.dataset.id;
  const row = event.target.closest('tr');
  const cells = row.querySelectorAll('td');

  const fields = [
    'nama_jabatan',
    'level',
  ];

  fields.forEach((field, index) => {
    const cell = cells[index];
    const value = cell.textContent.trim();
    cell.innerHTML = `<input type="text" value="${value}" class="form-control">`;
  });

  cells[cells.length - 1].innerHTML = `
    <button class="btn btn-success btn-save" data-id="${id_jabatan}"></button>
    <button class="btn btn-secondary btn-cancel"></button>
  `;

  cells[cells.length - 1].querySelector('.btn-save').addEventListener('click', async () => {
    const updatedData = {};

    fields.forEach((field, index) => {
      updatedData[field] = cells[index].querySelector('input').value.trim();
    });

    try {
      const { error } = await supabase
        .from('jabatan')
        .update(updatedData)
        .eq('id_jabatan', id_jabatan);

      if (error) throw error;

      alert('Data berhasil diperbarui.');
      loadDataJabatan();
    } catch (err) {
      console.error('Error updating data:', err);
      alert('Gagal memperbarui data.');
    }
  });

  cells[cells.length - 1].querySelector('.btn-cancel').addEventListener('click', loadDataJabatan);
}

// Fungsi Delete
async function handleDeleteJabatan(event) {
  const id_jabatan = event.target.dataset.id;

  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    try {
      const { error } = await supabase
        .from('jabatan')
        .delete()
        .eq('id_jabatan', id_jabatan);

      if (error) throw error;

      alert('Data berhasil dihapus.');
      loadDataJabatan();
    } catch (err) {
      console.error('Error deleting data:', err);
      alert('Gagal menghapus data.');
    }
  }
}

// Fungsi format tanggal ke format lokal
function formatTanggal(tanggal) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(tanggal).toLocaleDateString('id-ID', options);
}

// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadDataJabatan);
