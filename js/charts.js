document.addEventListener("DOMContentLoaded", () => {
  // 1. Лінійний графік споживання
  const lineCtx = document.getElementById('lineConsumptionChart');
  if (lineCtx) {
    new Chart(lineCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв'],
        datasets: [{
          data: [30, 15, 60, 45, 85, 70],
          borderColor: '#32451D',
          backgroundColor: 'rgba(50, 69, 29, 0.1)',
          borderWidth: 3,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: true, color: 'rgba(0,0,0,0.8)' }, beginAtZero: true }
      }
    });
  }

  // 2. Polar Area Chart
  const polarCtx = document.getElementById('polarAreaChart');
  if (polarCtx) {
    new Chart(polarCtx.getContext('2d'), {
      type: 'polarArea',
      data: {
        labels: ['Світло (50%)', 'Вода (30%)', 'Газ (20%)'],
        datasets: [{
          data: [50, 30, 20],
          backgroundColor: [
            'rgba(50, 69, 29, 0.85)',
            'rgba(107, 142, 35, 0.85)',
            'rgba(158, 174, 122, 0.85)'
          ],
          borderWidth: 0 
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            radius: '75%', 
            ticks: { display: false },
            grid: { color: 'rgba(0, 0, 0, 0.08)' }
          }
        },
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { boxWidth: 12, font: { size: 11 }, padding: 15 } 
          }
        }
      }
    });
  }

  // 3. Bar Chart для тижневого споживання
  const barCtx = document.getElementById('weeklyBarChart');
  if (barCtx) {
    new Chart(barCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
        datasets: [{
          data: [12, 8, 18, 6, 11, 14, 19],
          backgroundColor: ['#5E7F39', '#A1B775', '#32451D', '#A1B775', '#80B14A', '#5E7F39', '#32451D'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true }
        }
      }
    });
  }

  // 4. Doughnut Chart для загального показника 84%
  const ringCtx = document.getElementById('doughnutRingChart');
  if (ringCtx) {
    new Chart(ringCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [84, 16],
          backgroundColor: ['#6B8E23', '#32451D'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: { legend: { display: false } }
      }
    });
  }
});