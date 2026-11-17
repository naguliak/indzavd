document.addEventListener("DOMContentLoaded", () => {
  const monthYearEl = document.getElementById('month-year');
  const daysContainer = document.getElementById('calendar-days');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const lastUpdatedEl = document.getElementById('last-updated');

  if (!daysContainer) return;

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  let currentDate = new Date();

  // Автоматичне оновлення дати та часу (сьогодні)
  if (lastUpdatedEl) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    lastUpdatedEl.textContent = `останнє оновлення: ${day}.${month} ${hours}:${minutes}`;
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (monthYearEl) {
      monthYearEl.textContent = `${monthNames[month]} ${year}`;
    }

    // Вираховуємо перший день тижня (Пн = 0, Нд = 6)
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    daysContainer.innerHTML = '';

    // Пусті клітинки для зміщення початку місяця
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('i');
      emptyCell.style.visibility = 'hidden';
      emptyCell.style.aspectRatio = '1 / 1';
      daysContainer.appendChild(emptyCell);
    }

    // Приклад кольорів для днів (як на макеті)
    const sampleColors = {
      1: 'day-pink',
      3: 'day-yellow',
      10: 'day-blue',
      12: 'day-pink',
      17: 'day-blue',
      21: 'day-pink',
      26: 'day-blue',
      28: 'day-pink'
    };

    // Генерація днів місяця
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement('i');
      dayEl.textContent = day;

      if (sampleColors[day]) {
        dayEl.className = sampleColors[day];
      } else {
        dayEl.className = 'day-light';
      }

      daysContainer.appendChild(dayEl);
    }
  };

  const changeMonth = (delta) => {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
  };

  if (prevBtn) prevBtn.addEventListener('click', () => changeMonth(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeMonth(1));

  renderCalendar();
});