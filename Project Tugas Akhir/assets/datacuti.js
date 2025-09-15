// Koneksi ke Supabase
const supabaseUrl = 'https://rvkmdvhhkutoozvdlzqp.supabase.co'; // Ganti dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a21kdmhoa3V0b296dmRsenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODU3OTgsImV4cCI6MjA0Njk2MTc5OH0.9nGITfyx7I_Kw6V7R1QcYjKHQIuGnDa8Rp9oAE-vRp8'; // Ganti dengan API Key Anda
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Variabel global untuk status kontrak yang aktif
let activeTab = 'PKWT';
let currentPage = 1;
const rowsPerPage = 3;

// Fungsi untuk mengganti tab
function switchTab(tabName) {
  activeTab = tabName;
  currentPage = 1; // Reset ke halaman pertama
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    if (button.textContent === tabName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  loadDataCuti();
}

window.switchTab = switchTab;

async function loadDataCuti() {
  try {
    const { data, error } = await supabaseClient
      .from('staff')
      .select(`
        id_staff,
        nik_karyawan,
        nama_staff,
        jabatan,
        nama_dept,
        riwayat_kontrak!riwayat_kontrak_id_staff_fkey (
          id_kontrak,
          mulai_bergabung,
          status_kontrak
        ),
        riwayat_cuti!riwayat_cuti_id_staff_fkey (
          id_cuti,
          hak_cuti,
          cuti_tahunan,
          cuti_bersama,
          sisa_cuti,
          tahun,
          link_lampiran,
          catatan
        )
      `)
      .order('id_staff', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Filter data berdasarkan status kontrak aktif
    const filteredData = data.filter(staff => {
      if (!staff.riwayat_kontrak || staff.riwayat_kontrak.length === 0) return false;
      staff.riwayat_kontrak.sort((a, b) => new Date(b.mulai_bergabung) - new Date(a.mulai_bergabung));
      return staff.riwayat_kontrak[0]?.status_kontrak === activeTab;
    });

    // Pagination setup
    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    const dataCutiBody = document.getElementById('table-body');
    dataCutiBody.innerHTML = '';

    if (paginatedData.length === 0) {
      dataCutiBody.innerHTML = `<tr><td colspan="14">Tidak ada data yang tersedia</td></tr>`;
      return;
    }

    paginatedData.forEach(staff => {
      const { id_staff, nik_karyawan, nama_staff, jabatan, nama_dept, riwayat_kontrak, riwayat_cuti } = staff;
      riwayat_cuti.sort((a, b) => b.tahun - a.tahun);

      const staffRow = document.createElement('tr');
      staffRow.innerHTML = `
        <td>${nik_karyawan}</td>
        <td>${nama_staff}</td>
        <td>${riwayat_kontrak[0]?.mulai_bergabung || '-'}</td>
        <td>${riwayat_kontrak[0]?.status_kontrak || '-'}</td>        
        <td>${jabatan}</td>
        <td>${nama_dept}</td>
        <td>${riwayat_cuti[0]?.hak_cuti || '-'}</td>
        <td>${riwayat_cuti[0]?.cuti_tahunan || '-'}</td>
        <td>${riwayat_cuti[0]?.cuti_bersama || '-'}</td>
        <td>${riwayat_cuti[0]?.sisa_cuti || '-'}</td>
        <td>${riwayat_cuti[0]?.tahun || '-'}</td>
        <td>${riwayat_cuti[0]?.catatan || '-'}</td>
        <td>${riwayat_cuti[0]?.link_lampiran || '-'}</td>
        <td>
          <button class="btn btn-primary btn-edit" data-id="${riwayat_cuti[0]?.id_cuti}"></button>
          <button class="btn btn-danger btn-delete" data-id="${riwayat_cuti[0]?.id_cuti}"></button>
          <button class="btn btn-success btn-tambah-cuti" data-id="${id_staff}"></button>
          <button class="btn btn-info btn-detail" data-id="${id_staff}"></button>
        </td>
      `;
      dataCutiBody.appendChild(staffRow);
    });

    // Menambahkan kontrol navigasi pagination
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
        loadDataCuti();
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
        loadDataCuti();
      }
    };
    paginationContainer.appendChild(nextButton);

  } catch (err) {
    console.error('Error fetching data:', err);
    alert('Gagal memuat data.');
  }
}

// Panggil fungsi awal
loadDataCuti();


// Fungsi untuk menampilkan/menyembunyikan detail riwayat cuti berdasarkan staffId
function toggleDetails(staffId) {
  const rows = document.querySelectorAll(`.hidden-details[data-staff-id="${staffId}"]`);
  rows.forEach(row => {
    // Toggle visibility
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
  });
}

