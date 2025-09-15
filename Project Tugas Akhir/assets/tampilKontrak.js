import { supabase } from './supabase.js'; // Koneksi ke Supabase

let currentPageKontrak = 1; // Halaman saat ini untuk data kontrak
const rowsPerPageKontrak = 5; // Data per halaman

// Fungsi untuk mengambil data kontrak terbaru dari Supabase
async function fetchKontrakData() {
  try {
    const offset = (currentPageKontrak - 1) * rowsPerPageKontrak;

    const { data, error, count } = await supabase
      .from('staff')
      .select(
        `
        id_staff,
        nama_staff,
        riwayat_kontrak!riwayat_kontrak_id_staff_fkey (
          id_kontrak,
          akhir_kontrak,
          mulai_bergabung
        )
      `,
        { count: 'exact' }
      )
      .range(offset, offset + rowsPerPageKontrak - 1);

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('No data found in staff or riwayat_kontrak.');
      return [];
    }

    const latestContracts = data.map((staff) => {
      const { id_staff, nama_staff, riwayat_kontrak } = staff;

      if (!riwayat_kontrak || riwayat_kontrak.length === 0) {
        return {
          id_staff,
          nama_staff,
          akhir_kontrak: null,
        };
      }

      // Sort kontrak berdasarkan tanggal mulai
      const sortedContracts = riwayat_kontrak.sort((a, b) =>
        new Date(b.mulai_bergabung) - new Date(a.mulai_bergabung)
      );

      return {
        id_staff,
        nama_staff,
        akhir_kontrak: sortedContracts[0].akhir_kontrak,
      };
    });

    // Tambahkan kontrol navigasi pagination
    const totalPages = Math.ceil(count / rowsPerPageKontrak);
    const paginationContainerKontrak = document.getElementById('pagination-kontrak');
    paginationContainerKontrak.innerHTML = '';

    // Tombol panah kiri
    const prevButtonKontrak = document.createElement('button');
    prevButtonKontrak.innerHTML = '&#9664;';
    prevButtonKontrak.classList.add('btn', 'btn-secondary');
    prevButtonKontrak.disabled = currentPageKontrak === 1;
    prevButtonKontrak.onclick = () => {
      if (currentPageKontrak > 1) {
        currentPageKontrak--;
        renderKontrakTable();
      }
    };
    paginationContainerKontrak.appendChild(prevButtonKontrak);

    // Tombol panah kanan
    const nextButtonKontrak = document.createElement('button');
    nextButtonKontrak.innerHTML = '&#9654;';
    nextButtonKontrak.classList.add('btn', 'btn-secondary');
    nextButtonKontrak.disabled = currentPageKontrak === totalPages;
    nextButtonKontrak.onclick = () => {
      if (currentPageKontrak < totalPages) {
        currentPageKontrak++;
        renderKontrakTable();
      }
    };
    paginationContainerKontrak.appendChild(nextButtonKontrak);

    return latestContracts;
  } catch (error) {
    console.error('Error fetching kontrak data:', error);
    return [];
  }
}

// Fungsi untuk memformat tanggal menjadi format yang lebih mudah dibaca
function formatDate(dateString) {
  if (!dateString) return 'Tidak Ada Data';

  const date = new Date(dateString);

  if (isNaN(date)) return dateString; // Jika tidak valid, tetap tampilkan string aslinya

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options); // Format dalam bahasa Indonesia
}

// Fungsi untuk mengecek status jatuh tempo dan mengatur warna teks
function checkNearExpiry(dateString) {
  if (!dateString) return { text: '', color: '' };

  const today = new Date();
  const kontrakDate = new Date(dateString);

  if (isNaN(kontrakDate)) return { text: '', color: '' };

  const threeMonthsBefore = new Date(kontrakDate);
  threeMonthsBefore.setMonth(kontrakDate.getMonth() - 3);

  const twoMonthsBefore = new Date(kontrakDate);
  twoMonthsBefore.setMonth(kontrakDate.getMonth() - 2);

  const oneMonthBefore = new Date(kontrakDate);
  oneMonthBefore.setMonth(kontrakDate.getMonth() - 1);

  if (today >= threeMonthsBefore && today < twoMonthsBefore) {
    return {
      text: `Jatuh tempo dalam 3 bulan = ${formatDate(dateString)}`,
      color: 'blue',
    };
  }

  if (today >= twoMonthsBefore && today < oneMonthBefore) {
    return {
      text: `Jatuh tempo dalam 2 bulan = ${formatDate(dateString)}`,
      color: 'orange',
    };
  }

  if (today >= oneMonthBefore && today <= kontrakDate) {
    return {
      text: `Jatuh tempo dalam 1 bulan = ${formatDate(dateString)}`,
      color: 'red',
    };
  }

  return { text: '', color: '' };
}

// Fungsi untuk render tabel kontrak secara dinamis
async function renderKontrakTable() {
  const data = await fetchKontrakData();

  if (data.length === 0) {
    console.log('No data found for kontrak.');
    const tbody = document.getElementById('tabelKontrak').querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="3">Tidak ada data</td></tr>';
    return;
  }

  const tbody = document.getElementById('tabelKontrak').querySelector('tbody');
  tbody.innerHTML = '';

  data.forEach((item) => {
    const row = document.createElement('tr');

    // Kolom Nama Lengkap
    const namaCell = document.createElement('td');
    namaCell.textContent = item.nama_staff || 'Tidak Ada Data';
    row.appendChild(namaCell);

    // Kolom Jatuh Tempo (dengan format tanggal)
    const jatuhTempoCell = document.createElement('td');
    jatuhTempoCell.textContent = formatDate(item.akhir_kontrak);
    row.appendChild(jatuhTempoCell);

    // Kolom Notifikasi (Cek jika mendekati jatuh tempo)
    const notifikasiCell = document.createElement('td');
    const { text, color } = checkNearExpiry(item.akhir_kontrak);
    notifikasiCell.textContent = text;
    notifikasiCell.style.color = color;
    row.appendChild(notifikasiCell);

    tbody.appendChild(row);
  });
}

// Panggil fungsi untuk render tabel
renderKontrakTable();
