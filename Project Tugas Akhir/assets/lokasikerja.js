// Koneksi ke Supabase
import { supabase } from './supabase.js';

// Fungsi untuk memuat data kontrak
let currentPageLokasi = 1; // Halaman saat ini untuk data lokasi
const rowsPerPageLokasi = 5; // Data per halaman

async function loadLokasiKerja() {
  try {
    const offset = (currentPageLokasi - 1) * rowsPerPageLokasi;

    const { data, error, count } = await supabase
      .from('lokasi_kerja')
      .select(
        'id_lokasi, nama_lokasi, kategori', {count: 'exact'}
      )
      .order('id_lokasi', { ascending: true })
      .range(offset, offset + rowsPerPageLokasi - 1);

    const tableLokasiBody = document.getElementById('lokasikerja-body');
    tableLokasiBody.innerHTML = ''; // Reset tabel sebelum memuat data baru

    if (error) throw error;

    if (data.length === 0) {
      tableLokasiBody.innerHTML = `<tr><td colspan="15">Tidak ada data yang tersedia</td></tr>`;
      return;
    }

    // Render data ke dalam tabel
    data.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.nama_lokasi}</td>
        <td>${row.kategori}</td>
        <td>
          <button class="btn btn-primary btn-edit" data-id="${row.id_lokasi}"></button>
          <button class="btn btn-danger btn-delete" data-id="${row.id_lokasi}"></button>
        </td>
      `;
      tableLokasiBody.appendChild(tr);
    });

    // Menambahkan kontrol navigasi pagination
    const totalPages = Math.ceil(count / rowsPerPageLokasi);
    const paginationContainerLokasi = document.getElementById('pagination-lokasi');
    paginationContainerLokasi.innerHTML = '';

    // Tombol panah kiri
    const prevButtonLokasi = document.createElement('button');
    prevButtonLokasi.innerHTML = '&#9664;'; // Simbol panah kiri
    prevButtonLokasi.classList.add('btn', 'btn-secondary');
    prevButtonLokasi.disabled = currentPageLokasi === 1;
    prevButtonLokasi.onclick = () => {
      if (currentPageLokasi > 1) {
        currentPageLokasi--;
        loadLokasiKerja();
      }
    };
    paginationContainerLokasi.appendChild(prevButtonLokasi);

    // Tombol panah kanan
    const nextButtonLokasi = document.createElement('button');
    nextButtonLokasi.innerHTML = '&#9654;'; // Simbol panah kanan
    nextButtonLokasi.classList.add('btn', 'btn-secondary');
    nextButtonLokasi.disabled = currentPageLokasi === totalPages;
    nextButtonLokasi.onclick = () => {
      if (currentPageLokasi < totalPages) {
        currentPageLokasi++;
        loadLokasiKerja();
      }
    };
    paginationContainerLokasi.appendChild(nextButtonLokasi);    

  } catch (err) {
    console.error('Error fetching location data:', err);
    alert('Gagal memuat data lokasi.');
  }
}

// Fungsi untuk menambahkan data kontrak
document.getElementById('addRowButton').addEventListener('click', () => {
  const tableLokasiBody = document.getElementById('lokasikerja-body');

  // Tambahkan baris kosong untuk input data
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" placeholder="Nama Lokasi" class="new-nama_lokasi"></td>
    <td><input type="text" placeholder="Kategori" class="new-kategori"></td>
    <td><button class="saveRowButton btn btn-success"></button></td>
  `;
  tableLokasiBody.appendChild(newRow);
});

// Delegasi Event untuk tombol Simpan, Edit, dan Hapus
document.getElementById('lokasikerja-body').addEventListener('click', async (event) => {
  const target = event.target;

  if (target.classList.contains('saveRowButton')) {
    // Simpan data baru
    const row = target.closest('tr');
    const newData = {
      nama_lokasi: row.querySelector('.new-nama_lokasi').value,
      kategori: row.querySelector('.new-kategori').value,
    };

    try {
      const { error } = await supabase.from('lokasi_kerja').insert([newData]);
      if (error) throw error;

      alert('Data berhasil ditambahkan!');
      loadLokasiKerja();
    } catch (err) {
      console.error('Error adding data:', err);
      alert('Gagal menambahkan data.');
    }
  } else if (target.classList.contains('btn-edit')) {
    handleEdit(event);
  } else if (target.classList.contains('btn-delete')) {
    handleDeleteLokasi(event);
  }
});

// Fungsi untuk handle edit
async function handleEdit(event) {
  const id_lokasi = event.target.dataset.id;
  const row = event.target.closest('tr');
  const cells = row.querySelectorAll('td');

  const fields = [
    'nama_lokasi',
    'kategori',
  ];

  fields.forEach((field, index) => {
    const cell = cells[index];
    const value = cell.textContent.trim();
    cell.innerHTML = `<input type="text" value="${value}" class="form-control">`;
  });

  cells[cells.length - 1].innerHTML = `
    <button class="btn btn-success btn-save" data-id="${id_lokasi}"></button>
    <button class="btn btn-secondary btn-cancel"></button>
  `;

  cells[cells.length - 1].querySelector('.btn-save').addEventListener('click', async () => {
    const updatedData = {};

    fields.forEach((field, index) => {
      updatedData[field] = cells[index].querySelector('input').value.trim();
    });

    try {
      const { error } = await supabase
        .from('lokasi_kerja')
        .update(updatedData)
        .eq('id_lokasi', id_lokasi);

      if (error) throw error;

      alert('Data berhasil diperbarui.');
      loadLokasiKerja();
    } catch (err) {
      console.error('Error updating data:', err);
      alert('Gagal memperbarui data.');
    }
  });

  cells[cells.length - 1].querySelector('.btn-cancel').addEventListener('click', loadLokasiKerja);
}

// Fungsi Delete
async function handleDeleteLokasi(event) {
  const id_lokasi = event.target.dataset.id;

  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    try {
      const { error } = await supabase
        .from('lokasi_kerja')
        .delete()
        .eq('id_lokasi', id_lokasi);

      if (error) throw error;

      alert('Data berhasil dihapus.');
      loadLokasiKerja();
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
document.addEventListener('DOMContentLoaded', loadLokasiKerja);