// Delegasi Event untuk tombol Tambah Cuti
document.getElementById('table-body').addEventListener('click', async (event) => {
  const target = event.target;

  // Fungsi untuk menghitung otomatis sisa cuti
  const calculateSisaCuti = (hakCuti, cutiTahunan, cutiBersama) => {
    return parseFloat(cutiTahunan || 0) + parseFloat(cutiBersama || 0) - parseFloat(hakCuti || 0);
  };

  if (target.classList.contains('btn-tambah-cuti')) {
    const id_staff = target.dataset.id;

    const parentRow = target.closest('tr');
    if (!parentRow) return;

    const newRow = document.createElement('tr');
    newRow.classList.add('new-cuti-row');
    newRow.dataset.staffId = id_staff;

    newRow.innerHTML = `
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td><input type="number" class="new-hak_cuti" placeholder="Hak Cuti"></td>
      <td><input type="number" class="new-cuti_tahunan" placeholder="Cuti Tahunan"></td>
      <td><input type="number" class="new-cuti_bersama" placeholder="Cuti Bersama"></td>
      <td><input type="number" class="new-sisa_cuti" placeholder="Sisa Cuti" disabled></td>
      <td><input type="text" class="new-tahun" placeholder="Tahun"></td>
      <td><input type="text" class="new-catatan" placeholder="Catatan"></td>
      <td><input type="text" class="new-link_lampiran" placeholder="Link Lampiran"></td>
      <td>
        <button class="btn btn-success btn-save-cuti" data-id="${id_staff}"></button>
        <button class="btn btn-secondary btn-cancel-cuti"></button>
      </td>
    `;

    parentRow.parentNode.insertBefore(newRow, parentRow.nextSibling);

    const hakCutiInput = newRow.querySelector('.new-hak_cuti');
    const cutiTahunanInput = newRow.querySelector('.new-cuti_tahunan');
    const cutiBersamaInput = newRow.querySelector('.new-cuti_bersama');
    const sisaCutiInput = newRow.querySelector('.new-sisa_cuti');

    // Event untuk menghitung sisa cuti secara otomatis
    const updateSisaCuti = () => {
      const hakCuti = hakCutiInput.value;
      const cutiTahunan = cutiTahunanInput.value;
      const cutiBersama = cutiBersamaInput.value;
      sisaCutiInput.value = calculateSisaCuti(hakCuti, cutiTahunan, cutiBersama);
    };

    hakCutiInput.addEventListener('input', updateSisaCuti);
    cutiTahunanInput.addEventListener('input', updateSisaCuti);
    cutiBersamaInput.addEventListener('input', updateSisaCuti);

    // Simpan data baru ke database
    newRow.querySelector('.btn-save-cuti').addEventListener('click', async () => {
      const id_staff = newRow.dataset.staffId;
      const hakCuti = hakCutiInput.value;
      const cutiTahunan = cutiTahunanInput.value;
      const cutiBersama = cutiBersamaInput.value;
      const sisaCuti = sisaCutiInput.value;
      const tahun = newRow.querySelector('.new-tahun').value;
      const catatan = newRow.querySelector('.new-catatan').value;
      const linkLampiran = newRow.querySelector('.new-link_lampiran').value;

      if (!hakCuti || !cutiTahunan || !cutiBersama || !tahun) {
        alert('Harap isi semua data yang wajib.');
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from('riwayat_cuti')
          .insert([{ id_staff, hak_cuti: hakCuti, cuti_tahunan: cutiTahunan, cuti_bersama: cutiBersama, sisa_cuti: sisaCuti, tahun, catatan, link_lampiran: linkLampiran }]);

        if (error) throw error;

        alert('Data cuti berhasil ditambahkan.');
        newRow.remove();
        loadDataCuti();
      } catch (err) {
        console.error('Error adding cuti data:', err);
        alert('Gagal menambahkan data cuti.');
      }
    });

    newRow.querySelector('.btn-cancel-cuti').addEventListener('click', () => {
      newRow.remove();
    });
  }

  if (target.classList.contains('btn-edit')) {
    const id_cuti = target.dataset.id;
  
    const row = target.closest('tr');
    const cells = row.querySelectorAll('td');
  
    // Kolom yang bisa diedit dan indeksnya
    const fields = ['hak_cuti', 'cuti_tahunan', 'cuti_bersama', 'tahun', 'catatan', 'link_lampiran'];
    const fieldIndices = {
      hak_cuti: 6,
      cuti_tahunan: 7,
      cuti_bersama: 8,
      sisa_cuti: 9, // Kolom ini dibekukan
      tahun: 10,
      catatan: 11,
      link_lampiran: 12,
    };
  
    // Ubah semua kolom menjadi input
    const convertToInput = (field, type = 'text') => {
      const cell = cells[fieldIndices[field]];
      if (cell) {
        const currentValue = cell.textContent.trim();
        cell.innerHTML = `<input type="${type}" class="input-${field}" value="${currentValue}">`;
      }
    };
  
    fields.forEach((field) => convertToInput(field));
  
    // Kolom `sisa_cuti` dibekukan
    const sisaCutiCell = cells[fieldIndices.sisa_cuti];
    if (sisaCutiCell) {
      const sisaCutiValue = sisaCutiCell.textContent.trim();
      sisaCutiCell.innerHTML = `<input type="text" class="input-sisa_cuti" value="${sisaCutiValue}" disabled>`;
    }
  
    // Ubah tombol menjadi tombol "Simpan"
    target.textContent = 'Simpan';
    target.classList.remove('btn-edit');
    target.classList.add('btn-save');
  
    // Fungsi untuk menyimpan perubahan data
    const saveHandler = async () => {
      const updatedData = {};
  
      // Ambil nilai dari input cuti
      fields.forEach((field) => {
        const input = row.querySelector(`.input-${field}`);
        if (input) {
          updatedData[field] = input.value.trim();
        }
      });
  
      // Hitung ulang `sisa_cuti`
      updatedData.sisa_cuti = calculateSisaCuti(
        parseFloat(updatedData.hak_cuti) || 0,
        parseFloat(updatedData.cuti_tahunan) || 0,
        parseFloat(updatedData.cuti_bersama) || 0
      );
  
      // Validasi wajib isi
      if (!updatedData.hak_cuti || !updatedData.tahun) {
        alert('Kolom Hak Cuti dan Tahun wajib diisi.');
        return;
      }
  
      try {
        // Update data riwayat_cuti
        const { error: cutiError } = await supabaseClient
          .from('riwayat_cuti')
          .update(updatedData)
          .eq('id_cuti', id_cuti);
  
        if (cutiError) throw cutiError;
  
        alert('Data cuti berhasil diperbarui.');
        loadDataCuti(); // Refresh data di tabel
  
        // Kembalikan input menjadi teks
        const revertToText = (field, data) => {
          const cell = cells[fieldIndices[field]];
          if (cell) {
            cell.textContent = data[field] || '-';
          }
        };
  
        fields.forEach((field) => revertToText(field, updatedData));
  
        // Kembalikan kolom `sisa_cuti`
        if (sisaCutiCell) {
          sisaCutiCell.textContent = updatedData.sisa_cuti;
        }
  
        // Kembalikan tombol menjadi Edit
        target.textContent = 'Edit';
        target.classList.remove('btn-save');
        target.classList.add('btn-edit');
      } catch (err) {
        console.error('Error updating data:', err);
        alert('Gagal memperbarui data.');
      }
    };
  
    // Tambahkan event listener untuk tombol Simpan
    target.addEventListener('click', saveHandler, { once: true });
  }
  
  
  // Handle tombol Hapus Aset
  if (target.classList.contains('btn-delete')) {
    const id_cuti = target.dataset.id;

    if (confirm('Apakah Anda yakin ingin menghapus riwayat cuti ini?')) {
      try {
        const { error } = await supabaseClient
          .from('riwayat_cuti')
          .delete()
          .eq('id_cuti', id_cuti);

        if (error) throw error;

        alert('Riwayat cuti berhasil dihapus.');
        loadDataCuti(); // Memastikan tabel disegarkan
      } catch (err) {
        console.error('Error deleting asset data:', err);
        alert('Gagal menghapus data cuti.');
      }
    }
  }
});


