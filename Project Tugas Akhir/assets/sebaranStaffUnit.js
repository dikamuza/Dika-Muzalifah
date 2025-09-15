import { supabase } from './supabase.js'; // Pastikan koneksi supabase sudah diimpor

// Fungsi untuk mengambil dan menghitung jumlah staff berdasarkan nama_unit
async function fetchSebaranStaffUnit() {
  try {
    // Ambil data staff dengan kolom nama_unit
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('nama_unit');

    if (staffError) throw staffError;

    // Kelompokkan jumlah staff berdasarkan nama_unit
    const groupedData = staffData.reduce((acc, item) => {
      const unit = item.nama_unit || 'Tidak Ada Unit'; // Penanganan nama_unit yang mungkin null
      if (!acc[unit]) {
        acc[unit] = 0;
      }
      acc[unit]++;
      return acc;
    }, {});

    // Konversi data menjadi array untuk Chart.js
    const result = Object.entries(groupedData).map(([nama_unit, jumlah_staff]) => ({
      nama_unit,
      jumlah_staff,
    }));

    return result;
  } catch (error) {
    console.error('Error fetching sebaran staff per unit:', error);
    return [];
  }
}

// Fungsi untuk menampilkan chart pie berdasarkan data staff per unit
async function renderSebaranStaffUnitChart() {
  const data = await fetchSebaranStaffUnit();

  if (data.length === 0) {
    console.log("No data found for staff distribution per unit.");
    return;
  }

  // Pisahkan nama unit dan jumlah staff
  const labels = data.map((item) => item.nama_unit);
  const values = data.map((item) => item.jumlah_staff);

  // Render pie chart
  const ctx = document.getElementById('sebaranStaffUnitChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#1abc9c', '#3498db', '#e74c3c', '#9b59b6', '#f1c40f', '#2ecc71'], // Warna untuk unit
          hoverBackgroundColor: ['#16a085', '#2980b9', '#c0392b', '#8e44ad', '#f39c12', '#27ae60'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true, // Tampilkan legend
          position: 'bottom', // Legend berada di bawah
          labels: {
            color: 'white', // Warna teks legend putih
            font: {
              size: 14, // Ukuran font legend
            },
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels.map((label, index) => {
                const value = data.datasets[0].data[index];
                return {
                  text: `${label}: ${value} staff`, // Tampilkan nama unit dan jumlah staff
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
renderSebaranStaffUnitChart();
