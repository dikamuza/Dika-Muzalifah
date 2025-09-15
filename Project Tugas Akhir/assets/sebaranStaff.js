import { supabase } from './supabase.js'; // Pastikan koneksi supabase sudah diimpor

async function fetchSebaranStaff() {
  try {
    // Ambil data nama_lokasi dari tabel staff
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('nama_lokasi');

    if (staffError) throw staffError;

    if (!staffData || staffData.length === 0) {
      console.log('No staff data found.');
      return [];
    }

    // Hitung jumlah staff berdasarkan nama_lokasi
    const result = staffData.reduce((acc, curr) => {
      const lokasi = acc.find((item) => item.nama_lokasi === curr.nama_lokasi);
      if (lokasi) {
        lokasi.jumlah_staff += 1; // Tambah jumlah staff
      } else {
        acc.push({
          nama_lokasi: curr.nama_lokasi,
          jumlah_staff: 1, // Lokasi baru, set jumlah staff ke 1
        });
      }
      return acc;
    }, []);

    return result;
  } catch (error) {
    console.error('Error fetching sebaran staff:', error);
    return [];
  }
}

async function renderSebaranStaffChart() {
  const data = await fetchSebaranStaff();

  if (data.length === 0) {
    console.log('No data found for staff distribution.');
    return;
  }

  // Pisahkan nama lokasi dan jumlah staff
  const labels = data.map((item) => item.nama_lokasi);
  const values = data.map((item) => item.jumlah_staff);

  // Render pie chart
  const ctx = document.getElementById('sebaranStaffChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#74b9ff', '#55efc4', '#ff7675', '#fdcb6e', '#81ecec'], // Warna dinamis
          hoverBackgroundColor: ['#0984e3', '#00b894', '#d63031', '#e17055', '#00cec9'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true, // Tampilkan legend
          position: 'bottom', // Letakkan legend di bawah chart
          labels: {
            color: 'black', // Warna teks legend
            font: {
              size: 14, // Ukuran font legend
            },
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels.map((label, index) => {
                const value = data.datasets[0].data[index];
                return {
                  text: `${label}: ${value} staff`, // Format legend: nama_lokasi: jumlah staff
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
              return `${label}: ${value} staff`;
            },
          },
        },
      },
    },
  });
}

// Panggil fungsi untuk render pie chart
renderSebaranStaffChart();
