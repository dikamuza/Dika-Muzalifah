// Koneksi ke Supabase
const supabaseUrl = 'https://rvkmdvhhkutoozvdlzqp.supabase.co'; // Ganti dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a21kdmhoa3V0b296dmRsenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODU3OTgsImV4cCI6MjA0Njk2MTc5OH0.9nGITfyx7I_Kw6V7R1QcYjKHQIuGnDa8Rp9oAE-vRp8'; // Ganti dengan API Key Anda
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let currentPageKontrak = 1; // Halaman saat ini untuk data aset
const rowsPerPageKontrak = 3; // Data per halaman

async function loadDataKontrak() {
  try {
    const offset = (currentPageKontrak - 1) * rowsPerPageKontrak;

    const { data, error, count } = await supabaseClient
      .from('staff')
      .select(`
        id_staff,
        nik_karyawan,
        nama_staff,
        nama_unit,
        nama_dept,
        jabatan,
        level,
        supervisor,
        gaji_pokok,
        tunjangan,
        nama_lokasi,
        riwayat_kontrak!riwayat_kontrak_id_staff_fkey (
          id_kontrak,
          mulai_bergabung,
          status_kontrak,
          awal_kontrak,
          akhir_kontrak,
          no_kontrak,
          masa_kontrak
        )
      `, { count: 'exact' })
      .order('id_staff', { ascending: true })
      .range(offset, offset + rowsPerPageKontrak - 1);

    if (error) {
      console.error('Supabase query error:', error); // Log error Supabase
      alert('Terjadi kesalahan saat mengambil data kontrak.');
      return;
    }

    const dataKontrakBody = document.getElementById('data-kontrak-body');
    dataKontrakBody.innerHTML = ''; // Reset tabel

    if (!data || data.length === 0) {
      dataKontrakBody.innerHTML = `<tr><td colspan="16">Tidak ada data yang tersedia</td></tr>`;
      return;
    }

    data.forEach((staff) => {
      const {
        id_staff,
        nik_karyawan,
        nama_staff,
        nama_unit,
        nama_dept,
        jabatan,
        level,
        supervisor,
        gaji_pokok,
        tunjangan,
        nama_lokasi,
        riwayat_kontrak,
      } = staff;

      // Cek apakah riwayat_kontrak ada dan valid
      const kontrakList = riwayat_kontrak || [];
      kontrakList.sort(
        (a, b) => new Date(b.mulai_bergabung) - new Date(a.mulai_bergabung)
      );

      // Baris utama (data staff + riwayat kontrak pertama)
      const staffRow = document.createElement('tr');
      staffRow.innerHTML = `
        <td>${nik_karyawan}</td>
        <td>${nama_staff}</td>
        <td>${kontrakList[0]?.mulai_bergabung || '-'}</td>
        <td>${kontrakList[0]?.status_kontrak || '-'}</td>
        <td>${kontrakList[0]?.no_kontrak || '-'}</td>        
        <td>${kontrakList[0]?.masa_kontrak || '-'}</td>                
        <td>${kontrakList[0]?.awal_kontrak || '-'}</td>
        <td>${kontrakList[0]?.akhir_kontrak || '-'}</td>
        <td>${nama_unit || '-'}</td>
        <td>${nama_dept || '-'}</td>
        <td>${jabatan || '-'}</td>
        <td>${level || '-'}</td>
        <td>${supervisor || '-'}</td>
        <td>${gaji_pokok || '-'}</td>
        <td>${tunjangan || '-'}</td>
        <td>${nama_lokasi || '-'}</td>
        <td>
          <button class="btn btn-primary btn-edit" data-id="${
            kontrakList[0]?.id_kontrak
          }"></button>
          <button class="btn btn-danger btn-delete" data-id="${id_staff}"></button>
          <button class="btn btn-success btn-tambah-riwayat" data-id="${id_staff}"></button>
          <button class="btn btn-info btn-detail" data-id="${id_staff}"></button>
        </td>
      `;
      dataKontrakBody.appendChild(staffRow);

      // Baris tambahan untuk riwayat kontrak kedua dan seterusnya
      kontrakList.slice(1).forEach((kontrak) => {
        const kontrakRow = document.createElement('tr');
        kontrakRow.classList.add('hidden-details');
        kontrakRow.dataset.staffId = id_staff; // Tandai dengan ID staff
        kontrakRow.style.display = 'none'; // Sembunyikan pada awalnya
        kontrakRow.innerHTML = `
          <td>${nik_karyawan}</td>
          <td>${nama_staff}</td>
          <td>${kontrak.mulai_bergabung || '-'}</td>
          <td>${kontrak.status_kontrak || '-'}</td>
          <td>${kontrak.no_kontrak || '-'}</td>
          <td>${kontrak.masa_kontrak || '-'}</td>                    
          <td>${kontrak.awal_kontrak || '-'}</td>
          <td>${kontrak.akhir_kontrak || '-'}</td>
          <td>${nama_unit || '-'}</td>
          <td>${nama_dept || '-'}</td>
          <td>${jabatan || '-'}</td>
          <td>${level || '-'}</td>
          <td>${supervisor || '-'}</td>
          <td>${gaji_pokok || '-'}</td>
          <td>${tunjangan || '-'}</td>
          <td>${nama_lokasi || '-'}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${kontrak.id_kontrak}"></button>
          </td>
        `;
        dataKontrakBody.appendChild(kontrakRow);
      });
    });

    // Menambahkan kontrol navigasi pagination
    const totalPages = Math.ceil(count / rowsPerPageKontrak);
    const paginationContainerKontrak = document.getElementById('pagination-kontrak');
    paginationContainerKontrak.innerHTML = '';

    // Tombol panah kiri
    const prevButtonKontrak = document.createElement('button');
    prevButtonKontrak.innerHTML = '&#9664;'; // Simbol panah kiri
    prevButtonKontrak.classList.add('btn', 'btn-secondary');
    prevButtonKontrak.disabled = currentPageKontrak === 1;
    prevButtonKontrak.onclick = () => {
      if (currentPageKontrak > 1) {
        currentPageKontrak--;
        loadDataKontrak();
      }
    };
    paginationContainerKontrak.appendChild(prevButtonKontrak);

    // Tombol panah kanan
    const nextButtonKontrak = document.createElement('button');
    nextButtonKontrak.innerHTML = '&#9654;'; // Simbol panah kanan
    nextButtonKontrak.classList.add('btn', 'btn-secondary');
    nextButtonKontrak.disabled = currentPageKontrak === totalPages;
    nextButtonKontrak.onclick = () => {
      if (currentPageKontrak < totalPages) {
        currentPageKontrak++;
        loadDataKontrak();
      }
    };
    paginationContainerKontrak.appendChild(nextButtonKontrak);

    // Tambahkan event listener untuk tombol detail
    document.querySelectorAll('.btn-detail').forEach((button) => {
      button.addEventListener('click', (event) => {
        const staffId = event.target.getAttribute('data-id');
        toggleDetails(staffId);
      });
    });
  } catch (err) {
    console.error('Error fetching kontrak data:', err);
    alert('Gagal memuat data kontrak.');
  }
}


