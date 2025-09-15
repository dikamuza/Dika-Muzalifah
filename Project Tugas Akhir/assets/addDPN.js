// Koneksi ke Supabase
const supabaseUrl = 'https://rvkmdvhhkutoozvdlzqp.supabase.co'; // Ganti dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a21kdmhoa3V0b296dmRsenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODU3OTgsImV4cCI6MjA0Njk2MTc5OH0.9nGITfyx7I_Kw6V7R1QcYjKHQIuGnDa8Rp9oAE-vRp8'; // Ganti dengan API Key Anda
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Fungsi untuk memuat data kontrak
let currentPagePendidikan = 1; // Halaman saat ini untuk data pendidikan
const rowsPerPagePendidikan = 3; // Data per halaman

async function loadDataPendidikan() {
  try {
    const offset = (currentPagePendidikan - 1) * rowsPerPagePendidikan;

    const { data, error, count } = await supabaseClient
      .from('staff')
      .select(
        'id_staff, nama_staff, lembaga, status_lulus, tahun_lulus, gelar, tempat_lulus, tingkat_pendidikan',
        { count: 'exact' }
      )
      .order('id_staff', { ascending: true })
      .range(offset, offset + rowsPerPagePendidikan - 1);

    const tableBody = document.getElementById('data-pendidikan-body');
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
            loadDataPendidikan();
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
            loadDataPendidikan();
          }
        };
        paginationContainerPendidikan.appendChild(nextButtonPendidikan);

  } catch (err) {
    console.error('Error fetching kontrak data:', err);
    alert('Gagal memuat data pendidikan.');
  }
}

// Fungsi untuk menambahkan data kontrak
document.getElementById('addRowButton').addEventListener('click', () => {
  const tableBody = document.getElementById('data-pendidikan-body');

  // Tambahkan baris kosong untuk input data
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" placeholder="Nama Staff" class="new-nama_staff"></td>
    <td><input type="text" placeholder="Lembaga" class="new-lembaga"></td>
    <td><input type="text" placeholder="Tingkat Pendidikan" class="new-tingkat_pendidikan"></td>
    <td><input type="text" placeholder="Status Lulus" class="new-status_lulus"></td>
    <td><input type="text" placeholder="Tahun Lulus" class="new-tahun_lulus"></td>
    <td><input type="text" placeholder="Gelar" class="new-gelar"></td>
    <td><input type="text" placeholder="Tempat Lulus" class="new-tempat_lulus"></td>
    <td><button class="saveRowButton btn btn-success"></button></td>
  `;
  tableBody.appendChild(newRow);
});

// Delegasi Event untuk tombol Simpan, Edit, dan Hapus
document.getElementById('data-pendidikan-body').addEventListener('click', async (event) => {
  const target = event.target;

  if (target.classList.contains('saveRowButton')) {
    // Simpan data baru
    const row = target.closest('tr');
    const newData = {
      nama_staff: row.querySelector('.new-nama_staff').value,
      lembaga: row.querySelector('.new-lembaga').value,
      tingkat_pendidikan: row.querySelector('.new-tingkat_pendidikan').value,
      status_lulus: row.querySelector('.new-status_lulus').value,
      tahun_lulus: row.querySelector('.new-tahun_lulus').value,
      gelar: row.querySelector('.new-gelar').value,
      tempat_lulus: row.querySelector('.new-tempat_lulus').value,
    };

    try {
      const { error } = await supabaseClient.from('staff').insert([newData]);
      if (error) throw error;

      alert('Data berhasil ditambahkan!');
      loadDataPendidikan();
    } catch (err) {
      console.error('Error adding data:', err);
      alert('Gagal menambahkan data.');
    }
  } else if (target.classList.contains('btn-edit')) {
    handleEdit(event);
  } else if (target.classList.contains('btn-delete')) {
    handleDeletePendidikan(event);
  }
});

// Fungsi untuk handle edit
async function handleEdit(event) {
  const id_staff = event.target.dataset.id;
  const row = event.target.closest('tr');
  const cells = row.querySelectorAll('td');

  const fields = [
    'nama_staff',
    'lembaga',
    'tingkat_pendidikan',
    'status_lulus',
    'tahun_lulus',
    'gelar',
    'tempat_lulus',
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
      loadDataPendidikan();
    } catch (err) {
      console.error('Error updating data:', err);
      alert('Gagal memperbarui data.');
    }
  });

  cells[cells.length - 1].querySelector('.btn-cancel').addEventListener('click', loadDataPendidikan);
}

// Fungsi Delete
async function handleDeletePendidikan(event) {
  const id_staff = event.target.dataset.id;

  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    try {
      const { error } = await supabaseClient
        .from('staff')
        .delete()
        .eq('id_staff', id_staff);

      if (error) throw error;

      alert('Data berhasil dihapus.');
      loadDataPendidikan();
    } catch (err) {
      console.error('Error deleting data:', err);
      alert('Gagal menghapus data.');
    }
  }
}

// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadDataPendidikan);
