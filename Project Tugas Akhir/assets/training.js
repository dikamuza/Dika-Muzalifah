import { supabase } from './supabase.js';

let currentPageTraining = 1; // Halaman saat ini untuk data pribadi
const rowsPerPageTraining = 5; // Data per halaman

// Fungsi untuk memuat data Training
async function loadTrainingData() {
  try {
    const offset = (currentPageTraining - 1) * rowsPerPageTraining;

    const { data, error, count } = await supabase
      .from('jenis_training')
      .select(`
        id_jenis,
        kode_training,
        jenis_training,
        training(id_training, no_kategori, kegiatan_training, topik_training, lembaga_penyelenggara, tempat_pelaksanaan, biaya)
      `, { count: 'exact' })
      .order('id_jenis', { ascending: true })
      .range(offset, offset + rowsPerPageTraining - 1);

    const tableBody = document.getElementById('training-body');
    tableBody.innerHTML = ''; // Reset tabel

    if (error) {
      console.error('Error fetching training data:', error.message || error);
      alert('Gagal memuat data training.');
      return;
    }

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8">Tidak ada data yang tersedia</td></tr>`;
      return;
    }

    data.forEach((row) => {
      // Baris untuk kategori (kode_training dan jenis_training)
      const jenisRow = document.createElement('tr');
      jenisRow.innerHTML = `
        <td colspan="8" style="background-color: #f0f0f0; font-weight: bold;">
          Kode Training: ${row.kode_training || '-'} - 
          <a href="datahuka.html?jenis_training=${encodeURIComponent(row.jenis_training || '')}" 
             style="color: black; text-decoration: none;">
             ${row.jenis_training || '-'}
          </a>
          <button class="btn-add" data-id="${row.id_jenis}">Tambah</button>
        </td>
      `;
      tableBody.appendChild(jenisRow);
    
      if (row.training && row.training.length > 0) {
        row.training.forEach((training) => {
          const trainingRow = document.createElement('tr');
          trainingRow.dataset.id = training.id_training;
    
          trainingRow.innerHTML = `
            <td>${training.no_kategori || '-'}</td>
            <td>${training.kegiatan_training || '-'}</td>
            <td>${training.topik_training || '-'}</td>
            <td>${training.lembaga_penyelenggara || '-'}</td>
            <td>${training.tempat_pelaksanaan || '-'}</td>
            <td>${training.biaya ? `Rp ${training.biaya}` : '-'}</td>
            <td>
              <button class="btn-edit" data-id="${training.id_training}"></button>
              <button class="btn-delete" data-id="${training.id_training}"></button>
            </td>
          `;
          tableBody.appendChild(trainingRow);
        });
      }
    });

    // Menambahkan kontrol navigasi pagination
    const totalPages = Math.ceil(count / rowsPerPageTraining);
    const paginationContainerTraining = document.getElementById('pagination-training');
    paginationContainerTraining.innerHTML = '';

    // Tombol panah kiri
    const prevButtonTraining = document.createElement('button');
    prevButtonTraining.innerHTML = '&#9664;'; // Simbol panah kiri
    prevButtonTraining.classList.add('btn', 'btn-secondary');
    prevButtonTraining.disabled = currentPageTraining === 1;
    prevButtonTraining.onclick = () => {
      if (currentPageTraining > 1) {
        currentPageTraining--;
        loadTrainingData();
      }
    };
    paginationContainerTraining.appendChild(prevButtonTraining);

    // Tombol panah kanan
    const nextButtonTraining = document.createElement('button');
    nextButtonTraining.innerHTML = '&#9654;'; // Simbol panah kanan
    nextButtonTraining.classList.add('btn', 'btn-secondary');
    nextButtonTraining.disabled = currentPageTraining === totalPages;
    nextButtonTraining.onclick = () => {
      if (currentPageTraining < totalPages) {
        currentPageTraining++;
        loadTrainingData();
      }
    };
    paginationContainerTraining.appendChild(nextButtonTraining);
    
    addEventListeners();
  } catch (err) {
    console.error('Unexpected error in loadTrainingData:', err);
    alert('Terjadi kesalahan saat memuat data training.');
  }
}

// Fungsi untuk membuat baris editable
function makeRowEditable(row, training) {
  row.innerHTML = `
    <td contenteditable="true" data-field="no_kategori">${training.no_kategori || ''}</td>
    <td contenteditable="true" data-field="kegiatan_training">${training.kegiatan_training || ''}</td>
    <td contenteditable="true" data-field="topik_training">${training.topik_training || ''}</td>
    <td contenteditable="true" data-field="lembaga_penyelenggara">${training.lembaga_penyelenggara || ''}</td>
    <td contenteditable="true" data-field="tempat_pelaksanaan">${training.tempat_pelaksanaan || ''}</td>
    <td contenteditable="true" data-field="biaya">${training.biaya || ''}</td>
    <td>
      <button class="btn-save" data-id="${training.id_training}"></button>
      <button class="btn-cancel"></button>
    </td>
  `;

  // Tombol Simpan
  row.querySelector('.btn-save').addEventListener('click', async (e) => {
    const idTraining = e.target.dataset.id;
    const updatedData = {};
    row.querySelectorAll('[contenteditable]').forEach((cell) => {
      updatedData[cell.dataset.field] = cell.textContent.trim();
    });

    const { error } = await supabase.from('training').update(updatedData).eq('id_training', idTraining);
    if (error) {
      console.error('Error updating training:', error.message || error);
      alert('Gagal menyimpan perubahan.');
    } else {
      alert('Data berhasil diperbarui.');
      loadTrainingData();
    }
  });

  // Tombol Batal
  row.querySelector('.btn-cancel').addEventListener('click', () => {
    loadTrainingData(); // Reload data tanpa menyimpan perubahan
  });
}

