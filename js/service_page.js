/* Сторінка "Оплата комунальних послуг" */

document.addEventListener('DOMContentLoaded', () => {
  // Елементи сторінки
  const tabs = document.querySelectorAll('input[name="service-type"]');
  const debtInput = document.getElementById('debt');
  const amountInput = document.getElementById('amount');
  const payCardRadio = document.getElementById('pay-card');
  const cardNumberInput = document.getElementById('card-number');
  const cardDateInput = document.getElementById('card-date');
  const cvvInputs = document.querySelectorAll('.cvv-box');
  const payButton = document.querySelector('.btn-pay-submit');

  // Початкова заборгованість для кожної послуги
  const START_DEBTS = [100, 245, 180];
  const STORAGE_KEY = 'grandhome-debts';

  // Пам'ять браузера (localStorage)
  function loadDebts() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length === START_DEBTS.length) {
        // усе сплачено — починаємо спочатку
        if (saved.every((debt) => debt === 0)) {
          return START_DEBTS.slice();
        }
        return saved;
      }
    } catch (error) {
      // у пам'яті щось зіпсоване — просто беремо початкові суми
    }
    return START_DEBTS.slice();
  }

  function saveDebts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
    } catch (error) {
      // браузер не дозволяє зберігати
    }
  }

  const debts = loadDebts();

  // Номер обраної вкладки
  function currentTabIndex() {
    return Array.from(tabs).findIndex((tab) => tab.checked);
  }

  // Показуємо заборгованість обраної послуги одразу при відкритті сторінки
  debtInput.value = debts[currentTabIndex()];

  // Допоміжні функції для помилок

  // Показати помилку: підсвітити поле і додати текст під ним
  function showError(box, text) {
    box.classList.add('is-invalid');

    const group = box.closest('.info-group');
    let message = group.querySelector('.error-message');

    if (!message) {
      message = document.createElement('span');
      message.className = 'error-message';
      group.appendChild(message);
    }

    message.textContent = text;
    placeMessage(box, message);
  }

  // Ставимо підказку рівно під полем
  function placeMessage(box, message) {
    message.style.left = box.offsetLeft + 'px';
    message.style.top = box.offsetTop + box.offsetHeight + 6 + 'px';
  }

  // Якщо змінився розмір вікна
  window.addEventListener('resize', () => {
    document.querySelectorAll('.is-invalid').forEach((box) => {
      const message = box.closest('.info-group').querySelector('.error-message');
      if (message) {
        placeMessage(box, message);
      }
    });
  });

  // Прибрати помилку з поля
  function clearError(box) {
    box.classList.remove('is-invalid');

    const message = box.closest('.info-group').querySelector('.error-message');
    if (message) {
      message.remove();
    }
  }

  // Вкладки послуг
  tabs.forEach((tab, index) => {
    tab.addEventListener('change', () => {
      debtInput.value = debts[index];

      // оновлюємо помилку з новою заборгованістю
      if (amountInput.parentElement.classList.contains('is-invalid')) {
        checkAmount();
      }
    });
  });

  // Сума для сплати
  function checkAmount() {
    const box = amountInput.parentElement;
    const value = amountInput.value.trim();
    const amount = Number(value);
    const debt = Number(debtInput.value);

    if (debt === 0) {
      showError(box, 'Заборгованості немає');
      return false;
    }

    if (value === '') {
      showError(box, 'Введіть суму');
      return false;
    }

    if (!(amount > 0)) {
      showError(box, 'Сума має бути більшою за 0');
      return false;
    }

    if (amount > debt) {
      showError(box, 'Не більше ніж ' + debt + ' грн');
      return false;
    }

    clearError(box);
    return true;
  }

  amountInput.addEventListener('input', () => {
    // перевіряємо, лише якщо помилка вже показана
    if (amountInput.parentElement.classList.contains('is-invalid')) {
      checkAmount();
    }
  });

  // Номер картки: пробіли по 4 цифри
  cardNumberInput.addEventListener('input', () => {
    const digits = cardNumberInput.value.replace(/\D/g, '').slice(0, 16);
    // "1234567812345678" -> "1234 5678 1234 5678"
    cardNumberInput.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');

    if (cardNumberInput.parentElement.classList.contains('is-invalid')) {
      checkCardNumber();
    }
  });

  function checkCardNumber() {
    const box = cardNumberInput.parentElement;
    const digits = cardNumberInput.value.replace(/\D/g, '');

    if (digits.length !== 16) {
      showError(box, 'Номер картки — 16 цифр');
      return false;
    }

    clearError(box);
    return true;
  }

  // Термін дії: ММ/РР
  cardDateInput.addEventListener('input', (event) => {
    let digits = cardDateInput.value.replace(/\D/g, '').slice(0, 4);

    // ставимо «/» після місяця
    if (digits.length >= 3 || (digits.length === 2 && event.inputType !== 'deleteContentBackward')) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }

    cardDateInput.value = digits;

    if (cardDateInput.parentElement.classList.contains('is-invalid')) {
      checkCardDate();
    }
  });

  function checkCardDate() {
    const box = cardDateInput.parentElement;
    const match = cardDateInput.value.match(/^(\d{2})\/(\d{2})$/);

    if (!match) {
      showError(box, 'Формат ММ/РР');
      return false;
    }

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);

    if (month < 1 || month > 12) {
      showError(box, 'Місяць від 01 до 12');
      return false;
    }

    // картка дійсна до кінця вказаного місяця
    const now = new Date();
    const expired = year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1);

    if (expired) {
      showError(box, 'Термін дії минув');
      return false;
    }

    clearError(box);
    return true;
  }

  // CVV: лише цифри, курсор сам переходить далі
  const cvvBox = document.querySelector('.cvv-boxes');

  cvvInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);

      if (input.value && index < cvvInputs.length - 1) {
        cvvInputs[index + 1].focus();
      }

      if (cvvBox.classList.contains('is-invalid')) {
        checkCvv();
      }
    });

    // Backspace у порожній клітинці — назад
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && index > 0) {
        cvvInputs[index - 1].focus();
      }
    });
  });

  function checkCvv() {
    const filled = Array.from(cvvInputs).every((input) => /^\d$/.test(input.value));

    if (!filled) {
      showError(cvvBox, 'Введіть 3 цифри');
      return false;
    }

    clearError(cvvBox);
    return true;
  }

  // для PayPal помилки картки не потрібні
  document.querySelectorAll('input[name="pay-method"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!payCardRadio.checked) {
        clearError(cardNumberInput.parentElement);
        clearError(cardDateInput.parentElement);
        clearError(cvvBox);
      }
    });
  });

  // Кнопка "Сплатити"
  payButton.addEventListener('click', (event) => {
    let isValid = checkAmount();

    // поля картки перевіряємо, лише коли обрано Credit Card
    if (payCardRadio.checked) {
      // перевіряємо всі поля, щоб підсвітились усі помилки
      const numberOk = checkCardNumber();
      const dateOk = checkCardDate();
      const cvvOk = checkCvv();
      isValid = isValid && numberOk && dateOk && cvvOk;
    }

    if (!isValid) {
      event.preventDefault(); // не переходимо на сторінку "Оплата пройшла успішно"
      return;
    }

    // Оплата пройшла: зменшуємо заборгованість обраної послуги і запам'ятовуємо
    const index = currentTabIndex();
    const left = debts[index] - Number(amountInput.value);
    debts[index] = Math.round(left * 100) / 100; // без "хвостів" на кшталт 49.999999
    saveDebts();
  });
});
