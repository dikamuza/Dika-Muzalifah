import { supabase } from './supabase.js';

// Fungsi untuk memuat data Struktur Organisasi
async function loadStrukturOrganisasi() {
  try {
    const { data, error } = await supabase
      .from('unit')
      .select('id_unit, nama_unit, departemen(id_dept, nama_dept)')
      .order('id_unit', { ascending: true });

    const tableBody = document.getElementById('struktur-body');
    tableBody.innerHTML = ''; // Hapus isi sebelumnya

    if (error) {
      console.error('Error fetching struktur organisasi data:', error);
      alert('Gagal memuat data struktur organisasi.');
      return;
    }

    if (data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">Tidak ada data yang tersedia</td>
        </tr>
      `;
      return;
    }

    data.forEach((unit) => {
      const departemenList = unit.departemen;

      if (departemenList.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${unit.id_unit}</td>
          <td>${unit.nama_unit}</td>
          <td>-</td>
          <td>
            <button class="btn btn-success add-department-button" data-unit-id="${unit.id_unit}">
            </button>
          </td>
          <td>
            <button class="btn btn-warning edit-unit-button" data-unit-id="${unit.id_unit}" data-unit-name="${unit.nama_unit}">
            </button>
            <button class="btn btn-danger delete-unit-button" data-unit-id="${unit.id_unit}">
            </button>
          </td>
        `;
        tableBody.appendChild(row);
      } else {
        departemenList.forEach((dept, index) => {
          const row = document.createElement('tr');

          if (index === 0) {
            row.innerHTML = `
              <td rowspan="${departemenList.length}">${unit.id_unit}</td>
              <td rowspan="${departemenList.length}">${unit.nama_unit}</td>
              <td>${dept.nama_dept}</td>
              <td rowspan="${departemenList.length}">
                <button class="btn btn-success add-department-button" data-unit-id="${unit.id_unit}">
                </button>
              </td>
              <td>
                <button class="btn btn-warning edit-unit-button" data-unit-id="${unit.id_unit}" data-unit-name="${unit.nama_unit}">
                </button>
                <button class="btn btn-danger delete-unit-button" data-unit-id="${unit.id_unit}">
                </button>
              </td>
              <td>
                <button class="btn btn-warning edit-department-button" data-dept-id="${dept.id_dept}">
                </button>
                <button class="btn btn-danger delete-department-button" data-dept-id="${dept.id_dept}">
                </button>
              </td>
            `;
          } else {
            row.innerHTML = `
              <td>${dept.nama_dept}</td>
              <td>
                <button class="btn btn-warning edit-department-button" data-dept-id="${dept.id_dept}">
                </button>
                <button class="btn btn-danger delete-department-button" data-dept-id="${dept.id_dept}">
                </button>
              </td>
            `;
          }

          tableBody.appendChild(row);
        });
      }
    });

    // Tambahkan ulang semua event listener setelah render ulang tabel
    addUnitEditEventListeners();
    addUnitDeleteEventListeners();
    addDepartmentEventListeners();
    addEditEventListeners();
    addDeleteEventListeners();
  } catch (err) {
    console.error('Unexpected error in loadStrukturOrganisasi:', err);
    alert('Terjadi kesalahan saat memuat data struktur organisasi.');
  }
}

function addUnitEditEventListeners() {
  const editUnitButtons = document.querySelectorAll('.edit-unit-button');

  editUnitButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const unitId = event.target.dataset.unitId;
      const currentName = event.target.dataset.unitName;
      const newName = prompt('Masukkan nama baru untuk unit:', currentName);

      if (!newName) {
        alert('Nama unit tidak boleh kosong.');
        return;
      }

      try {
        const { error } = await supabase.from('unit').update({ nama_unit: newName }).eq('id_unit', unitId);

        if (error) {
          console.error('Error mengedit unit:', error);
          alert('Gagal mengedit unit.');
        } else {
          alert('Unit berhasil diperbarui.');
          loadStrukturOrganisasi();
        }
      } catch (err) {
        console.error('Unexpected error while editing unit:', err);
        alert('Terjadi kesalahan saat mengedit unit.');
      }
    });
  });
}