// Tambah Data Baru
async function addNewTraining(rowId) {
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td contenteditable="true" data-field="no_kategori"></td>
    <td contenteditable="true" data-field="kegiatan_training"></td>
    <td contenteditable="true" data-field="topik_training"></td>
    <td contenteditable="true" data-field="lembaga_penyelenggara"></td>
    <td contenteditable="true" data-field="tempat_pelaksanaan"></td>
    <td contenteditable="true" data-field="biaya"></td>
    <td><button class="btn-save-new" data-id="${rowId}">Simpan</button></td>
  `;
  document.querySelector(`[data-id="${rowId}"]`).parentNode.appendChild(newRow);

  // Event listener untuk simpan data baru
  newRow.querySelector('.btn-save-new').addEventListener('click', async (e) => {
    const idJenis = e.target.dataset.id;
    const newData = {};
    newRow.querySelectorAll('[contenteditable]').forEach((cell) => {
      newData[cell.dataset.field] = cell.textContent.trim();
    });

    const { error } = await supabase.from('training').insert({
      ...newData,
      id_jenis: idJenis,
    });

    if (error) {
      console.error('Error adding new training:', error.message || error);
      alert('Gagal menambah data.');
    } else {
      alert('Data berhasil ditambahkan.');
      loadTrainingData();
    }
  });
}

// Hapus Data
async function deleteTraining(idTraining) {
  const { error } = await supabase.from('training').delete().eq('id_training', idTraining);
  if (error) {
    console.error('Error deleting training:', error.message || error);
    alert('Gagal menghapus data.');
  } else {
    alert('Data berhasil dihapus.');
    loadTrainingData();
  }
}

// Event Listeners
function addEventListeners() {
  // Tambah data baru
  document.querySelectorAll('.btn-add').forEach((btn) => {
    btn.addEventListener('click', () => addNewTraining(btn.dataset.id));
  });

  // Hapus data
  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteTraining(btn.dataset.id));
  });

  // Edit data
  document.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      const training = {
        id_training: row.dataset.id,
        no_kategori: row.children[0].textContent.trim(),
        kegiatan_training: row.children[1].textContent.trim(),
        topik_training: row.children[2].textContent.trim(),
        lembaga_penyelenggara: row.children[3].textContent.trim(),
        tempat_pelaksanaan: row.children[4].textContent.trim(),
        biaya: row.children[5].textContent.trim(),
      };
      makeRowEditable(row, training);
    });
  });
}

// Fungsi untuk menambahkan baris baru untuk jenis_training
function addNewJenisRow() {
  // Buat elemen baris baru
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td contenteditable="true" data-field="kode_training"></td>
    <td contenteditable="true" data-field="jenis_training"></td>
    <td>
      <button class="btn-save-jenis">Simpan</button>
      <button class="btn-cancel-jenis">Batal</button>
    </td>
  `;

  // Tambahkan baris ke tabel di bagian atas
  const tableBody = document.getElementById('training-body');
  tableBody.insertBefore(newRow, tableBody.firstChild);

  // Tombol Simpan untuk data baru
  newRow.querySelector('.btn-save-jenis').addEventListener('click', async () => {
    const newData = {};
    newRow.querySelectorAll('[contenteditable]').forEach((cell) => {
      newData[cell.dataset.field] = cell.textContent.trim();
    });

    // Validasi data sebelum menyimpan
    if (!newData.kode_training || !newData.jenis_training) {
      alert('Kode Training dan Jenis Training tidak boleh kosong.');
      return;
    }

    try {
      // Simpan data baru ke Supabase
      const { error } = await supabase.from('jenis_training').insert({
        kode_training: newData.kode_training,
        jenis_training: newData.jenis_training,
      });

      if (error) {
        console.error('Error adding new jenis_training:', error.message || error);
        alert('Gagal menambahkan data baru. Pastikan data valid dan tidak duplikat.');
      } else {
        alert('Data berhasil ditambahkan.');
        loadTrainingData(); // Reload tabel setelah berhasil menyimpan
      }
    } catch (err) {
      console.error('Unexpected error while adding jenis_training:', err);
      alert('Terjadi kesalahan saat menambah data.');
    }
  });

  // Tombol Batal untuk membatalkan input
  newRow.querySelector('.btn-cancel-jenis').addEventListener('click', () => {
    newRow.remove(); // Hapus baris baru jika dibatalkan
  });
}

// Tambahkan event listener ke button Tambah Jenis
document.getElementById('addJenisButton').addEventListener('click', addNewJenisRow);

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', loadTrainingData);