// Fungsi untuk menampilkan/menyembunyikan detail riwayat kontrak berdasarkan staffId
function toggleDetails(staffId) {
  const rows = document.querySelectorAll(`.hidden-details[data-staff-id="${staffId}"]`);
  rows.forEach((row) => {
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
  });
}

// Delegasi Event untuk tombol Tambah Riwayat
document.getElementById('data-kontrak-body').addEventListener('click', async (event) => {
  const target = event.target;

  if (target.classList.contains('btn-tambah-riwayat')) {
    const id_staff = target.dataset.id;

    // Tambahkan baris baru di atas semua baris riwayat kontrak
    const parentRow = target.closest('tr');
    const kontrakRows = Array.from(parentRow.nextElementSibling ? parentRow.nextElementSibling.parentNode.children : [])
      .filter(row => row.classList.contains('kontrak-row') && row.dataset.staffId === id_staff);

    // Buat elemen baris baru
    const newRow = document.createElement('tr');
    newRow.classList.add('new-kontrak-row');
    newRow.dataset.staffId = id_staff;
    newRow.innerHTML = `
      <td>-</td>
      <td>-</td>
      <td><input type="text" class="new-mulai_bergabung" placeholder="Mulai Bergabung"></td>
      <td><input type="text" class="new-status_kontrak" placeholder="Status Kontrak"></td>
      <td><input type="text" class="new-no_kontrak" placeholder="No Kontrak"></td>
      <td><input type="text" class="new-masa_kontrak" placeholder="Masa Kontrak"></td>      
      <td><input type="text" class="new-awal_kontrak" placeholder="Awal Kontrak"></td>
      <td><input type="text" class="new-akhir_kontrak" placeholder="Akhir Kontrak"></td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>
        <button class="btn btn-success btn-save-riwayat" data-id="${id_staff}"></button>
        <button class="btn btn-secondary btn-cancel-riwayat"></button>
      </td>
    `;

    // Sisipkan baris baru di atas semua baris kontrak
    const firstKontrakRow = kontrakRows.length > 0 ? kontrakRows[0] : parentRow.nextSibling;
    parentRow.parentNode.insertBefore(newRow, firstKontrakRow);

    // Event Simpan Riwayat
    newRow.querySelector('.btn-save-riwayat').addEventListener('click', async () => {
      const mulaiBergabung = newRow.querySelector('.new-mulai_bergabung').value.trim();
      const statusKontrak = newRow.querySelector('.new-status_kontrak').value.trim();
      const awalKontrak = newRow.querySelector('.new-awal_kontrak').value.trim();
      const akhirKontrak = newRow.querySelector('.new-akhir_kontrak').value.trim();
      const noKontrak = newRow.querySelector('.new-no_kontrak').value.trim();
      const masaKontrak = newRow.querySelector('.new-masa_kontrak').value.trim();

      try {
        const { data, error } = await supabaseClient
          .from('riwayat_kontrak')
          .insert([{ id_staff, mulai_bergabung: mulaiBergabung, status_kontrak: statusKontrak, awal_kontrak: awalKontrak, akhir_kontrak: akhirKontrak, no_kontrak: noKontrak, masa_kontrak: masaKontrak }])
          .select();

        if (error) throw error;

        alert('Riwayat kontrak berhasil ditambahkan.');

        // Perbarui baris baru menjadi data definitif
        const savedRow = data[0];
        newRow.innerHTML = `
          <td>${savedRow.mulai_bergabung}</td>
          <td>${savedRow.status_kontrak}</td>
          <td>${savedRow.no_kontrak}</td>
          <td>${savedRow.masa_kontrak}</td>          
          <td>${savedRow.awal_kontrak}</td>
          <td>${savedRow.akhir_kontrak}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${savedRow.id_kontrak}"></button>
          </td>
        `;

        // Pastikan baris tetap di posisi atas
        parentRow.parentNode.insertBefore(newRow, firstKontrakRow);

        loadDataKontrak(); // Memastikan tabel disegarkan
      } catch (err) {
        console.error('Error adding riwayat kontrak:', err);
        alert('Gagal menambahkan riwayat kontrak.');
      }
    });

    // Event Batal Riwayat
    newRow.querySelector('.btn-cancel-riwayat').addEventListener('click', () => {
      newRow.remove();
    });
  }
});

