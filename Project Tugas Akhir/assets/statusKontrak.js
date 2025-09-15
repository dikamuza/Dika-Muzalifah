import { supabase } from './supabase.js'; // Pastikan koneksi ke Supabase diimpor

// Fungsi untuk mengambil data status kontrak berdasarkan aturan yang diminta
async function fetchStatusKontrak() {
  try {
    // Ambil data dari tabel staff dan riwayat_kontrak
    const { data, error } = await supabase
      .from('staff')
      .select(`
        id_staff,
        nama_staff,
        riwayat_kontrak!riwayat_kontrak_id_staff_fkey (
          id_kontrak,
          status_kontrak,
          mulai_bergabung
        )
      `);

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('No data found in staff or riwayat_kontrak.');
      return [];
    }

    // Proses data: ambil status_kontrak terakhir untuk setiap id_staff
    const latestContracts = data.map((staff) => {
      const { id_staff, riwayat_kontrak } = staff;

      if (!riwayat_kontrak || riwayat_kontrak.length === 0) {
        return null; // Abaikan jika tidak ada riwayat kontrak
      }

      // Urutkan riwayat_kontrak berdasarkan tanggal mulai_bergabung
      const sortedContracts = riwayat_kontrak.sort((a, b) =>
        new Date(b.mulai_bergabung) - new Date(a.mulai_bergabung)
      );

      // Ambil status_kontrak terakhir
      return {
        id_staff,
        status_kontrak: sortedContracts[0].status_kontrak,
      };
    });

    // Filter data yang valid dan hitung jumlah setiap status_kontrak
    const filteredContracts = latestContracts.filter((item) => item !== null);
    const groupedData = filteredContracts.reduce((acc, item) => {
      const status = item.status_kontrak;
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});

    // Konversi hasil ke format yang sesuai untuk chart.js
    const result = Object.entries(groupedData).map(([status, jumlah]) => ({
      status,
      jumlah,
    }));

    return result;
  } catch (error) {
    console.error('Error fetching status kontrak:', error);
    return [];
  }
}

// Fungsi untuk menampilkan pie chart status kontrak
async function renderStatusKontrakChart() {
  const data = await fetchStatusKontrak();

  if (data.length === 0) {
    console.log('No data found for status kontrak.');
    return;
  }

  // Pisahkan label dan data untuk Chart.js
  const labels = data.map((item) => item.status);
  const values = data.map((item) => item.jumlah);

  // Buat pie chart menggunakan Chart.js
  const ctx = document.getElementById('statusKontrakChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels, // Menampilkan status kontrak sebagai label
      datasets: [
        {
          data: values, // Data jumlah masing-masing status
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'], // Warna pie chart
          hoverOffset: 4,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true, // Tampilkan legend
          position: 'bottom', // Posisi legend di bawah chart
          labels: {
            color: 'white', // Pastikan warna legend putih
            font: {
              size: 14, // Ukuran font legend
            },
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels.map((label, index) => {
                const value = data.datasets[0].data[index];
                return {
                  text: `${label}: ${value} staff`, // Tambahkan jumlah staff
                  fillStyle: data.datasets[0].backgroundColor[index],
                  hidden: false,
                  lineCap: 'round',
                  lineJoin: 'round',
                };
              });
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value} staff`; // Tambahkan "... staff" di tooltip
            },
          },
        },
      },
    },
  });  
}

// Panggil fungsi untuk render chart
renderStatusKontrakChart();
