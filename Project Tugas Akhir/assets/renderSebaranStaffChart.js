import { fetchSebaranStaff } from './sebaranStaff.js';

async function renderSebaranStaffChart() {
  const data = await fetchSebaranStaff();

  // Pisahkan kategori dan jumlah staff untuk Chart.js
  const labels = data.map((item) => item.kategori);
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
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverOffset: 4,
        },
      ],
    },
  });
}

renderSebaranStaffChart();
