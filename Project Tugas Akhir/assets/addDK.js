// Koneksi ke Supabase
const supabaseUrl = 'https://rvkmdvhhkutoozvdlzqp.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a21kdmhoa3V0b296dmRsenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODU3OTgsImV4cCI6MjA0Njk2MTc5OH0.9nGITfyx7I_Kw6V7R1QcYjKHQIuGnDa8Rp9oAE-vRp8'; // Ganti dengan API Key Anda
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);


let currentPageKeluarga = 1;
const rowsPerPageKeluarga = 3; // Jumlah baris per halaman

// Fungsi untuk memuat data keluarga
async function loadDataKeluarga() {
  try {
    const offset = (currentPageKeluarga - 1) * rowsPerPageKeluarga;

    const { data, error, count } = await supabaseClient
      .from('staff')
      .select(
        'id_staff, nama_staff, nama_istri_suami, gender_suami_istri, tgl_lahir_keluarga, pekerjaan, pendidikan_terakhir, nama_anak, nama_ibu_kandung',
        { count: 'exact' }
      )
      .order('id_staff', { ascending: true })
      .range(offset, offset + rowsPerPageKeluarga - 1);

    const tableBody = document.getElementById('data-keluarga-body');
    tableBody.innerHTML = ''; // Reset tabel sebelum memuat data baru

    if (error) throw error;

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9">Tidak ada data yang tersedia</td></tr>`;
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
        loadDataKeluarga();
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
        loadDataKeluarga();
      }
    };
    paginationContainerKeluarga.appendChild(nextButtonKeluarga);

  } catch (err) {
    console.error('Error fetching data keluarga:', err);
    alert('Gagal memuat data keluarga.');
  }
}

// Fungsi untuk memastikan data keluarga dimuat saat halaman dibuka
document.addEventListener('DOMContentLoaded', () => {
  // Set tab default ke "data-keluarga"
  currentPageKeluarga = 1; // Reset halaman ke 1
  loadDataKeluarga(); // Muat data sesuai dengan limit
});


// Fungsi untuk menambahkan data kontrak
document.getElementById('addRowButton').addEventListener('click', () => {
  const tableBody = document.getElementById('data-keluarga-body');

  // Tambahkan baris kosong untuk input data
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" placeholder="Nama Staff" class="new-nama_staff"></td>
    <td><input type="text" placeholder="Nama Istri/Suami" class="new-nama_istri_suami"></td>
    <td><input type="text" placeholder="Gender Suami/Istri" class="new-gender_suami_istri"></td>
    <td><input type="text" placeholder="Tgl Lahir" class="new-tgl_lahir_keluarga"></td>
    <td><input type="text" placeholder="Pendidikan Terakhir" class="new-pendidikan_terakhir"></td>
    <td><input type="text" placeholder="Pekerjaan" class="new-pekerjaan"></td>
    <td><input type="text" placeholder="Nama Anak" class="new-nama_anak"></td>
    <td><input type="text" placeholder="Nama Ibu Kandung" class="new-nama_ibu_kandung"></td>
    <td><button class="saveRowButton btn btn-success"></button></td>
  `;
  tableBody.appendChild(newRow);
});

// Delegasi Event untuk tombol Simpan, Edit, dan Hapus
document.getElementById('data-keluarga-body').addEventListener('click', async (event) => {
  const target = event.target;

  if (target.classList.contains('saveRowButton')) {
    // Simpan data baru
    const row = target.closest('tr');
    const newData = {
      nama_staff: row.querySelector('.new-nama_staff').value.trim(),
      nama_istri_suami: row.querySelector('.new-nama_istri_suami').value.trim(),
      gender_suami_istri: row.querySelector('.new-gender_suami_istri').value.trim(),
      tgl_lahir_keluarga: row.querySelector('.new-tgl_lahir_keluarga').value.trim(),
      pendidikan_terakhir: row.querySelector('.new-pendidikan_terakhir').value.trim(),
      pekerjaan: row.querySelector('.new-pekerjaan').value.trim(),
      nama_anak: row.querySelector('.new-nama_anak').value.trim(),
      nama_ibu_kandung: row.querySelector('.new-nama_ibu_kandung').value.trim(),
    };

    try {
      const { error } = await supabaseClient.from('staff').insert([newData]);
      if (error) throw error;

      alert('Data berhasil ditambahkan!');
      loadDataKeluarga();
    } catch (err) {
      console.error('Error adding data:', err);
      alert('Gagal menambahkan data.');
    }
  } else if (target.classList.contains('btn-edit')) {
    handleEdit(event);
  } else if (target.classList.contains('btn-delete')) {
    handleDeleteKeluarga(event);
  }
});

// Fungsi untuk handle edit
async function handleEdit(event) {
  const id_staff = event.target.dataset.id;
  const row = event.target.closest('tr');
  const cells = row.querySelectorAll('td');

  const fields = [
    'nama_staff',
    'nama_istri_suami',
    'gender_suami_istri',
    'tgl_lahir_keluarga',
    'pendidikan_terakhir',
    'pekerjaan',
    'nama_anak',
    'nama_ibu_kandung',
  ];

  fields.forEach((field, index) => {
    const cell = cells[index];
    const value = cell.textContent.trim();
  
    // Semua input sekarang berupa teks
    const inputType = 'text';
    const formattedValue = value; // Tidak perlu memformat nilai sebagai tanggal
    cell.innerHTML = `<input type="${inputType}" value="${formattedValue}" class="form-control">`;
  });
  

  cells[cells.length - 1].innerHTML = `
    <button class="btn btn-success btn-save" data-id="${id_staff}"></button>
    <button class="btn btn-secondary btn-cancel"></button>
  `;

  cells[cells.length - 1].querySelector('.btn-save').addEventListener('click', async () => {
    const updatedData = {};

    fields.forEach((field, index) => {
      updatedData[field] = cells[index].querySelector('input').value.trim();
    });

    try {
      const { error } = await supabaseClient
        .from('staff')
        .update(updatedData)
        .eq('id_staff', id_staff);

      if (error) throw error;

      alert('Data berhasil diperbarui.');
      loadDataKeluarga();
    } catch (err) {
      console.error('Error updating data:', err);
      alert('Gagal memperbarui data.');
    }
  });

  cells[cells.length - 1].querySelector('.btn-cancel').addEventListener('click', loadDataKeluarga);
}

// Fungsi Delete
async function handleDeleteKeluarga(event) {
  const id_staff = event.target.dataset.id;

  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    try {
      const { error } = await supabaseClient
        .from('staff')
        .delete()
        .eq('id_staff', id_staff);

      if (error) throw error;

      alert('Data berhasil dihapus.');
      loadDataKeluarga();
    } catch (err) {
      console.error('Error deleting data:', err);
      alert('Gagal menghapus data.');
    }
  }
}

// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadDataKeluarga);