function populateYearDropdown() {
  const yearDropdown = document.getElementById('yearDropdown');
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 15; // Mulai dari 15 tahun yang lalu
  const endYear = 2030;

  // Tambahkan opsi default "Choose Year"
  const defaultOption = document.createElement('option');
  defaultOption.value = ''; // Nilai kosong untuk opsi default
  defaultOption.textContent = 'Choose Year';
  defaultOption.disabled = true; // Nonaktifkan opsi ini agar tidak bisa dipilih
  defaultOption.selected = true; // Jadikan opsi default terpilih
  yearDropdown.appendChild(defaultOption);

  // Ambil tahun yang disimpan di localStorage
  const savedYears = JSON.parse(localStorage.getItem('customYears')) || [];

  // Tambahkan tahun dari startYear hingga endYear ke dropdown
  for (let year = startYear; year <= endYear; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearDropdown.appendChild(option);
  }

  // Tambahkan tahun yang disimpan di localStorage
  savedYears.forEach((year) => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearDropdown.appendChild(option);
  });

  // Tambahkan opsi "Tambah Tahun Manual"
  const manualOption = document.createElement('option');
  manualOption.value = 'manual';
  manualOption.textContent = 'Tambah Tahun Manual';
  yearDropdown.appendChild(manualOption);

  // Event listener untuk menambahkan tahun manual
  yearDropdown.addEventListener('change', () => {
    if (yearDropdown.value === 'manual') {
      const manualYear = prompt('Masukkan tahun baru:');
      if (manualYear && !isNaN(manualYear) && !savedYears.includes(manualYear)) {
        const newOption = document.createElement('option');
        newOption.value = manualYear;
        newOption.textContent = manualYear;
        yearDropdown.insertBefore(newOption, manualOption); // Tambahkan sebelum opsi manual
        yearDropdown.value = manualYear; // Pilih tahun baru

        // Simpan tahun ke localStorage
        savedYears.push(manualYear);
        localStorage.setItem('customYears', JSON.stringify(savedYears));
      } else {
        alert('Tahun tidak valid atau sudah ada.');
        yearDropdown.value = ''; // Reset dropdown
      }
    }
  });
}