document.getElementById('data-kontrak-body').addEventListener('click', async (event) => {
  const target = event.target;

// Handle tombol Edit
if (target.classList.contains('btn-edit')) {
  const id_kontrak = target.dataset.id;

  // Ambil baris terkait
  const row = target.closest('tr');
  const cells = row.querySelectorAll('td');

  // Tentukan apakah baris ini adalah baris tambahan (tidak memiliki rowspan)
  const isAdditionalRow = row.classList.contains('kontrak-row');

  // Tentukan kolom yang dapat diedit
  const fields = [
    'mulai_bergabung',
    'status_kontrak',
    'no_kontrak',
    'masa_kontrak',    
    'awal_kontrak',
    'akhir_kontrak',
  ];

  // Logika untuk menentukan offset kolom
  fields.forEach((field, index) => {
    const cell = isAdditionalRow ? cells[index] : cells[index + 2]; // Offset kolom untuk baris utama
    const currentValue = cell.textContent.trim();
    cell.innerHTML = `<input type="text" class="input-${field}" value="${currentValue}">`;
  });

  // Ubah tombol Edit menjadi Simpan
  target.textContent = '';
  target.classList.remove('btn-edit');
  target.classList.add('btn-save');

  // Handle tombol Simpan
  const saveHandler = async () => {
    const updatedData = {};

    // Ambil nilai baru dari input
    fields.forEach((field, index) => {
      const input = row.querySelector(`.input-${field}`);
      updatedData[field] = input.value.trim();
    });

    try {
      const { error } = await supabaseClient
        .from('riwayat_kontrak')
        .update(updatedData)
        .eq('id_kontrak', id_kontrak);

      if (error) throw error;

      alert('Data berhasil diperbarui.');

      // Kembalikan input menjadi teks
      fields.forEach((field, index) => {
        const cell = isAdditionalRow ? cells[index] : cells[index + 2];
        cell.textContent = updatedData[field] || '-';
      });

      // Kembalikan tombol menjadi Edit
      target.textContent = 'Edit';
      target.classList.remove('btn-save');
      target.classList.add('btn-edit');

      // Hapus event listener setelah berhasil
      target.removeEventListener('click', saveHandler);
    } catch (err) {
      console.error('Error updating data:', err);
      alert('Gagal memperbarui data.');
    }
  };

  // Tambahkan event listener untuk Simpan
  target.addEventListener('click', saveHandler, { once: true });
}

  // Handle tombol Hapus
  if (target.classList.contains('btn-delete')) {
    const id_staff = target.dataset.id;

    if (confirm('Apakah Anda yakin ingin menghapus riwayat kontrak satu per satu hingga data staff terhapus?')) {
      try {
        // Ambil data riwayat_kontrak
        const { data: kontrakData, error } = await supabaseClient
          .from('riwayat_kontrak')
          .select('id_kontrak')
          .eq('id_staff', id_staff);

        if (error) throw error;

        // Hapus semua riwayat kontrak satu per satu
        for (const kontrak of kontrakData) {
          const { error: deleteError } = await supabaseClient
            .from('riwayat_kontrak')
            .delete()
            .eq('id_kontrak', kontrak.id_kontrak);

          if (deleteError) throw deleteError;
        }

        alert('Riwayat kontrak berhasil dihapus.');
        location.reload();
      } catch (err) {
        console.error('Error deleting riwayat kontrak:', err);
        alert('Gagal menghapus riwayat kontrak.');
      }
    }
  }
});


