// Koneksi ke Supabase
const supabaseUrl = 'https://rvkmdvhhkutoozvdlzqp.supabase.co'; // Ganti dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a21kdmhoa3V0b296dmRsenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODU3OTgsImV4cCI6MjA0Njk2MTc5OH0.9nGITfyx7I_Kw6V7R1QcYjKHQIuGnDa8Rp9oAE-vRp8'; // Ganti dengan API Key Anda
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let currentPageAset = 1; // Halaman saat ini untuk data aset
const rowsPerPageAset = 5; // Data per halaman

async function loadDataAset() {
  try {
    const offset = (currentPageAset - 1) * rowsPerPageAset;

    const namaKategoriFilter = getQueryParam('nama_kategori'); // Ambil parameter nama_kategori dari URL
    const { data, error, count } = await supabaseClient
      .from('staff')
      .select(`
        id_staff,
        nik_karyawan,
        nama_staff,
        aset_staff (
          id_asetstaff,
          kode_aset,
          no_kategori,
          nama_kategori,
          nama_aset,
          kondisi,
          detail,
          dokumentasi
        )
      `, {
        count: 'exact',})
      .order('id_staff', { ascending: true })
      .range(offset, offset + rowsPerPageAset);  

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Debugging: cek isi data
    console.log('Data fetched from Supabase:', data);

    const dataAsetBody = document.getElementById('aset-kantor-body');
    dataAsetBody.innerHTML = ''; // Reset tabel

    if (!data || data.length === 0) {
      dataAsetBody.innerHTML = `<tr><td colspan="10">Tidak ada data aset yang tersedia</td></tr>`;
      return;
    }

    const filteredData = namaKategoriFilter
      ? data.filter((staff) => 
          staff.aset_staff.some((aset) => aset.nama_kategori === namaKategoriFilter)
        )
      : data;

    if (filteredData.length === 0) {
      dataAsetBody.innerHTML = `<tr><td colspan="10">Tidak ada data dengan kategori "${namaKategoriFilter}"</td></tr>`;
      return;
    }

    filteredData.forEach((staff) => {
      const { id_staff, nik_karyawan, nama_staff, aset_staff } = staff;

      if (!aset_staff || aset_staff.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
          <td>${nik_karyawan}</td>
          <td>${nama_staff}</td>
          <td colspan="7" class="text-center">Tidak ada aset yang terdaftar</td>
          <td>
            <button class="btn btn-success btn-tambah-aset" data-id="${id_staff}"></button>
          </td>
        `;
        dataAsetBody.appendChild(emptyRow);
        return;
      }

      // Baris utama (data staff + aset pertama)
      const staffRow = document.createElement('tr');
      staffRow.innerHTML = `
        <td>${nik_karyawan}</td>
        <td>${nama_staff}</td>
        <td>${aset_staff[0]?.kode_aset || '-'}</td>
        <td>${aset_staff[0]?.no_kategori || '-'}</td>
        <td>${aset_staff[0]?.nama_kategori || '-'}</td>
        <td>${aset_staff[0]?.nama_aset || '-'}</td>
        <td>${aset_staff[0]?.kondisi || '-'}</td>
        <td>${aset_staff[0]?.detail || '-'}</td>
        <td>${aset_staff[0]?.dokumentasi || '-'}</td>
        <td>
          <button class="btn btn-primary btn-edit" data-id="${aset_staff[0]?.id_asetstaff}"></button>
          <button class="btn btn-danger btn-delete" data-id="${aset_staff[0]?.id_asetstaff}"></button>
          <button class="btn btn-success btn-tambah-aset" data-id="${id_staff}"></button>
          <button class="btn btn-info btn-detail" data-id="${id_staff}"></button>
        </td>
      `;
      dataAsetBody.appendChild(staffRow);

      aset_staff.slice(1).forEach((aset) => {
        const asetRow = document.createElement('tr');
        asetRow.classList.add('hidden-details');
        asetRow.dataset.staffId = id_staff;
        asetRow.style.display = 'none';
        asetRow.innerHTML = `
          <td>${nik_karyawan || '-'}</td>
          <td>${nama_staff || '-'}</td>
          <td>${aset.kode_aset || '-'}</td>
          <td>${aset.no_kategori || '-'}</td>
          <td>${aset.nama_kategori || '-'}</td>
          <td>${aset.nama_aset || '-'}</td>
          <td>${aset.kondisi || '-'}</td>
          <td>${aset.detail || '-'}</td>
          <td>${aset.dokumentasi || '-'}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${aset.id_asetstaff}"></button>
          </td>
        `;
        dataAsetBody.appendChild(asetRow);
      });
    });

    // Menambahkan kontrol navigasi pagination
    const totalPages = Math.ceil(count / rowsPerPageAset);
    const paginationContainerAset = document.getElementById('pagination-aset');
    paginationContainerAset.innerHTML = '';

    // Tombol panah kiri
    const prevButtonAset = document.createElement('button');
    prevButtonAset.innerHTML = '&#9664;'; // Simbol panah kiri
    prevButtonAset.classList.add('btn', 'btn-secondary');
    prevButtonAset.disabled = currentPageAset === 1;
    prevButtonAset.onclick = () => {
      if (currentPageAset > 1) {
        currentPageAset--;
        loadDataAset();
      }
    };
    paginationContainerAset.appendChild(prevButtonAset);

    // Tombol panah kanan
    const nextButtonAset = document.createElement('button');
    nextButtonAset.innerHTML = '&#9654;'; // Simbol panah kanan
    nextButtonAset.classList.add('btn', 'btn-secondary');
    nextButtonAset.disabled = currentPageAset === totalPages;
    nextButtonAset.onclick = () => {
      if (currentPageAset < totalPages) {
        currentPageAset++;
        loadDataAset();
      }
    };
    paginationContainerAset.appendChild(nextButtonAset);

  } catch (err) {
    console.error('Error fetching aset data:', err);
    alert('Gagal memuat data aset.');
  }
}

// Fungsi untuk menampilkan/menyembunyikan detail aset berdasarkan staffId
function toggleDetails(staffId) {
  const rows = document.querySelectorAll(`.hidden-details[data-staff-id="${staffId}"]`);
  rows.forEach((row) => {
    // Toggle visibility
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
  });
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Delegasi Event untuk tombol Tambah Aset
document.getElementById('aset-kantor-body').addEventListener('click', async (event) => {
  const target = event.target;

  if (target.classList.contains('btn-tambah-aset')) {
    const id_staff = target.dataset.id;

    // Cari baris induk (parent row)
    const parentRow = target.closest('tr');
    if (!parentRow) {
      console.error('Parent row not found.');
      return;
    }

    // Pastikan ada elemen saudara sebelum mengakses `nextElementSibling`
    const asetRows = parentRow.nextElementSibling
      ? Array.from(parentRow.nextElementSibling.parentNode.children)
          .filter(row => row.classList.contains('aset-row') && row.dataset.staffId === id_staff)
      : [];

    // Buat elemen baris baru
    const newRow = document.createElement('tr');
    newRow.classList.add('new-aset-row');
    newRow.dataset.staffId = id_staff;
    newRow.innerHTML = `
      <td>-</td>
      <td>-</td>
      <td><input type="text" class="new-kode_aset" placeholder="Kode Aset"></td>
      <td><input type="text" class="new-no_kategori" placeholder="No Kategori"></td>
      <td><input type="text" class="new-nama_kategori" placeholder="Nama Kategori"></td>
      <td><input type="text" class="new-nama_aset" placeholder="Nama Aset"></td>
      <td><input type="text" class="new-kondisi" placeholder="Kondisi"></td>
      <td><input type="text" class="new-detail" placeholder="Detail"></td>
      <td><input type="text" class="new-dokumentasi" placeholder="Dokumentasi"></td>
      <td>
        <button class="btn btn-success btn-save-aset" data-id="${id_staff}"></button>
        <button class="btn btn-secondary btn-cancel-aset"></button>
      </td>
    `;

    // Sisipkan baris baru di bawah parentRow atau setelah baris aset yang sudah ada
    const firstAsetRow = asetRows.length > 0 ? asetRows[0] : parentRow.nextSibling;
    parentRow.parentNode.insertBefore(newRow, firstAsetRow);

    // Event Simpan Aset
    newRow.querySelector('.btn-save-aset').addEventListener('click', async () => {
      const kodeAset = newRow.querySelector('.new-kode_aset').value.trim();
      const noKategori = newRow.querySelector('.new-no_kategori').value.trim();
      const namaKategori = newRow.querySelector('.new-nama_kategori').value.trim();
      const namaAset = newRow.querySelector('.new-nama_aset').value.trim();
      const kondisi = newRow.querySelector('.new-kondisi').value.trim();
      const detail = newRow.querySelector('.new-detail').value.trim();
      const dokumentasi = newRow.querySelector('.new-dokumentasi').value.trim();

      if (!kodeAset || !noKategori || !namaKategori || !namaAset) {
        alert('Harap isi semua data yang wajib.');
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from('aset_staff')
          .insert([{ id_staff, kode_aset: kodeAset, no_kategori: noKategori, nama_kategori: namaKategori, nama_aset: namaAset, kondisi, detail, dokumentasi }])
          .select();

        if (error) throw error;

        alert('Aset berhasil ditambahkan.');

        // Perbarui baris baru menjadi data definitif
        const savedRow = data[0];
        newRow.innerHTML = `
          <td>${savedRow.kode_aset}</td>
          <td>${savedRow.no_kategori}</td>
          <td>${savedRow.nama_kategori}</td>
          <td>${savedRow.nama_aset}</td>
          <td>${savedRow.kondisi}</td>
          <td>${savedRow.detail}</td>
          <td>${savedRow.dokumentasi}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${savedRow.id_asetstaff}"></button>
          </td>
        `;

        loadDataAset(); // Memastikan tabel disegarkan
      } catch (err) {
        console.error('Error adding asset data:', err);
        alert('Gagal menambahkan data aset.');
      }
    });

    // Event Batal Aset
    newRow.querySelector('.btn-cancel-aset').addEventListener('click', () => {
      newRow.remove();
    });
  }
});

// Handle tombol Edit untuk Aset
document.getElementById('aset-kantor-body').addEventListener('click', async (event) => {
  const target = event.target;

  if (target.classList.contains('btn-edit')) {
    const id_asetstaff = target.dataset.id;

    // Ambil baris terkait
    const row = target.closest('tr');
    const cells = row.querySelectorAll('td');

    // Tentukan kolom yang dapat diedit
    const fields = [
      'kode_aset',
      'no_kategori',
      'nama_kategori',
      'nama_aset',
      'kondisi',
      'detail',
      'dokumentasi',
    ];

    fields.forEach((field, index) => {
      const cell = cells[index + 2]; // Offset kolom untuk baris utama
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

      fields.forEach((field, index) => {
        const input = row.querySelector(`.input-${field}`);
        updatedData[field] = input.value.trim();
      });

      try {
        const { error } = await supabaseClient
          .from('aset_staff')
          .update(updatedData)
          .eq('id_asetstaff', id_asetstaff);

        if (error) throw error;

        alert('Data aset berhasil diperbarui.');

        fields.forEach((field, index) => {
          const cell = cells[index + 2]; // Offset kolom untuk baris utama
          cell.textContent = updatedData[field] || '-';
        });

        target.textContent = 'Edit';
        target.classList.remove('btn-save');
        target.classList.add('btn-edit');
        target.removeEventListener('click', saveHandler);
      } catch (err) {
        console.error('Error updating asset data:', err);
        alert('Gagal memperbarui data aset.');
      }
    };

    target.addEventListener('click', saveHandler, { once: true });
  }

  // Handle tombol Hapus Aset
  if (target.classList.contains('btn-delete')) {
    const id_asetstaff = target.dataset.id;

    if (confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
      try {
        const { error } = await supabaseClient
          .from('aset_staff')
          .delete()
          .eq('id_asetstaff', id_asetstaff);

        if (error) throw error;

        alert('Aset berhasil dihapus.');
        loadDataAset(); // Memastikan tabel disegarkan
      } catch (err) {
        console.error('Error deleting asset data:', err);
        alert('Gagal menghapus data aset.');
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
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

  function renderSearchElementsForAset() {
    const searchContainer = document.getElementById('search-container');
  
    // Atur gaya kontainer
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '10px';
    searchContainer.style.alignItems = 'center';
  
    // Tambahkan elemen pencarian
    searchContainer.innerHTML = `
      <input type="text" id="searchNamaStaff" placeholder="Search by staff name">
      <input type="text" id="searchNamaAset" placeholder="Search by asset name">
      <button id="searchButtonAset">Search</button>
    `;
  
    // Gaya untuk input teks
    ['searchNamaStaff', 'searchNamaAset'].forEach((id) => {
      const input = document.getElementById(id);
      Object.assign(input.style, {
        padding: '10px',
        border: '1px solid rgba(66, 92, 90, 0.6)',
        borderRadius: '5px',
        color: '#425C5A',
        flexGrow: '1',
      });
    });
  
    // Gaya untuk tombol
    const searchButton = document.getElementById('searchButtonAset');
    Object.assign(searchButton.style, {
      padding: '10px 15px',
      backgroundColor: '#4C9F98',
      border: 'none',
      borderRadius: '5px',
      color: '#ffffff',
      cursor: 'pointer',
    });
  
    // Tambahkan event listener untuk tombol Search
    searchButton.addEventListener('click', filterDataAset);
  }
  
  function renderSearchElementsForTraining() {
    const searchContainer = document.getElementById('search-container');
  
    // Atur gaya kontainer
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '10px';
    searchContainer.style.alignItems = 'center';
  
    // Tambahkan elemen pencarian
    searchContainer.innerHTML = `
      <input type="text" id="searchNamaStaff" placeholder="Search by staff name">
      <input type="text" id="searchJenisTraining" placeholder="Search by training name">
      <button id="searchButtonTraining">Search</button>
    `;
  
    // Gaya untuk input teks
    ['searchNamaStaff', 'searchJenisTraining'].forEach((id) => {
      const input = document.getElementById(id);
      Object.assign(input.style, {
        padding: '10px',
        border: '1px solid rgba(66, 92, 90, 0.6)',
        borderRadius: '5px',
        color: '#425C5A',
        flexGrow: '1',
      });
    });
  
    // Gaya untuk tombol
    const searchButton = document.getElementById('searchButtonTraining');
    Object.assign(searchButton.style, {
      padding: '10px 15px',
      backgroundColor: '#4C9F98',
      border: 'none',
      borderRadius: '5px',
      color: '#ffffff',
      cursor: 'pointer',
    });
  
    // Tambahkan event listener untuk tombol Search
    searchButton.addEventListener('click', filterDataTraining);
  }

  // Fungsi untuk memfilter data aset
  async function filterDataAset() {
    try {
      const searchNamaStaff = document.getElementById('searchNamaStaff').value.trim();
      const searchNamaAset = document.getElementById('searchNamaAset').value.trim();
  
      const { data, error } = await supabaseClient
        .from('staff')
        .select(`
          id_staff,
          nik_karyawan,
          nama_staff,
          aset_staff (
            id_asetstaff,
            kode_aset,
            no_kategori,
            nama_kategori,
            nama_aset,
            kondisi,
            detail,
            dokumentasi
          )
        `)
        .order('id_staff', { ascending: true });
  
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
  
      const dataAsetBody = document.getElementById('aset-kantor-body');
      dataAsetBody.innerHTML = '';
  
      const filteredData = data.filter((staff) => {
        const matchesStaff = searchNamaStaff
          ? staff.nama_staff.toLowerCase().includes(searchNamaStaff.toLowerCase())
          : true;
        const matchesAset = searchNamaAset
          ? staff.aset_staff.some((aset) =>
              aset.nama_aset.toLowerCase().includes(searchNamaAset.toLowerCase())
            )
          : true;
        return matchesStaff && matchesAset;
      });
  
      if (filteredData.length === 0) {
        dataAsetBody.innerHTML = `<tr><td colspan="10">Tidak ada data yang sesuai dengan pencarian</td></tr>`;
        return;
      }
  
      filteredData.forEach((staff) => {
        const { id_staff, nik_karyawan, nama_staff, aset_staff } = staff;
  
        if (!aset_staff || aset_staff.length === 0) {
          const emptyRow = document.createElement('tr');
          emptyRow.innerHTML = `
            <td>${nik_karyawan}</td>
            <td>${nama_staff}</td>
            <td colspan="7" class="text-center">Tidak ada aset yang terdaftar</td>
            <td>
              <button class="btn btn-success btn-tambah-aset" data-id="${id_staff}"></button>
            </td>
          `;
          dataAsetBody.appendChild(emptyRow);
          return;
        }
  
        const staffRow = document.createElement('tr');
        staffRow.innerHTML = `
          <td>${nik_karyawan}</td>
          <td>${nama_staff}</td>
          <td>${aset_staff[0]?.kode_aset || '-'}</td>
          <td>${aset_staff[0]?.no_kategori || '-'}</td>
          <td>${aset_staff[0]?.nama_kategori || '-'}</td>
          <td>${aset_staff[0]?.nama_aset || '-'}</td>
          <td>${aset_staff[0]?.kondisi || '-'}</td>
          <td>${aset_staff[0]?.detail || '-'}</td>
          <td>${aset_staff[0]?.dokumentasi || '-'}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${aset_staff[0]?.id_asetstaff}"></button>
            <button class="btn btn-danger btn-delete" data-id="${aset_staff[0]?.id_asetstaff}"></button>
            <button class="btn btn-success btn-tambah-aset" data-id="${id_staff}"></button>
            <button class="btn btn-info btn-detail" data-id="${id_staff}"></button>            
          </td>
        `;
        dataAsetBody.appendChild(staffRow);
  
        aset_staff.slice(1).forEach((aset) => {
          const asetRow = document.createElement('tr');
          asetRow.classList.add('hidden-details');
          asetRow.dataset.staffId = id_staff;
          asetRow.style.display = 'none';
          asetRow.innerHTML = `
            <td>${nik_karyawan || '-'}</td>
            <td>${nama_staff || '-'}</td>
            <td>${aset.kode_aset || '-'}</td>
            <td>${aset.no_kategori || '-'}</td>
            <td>${aset.nama_kategori || '-'}</td>
            <td>${aset.nama_aset || '-'}</td>
            <td>${aset.kondisi || '-'}</td>
            <td>${aset.detail || '-'}</td>
            <td>${aset.dokumentasi || '-'}</td>
            <td>
              <button class="btn btn-primary btn-edit" data-id="${aset.id_asetstaff}"></button>
            </td>
          `;
          dataAsetBody.appendChild(asetRow);
        });
      });
    } catch (err) {
      console.error('Error filtering aset data:', err);
      alert('Gagal memfilter data aset.');
    }
  }

  async function filterDataTraining() {
    try {
      const searchNamaStaff = document.getElementById('searchNamaStaff').value.trim();
      const searchJenisTraining = document.getElementById('searchJenisTraining').value.trim();
  
      const { data, error } = await supabaseClient
        .from('staff')
        .select(`
          id_staff,
          nik_karyawan,
          nama_staff,
          training (
            id_training,
            kode_training,
            jenis_training,
            kegiatan_training,
            topik_training,
            lembaga_penyelenggara,
            tgl_mulai,
            tgl_selesai,
            tempat_pelaksanaan,
            sertifikat,
            biaya
          )
        `)
        .order('id_staff', { ascending: true });
  
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
  
      const dataTrainingBody = document.getElementById('training-body');
      dataTrainingBody.innerHTML = ''; // Reset tabel
  
      const filteredData = data.filter((staff) => {
        const matchesStaff = searchNamaStaff
          ? staff.nama_staff?.toLowerCase().includes(searchNamaStaff.toLowerCase())
          : true;
  
        const matchesTraining = searchJenisTraining
          ? staff.training?.some((training) =>
              training.jenis_training?.toLowerCase().includes(searchJenisTraining.toLowerCase())
            )
          : true;
  
        return matchesStaff && matchesTraining;
      });
  
      if (filteredData.length === 0) {
        dataTrainingBody.innerHTML = `<tr><td colspan="10">Tidak ada data yang sesuai dengan pencarian</td></tr>`;
        return;
      }
  
      filteredData.forEach((staff) => {
        const { id_staff, nik_karyawan, nama_staff, training } = staff;
  
        // Jika tidak ada data training, tampilkan baris kosong
        if (!training || training.length === 0) {
          const emptyRow = document.createElement('tr');
          emptyRow.innerHTML = `
            <td>${nik_karyawan}</td>
            <td>${nama_staff}</td>
            <td colspan="10" class="text-center">Tidak ada data training</td>
            <td>
              <button class="btn btn-success btn-add-training" data-id="${id_staff}"></button>
            </td>
          `;
          dataTrainingBody.appendChild(emptyRow);
          return;
        }
  
        // Baris utama (data staff + training pertama)
        const staffRow = document.createElement('tr');
        staffRow.innerHTML = `
          <td>${nik_karyawan}</td>
          <td>${nama_staff}</td>
          <td>${training[0]?.kode_training || '-'}</td>
          <td>${training[0]?.jenis_training || '-'}</td>
          <td>${training[0]?.kegiatan_training || '-'}</td>
          <td>${training[0]?.topik_training || '-'}</td>
          <td>${training[0]?.lembaga_penyelenggara || '-'}</td>
          <td>${training[0]?.tgl_mulai || '-'}</td>
          <td>${training[0]?.tgl_selesai || '-'}</td>
          <td>${training[0]?.tempat_pelaksanaan || '-'}</td>
          <td>${training[0]?.sertifikat || '-'}</td>
          <td>${training[0]?.biaya || '-'}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${training[0]?.id_training}"></button>
            <button class="btn btn-danger btn-delete" data-id="${training[0]?.id_training}"></button>
            <button class="btn btn-success btn-add-training" data-id="${id_staff}"></button>
            <button class="btn btn-info btn-detail" data-id="${id_staff}"></button>
          </td>
        `;
        dataTrainingBody.appendChild(staffRow);
  
        // Baris tambahan untuk training kedua dan seterusnya
        training.slice(1).forEach((train) => {
          const trainingRow = document.createElement('tr');
          trainingRow.classList.add('hidden-details');
          trainingRow.dataset.staffId = id_staff;
          trainingRow.style.display = 'none';
          trainingRow.innerHTML = `
            <td>${nik_karyawan || '-'}</td>
            <td>${nama_staff || '-'}</td>
            <td>${train.kode_training || '-'}</td>
            <td>${train.jenis_training || '-'}</td>
            <td>${train.kegiatan_training || '-'}</td>
            <td>${train.topik_training || '-'}</td>
            <td>${train.lembaga_penyelenggara || '-'}</td>
            <td>${train.tgl_mulai || '-'}</td>
            <td>${train.tgl_selesai || '-'}</td>
            <td>${train.tempat_pelaksanaan || '-'}</td>
            <td>${train.sertifikat || '-'}</td>
            <td>${train.biaya || '-'}</td>
            <td>
              <button class="btn btn-primary btn-edit" data-id="${train.id_training}"></button>
              <button class="btn btn-danger btn-delete" data-id="${train.id_training}"></button>
            </td>
          `;
          dataTrainingBody.appendChild(trainingRow);
        });
      });
  
      // Event listener untuk tombol Detail
      document.querySelectorAll('.btn-detail').forEach((button) => {
        button.addEventListener('click', (event) => {
          const staffId = event.target.getAttribute('data-id');
          toggleDetails(staffId);
        });
      });
    } catch (err) {
      console.error('Error fetching training data:', err);
      alert('Gagal memuat data training.');
    }
  }    
  
  // Fungsi untuk menangani pergantian tab
  function handleTabSwitch(tabName) {
    const searchContainer = document.getElementById('search-container');
    searchContainer.innerHTML = '';
  
    if (tabName === 'aset-kantor') {
      renderSearchElementsForAset();
    } else if (tabName === 'kontrak') {
      renderSearchElements();
    } else if (tabName === 'training') {
      renderSearchElementsForTraining();
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
    else if (tabId === 'aset-kantor') renderSearchElementsForAset();
    else if (tabId === 'training') renderSearchElementsForTraining();
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

// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadDataAset);
