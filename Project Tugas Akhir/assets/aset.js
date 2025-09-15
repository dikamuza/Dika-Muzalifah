import { supabase } from './supabase.js';

let currentPageAsetKantor = 1; // Halaman saat ini untuk data aset kantor
const rowsPerPageAsetKantor = 2; // Data per halaman

// Fungsi untuk memuat data Aset Kantor
async function loadAsetKantor() {
  try {
    const offset = (currentPageAsetKantor - 1) * rowsPerPageAsetKantor;

    const { data, error, count } = await supabase
      .from('kategori_aset')
      .select(`
        id_kategori,
        nama_kategori,
        aset_kantor (id_aset, nama_aset, kondisi, uraian, dokumentasi, tahun_pengadaan, yg_menyerahkan, yg_menerima, sanksi)
      `, { count: 'exact' })
      .order('id_kategori', { ascending: true })
      .range(offset, offset + rowsPerPageAsetKantor - 1);

    const tableBody = document.getElementById('lokasikerja-body');
    const paginationContainerAsetKantor = document.getElementById('pagination-asetkantor');

    // Hapus isi sebelumnya
    tableBody.innerHTML = '';
    paginationContainerAsetKantor.innerHTML = '';

    if (error) {
      console.error('Error fetching aset kantor data:', error);
      alert('Gagal memuat data aset kantor.');
      return;
    }

    if (data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10">Tidak ada data yang tersedia</td>
        </tr>
      `;
      return;
    }

    // Tampilkan data ke tabel
    data.forEach((kategori_aset) => {
      const asetkantorList = kategori_aset.aset_kantor;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <a href="datahuka.html?nama_kategori=${encodeURIComponent(kategori_aset.nama_kategori)}" class="kategori-link">
            ${kategori_aset.nama_kategori}
          </a>
        </td>
        <td colspan="8">-</td>
        <td>
          <button class="btn btn-success add-aset-button" data-kategori-id="${kategori_aset.id_kategori}">
          </button>
        </td>
      `;
      tableBody.appendChild(row);

      asetkantorList.forEach((aset) => {
        const asetRow = document.createElement('tr');
        asetRow.innerHTML = `
          <td></td>
          <td>${aset.nama_aset}</td>
          <td>${aset.uraian}</td>
          <td>${aset.tahun_pengadaan}</td>
          <td>${aset.kondisi}</td>
          <td>${aset.yg_menyerahkan}</td>
          <td>${aset.yg_menerima}</td>
          <td>${aset.sanksi}</td>
          <td>${aset.dokumentasi}</td>
          <td>
            <button class="btn btn-warning edit-aset-button" data-aset-id="${aset.id_aset}">
            </button>
            <button class="btn btn-danger delete-aset-button" data-aset-id="${aset.id_aset}">
            </button>
          </td>
        `;
        tableBody.appendChild(asetRow);
      });
    });

    // Tambahkan navigasi pagination
    const totalPages = Math.ceil(count / rowsPerPageAsetKantor);

    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&#9664;';
    prevButton.classList.add('btn', 'btn-secondary');
    prevButton.disabled = currentPageAsetKantor === 1;
    prevButton.onclick = () => {
      if (currentPageAsetKantor > 1) {
        currentPageAsetKantor--;
        loadAsetKantor();
      }
    };
    paginationContainerAsetKantor.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&#9654;';
    nextButton.classList.add('btn', 'btn-secondary');
    nextButton.disabled = currentPageAsetKantor === totalPages;
    nextButton.onclick = () => {
      if (currentPageAsetKantor < totalPages) {
        currentPageAsetKantor++;
        loadAsetKantor();
      }
    };
    paginationContainerAsetKantor.appendChild(nextButton);

    addAsetEventListeners();
    addEditEventListeners();
    addDeleteEventListeners();
  } catch (err) {
    console.error('Unexpected error in loadAsetKantor:', err);
    alert('Terjadi kesalahan saat memuat data aset kantor.');
  }
}


function addAsetEventListeners() {
  const addAsetButtons = document.querySelectorAll('.add-aset-button');

  addAsetButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const kategoriId = event.target.dataset.kategoriId;
      const tableBody = document.getElementById('lokasikerja-body');

      // Tambahkan baris input baru
      const inputRow = document.createElement('tr');
      inputRow.innerHTML = `
        <td colspan="1">Kategori ID: ${kategoriId}</td>
        <td><input type="text" class="form-control" id="nama_aset" placeholder="Nama Aset"></td>
        <td><input type="text" class="form-control" id="uraian" placeholder="Uraian"></td>
        <td><input type="number" class="form-control" id="tahun_pengadaan" placeholder="Tahun"></td>
        <td><input type="text" class="form-control" id="kondisi" placeholder="Kondisi"></td>
        <td><input type="text" class="form-control" id="yg_menyerahkan" placeholder="Penyerah"></td>
        <td><input type="text" class="form-control" id="yg_menerima" placeholder="Penerima"></td>
        <td><input type="text" class="form-control" id="sanksi" placeholder="Sanksi"></td>
        <td><input type="text" class="form-control" id="dokumentasi" placeholder="Dokumentasi"></td>
        <td>
          <button class="btn btn-primary save-aset-button"></button>
          <button class="btn btn-danger cancel-aset-button"></button>
        </td>
      `;
      tableBody.appendChild(inputRow);

      // Tambahkan event listener untuk tombol Simpan dan Batal
      const saveButton = inputRow.querySelector('.save-aset-button');
      const cancelButton = inputRow.querySelector('.cancel-aset-button');

      saveButton.addEventListener('click', async () => {
        const namaAset = inputRow.querySelector('#nama_aset').value;
        const uraian = inputRow.querySelector('#uraian').value;
        const tahunPengadaan = inputRow.querySelector('#tahun_pengadaan').value;
        const kondisi = inputRow.querySelector('#kondisi').value;
        const ygMenyerahkan = inputRow.querySelector('#yg_menyerahkan').value;
        const ygMenerima = inputRow.querySelector('#yg_menerima').value;
        const sanksi = inputRow.querySelector('#sanksi').value;
        const dokumentasi = inputRow.querySelector('#dokumentasi').value;

        // Validasi input
        if (!namaAset || !tahunPengadaan || !kondisi) {
          alert('Harap lengkapi semua field yang diperlukan.');
          return;
        }

        try {
          const { error } = await supabase.from('aset_kantor').insert([{
            id_kategori: kategoriId,
            nama_aset: namaAset,
            uraian: uraian,
            tahun_pengadaan: tahunPengadaan,
            kondisi: kondisi,
            yg_menyerahkan: ygMenyerahkan,
            yg_menerima: ygMenerima,
            sanksi: sanksi,
            dokumentasi: dokumentasi,
          }]);

          if (error) {
            console.error('Error inserting data:', error);
            alert('Gagal menyimpan data aset.');
            return;
          }

          alert('Aset berhasil ditambahkan!');
          loadAsetKantor(); // Refresh data aset kantor
        } catch (err) {
          console.error('Unexpected error:', err);
          alert('Terjadi kesalahan saat menyimpan data aset.');
        }
      });

      cancelButton.addEventListener('click', () => {
        inputRow.remove(); // Hapus baris input jika pengguna membatalkan
      });
    });
  });
}

