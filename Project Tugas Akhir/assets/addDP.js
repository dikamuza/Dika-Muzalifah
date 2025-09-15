// Koneksi ke Supabase
const supabaseUrl = 'https://rvkmdvhhkutoozvdlzqp.supabase.co'; // Ganti dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a21kdmhoa3V0b296dmRsenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODU3OTgsImV4cCI6MjA0Njk2MTc5OH0.9nGITfyx7I_Kw6V7R1QcYjKHQIuGnDa8Rp9oAE-vRp8'; // Ganti dengan API Key Anda
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Fungsi untuk memuat data kontrak
let currentPagePribadi = 1; // Halaman saat ini untuk data pribadi
const rowsPerPagePribadi = 3; // Data per halaman

async function loadDataPribadi() {
  try {
    const offset = (currentPagePribadi - 1) * rowsPerPagePribadi;

    const { data, error, count } = await supabaseClient
      .from('staff')
      .select(
        'id_staff, nama_staff, jenis_kelamin, tempat_lahir, tgl_lahir, status_kawin, warga_negara, agama, tinggi_badan, berat_badan, gol_darah, alamat_rumah, alamat_wali, no_telp_wali, no_telp, no_ktp, no_kk, no_npwp, no_bpjssehat, no_bpjskerja, asuransi_inhealth, no_dplk, nama_bank, no_rekening, email_kantor, email_pribadi, gaji_pokok, tunjangan',
        { count: 'exact' }
      )
      .order('id_staff', { ascending: true })
      .range(offset, offset + rowsPerPagePribadi - 1);

    const tableBody = document.getElementById('data-pribadi-body');
    tableBody.innerHTML = ''; // Reset tabel sebelum memuat data baru

    if (error) throw error;

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="15">Tidak ada data yang tersedia</td></tr>`;
      return;
    }

// Render data ke dalam tabel
data.forEach((row) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${row.nama_staff}</td>
    <td>${row.jenis_kelamin}</td>
    <td>${row.tempat_lahir}</td>
    <td>${row.tgl_lahir}</td>
    <td>${row.status_kawin}</td>
    <td>${row.warga_negara}</td>
    <td>${row.agama}</td>
    <td>${row.tinggi_badan}</td>
    <td>${row.berat_badan}</td>
    <td>${row.gol_darah}</td>
    <td>${row.alamat_rumah}</td>
    <td>${row.alamat_wali}</td>
    <td>${row.no_telp_wali}</td>
    <td>${row.no_telp}</td>
    <td>
      <button class="btn btn-primary btn-edit" data-id="${row.id_staff}"></button>
      <button class="btn btn-danger btn-delete" data-id="${row.id_staff}"></button>
      <button class="btn btn-info btn-detail" data-id="${row.id_staff}"></button>
    </td>
  `;
  tableBody.appendChild(tr);

  // Buat baris detail yang tersembunyi
  const detailRow = document.createElement('tr');
  detailRow.classList.add('detail-row');
  detailRow.style.display = 'none'; // Disembunyikan secara default
  detailRow.innerHTML = `
    <td colspan="15">
      <table class="table table-bordered">
        <tr><th>No. KTP</th><td>${row.no_ktp}</td></tr>
        <tr><th>No. KK</th><td>${row.no_kk}</td></tr>
        <tr><th>No. NPWP</th><td>${row.no_npwp}</td></tr>
        <tr><th>No. BPJS Kesehatan</th><td>${row.no_bpjssehat}</td></tr>
        <tr><th>No. BPJS Ketenagakerjaan</th><td>${row.no_bpjskerja}</td></tr>
        <tr><th>Asuransi Inhealth</th><td>${row.asuransi_inhealth}</td></tr>
        <tr><th>No. DPLK</th><td>${row.no_dplk}</td></tr>
        <tr><th>Nama Bank</th><td>${row.nama_bank}</td></tr>
        <tr><th>No. Rekening</th><td>${row.no_rekening}</td></tr>
        <tr><th>Email Kantor</th><td>${row.email_kantor}</td></tr>
        <tr><th>Email Pribadi</th><td>${row.email_pribadi}</td></tr>
        <tr><th>Gaji Pokok</th><td>${row.gaji_pokok}</td></tr>
        <tr><th>Tunjangan</th><td>${row.tunjangan}</td></tr>
      </table>
    </td>
  `;
  tableBody.appendChild(detailRow);

  // Handle Detail Button Click
  const detailButton = tr.querySelector('.btn-detail');
  detailButton.addEventListener('click', () => {
    // Toggle visibility
    detailRow.style.display = detailRow.style.display === 'none' ? 'table-row' : 'none';
  });
});

    // Menambahkan kontrol navigasi pagination
    const totalPages = Math.ceil(count / rowsPerPagePribadi);
    const paginationContainerPribadi = document.getElementById('pagination-pribadi');
    paginationContainerPribadi.innerHTML = '';

    // Tombol panah kiri
    const prevButtonPribadi = document.createElement('button');
    prevButtonPribadi.innerHTML = '&#9664;'; // Simbol panah kiri
    prevButtonPribadi.classList.add('btn', 'btn-secondary');
    prevButtonPribadi.disabled = currentPagePribadi === 1;
    prevButtonPribadi.onclick = () => {
      if (currentPagePribadi > 1) {
        currentPagePribadi--;
        loadDataPribadi();
      }
    };
    paginationContainerPribadi.appendChild(prevButtonPribadi);

    // Tombol panah kanan
    const nextButtonPribadi = document.createElement('button');
    nextButtonPribadi.innerHTML = '&#9654;'; // Simbol panah kanan
    nextButtonPribadi.classList.add('btn', 'btn-secondary');
    nextButtonPribadi.disabled = currentPagePribadi === totalPages;
    nextButtonPribadi.onclick = () => {
      if (currentPagePribadi < totalPages) {
        currentPagePribadi++;
        loadDataPribadi();
      }
    };
    paginationContainerPribadi.appendChild(nextButtonPribadi);

  } catch (err) {
    console.error('Error fetching personal data:', err);
    alert('Gagal memuat data pribadi.');
  }
}

