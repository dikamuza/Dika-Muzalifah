import { supabase } from './supabase.js';

// Fungsi untuk memuat data
let currentPage = 1; // Halaman saat ini
const rowsPerPage = 5; // Data per halaman

async function loadDataStaff() {
  try {
    const offset = (currentPage - 1) * rowsPerPage;

    const { data: staffData, error: staffError, count } = await supabase
      .from('staff')
      .select(
        'id_staff, nik_karyawan, nama_staff, jenis_kelamin, nama_unit, nama_dept, jabatan, level, supervisor, nama_lokasi, link',
        { count: 'exact' }
      )
      .order('id_staff', { ascending: true })
      .range(offset, offset + rowsPerPage - 1);

    const { data: kontrakData, error: kontrakError } = await supabase
      .from('riwayat_kontrak')
      .select('id_staff, mulai_bergabung, status_kontrak, awal_kontrak, akhir_kontrak, no_kontrak, masa_kontrak');

    if (staffError) throw staffError;
    if (kontrakError) throw kontrakError;

    // Filter hanya data kontrak terbaru
    const latestKontrakData = {};
    kontrakData.forEach((row) => {
      if (
        !latestKontrakData[row.id_staff] || 
        new Date(row.mulai_bergabung) > new Date(latestKontrakData[row.id_staff].mulai_bergabung)
      ) {
        latestKontrakData[row.id_staff] = row;
      }
    });

    const staffTableBody = document.getElementById('staff-table-body');
    staffTableBody.innerHTML = '';

    if (staffData.length === 0) {
      staffTableBody.innerHTML = '<tr><td colspan="15">Tidak ada data yang tersedia</td></tr>';
      return;
    }

    staffData.forEach((staffRow) => {
      const kontrakRow = latestKontrakData[staffRow.id_staff]; // Mengambil kontrak terbaru

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${staffRow.nik_karyawan}</td>
        <td>${staffRow.nama_staff}</td>
        <td>${staffRow.jenis_kelamin}</td>
        <td>${kontrakRow ? kontrakRow.mulai_bergabung : '-'}</td>
        <td>${kontrakRow ? kontrakRow.status_kontrak : '-'}</td>
        <td>${kontrakRow ? kontrakRow.no_kontrak : '-'}</td>
        <td>${kontrakRow ? kontrakRow.masa_kontrak : '-'}</td>
        <td>${kontrakRow ? kontrakRow.awal_kontrak : '-'}</td>
        <td>${kontrakRow ? kontrakRow.akhir_kontrak : '-'}</td>
        <td>${staffRow.nama_unit}</td>
        <td>${staffRow.nama_dept}</td>
        <td>${staffRow.jabatan}</td>
        <td>${staffRow.level}</td>
        <td>${staffRow.supervisor}</td>
        <td>${staffRow.nama_lokasi}</td>
        <td>${staffRow.link}</td>
        <td>
          <button class="btn btn-primary btn-edit" data-id="${staffRow.id_staff}"></button>
          <button class="btn btn-danger btn-delete" data-id="${staffRow.id_staff}"></button>
        </td>
      `;
      staffTableBody.appendChild(tr);
    });

    // Menambahkan kontrol navigasi pagination
    const totalPages = Math.ceil(count / rowsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Tombol panah kiri
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&#9664;'; // Simbol panah kiri
    prevButton.classList.add('btn', 'btn-secondary');
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        loadDataStaff();
      }
    };
    paginationContainer.appendChild(prevButton);

    // Tombol panah kanan
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&#9654;'; // Simbol panah kanan
    nextButton.classList.add('btn', 'btn-secondary');
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadDataStaff();
      }
    };
    paginationContainer.appendChild(nextButton);

  } catch (err) {
    console.error('Error fetching data:', err);
    alert('Gagal memuat data.');
  }
}



// Fungsi untuk menambah data staff
document.getElementById('addRowButton').addEventListener('click', () => {
  const staffTableBody = document.getElementById('staff-table-body');

  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" placeholder="NIK Karyawan" class="new-nik_karyawan"></td>    
    <td><input type="text" placeholder="Nama Staff" class="new-nama_staff"></td>
    <td><input type="text" placeholder="Jenis Kelamin" class="new-jenis_kelamin"></td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td><input type="text" placeholder="Nama Unit" class="new-nama_unit"></td>
    <td><input type="text" placeholder="Nama Dept" class="new-nama_dept"></td>
    <td><input type="text" placeholder="Jabatan" class="new-jabatan"></td>
    <td><input type="text" placeholder="Level" class="new-level"></td>
    <td><input type="text" placeholder="Supervisor" class="new-supervisor"></td>
    <td><input type="text" placeholder="Nama Lokasi" class="new-nama_lokasi"></td>
    <td><input type="text" placeholder="Link" class="new-link"></td>
    <td><button class="saveRowButton btn btn-success"></button></td>
  `;
  staffTableBody.appendChild(newRow);
});

// Event listener untuk simpan, edit, dan hapus
document.getElementById('staff-table-body').addEventListener('click', async (event) => {
  const target = event.target;

  if (target.classList.contains('saveRowButton')) {
    const row = target.closest('tr');
    const newData = {
      nik_karyawan: row.querySelector('.new-nik_karyawan').value,
      nama_staff: row.querySelector('.new-nama_staff').value,
      jenis_kelamin: row.querySelector('.new-jenis_kelamin').value,
      nama_unit: row.querySelector('.new-nama_unit').value,
      nama_dept: row.querySelector('.new-nama_dept').value,
      jabatan: row.querySelector('.new-jabatan').value,
      level: row.querySelector('.new-level').value,
      supervisor: row.querySelector('.new-supervisor').value,
      nama_lokasi: row.querySelector('.new-nama_lokasi').value,
      link: row.querySelector('.new-link').value,
    };

    try {
      const { error } = await supabase.from('staff').insert([newData]);
      if (error) throw error;

      alert('Data staff berhasil ditambahkan.');
      loadDataStaff();
    } catch (err) {
      console.error('Error adding data:', err);
      alert('Gagal menambahkan data.');
    }
  } else if (target.classList.contains('btn-edit')) {
    handleEdit(event);
  } else if (target.classList.contains('btn-delete')) {
    handleDeleteStaff(event);
  }
});

// Fungsi untuk mengedit data staff
async function handleEdit(event) {
  const id_staff = event.target.dataset.id; // ID staff yang akan diedit
  const row = event.target.closest('tr');
  const cells = row.querySelectorAll('td');

  // Indeks kolom yang dapat diedit (berdasarkan data dari tabel 'staff')
  const editableFields = ['nik_karyawan', 'nama_staff', 'jenis_kelamin', 'nama_unit', 'nama_dept', 'jabatan', 'level', 'supervisor', 'nama_lokasi', 'link'];
  const editableIndexes = [0, 1, 2, 9, 10, 11, 12, 13, 14, 15]; // Indeks kolom berdasarkan posisi dalam tabel

  // Simpan nilai awal untuk memungkinkan pembatalan
  const originalData = {};
  editableIndexes.forEach((index) => {
    const cell = cells[index];
    const value = cell.textContent.trim();
    originalData[index] = value; // Simpan nilai asli
    cell.innerHTML = `<input type="text" value="${value}" class="form-control">`; // Ganti dengan input
  });

  // Ganti kolom aksi dengan tombol Simpan dan Batal
  cells[cells.length - 1].innerHTML = `
    <button class="btn btn-success btn-save" data-id="${id_staff}"></button>
    <button class="btn btn-secondary btn-cancel"></button>
  `;

  // Event listener untuk tombol Simpan
  cells[cells.length - 1].querySelector('.btn-save').addEventListener('click', async () => {
    const updatedData = {};
    editableIndexes.forEach((index, fieldIndex) => {
      updatedData[editableFields[fieldIndex]] = cells[index].querySelector('input').value.trim(); // Ambil nilai dari input
    });

    try {
      // Update data di database
      const { error } = await supabase.from('staff').update(updatedData).eq('id_staff', id_staff);
      if (error) throw error;

      alert('Data staff berhasil diperbarui.');
      loadDataStaff(); // Reload data setelah update
    } catch (err) {
      console.error('Error updating data:', err);
      alert('Gagal memperbarui data.');
    }
  });

  // Event listener untuk tombol Batal
  cells[cells.length - 1].querySelector('.btn-cancel').addEventListener('click', () => {
    // Kembalikan nilai asli ke setiap kolom yang dapat diedit
    editableIndexes.forEach((index) => {
      cells[index].innerHTML = originalData[index];
    });

    // Kembalikan tombol aksi ke keadaan awal
    cells[cells.length - 1].innerHTML = `
      <button class="btn btn-primary btn-edit" data-id="${id_staff}"></button>
      <button class="btn btn-danger btn-delete" data-id="${id_staff}"></button>
    `;

    // Tambahkan kembali event listener untuk tombol Edit
    cells[cells.length - 1].querySelector('.btn-edit').addEventListener('click', handleEdit);
  });
}

// Fungsi untuk menghapus data staff
async function handleDeleteStaff(event) {
  const id_staff = event.target.dataset.id;

  if (confirm('Apakah Anda yakin ingin menghapus data ini beserta riwayat kontraknya?')) {
    try {
      // Hapus riwayat kontrak terkait
      const { error: deleteRiwayatError } = await supabase
        .from('riwayat_kontrak')
        .delete()
        .eq('id_staff', id_staff);
      if (deleteRiwayatError) throw deleteRiwayatError;

      // Hapus data staff
      const { error: deleteStaffError } = await supabase
        .from('staff')
        .delete()
        .eq('id_staff', id_staff);
      if (deleteStaffError) throw deleteStaffError;

      alert('Data staff dan riwayat kontrak berhasil dihapus.');
      loadDataStaff();
    } catch (err) {
      console.error('Error deleting data:', err);
      alert('Gagal menghapus data.');
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Fungsi untuk memuat elemen pencarian
  function renderSearchElements() {
    const searchContainer = document.getElementById('search-container');
  
    // Atur gaya kontainer
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '10px';
    searchContainer.style.alignItems = 'center';
  
    // Tambahkan elemen-elemen pencarian
    searchContainer.innerHTML = `
      <input type="text" id="search" placeholder="Search by name">
      <select id="statusDropdown"></select>
      <button id="searchButton">Search</button>
    `;
  
    // Gaya untuk input teks
    const searchInput = document.getElementById('search');
    Object.assign(searchInput.style, {
      padding: '10px',
      border: '1px solid rgba(66, 92, 90, 0.6)',
      borderRadius: '5px',
      color: '#425C5A',
      flexGrow: '1', // Agar input meluas sesuai ruang yang tersedia
    });
  
    // Gaya untuk dropdown
    const dropdown = document.getElementById('statusDropdown');
    Object.assign(dropdown.style, {
      padding: '10px',
      border: '1px solid rgba(66, 92, 90, 0.6)',
      borderRadius: '5px',
      color: '#425C5A',
      backgroundColor: '#ffffff',
    });
  
    // Gaya untuk tombol
    const searchButton = document.getElementById('searchButton');
    Object.assign(searchButton.style, {
      padding: '10px 15px',
      backgroundColor: '#4C9F98',
      border: 'none',
      borderRadius: '5px',
      color: '#ffffff',
      cursor: 'pointer',
    });
  
    // Tambahkan event listener untuk tombol Search
    searchButton.addEventListener('click', filterData);
  
    // Muat dropdown setelah elemen dibuat
    loadDropdown();
  }  

  // Fungsi untuk mengatur visibilitas elemen berdasarkan tab
  function handleTabSwitch(tabName) {
    const searchContainer = document.getElementById('search-container');
    if (tabName === 'staff') {
      // Render elemen pencarian hanya di tab staff
      if (!searchContainer.innerHTML) renderSearchElements();
      searchContainer.style.display = 'block';
    } else {
      // Sembunyikan elemen pencarian di tab lain
      searchContainer.style.display = 'none';
    }
  }

  // Fungsi untuk menangani perubahan tab
  function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach((tab) => tab.classList.remove('active'));
    contents.forEach((content) => content.classList.remove('active'));

    document.querySelector(`#${tabId}`).classList.add('active');
    document.querySelector(`.tab-button[onclick="switchTab('${tabId}')"]`).classList.add('active');

    // Tangani visibilitas pencarian saat tab berubah
    handleTabSwitch(tabId);

    if (tabId === 'staff') loadDataStaff();
  }

  // Tambahkan event listener untuk perubahan tab
  const tabs = document.querySelectorAll('.tab-button'); 
  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const tabName = this.getAttribute('onclick').split("'")[1]; // Ambil nama tab
      switchTab(tabName); // Panggil fungsi switchTab yang sudah ada
    });
  });

  // Panggil pertama kali untuk inisialisasi (asumsi tab default adalah "staff")
  handleTabSwitch('staff');
});