// Fungsi untuk menambahkan event listener ke tombol "Edit Aset"
function addEditEventListeners() {
  const editButtons = document.querySelectorAll('.edit-aset-button');

  editButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const asetId = event.target.dataset.asetId;
      const asetRow = button.closest('tr');
      const cells = asetRow.querySelectorAll('td');

      // Ambil data lama dari kolom
      const oldData = {
        nama_aset: cells[1].textContent.trim(),
        uraian: cells[2].textContent.trim(),
        tahun_pengadaan: cells[3].textContent.trim(),
        kondisi: cells[4].textContent.trim(),
        yg_menyerahkan: cells[5].textContent.trim(),
        yg_menerima: cells[6].textContent.trim(),
        sanksi: cells[7].textContent.trim(),
        dokumentasi: cells[8].textContent.trim(),
      };

      // Ubah baris menjadi form input
      asetRow.innerHTML = `
        <td></td>
        <td><input type="text" class="form-control" value="${oldData.nama_aset}" id="edit-nama_aset"></td>
        <td><input type="text" class="form-control" value="${oldData.uraian}" id="edit-uraian"></td>
        <td><input type="number" class="form-control" value="${oldData.tahun_pengadaan}" id="edit-tahun_pengadaan"></td>
        <td><input type="text" class="form-control" value="${oldData.kondisi}" id="edit-kondisi"></td>
        <td><input type="text" class="form-control" value="${oldData.yg_menyerahkan}" id="edit-yg_menyerahkan"></td>
        <td><input type="text" class="form-control" value="${oldData.yg_menerima}" id="edit-yg_menerima"></td>
        <td><input type="text" class="form-control" value="${oldData.sanksi}" id="edit-sanksi"></td>
        <td><input type="text" class="form-control" value="${oldData.dokumentasi}" id="edit-dokumentasi"></td>
        <td>
          <button class="btn btn-primary save-edit-aset-button" data-aset-id="${asetId}"></button>
          <button class="btn btn-secondary cancel-edit-aset-button"></button>
        </td>
      `;

      // Tambahkan event listener untuk tombol Simpan dan Batal
      const saveButton = asetRow.querySelector('.save-edit-aset-button');
      const cancelButton = asetRow.querySelector('.cancel-edit-aset-button');

      saveButton.addEventListener('click', async () => {
        const newData = {
          nama_aset: asetRow.querySelector('#edit-nama_aset').value,
          uraian: asetRow.querySelector('#edit-uraian').value,
          tahun_pengadaan: asetRow.querySelector('#edit-tahun_pengadaan').value,
          kondisi: asetRow.querySelector('#edit-kondisi').value,
          yg_menyerahkan: asetRow.querySelector('#edit-yg_menyerahkan').value,
          yg_menerima: asetRow.querySelector('#edit-yg_menerima').value,
          sanksi: asetRow.querySelector('#edit-sanksi').value,
          dokumentasi: asetRow.querySelector('#edit-dokumentasi').value,
        };

        try {
          const { error } = await supabase
            .from('aset_kantor')
            .update(newData)
            .eq('id_aset', asetId);

          if (error) {
            console.error('Error updating data:', error);
            alert('Gagal memperbarui data aset.');
            return;
          }

          alert('Aset berhasil diperbarui!');
          loadAsetKantor();
        } catch (err) {
          console.error('Unexpected error:', err);
          alert('Terjadi kesalahan saat memperbarui data aset.');
        }
      });

      cancelButton.addEventListener('click', () => {
        loadAsetKantor();
      });
    });
  });
}

// Fungsi untuk menambahkan event listener ke tombol "Hapus Aset"
function addDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll('.delete-aset-button');

  deleteButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const asetId = event.target.dataset.asetId;
      const confirmation = confirm('Apakah Anda yakin ingin menghapus aset ini?');

      if (!confirmation) return;

      try {
        const { error } = await supabase
          .from('aset_kantor')
          .delete()
          .eq('id_aset', asetId);

        if (error) {
          console.error('Error deleting data:', error);
          alert('Gagal menghapus data aset.');
          return;
        }

        alert('Aset berhasil dihapus!');
        loadAsetKantor();
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('Terjadi kesalahan saat menghapus data aset.');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', loadAsetKantor);