// Fungsi untuk menambahkan data kontrak
document.getElementById('addRowButton').addEventListener('click', () => {
  const tableBody = document.getElementById('data-pribadi-body');

  // Tambahkan baris kosong untuk input data
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" placeholder="Nama Staff" class="new-nama_staff"></td>
    <td><input type="text" placeholder="Jenis Kelamin" class="new-jenis_kelamin"></td>
    <td><input type="text" placeholder="Tempat Lahir" class="new-tempat_lahir"></td>
    <td><input type="text" placeholder="Tanggal Lahir" class="new-tgl_lahir"></td>
    <td><input type="text" placeholder="Status Kawin" class="new-status_kawin"></td>
    <td><input type="text" placeholder="Warga Negara" class="new-warga_negara"></td>
    <td><input type="text" placeholder="Agama" class="new-agama"></td>
    <td><input type="text" placeholder="Tinggi Badan" class="new-tinggi_badan"></td>
    <td><input type="text" placeholder="Berat Badan" class="new-berat_badan"></td>
    <td><input type="text" placeholder="Golongan Darah" class="new-gol_darah"></td>
    <td><input type="text" placeholder="Alamat Rumah" class="new-alamat_rumah"></td>
    <td><input type="text" placeholder="Alamat Wali" class="new-alamat_wali"></td>
    <td><input type="text" placeholder="No Telp Wali" class="new-no_telp_wali"></td>
    <td><input type="text" placeholder="No Telp" class="new-no_telp"></td>
    <td><input type="text" placeholder="No KTP" class="new-no_ktp"></td>
    <td><input type="text" placeholder="No KK" class="new-no_kk"></td>
    <td><input type="text" placeholder="No NPWP" class="new-no_npwp"></td>
    <td><input type="text" placeholder="No BPJS Kesehatan" class="new-no_bpjssehat"></td>
    <td><input type="text" placeholder="No BPJS Ketenagakerjaan" class="new-no_bpjskerja"></td>
    <td><input type="text" placeholder="No DPLK" class="new-no_dplk"></td>
    <td><input type="text" placeholder="Nama Bank" class="new-nama_bank"></td>
    <td><input type="text" placeholder="No Rekening" class="new-no_rekening"></td>
    <td><input type="text" placeholder="Email Kantor" class="new-email_kantor"></td>
    <td><input type="text" placeholder="Email Pribadi" class="new-email_pribadi"></td>
    <td><input type="text" placeholder="Gaji Pokok" class="new-gaji_pokok"></td>
    <td><input type="text" placeholder="Tunjangan Jabatan" class="new-tunjangan"></td>
    <td><button class="saveRowButton btn btn-success"></button></td>
  `;
  tableBody.appendChild(newRow);
});

// Delegasi Event untuk tombol Simpan, Edit, dan Hapus
document.getElementById('data-pribadi-body').addEventListener('click', async (event) => {
  const target = event.target;

  if (target.classList.contains('saveRowButton')) {
    // Simpan data baru
    const row = target.closest('tr');
    const newData = {
      nama_staff: row.querySelector('.new-nama_staff').value.trim(),
      jenis_kelamin: row.querySelector('.new-jenis_kelamin').value.trim(),
      tempat_lahir: row.querySelector('.new-tempat_lahir').value.trim(),
      tgl_lahir: row.querySelector('.new-tgl_lahir').value.trim(),
      status_kawin: row.querySelector('.new-status_kawin').value.trim(),
      warga_negara: row.querySelector('.new-warga_negara').value.trim(),
      agama: row.querySelector('.new-agama').value.trim(),
      tinggi_badan: row.querySelector('.new-tinggi_badan').value.trim(),
      berat_badan: row.querySelector('.new-berat_badan').value.trim(),
      gol_darah: row.querySelector('.new-gol_darah').value.trim(),
      alamat_rumah: row.querySelector('.new-alamat_rumah').value.trim(),
      alamat_wali: row.querySelector('.new-alamat_wali').value.trim(),
      no_telp_wali: row.querySelector('.new-no_telp_wali').value.trim(),
      no_telp: row.querySelector('.new-no_telp').value.trim(),
      no_ktp: row.querySelector('.new-no_ktp').value.trim(),
      no_kk: row.querySelector('.new-no_kk').value.trim(),
      no_npwp: row.querySelector('.new-no_npwp').value.trim(),
      no_bpjssehat: row.querySelector('.new-no_bpjssehat').value.trim(),
      no_bpjskerja: row.querySelector('.new-no_bpjskerja').value.trim(),
      no_dplk: row.querySelector('.new-no_dplk').value.trim(),
      nama_bank: row.querySelector('.new-nama_bank').value.trim(),
      no_rekening: row.querySelector('.new-no_rekening').value.trim(),
      email_kantor: row.querySelector('.new-email_kantor').value.trim(),
      email_pribadi: row.querySelector('.new-email_pribadi').value.trim(),
      gaji_pokok: row.querySelector('.new-gaji_pokok').value.trim(),
      tunjangan: row.querySelector('.new-tunjangan').value.trim(),
    };

    try {
      const { error } = await supabaseClient.from('staff').insert([newData]);
      if (error) throw error;

      alert('Data berhasil ditambahkan!');
      loadDataPribadi();
    } catch (err) {
      console.error('Error adding data:', err);
      alert('Gagal menambahkan data.');
    }
  } else if (target.classList.contains('btn-edit')) {
    handleEdit(event);
  } else if (target.classList.contains('btn-delete')) {
    handleDeletePribadi(event);
  }
});

// Fungsi untuk handle edit
async function handleEdit(event) {
  const id_staff = event.target.dataset.id;
  const row = event.target.closest('tr');
  const tableBody = document.getElementById('data-pribadi-body');

  // Ambil data dari baris yang akan diedit
  const data = Array.from(row.querySelectorAll('td')).map((cell) =>
    cell.textContent.trim()
  );

  // Hapus baris asli dari tampilan untuk sementara
  row.style.display = 'none';

  // Baris baru untuk input edit
  const newRow = document.createElement('tr');
  const fields = [
    'nama_staff',
    'jenis_kelamin',
    'tempat_lahir',
    'tgl_lahir',
    'status_kawin',
    'warga_negara',
    'agama',
    'tinggi_badan',
    'berat_badan',
    'gol_darah',
    'alamat_rumah',
    'alamat_wali',
    'no_telp_wali',
    'no_telp',
    'no_ktp',
    'no_kk',
    'no_npwp',
    'no_bpjssehat',
    'no_bpjskerja',
    'no_dplk',
    'nama_bank',
    'no_rekening',
    'email_kantor',
    'email_pribadi',
    'gaji_pokok',
    'tunjangan',
  ];

  newRow.innerHTML = fields
    .map(
      (field, index) => `
      <td>
        <input type="text" class="form-control" value="${data[index] || ''}" placeholder="${field.replace('_', ' ').toUpperCase()}">
      </td>
    `
    )
    .join('') +
    `
    <td>
      <button class="btn btn-success btn-save" data-id="${id_staff}"></button>
      <button class="btn btn-secondary btn-cancel"></button>
    </td>
  `;

  // Tambahkan baris baru setelah baris lama
  row.insertAdjacentElement('afterend', newRow);

  // Tombol Simpan
  newRow.querySelector('.btn-save').addEventListener('click', async () => {
    const updatedData = {};
    const inputs = newRow.querySelectorAll('input');

    fields.forEach((field, index) => {
      updatedData[field] = inputs[index].value.trim();
    });

    try {
      const { error } = await supabaseClient
        .from('staff')
        .update(updatedData)
        .eq('id_staff', id_staff);

      if (error) throw error;

      alert('Data berhasil diperbarui.');
      loadDataPribadi();
    } catch (err) {
      console.error('Error updating data:', err);
      alert('Gagal memperbarui data.');
    }
  });

  // Tombol Batal
  newRow.querySelector('.btn-cancel').addEventListener('click', () => {
    newRow.remove();
    row.style.display = ''; // Tampilkan kembali baris asli
  });
}


// Fungsi Delete
async function handleDeletePribadi(event) {
  const id_staff = event.target.dataset.id;

  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    try {
      const { error } = await supabaseClient
        .from('staff')
        .delete()
        .eq('id_staff', id_staff);

      if (error) throw error;

      alert('Data berhasil dihapus.');
      loadDataPribadi();
    } catch (err) {
      console.error('Error deleting data:', err);
      alert('Gagal menghapus data.');
    }
  }
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}


document.addEventListener("DOMContentLoaded", function () {
  // Fungsi untuk memuat elemen pencarian di tab "staff"
  function renderSearchElements() {
    const searchContainer = document.getElementById('search-container');
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '10px';
    searchContainer.style.alignItems = 'center';
    searchContainer.innerHTML = `
      <input type="text" id="search" placeholder="Search by name">
      <select id="statusDropdown"></select>
      <button id="searchButton">Search</button>
    `;

    const searchInput = document.getElementById('search');
    Object.assign(searchInput.style, { padding: '10px', flexGrow: '1' });

    const dropdown = document.getElementById('statusDropdown');
    Object.assign(dropdown.style, { padding: '10px' });

    const searchButton = document.getElementById('searchButton');
    Object.assign(searchButton.style, { padding: '10px 15px', backgroundColor: '#4C9F98', color: '#fff' });

    searchButton.addEventListener('click', filterData);
    loadDropdown();
  }

  // Fungsi untuk memuat elemen pencarian di tab "data-pribadi"
  function renderSearchElementsForPribadi() {
    const searchContainer = document.getElementById('search-container');
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '10px';
    searchContainer.style.alignItems = 'center';
    searchContainer.innerHTML = `
      <input type="text" id="search" placeholder="Search by name">
      <button id="searchButton">Search</button>
    `;

    const searchInput = document.getElementById('search');
    Object.assign(searchInput.style, { padding: '10px', flexGrow: '1' });

    const searchButton = document.getElementById('searchButton');
    Object.assign(searchButton.style, { padding: '10px 15px', backgroundColor: '#4C9F98', color: '#fff' });

    searchButton.addEventListener('click', filterDataPribadi);
  }

  function renderSearchElementsForKeluarga() {
    const searchContainer = document.getElementById('search-container');
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '10px';
    searchContainer.style.alignItems = 'center';
    searchContainer.innerHTML = `
      <input type="text" id="search" placeholder="Search by name">
      <button id="searchButton">Search</button>
    `;

    const searchInput = document.getElementById('search');
    Object.assign(searchInput.style, { padding: '10px', flexGrow: '1' });

    const searchButton = document.getElementById('searchButton');
    Object.assign(searchButton.style, { padding: '10px 15px', backgroundColor: '#4C9F98', color: '#fff' });

    searchButton.addEventListener('click', filterDataKeluarga);
  }

  function renderSearchElementsForPendidikan() {
    const searchContainer = document.getElementById('search-container');
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '10px';
    searchContainer.style.alignItems = 'center';
    searchContainer.innerHTML = `
      <input type="text" id="search" placeholder="Search by name">
      <button id="searchButton">Search</button>
    `;

    const searchInput = document.getElementById('search');
    Object.assign(searchInput.style, { padding: '10px', flexGrow: '1' });

    const searchButton = document.getElementById('searchButton');
    Object.assign(searchButton.style, { padding: '10px 15px', backgroundColor: '#4C9F98', color: '#fff' });

    searchButton.addEventListener('click', filterDataPendidikan);
  }

  // Fungsi untuk mengatur visibilitas elemen berdasarkan tab
  function handleTabSwitch(tabName) {
    const searchContainer = document.getElementById('search-container');
    if (tabName === 'staff') {
      renderSearchElements();
    } else if (tabName === 'data-pribadi') {
      renderSearchElementsForPribadi();
    } else if (tabName === 'data-keluarga') {
      renderSearchElementsForKeluarga();
    } else if (tabName === 'data-pendidikan') {
      renderSearchElementsForPendidikan();
    } else {
      searchContainer.style.display = 'none';
    }
  }

  // Fungsi untuk memfilter data di tab "data-pribadi"
  async function filterDataPribadi() {
    const searchValue = document.getElementById('search').value.trim().toLowerCase();

    try {
      const { data, error } = await supabaseClient
        .from('staff')
        .select(
          'id_staff, nama_staff, jenis_kelamin, tempat_lahir, tgl_lahir, status_kawin, warga_negara, agama, tinggi_badan, berat_badan, gol_darah, alamat_rumah, alamat_wali, no_telp_wali, no_telp, gaji_pokok, tunjangan'
        )
        .ilike('nama_staff', `%${searchValue}%`);

      if (error) throw error;

      const tableBody = document.getElementById('data-pribadi-body');
      tableBody.innerHTML = '';

      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="15">Tidak ada data yang ditemukan</td></tr>`;
        return;
      }

      data.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.nama_staff}</td>
          <td>${row.jenis_kelamin}</td>
          <td>${row.tempat_lahir}</td>
          <td>${row.tgl_lahir}</td>
          <td>${row.status_kawin}</td>
          <td>${row.warga_negara}</td>
          <td>${row.agama}</td>
          <td>${row.tinggi_badan}</td>
          <td>${row.berat_badan}</td>
          <td>${row.gol_darah}</td>
          <td>${row.alamat_rumah}</td>
          <td>${row.alamat_wali}</td>
          <td>${row.no_telp_wali}</td>
          <td>${row.no_telp}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${row.id_staff}"></button>
            <button class="btn btn-danger btn-delete" data-id="${row.id_staff}"></button>
            <button class="btn btn-info btn-detail" data-id="${row.id_staff}"></button>
          </td>
        `;
        tableBody.appendChild(tr);

      // Handle Detail Button Click
      const detailButton = tr.querySelector('.btn-detail');
      detailButton.addEventListener('click', async () => {
        const detailData = {
          no_ktp: row.no_ktp,
          no_kk: row.no_kk,
          no_npwp: row.no_npwp,
          no_bpjssehat: row.no_bpjssehat,
          no_bpjskerja: row.no_bpjskerja,
          asuransi_inhealth: row.asuransi_inhealth,
          no_dplk: row.no_dplk,
          nama_bank: row.nama_bank,
          no_rekening: row.no_rekening,
          email_kantor: row.email_kantor,
          email_pribadi: row.email_pribadi,
          gaji_pokok: row.gaji_pokok,
          tunjangan: row.tunjangan
        };

        // Render detail data
        let detailHTML = `
          <tr>
            <th>No. KTP</th>
            <td>${detailData.no_ktp}</td>
          </tr>
          <tr>
            <th>No. KK</th>
            <td>${detailData.no_kk}</td>
          </tr>
          <tr>
            <th>No. NPWP</th>
            <td>${detailData.no_npwp}</td>
          </tr>
          <tr>
            <th>No. BPJS Kesehatan</th>
            <td>${detailData.no_bpjssehat}</td>
          </tr>
          <tr>
            <th>No. BPJS Ketenagakerjaan</th>
            <td>${detailData.no_bpjskerja}</td>
          </tr>
          <tr>
            <th>Asuransi Inhealth</th>
            <td>${detailData.asuransi_inhealth}</td>
          </tr>
          <tr>
            <th>No. DPLK</th>
            <td>${detailData.no_dplk}</td>
          </tr>
          <tr>
            <th>Nama Bank</th>
            <td>${detailData.nama_bank}</td>
          </tr>
          <tr>
            <th>No. Rekening</th>
            <td>${detailData.no_rekening}</td>
          </tr>
          <tr>
            <th>Email Kantor</th>
            <td>${detailData.email_kantor}</td>
          </tr>
          <tr>
            <th>Email Pribadi</th>
            <td>${detailData.email_pribadi}</td>
          </tr>
          <tr>
            <th>Gaji Pokok</th>
            <td>${detailData.gaji_pokok}</td>
          </tr>
          <tr>
            <th>Tunjangan</th>
            <td>${detailData.tunjangan}</td>
          </tr>
        `;

        // Create a new row for the details
        const detailsRow = document.createElement('tr');
        detailsRow.innerHTML = `<td colspan="15"><table class="table table-bordered">${detailHTML}</table></td>`;
        tableBody.appendChild(detailsRow);
      });

      });
    } catch (err) {
      console.error('Error filtering personal data:', err);
      alert('Gagal memfilter data pribadi.');
    }
  }

  let currentPageKeluarga = 1; // Halaman saat ini
  const rowsPerPageKeluarga = 3; // Jumlah data per halaman
  
  async function filterDataKeluarga() {
    const searchValue = document.getElementById('search').value.trim().toLowerCase();
    const offset = (currentPageKeluarga - 1) * rowsPerPageKeluarga;
  
    try {
      const { data, error, count } = await supabaseClient
        .from('staff')
        .select(
          'id_staff, nama_staff, nama_istri_suami, gender_suami_istri, tgl_lahir_keluarga, pekerjaan, pendidikan_terakhir, nama_anak, nama_ibu_kandung',
          { count: 'exact' }
        )
        .ilike('nama_staff', `%${searchValue}%`)
        .order('id_staff', { ascending: true })
        .range(offset, offset + rowsPerPageKeluarga - 1);
  
      if (error) throw error;
  
      const tableBody = document.getElementById('data-keluarga-body');
      tableBody.innerHTML = '';
  
      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="15">Tidak ada data yang ditemukan</td></tr>`;
        return;
      }
  
      // Render data ke dalam tabel
      data.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.nama_staff}</td>
          <td>${row.nama_istri_suami}</td>
          <td>${row.gender_suami_istri}</td>
          <td>${row.tgl_lahir_keluarga}</td>
          <td>${row.pendidikan_terakhir}</td>
          <td>${row.pekerjaan}</td>
          <td>${row.nama_anak}</td>
          <td>${row.nama_ibu_kandung}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${row.id_staff}"></button>
            <button class="btn btn-danger btn-delete" data-id="${row.id_staff}"></button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
  
      // Menambahkan kontrol navigasi pagination
      const totalPages = Math.ceil(count / rowsPerPageKeluarga);
      const paginationContainerKeluarga = document.getElementById('pagination-keluarga');
      paginationContainerKeluarga.innerHTML = '';
  
      // Tombol panah kiri
      const prevButtonKeluarga = document.createElement('button');
      prevButtonKeluarga.innerHTML = '&#9664;'; // Simbol panah kiri
      prevButtonKeluarga.classList.add('btn', 'btn-secondary');
      prevButtonKeluarga.disabled = currentPageKeluarga === 1;
      prevButtonKeluarga.onclick = () => {
        if (currentPageKeluarga > 1) {
          currentPageKeluarga--;
          filterDataKeluarga();
        }
      };
      paginationContainerKeluarga.appendChild(prevButtonKeluarga);
  
      // Tombol panah kanan
      const nextButtonKeluarga = document.createElement('button');
      nextButtonKeluarga.innerHTML = '&#9654;'; // Simbol panah kanan
      nextButtonKeluarga.classList.add('btn', 'btn-secondary');
      nextButtonKeluarga.disabled = currentPageKeluarga === totalPages;
      nextButtonKeluarga.onclick = () => {
        if (currentPageKeluarga < totalPages) {
          currentPageKeluarga++;
          filterDataKeluarga();
        }
      };
      paginationContainerKeluarga.appendChild(nextButtonKeluarga);
  
    } catch (err) {
      console.error('Error filtering personal data:', err);
      alert('Gagal memfilter data pribadi.');
    }
  }  

  let currentPagePendidikan = 1; // Halaman saat ini untuk data pendidikan
  const rowsPerPagePendidikan = 3; // Jumlah data per halaman untuk data pendidikan
  
  async function filterDataPendidikan() {
    const searchValue = document.getElementById('search').value.trim().toLowerCase();
    const offset = (currentPagePendidikan - 1) * rowsPerPagePendidikan;
  
    try {
      const { data, error, count } = await supabaseClient
        .from('staff')
        .select(
          'id_staff, nama_staff, lembaga, status_lulus, tahun_lulus, gelar, tempat_lulus, tingkat_pendidikan',
          { count: 'exact' }
        )
        .ilike('nama_staff', `%${searchValue}%`)
        .order('id_staff', { ascending: true })
        .range(offset, offset + rowsPerPagePendidikan - 1);
  
      if (error) throw error;
  
      const tableBody = document.getElementById('data-pendidikan-body');
      tableBody.innerHTML = ''; // Reset tabel sebelum memuat data baru
  
      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="15">Tidak ada data yang ditemukan</td></tr>`;
        return;
      }
  
      // Render data ke dalam tabel
      data.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.nama_staff}</td>
          <td>${row.lembaga}</td>
          <td>${row.tingkat_pendidikan}</td>
          <td>${row.status_lulus}</td>
          <td>${row.tahun_lulus}</td>
          <td>${row.gelar}</td>
          <td>${row.tempat_lulus}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${row.id_staff}"></button>
            <button class="btn btn-danger btn-delete" data-id="${row.id_staff}"></button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
  
      // Menambahkan kontrol navigasi pagination
      const totalPages = Math.ceil(count / rowsPerPagePendidikan);
      const paginationContainerPendidikan = document.getElementById('pagination-pendidikan');
      paginationContainerPendidikan.innerHTML = '';
  
      // Tombol panah kiri
      const prevButtonPendidikan = document.createElement('button');
      prevButtonPendidikan.innerHTML = '&#9664;'; // Simbol panah kiri
      prevButtonPendidikan.classList.add('btn', 'btn-secondary');
      prevButtonPendidikan.disabled = currentPagePendidikan === 1;
      prevButtonPendidikan.onclick = () => {
        if (currentPagePendidikan > 1) {
          currentPagePendidikan--;
          filterDataPendidikan();
        }
      };
      paginationContainerPendidikan.appendChild(prevButtonPendidikan);
  
      // Tombol panah kanan
      const nextButtonPendidikan = document.createElement('button');
      nextButtonPendidikan.innerHTML = '&#9654;'; // Simbol panah kanan
      nextButtonPendidikan.classList.add('btn', 'btn-secondary');
      nextButtonPendidikan.disabled = currentPagePendidikan === totalPages;
      nextButtonPendidikan.onclick = () => {
        if (currentPagePendidikan < totalPages) {
          currentPagePendidikan++;
          filterDataPendidikan();
        }
      };
      paginationContainerPendidikan.appendChild(nextButtonPendidikan);
  
    } catch (err) {
      console.error('Error filtering data pendidikan:', err);
      alert('Gagal memfilter data pendidikan.');
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

    handleTabSwitch(tabId);

    if (tabId === 'staff') loadDataStaff();
    else if (tabId === 'data-pribadi') loadDataPribadi();
    else if (tabId === 'data-keluarga') filterDataKeluarga();
    else if (tabId === 'data-pendidikan') filterDataPendidikan();
  }

  // Event listener untuk tab
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const tabName = this.getAttribute('onclick').split("'")[1];
      switchTab(tabName);
    });
  });

  // Inisialisasi default tab
  handleTabSwitch('staff');
});


// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadDataPribadi);