// Fungsi untuk memuat dropdown dari localStorage
function loadDropdown() {
  const dropdown = document.getElementById('statusDropdown');
  const savedOptions = JSON.parse(localStorage.getItem('statusOptions')) || ['PKWT', 'PKWTT', 'Subcont', 'Internship', 'SPKL'];

  dropdown.innerHTML = `<option value="all">All</option>`; // Default "All"
  savedOptions.forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    dropdown.appendChild(option);
  });
}

// Fungsi untuk memfilter data (tetap sama)
async function filterData() {
  const searchValue = document.getElementById('search').value.trim().toLowerCase();
  const selectedStatus = document.getElementById('statusDropdown').value;

  try {
    // Fetch data staff
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select(
        `id_staff, nik_karyawan, nama_staff, jenis_kelamin, nama_unit, nama_dept, jabatan, level, supervisor, nama_lokasi, link`
      )
      .ilike('nama_staff', `%${searchValue}%`); // Pencarian case-insensitive

    if (staffError) throw staffError;

    // Fetch data riwayat kontrak
    const { data: kontrakData, error: kontrakError } = await supabase
      .from('riwayat_kontrak')
      .select(`id_staff, mulai_bergabung, status_kontrak, awal_kontrak, akhir_kontrak, no_kontrak, masa_kontrak`);

    if (kontrakError) throw kontrakError;

    // Filter data kontrak terbaru
    const latestKontrakData = {};
    kontrakData.forEach((row) => {
      if (
        !latestKontrakData[row.id_staff] || 
        new Date(row.mulai_bergabung) > new Date(latestKontrakData[row.id_staff].mulai_bergabung)
      ) {
        latestKontrakData[row.id_staff] = row;
      }
    });

    // Gabungkan data staff dengan kontrak terbaru
    let filteredStaff = staffData.map((staffRow) => ({
      ...staffRow,
      kontrak: latestKontrakData[staffRow.id_staff] || null,
    }));

    // Filter berdasarkan dropdown, jika dipilih selain 'all'
    if (selectedStatus !== 'all') {
      filteredStaff = filteredStaff.filter((staffRow) => {
        const kontrakRow = staffRow.kontrak;
        return kontrakRow && kontrakRow.status_kontrak === selectedStatus;
      });
    }

    // Jika input nama_staff kosong, abaikan filter nama
    if (searchValue === '') {
      filteredStaff = selectedStatus === 'all' ? staffData : filteredStaff;
    }

    // Render hasil ke tabel
    const staffTableBody = document.getElementById('staff-table-body');
    staffTableBody.innerHTML = '';

    if (filteredStaff.length === 0) {
      staffTableBody.innerHTML = `<tr><td colspan="15">Tidak ada data yang ditemukan</td></tr>`;
      return;
    }

    filteredStaff.forEach((staffRow) => {
      const kontrakRow = staffRow.kontrak;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${staffRow.nik_karyawan}</td>
        <td>${staffRow.nama_staff}</td>
        <td>${staffRow.jenis_kelamin}</td>
        <td>${kontrakRow?.mulai_bergabung || '-'}</td>
        <td>${kontrakRow?.status_kontrak || '-'}</td>
        <td>${kontrakRow?.no_kontrak || '-'}</td>
        <td>${kontrakRow?.masa_kontrak || '-'}</td>        
        <td>${kontrakRow?.awal_kontrak || '-'}</td>
        <td>${kontrakRow?.akhir_kontrak || '-'}</td>
        <td>${staffRow.nama_unit}</td>
        <td>${staffRow.nama_dept}</td>
        <td>${staffRow.jabatan}</td>
        <td>${staffRow.level}</td>
        <td>${staffRow.supervisor}</td>
        <td>${staffRow.nama_lokasi}</td>
        <td>${staffRow.link}</td>
        <td>
          <button class="btn btn-primary btn-edit" data-id="${staffRow.id_staff}"></button>
          <button class="btn btn-danger btn-delete" data-id="${staffRow.id_staff}"></button>
        </td>
      `;
      staffTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error filtering data:', err);
    alert('Gagal memfilter data.');
  }
}

window.loadDropdown = loadDropdown;
window.filterData = filterData;

// Panggil loadDropdown saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadDropdown);


// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadDataStaff);