function addUnitDeleteEventListeners() {
  const deleteUnitButtons = document.querySelectorAll('.delete-unit-button');

  deleteUnitButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const unitId = event.target.dataset.unitId;
      const confirmation = confirm(
        'Apakah Anda yakin ingin menghapus unit ini beserta semua departemen yang terkait?'
      );

      if (!confirmation) return;

      try {
        // Hapus departemen yang terkait dengan unit
        const { error: deleteDepartemenError } = await supabase
          .from('departemen')
          .delete()
          .eq('unit_id', unitId);

        if (deleteDepartemenError) {
          console.error('Error menghapus departemen terkait:', deleteDepartemenError);
          alert('Gagal menghapus departemen yang terkait dengan unit.');
          return;
        }

        // Hapus unit
        const { error: deleteUnitError } = await supabase
          .from('unit')
          .delete()
          .eq('id_unit', unitId);

        if (deleteUnitError) {
          console.error('Error menghapus unit:', deleteUnitError);
          alert('Gagal menghapus unit.');
          return;
        }

        alert('Unit beserta semua departemen terkait berhasil dihapus.');
        loadStrukturOrganisasi();
      } catch (err) {
        console.error('Unexpected error while deleting unit and related departments:', err);
        alert('Terjadi kesalahan saat menghapus unit dan departemen terkait.');
      }
    });
  });
}

// Fungsi untuk menambahkan event listener ke tombol "Tambah Departemen"
function addDepartmentEventListeners() {
  const addDepartmentButtons = document.querySelectorAll('.add-department-button');

  addDepartmentButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const unitId = event.target.dataset.unitId;
      const departmentName = prompt('Masukkan nama departemen baru:');

      if (!departmentName) {
        alert('Nama departemen tidak boleh kosong.');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('departemen')
          .insert([{ nama_dept: departmentName, unit_id: unitId }]);

        if (error) {
          console.error('Error Supabase:', error);
          alert(`Gagal menambahkan departemen: ${error.message}`);
          return;
        }

        alert('Departemen berhasil ditambahkan!');
        loadStrukturOrganisasi();
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('Terjadi kesalahan saat menambahkan departemen.');
      }
    });
  });
}

// Fungsi untuk menambahkan event listener ke tombol "Edit"
function addEditEventListeners() {
  const editButtons = document.querySelectorAll('.edit-department-button');

  editButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const deptId = event.target.dataset.deptId;
      const newDepartmentName = prompt('Masukkan nama baru untuk departemen:');

      if (!newDepartmentName) {
        alert('Nama departemen tidak boleh kosong.');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('departemen')
          .update({ nama_dept: newDepartmentName })
          .eq('id_dept', deptId);

        if (error) {
          console.error('Error Supabase:', error);
          alert(`Gagal mengedit departemen: ${error.message}`);
          return;
        }

        alert('Departemen berhasil diperbarui!');
        loadStrukturOrganisasi();
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('Terjadi kesalahan saat mengedit departemen.');
      }
    });
  });
}

// Fungsi untuk menambahkan event listener ke tombol "Hapus"
function addDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll('.delete-department-button');

  deleteButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const deptId = event.target.dataset.deptId;
      const confirmation = confirm('Apakah Anda yakin ingin menghapus departemen ini?');

      if (!confirmation) return;

      try {
        const { data, error } = await supabase
          .from('departemen')
          .delete()
          .eq('id_dept', deptId);

        if (error) {
          console.error('Error Supabase:', error);
          alert(`Gagal menghapus departemen: ${error.message}`);
          return;
        }

        alert('Departemen berhasil dihapus!');
        loadStrukturOrganisasi();
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('Terjadi kesalahan saat menghapus departemen.');
      }
    });
  });
}

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', loadStrukturOrganisasi);