document.addEventListener("DOMContentLoaded", function () {
  // Fungsi untuk memuat elemen pencarian
  function renderSearchElements() {
    const searchContainer = document.getElementById('search-container');
  
    // Atur gaya kontainer
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '10px';
    searchContainer.style.alignItems = 'center';
  
    // Tambahkan elemen pencarian dan dropdown status
    searchContainer.innerHTML = `
      <input type="text" id="search" placeholder="Search by name">
      <select id="statusDropdown">
        <option value="" disabled selected>Select status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button id="searchButton">Search</button>
    `;
  
    // Gaya untuk input teks (search dan contract number)
    ['search'].forEach((id) => {
      const input = document.getElementById(id);
      Object.assign(input.style, {
        padding: '10px',
        border: '1px solid rgba(66, 92, 90, 0.6)',
        borderRadius: '5px',
        color: '#425C5A',
        flexGrow: '1', // Agar input meluas sesuai ruang yang tersedia
      });
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
    if (tabName === 'kontrak') {
      // Render elemen pencarian hanya di tab kontrak
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

    if (tabId === 'kontrak') loadDataKontrak();
  }

  // Tambahkan event listener untuk perubahan tab
  const tabs = document.querySelectorAll('.tab-button'); 
  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const tabName = this.getAttribute('onclick').split("'")[1]; // Ambil nama tab
      switchTab(tabName); // Panggil fungsi switchTab yang sudah ada
    });
  });

  // Panggil pertama kali untuk inisialisasi (asumsi tab default adalah "kontrak")
  handleTabSwitch('kontrak');
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

// Fungsi untuk memfilter data (kontrak) berdasarkan pencarian
async function filterData() {
  const searchValue = document.getElementById('search').value.trim().toLowerCase();
  const selectedStatus = document.getElementById('statusDropdown').value;

  try {
    // Fetch data staff dengan riwayat kontrak menggunakan foreign key
    const { data, error } = await supabaseClient
      .from('staff')
      .select(`
        id_staff,
        nik_karyawan,
        nama_staff,
        nama_unit,
        nama_dept,
        jabatan,
        level,
        supervisor,
        gaji_pokok,
        tunjangan,
        nama_lokasi,
        riwayat_kontrak!riwayat_kontrak_id_staff_fkey (
          id_kontrak,
          mulai_bergabung,
          status_kontrak,
          awal_kontrak,
          akhir_kontrak,
          no_kontrak,
          masa_kontrak
        )
      `)
      .ilike('nama_staff', `%${searchValue}%`) // Pencarian berdasarkan nama staff
      .order('id_staff', { ascending: true });

    if (error) throw error;

    // Filter data berdasarkan status kontrak
    const filteredData = data.filter((staff) => {
      const kontrakData = staff.riwayat_kontrak || [];
      return kontrakData.some(
        (kontrak) => selectedStatus === 'all' || kontrak.status_kontrak === selectedStatus
      );
    });

    // Render hasil filter
    const dataKontrakBody = document.getElementById('data-kontrak-body');
    dataKontrakBody.innerHTML = ''; // Reset tabel

    if (filteredData.length === 0) {
      dataKontrakBody.innerHTML = `<tr><td colspan="16">Tidak ada data yang ditemukan</td></tr>`;
      return;
    }

    filteredData.forEach((staff) => {
      const {
        id_staff,
        nik_karyawan,
        nama_staff,
        nama_unit,
        nama_dept,
        jabatan,
        level,
        supervisor,
        gaji_pokok,
        tunjangan,
        nama_lokasi,
        riwayat_kontrak,
      } = staff;

      const kontrakList = riwayat_kontrak || [];
      kontrakList.sort(
        (a, b) => new Date(b.mulai_bergabung) - new Date(a.mulai_bergabung)
      );

      // Baris utama (kontrak terbaru)
      const kontrak = kontrakList[0];
      const staffRow = document.createElement('tr');
      staffRow.innerHTML = `
        <td>${nik_karyawan}</td>
        <td>${nama_staff}</td>
        <td>${kontrak?.mulai_bergabung || '-'}</td>
        <td>${kontrak?.status_kontrak || '-'}</td>
        <td>${kontrak?.no_kontrak || '-'}</td>
        <td>${kontrak?.masa_kontrak || '-'}</td>        
        <td>${kontrak?.awal_kontrak || '-'}</td>
        <td>${kontrak?.akhir_kontrak || '-'}</td>
        <td>${nama_unit || '-'}</td>
        <td>${nama_dept || '-'}</td>
        <td>${jabatan || '-'}</td>
        <td>${level || '-'}</td>
        <td>${supervisor || '-'}</td>
        <td>${gaji_pokok || '-'}</td>
        <td>${tunjangan || '-'}</td>
        <td>${nama_lokasi || '-'}</td>
        <td>
          <button class="btn btn-primary btn-edit" data-id="${kontrak?.id_kontrak}"></button>
          <button class="btn btn-danger btn-delete" data-id="${id_staff}"></button>
          <button class="btn btn-success btn-tambah-riwayat" data-id="${id_staff}"></button>
          <button class="btn btn-info btn-detail" data-id="${id_staff}"></button>
        </td>
      `;
      dataKontrakBody.appendChild(staffRow);

      // Tambahkan baris untuk kontrak lainnya
      kontrakList.slice(1).forEach((kontrak) => {
        const kontrakRow = document.createElement('tr');
        kontrakRow.classList.add('hidden-details');
        kontrakRow.dataset.staffId = id_staff;
        kontrakRow.style.display = 'none'; // Default hidden
        kontrakRow.innerHTML = `
          <td>${nik_karyawan}</td>
          <td>${nama_staff}</td>
          <td>${kontrak.mulai_bergabung || '-'}</td>
          <td>${kontrak.status_kontrak || '-'}</td>
          <td>${kontrak.no_kontrak || '-'}</td>
          <td>${kontrak.masa_kontrak || '-'}</td>          
          <td>${kontrak.awal_kontrak || '-'}</td>
          <td>${kontrak.akhir_kontrak || '-'}</td>
          <td>${nama_unit || '-'}</td>
          <td>${nama_dept || '-'}</td>
          <td>${jabatan || '-'}</td>
          <td>${level || '-'}</td>
          <td>${supervisor || '-'}</td>
          <td>${gaji_pokok || '-'}</td>
          <td>${tunjangan || '-'}</td>
          <td>${nama_lokasi || '-'}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${kontrak.id_kontrak}"></button>
          </td>
        `;
        dataKontrakBody.appendChild(kontrakRow);
      });
    });

    // Delegasi Event untuk tombol Edit, Hapus, dan Tambah Riwayat
// Event Listener untuk tombol Tambah Riwayat
document.getElementById('data-kontrak-body').addEventListener('click', async (event) => {
  const target = event.target;

  // Handle tombol Tambah Riwayat
  if (target.classList.contains('btn-tambah-riwayat')) {
    const id_staff = target.dataset.id;

    // Ambil baris staff terkait
    const parentRow = target.closest('tr');
    if (!parentRow) return; // Jika baris tidak ditemukan, keluar

    // Buat elemen baris baru untuk input riwayat kontrak
    const newRow = document.createElement('tr');
    newRow.classList.add('new-kontrak-row');
    newRow.dataset.staffId = id_staff;
    newRow.innerHTML = `
      <td>-</td>
      <td>-</td>
      <td><input type="text" class="new-mulai_bergabung" placeholder="Mulai Bergabung"></td>
      <td><input type="text" class="new-status_kontrak" placeholder="Status Kontrak"></td>
      <td><input type="text" class="new-no_kontrak" placeholder="No Kontrak"></td>
      <td><input type="text" class="new-masa_kontrak" placeholder="Masa Kontrak"></td>      
      <td><input type="text" class="new-awal_kontrak" placeholder="Awal Kontrak"></td>
      <td><input type="text" class="new-akhir_kontrak" placeholder="Akhir Kontrak"></td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>
        <button class="btn btn-success btn-save-riwayat" data-id="${id_staff}"></button>
        <button class="btn btn-secondary btn-cancel-riwayat"></button>
      </td>
    `;

    // Pastikan elemen baru ditambahkan di bawah baris parent
    const parentTableBody = parentRow.parentNode;
    parentTableBody.insertBefore(newRow, parentRow.nextSibling); // Menyisipkan baris baru tepat setelah baris staff

    // Event Simpan Riwayat
    newRow.querySelector('.btn-save-riwayat').addEventListener('click', async () => {
      const mulaiBergabung = newRow.querySelector('.new-mulai_bergabung').value.trim();
      const statusKontrak = newRow.querySelector('.new-status_kontrak').value.trim();
      const awalKontrak = newRow.querySelector('.new-awal_kontrak').value.trim();
      const akhirKontrak = newRow.querySelector('.new-akhir_kontrak').value.trim();
      const noKontrak = newRow.querySelector('.new-no_kontrak').value.trim();
      const masaKontrak = newRow.querySelector('.new-masa_kontrak').value.trim();

      try {
        const { data, error } = await supabaseClient
          .from('riwayat_kontrak')
          .insert([{ 
            id_staff, 
            mulai_bergabung: mulaiBergabung, 
            status_kontrak: statusKontrak, 
            no_kontrak: noKontrak, 
            masa_kontrak: masaKontrak,
            awal_kontrak: awalKontrak, 
            akhir_kontrak: akhirKontrak 
          }])
          .select();

        if (error) throw error;

        alert('Riwayat kontrak berhasil ditambahkan.');

        // Perbarui baris baru menjadi data definitif
        const savedRow = data[0];
        newRow.innerHTML = `
          <td>${savedRow.mulai_bergabung}</td>
          <td>${savedRow.status_kontrak}</td>
          <td>${savedRow.no_kontrak}</td>
          <td>${savedRow.masa_kontrak}</td>          
          <td>${savedRow.awal_kontrak}</td>
          <td>${savedRow.akhir_kontrak}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${savedRow.id_kontrak}"></button>
          </td>
        `;

        // Segarkan tampilan data riwayat kontrak
        loadDataKontrak(); // Fungsi untuk memuat ulang data dan memastikan tampilan diperbarui
      } catch (err) {
        console.error('Error adding riwayat kontrak:', err);
        alert('Gagal menambahkan riwayat kontrak.');
      }
    });

    // Event Batal Riwayat
    newRow.querySelector('.btn-cancel-riwayat').addEventListener('click', () => {
      newRow.remove(); // Menghapus baris baru jika batal
    });
  }

      // Handle tombol Edit
      if (target.classList.contains('btn-edit')) {
        const id_kontrak = target.dataset.id;

        // Ambil baris terkait
        const row = target.closest('tr');
        const cells = row.querySelectorAll('td');

        // Tentukan apakah baris ini adalah baris tambahan (tidak memiliki rowspan)
        const isAdditionalRow = row.classList.contains('kontrak-row');

        // Tentukan kolom yang dapat diedit
        const fields = [
          'mulai_bergabung',
          'status_kontrak',
          'no_kontrak',
          'masa_kontrak',          
          'awal_kontrak',
          'akhir_kontrak',
        ];

        // Logika untuk menentukan offset kolom
        fields.forEach((field, index) => {
          const cell = isAdditionalRow ? cells[index] : cells[index + 2]; // Offset kolom untuk baris utama
          const currentValue = cell.textContent.trim();
          cell.innerHTML = `<input type="text" class="input-${field}" value="${currentValue}">`;
        });

        // Ubah tombol Edit menjadi Simpan
        target.textContent = 'Simpan';
        target.classList.remove('btn-edit');
        target.classList.add('btn-save');

        // Handle tombol Simpan
        const saveHandler = async () => {
          const updatedData = {};

          // Ambil nilai baru dari input
          fields.forEach((field, index) => {
            const input = row.querySelector(`.input-${field}`);
            updatedData[field] = input.value.trim();
          });

          try {
            const { error } = await supabaseClient
              .from('riwayat_kontrak')
              .update(updatedData)
              .eq('id_kontrak', id_kontrak);

            if (error) throw error;

            alert('Data berhasil diperbarui.');

            // Kembalikan input menjadi teks
            fields.forEach((field, index) => {
              const cell = isAdditionalRow ? cells[index] : cells[index + 2];
              cell.textContent = updatedData[field] || '-';
            });

            // Kembalikan tombol menjadi Edit
            target.textContent = 'Edit';
            target.classList.remove('btn-save');
            target.classList.add('btn-edit');

            // Hapus event listener setelah berhasil
            target.removeEventListener('click', saveHandler);
          } catch (err) {
            console.error('Error updating data:', err);
            alert('Gagal memperbarui data.');
          }
        };

        // Tambahkan event listener untuk Simpan
        target.addEventListener('click', saveHandler, { once: true });
      }

      // Handle tombol Hapus
      if (target.classList.contains('btn-delete')) {
        const id_staff = target.dataset.id;

        if (confirm('Apakah Anda yakin ingin menghapus riwayat kontrak satu per satu hingga data staff terhapus?')) {
          try {
            // Ambil data riwayat_kontrak
            const { data: kontrakData, error } = await supabaseClient
              .from('riwayat_kontrak')
              .select('id_kontrak')
              .eq('id_staff', id_staff);

            if (error) throw error;

            // Hapus semua riwayat kontrak satu per satu
            for (const kontrak of kontrakData) {
              const { error: deleteError } = await supabaseClient
                .from('riwayat_kontrak')
                .delete()
                .eq('id_kontrak', kontrak.id_kontrak);

              if (deleteError) throw deleteError;
            }

            alert('Riwayat kontrak berhasil dihapus.');
            location.reload();
          } catch (err) {
            console.error('Error deleting riwayat kontrak:', err);
            alert('Gagal menghapus riwayat kontrak.');
          }
        }
      }
    });
  } catch (err) {
    console.error('Error filtering data:', err);
    alert('Gagal memuat data.');
  }
}

window.loadDropdown = loadDropdown;
window.filterData = filterData;

// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadDataKontrak);