async function filterData() {
  const searchInput = document.getElementById('search').value.trim();
  const selectedYear = document.getElementById('yearDropdown').value;

  // Validasi jika tahun belum dipilih
  if (selectedYear === '' || selectedYear === 'manual') {
    alert('Silakan pilih tahun terlebih dahulu.');
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('staff')
      .select(`
        id_staff,
        nik_karyawan,
        nama_staff,
        jabatan,
        nama_dept,
        riwayat_kontrak!riwayat_kontrak_id_staff_fkey (
          id_kontrak,
          mulai_bergabung,
          status_kontrak
        ),
        riwayat_cuti!riwayat_cuti_id_staff_fkey (
          id_cuti,
          hak_cuti,
          cuti_tahunan,
          cuti_bersama,
          sisa_cuti,
          tahun,
          link_lampiran,
          catatan
        )
      `)
      .ilike('nama_staff', `%${searchInput}%`) // Filter berdasarkan nama_staff
      .eq('riwayat_cuti.tahun', selectedYear) // Filter berdasarkan tahun pada riwayat_cuti
      .order('id_staff', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    const dataCutiBody = document.getElementById('table-body');
    dataCutiBody.innerHTML = '';

    if (!data || data.length === 0) {
      dataCutiBody.innerHTML = `<tr><td colspan="14">Tidak ada data yang ditemukan.</td></tr>`;
      return;
    }

    data.forEach((staff) => {
      const { id_staff, nik_karyawan, nama_staff, jabatan, nama_dept, riwayat_kontrak, riwayat_cuti } = staff;

      // Pastikan data riwayat_kontrak ada sebelum diproses
      const validKontrak = riwayat_kontrak || [];
      const filteredCuti = riwayat_cuti || [];

      // Filter hanya riwayat cuti sesuai tahun yang dipilih
      const cutiByYear = filteredCuti.filter((cuti) => cuti.tahun == selectedYear);

      if (cutiByYear.length === 0) {
        return; // Skip jika tidak ada riwayat_cuti untuk tahun tersebut
      }

      // Urutkan kontrak berdasarkan tanggal mulai bergabung (descending)
      const sortedKontrak = validKontrak.sort(
        (a, b) => new Date(b.mulai_bergabung) - new Date(a.mulai_bergabung)
      );

      // Ambil kontrak terbaru
      const kontrakTerbaru = sortedKontrak[0] || { mulai_bergabung: '-', status_kontrak: '-' };

      cutiByYear.forEach((cuti, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index === 0 ? nik_karyawan : '-'}</td>
          <td>${index === 0 ? nama_staff : '-'}</td>
          <td>${index === 0 ? kontrakTerbaru.mulai_bergabung : '-'}</td>
          <td>${index === 0 ? kontrakTerbaru.status_kontrak : '-'}</td>          
          <td>${index === 0 ? jabatan : '-'}</td>
          <td>${index === 0 ? nama_dept : '-'}</td>
          <td>${cuti.hak_cuti || '-'}</td>
          <td>${cuti.cuti_tahunan || '-'}</td>
          <td>${cuti.cuti_bersama || '-'}</td>
          <td>${cuti.sisa_cuti || '-'}</td>
          <td>${cuti.tahun || '-'}</td>
          <td>${cuti.catatan || '-'}</td>
          <td>${cuti.link_lampiran || '-'}</td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${cuti.id_cuti}"></button>
            ${
              index === 0
                ? `<button class="btn btn-success btn-tambah-cuti" data-id="${id_staff}"></button>`
                : ''
            }
          </td>
        `;
        dataCutiBody.appendChild(row);
      });
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    alert('Gagal memuat data.');
  }
}

window.switchTab = switchTab;
window.filterData = filterData;

// Panggil fungsi populateYearDropdown saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  populateYearDropdown();
});

document.getElementById('searchButton').addEventListener('click', filterData);

// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  loadDataCuti();
});