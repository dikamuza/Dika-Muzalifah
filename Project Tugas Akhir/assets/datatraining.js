// Koneksi ke Supabase
const supabaseUrl = 'https://rvkmdvhhkutoozvdlzqp.supabase.co'; // Ganti dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a21kdmhoa3V0b296dmRsenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODU3OTgsImV4cCI6MjA0Njk2MTc5OH0.9nGITfyx7I_Kw6V7R1QcYjKHQIuGnDa8Rp9oAE-vRp8'; // Ganti dengan API Key Anda
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let currentPageTraining = 1; // Halaman saat ini untuk data training
const rowsPerPageTraining = 5; // Data per halaman

async function loadDataTraining() {
  try {
    const offset = (currentPageTraining - 1) * rowsPerPageTraining;

    const namaKategoriFilter = getQueryParam('jenis_training'); // Ambil parameter nama_kategori dari URL
    const { data, error, count } = await supabaseClient
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
      `, { count: 'exact' })
      .order('id_staff', { ascending: true })
      .range(offset, offset + rowsPerPageTraining - 1);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    const dataTrainingBody = document.getElementById('training-body');
    dataTrainingBody.innerHTML = ''; // Reset tabel

    if (!data || data.length === 0) {
      dataTrainingBody.innerHTML = `<tr><td colspan="13">Tidak ada data training yang tersedia</td></tr>`;
      return;
    }

    const filteredData = namaKategoriFilter
    ? data.filter((staff) => 
        staff.training.some((training) => training.jenis_training === namaKategoriFilter)
      )
    : data;

    if (filteredData.length === 0) {
      dataTrainingBody.innerHTML = `<tr><td colspan="10">Tidak ada data dengan kategori "${namaKategoriFilter}"</td></tr>`;
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

      // Baris tambahan untuk training kedua dan seterusnya (disembunyikan awalnya)
      training.slice(1).forEach((train) => {
        const trainingRow = document.createElement('tr');
        trainingRow.classList.add('hidden-details');
        trainingRow.dataset.staffId = id_staff; // Tandai dengan ID staff
        trainingRow.style.display = 'none'; // Sembunyikan awalnya
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

    // Menambahkan event listener untuk tombol Detail
    document.querySelectorAll('.btn-detail').forEach((button) => {
      button.addEventListener('click', (event) => {
        const staffId = event.target.getAttribute('data-id');
        toggleDetails(staffId);
      });
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
            loadDataTraining();
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
            loadDataTraining();
          }
        };
        paginationContainerTraining.appendChild(nextButtonTraining);

  } catch (err) {
    console.error('Error fetching training data:', err);
    alert('Gagal memuat data training.');
  }
}

// Fungsi untuk menampilkan/menyembunyikan detail training berdasarkan staffId
function toggleDetails(staffId) {
  const rows = document.querySelectorAll(`.hidden-details[data-staff-id="${staffId}"]`);
  rows.forEach((row) => {
    // Toggle visibility
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
  });
}

// Fungsi untuk membaca parameter dari URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Event untuk tombol "Tambah Training"
document.getElementById('training-body').addEventListener('click', async (event) => {
  const target = event.target;

  // Cek apakah tombol yang diklik adalah tombol "Tambah Training"
  if (target.classList.contains('btn-add-training')) {
    const idStaff = target.dataset.id;

    // Buat baris baru untuk input training
    const staffRow = target.closest('tr');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>-</td>
      <td>-</td>
      <td><input type="text" placeholder="Kode Training" class="new-kode-training"></td>
      <td><input type="text" placeholder="Jenis Training" class="new-jenis-training"></td>
      <td><input type="text" placeholder="Kegiatan" class="new-kegiatan"></td>
      <td><input type="text" placeholder="Topik" class="new-topik"></td>
      <td><input type="text" placeholder="Lembaga" class="new-lembaga"></td>
      <td><input type="text" placeholder="Tanggal Mulai" class="new-tanggal-mulai"></td>
      <td><input type="text" placeholder="Tanggal Selesai" class="new-tanggal-selesai"></td>                    
      <td><input type="text" placeholder="Tempat" class="new-tempat"></td>
      <td><input type="text" placeholder="Sertifikat" class="new-sertifikat"></td>
      <td><input type="text" placeholder="Biaya" class="new-biaya"></td>
      <td>
        <button class="btn btn-success btn-save-training" data-id="${idStaff}"></button>
        <button class="btn btn-secondary btn-cancel-training"></button>
      </td>
    `;
    staffRow.after(newRow);

    // Simpan data training baru
    newRow.querySelector('.btn-save-training').addEventListener('click', async () => {
      const kodeTraining = newRow.querySelector('.new-kode-training').value.trim();
      const jenisTraining = newRow.querySelector('.new-jenis-training').value.trim();
      const kegiatan = newRow.querySelector('.new-kegiatan').value.trim();
      const topik = newRow.querySelector('.new-topik').value.trim();
      const lembaga = newRow.querySelector('.new-lembaga').value.trim();
      const tglMulai = newRow.querySelector('.new-tanggal-mulai').value.trim();
      const tglSelesai = newRow.querySelector('.new-tanggal-selesai').value.trim();
      const tempat = newRow.querySelector('.new-tempat').value.trim();
      const sertifikat = newRow.querySelector('.new-sertifikat').value.trim();
      const biaya = newRow.querySelector('.new-biaya').value.trim();

      try {
        const { data, error } = await supabaseClient
          .from('training')
          .insert({
            id_staff: idStaff,
            kode_training: kodeTraining || null,
            jenis_training: jenisTraining || null,
            kegiatan_training: kegiatan || null,
            topik_training: topik || null,
            lembaga_penyelenggara: lembaga || null,
            tgl_mulai: tglMulai || null,
            tgl_selesai: tglSelesai || null,
            tempat_pelaksanaan: tempat || null,
            sertifikat: sertifikat || null,
            biaya: biaya || null,
          });

          if (error) throw error;

          alert('Training berhasil ditambahkan.');  

        loadDataTraining(); // Refresh tabel
      } catch (err) {
        console.error('Error adding training:', err);
      }
    });

    // Batalkan penambahan training
    newRow.querySelector('.btn-cancel-training').addEventListener('click', () => {
      newRow.remove();
    });
  }

  // Fungsi Edit
  if (target.classList.contains('btn-edit')) {
    const idTraining = target.dataset.id;
    const row = target.closest('tr');

    // Mendapatkan data dari cell yang ada di baris
    const cells = row.querySelectorAll('td');

    // Cek jika input tersedia, kemudian buat input untuk kolom yang dapat diedit
    if (cells.length > 0) {
      row.innerHTML = `
        <td>${cells[0].textContent}</td>
        <td>${cells[1].textContent}</td>
        <td><input type="text" value="${cells[2].textContent}" class="edit-kode-training"></td>
        <td><input type="text" value="${cells[3].textContent}" class="edit-jenis-training"></td>
        <td><input type="text" value="${cells[4].textContent}" class="edit-kegiatan"></td>
        <td><input type="text" value="${cells[5].textContent}" class="edit-topik"></td>
        <td><input type="text" value="${cells[6].textContent}" class="edit-lembaga"></td>
        <td><input type="text" value="${cells[7].textContent}" class="edit-tanggal-mulai"></td>
        <td><input type="text" value="${cells[8].textContent}" class="edit-tanggal-selesai"></td>
        <td><input type="text" value="${cells[9].textContent}" class="edit-tempat"></td>
        <td><input type="text" value="${cells[10].textContent}" class="edit-sertifikat"></td>
        <td><input type="text" value="${cells[11].textContent}" class="edit-biaya"></td>
        <td>
          <button class="btn btn-success btn-save-edit" data-id="${idTraining}"></button>
          <button class="btn btn-secondary btn-cancel-edit"></button>
        </td>
      `;
    }
  }

  // Event untuk simpan perubahan edit
  if (event.target.classList.contains('btn-save-edit')) {
    const row = event.target.closest('tr');
    const idTraining = event.target.dataset.id;

    // Ambil nilai dari input yang sudah diubah
    const kodeTraining = row.querySelector('.edit-kode-training').value.trim();
    const jenisTraining = row.querySelector('.edit-jenis-training').value.trim();
    const kegiatan = row.querySelector('.edit-kegiatan').value.trim();
    const topik = row.querySelector('.edit-topik').value.trim();
    const lembaga = row.querySelector('.edit-lembaga').value.trim();
    const tglMulai = row.querySelector('.edit-tanggal-mulai').value.trim();
    const tglSelesai = row.querySelector('.edit-tanggal-selesai').value.trim();
    const tempat = row.querySelector('.edit-tempat').value.trim();
    const sertifikat = row.querySelector('.edit-sertifikat').value.trim();
    const biaya = row.querySelector('.edit-biaya').value.trim();

    try {
      const { data, error } = await supabaseClient
        .from('training')
        .update({
          kode_training: kodeTraining || null,
          jenis_training: jenisTraining || null,
          kegiatan_training: kegiatan || null,
          topik_training: topik || null,
          lembaga_penyelenggara: lembaga || null,
          tgl_mulai: tglMulai || null,
          tgl_selesai: tglSelesai || null,
          tempat_pelaksanaan: tempat || null,
          sertifikat: sertifikat || null,
          biaya: biaya || null,
        })
        .eq('id_training', idTraining);

        if (error) throw error;

        alert('Training berhasil diupdate.');

      loadDataTraining(); // Refresh tabel
    } catch (err) {
      console.error('Error updating training:', err);
    }
  }

  // Fungsi batal edit
  if (event.target.classList.contains('btn-cancel-edit')) {
    loadDataTraining(); // Kembalikan tampilan semula tanpa perubahan
  }

// Fungsi Hapus
if (target.classList.contains('btn-delete')) {
  const idTraining = target.dataset.id;

  const confirmDelete = confirm('Apakah Anda yakin ingin menghapus data training ini?');
  if (confirmDelete) {
    try {
      // Menghapus data training berdasarkan id_training
      const { data, error } = await supabaseClient
        .from('training')
        .delete()
        .eq('id_training', idTraining);

      if (error) throw error;

      alert('Training berhasil dihapus.');
      loadDataTraining(); // Refresh tabel untuk menampilkan data training yang masih ada
    } catch (err) {
      console.error('Error deleting training:', err);
      alert('Gagal menghapus data training.');
    }
  }
}
});

function switchTab(tabId) {
  // Tangani visibilitas konten tab yang dimuat
  const currentContent = document.getElementById(tabId);

  if (!currentContent.classList.contains('active')) {
    // Aktifkan tab yang diminta
    document.querySelectorAll('.tab-content').forEach((content) => {
      if (content.id === tabId) {
        content.classList.add('active'); // Tampilkan konten terkait
      } else {
        content.classList.remove('active'); // Sembunyikan konten lainnya
      }
    });

    // Tangani pemanggilan fungsi sesuai tab yang dimuat
    if (tabId === 'training') {
      loadDataTraining(); // Muat data untuk tab aset kantor
  }
}
}

window.switchTab = switchTab;

// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadDataTraining);
