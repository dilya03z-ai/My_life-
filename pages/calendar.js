
const monthTitle = document.getElementById('calendar-month');
const daysContainer = document.getElementById('calendar-days');
const selectedDateTitle = document.getElementById('selected-date');

const today = new Date();

let currentMonth = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

let selectedDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель',
  'Май', 'Июнь', 'Июль', 'Август',
  'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  monthTitle.textContent =
    `${monthNames[month]} ${year}`;

  daysContainer.innerHTML = '';

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 7 : startDay;

  const totalDays = lastDay.getDate();

  const previousMonthLastDay =
    new Date(year, month, 0).getDate();

  for (let i = startDay - 1; i > 0; i--) {
    createDay(previousMonthLastDay - i + 1, 'other-month');
  }

  for (let day = 1; day <= totalDays; day++) {
    createDay(day, '');
  }

  const totalCells = daysContainer.children.length;
  const remaining = Math.ceil(totalCells / 7) * 7 - totalCells;

  for (let day = 1; day <= remaining; day++) {
    createDay(day, 'other-month');
  }
}

function createDay(day, extraClass) {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'calendar-day';

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  let date;

  if (extraClass === 'other-month' && day > 20) {
    date = new Date(year, month - 1, day);
  } else if (extraClass === 'other-month') {
    date = new Date(year, month + 1, day);
  } else {
    date = new Date(year, month, day);
  }

  button.textContent = day;

  // Показываем точку, если на дате есть события
  const hasEvents = calendarEvents?.some(
    event => event.date === formatDate(date)
  );

  if (hasEvents) {
    const dot = document.createElement('span');
    dot.className = 'calendar-event-dot';
    button.appendChild(dot);
  }

  if (extraClass) {
    button.classList.add(extraClass);
  }

  if (formatDate(date) === formatDate(today)) {
    button.classList.add('today');
  }

  if (formatDate(date) === formatDate(selectedDate)) {
    button.classList.add('selected');
  }

  button.addEventListener('click', () => {
    selectedDate = date;

    if (extraClass === 'other-month') {
      currentMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );
    }

    updateSelectedDate();
    renderCalendar();
  });

  daysContainer.appendChild(button);
}

function updateSelectedDate() {
  const dateText = selectedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  selectedDateTitle.textContent = dateText;
}

document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
});


// EVENTS — СОБЫТИЯ КАЛЕНДАРЯ

const eventsList = document.getElementById('events-list');
const eventForm = document.getElementById('event-form');
const eventTitle = document.getElementById('event-title');
const eventCategory = document.getElementById('event-category');
const eventTime = document.getElementById('event-time');
const eventDescription = document.getElementById('event-description');

// Загружаем сохранённые события
let calendarEvents = JSON.parse(
  localStorage.getItem('myLifeCalendarEvents') || '[]'
);

// Сохраняем события
function saveCalendarEvents() {
  localStorage.setItem(
    'myLifeCalendarEvents',
    JSON.stringify(calendarEvents)
  );
}

// Показываем события выбранного дня
function renderEvents() {
  eventsList.innerHTML = '';

  const selectedDateKey = formatDate(selectedDate);

  const dayEvents = calendarEvents
    .filter(event => event.date === selectedDateKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  if (dayEvents.length === 0) {
    eventsList.innerHTML =
      '<p class="events-empty">На этот день пока нет событий ✨</p>';
    return;
  }

  dayEvents.forEach(event => {
    const item = document.createElement('div');
    item.className = 'event-item';

    const title = document.createElement('strong');
    title.textContent = event.title;

    item.appendChild(title);

    const categoryNames = {
  personal: 'Личное',
  work: 'Работа',
  health: 'Здоровье',
  rest: 'Отдых',
  other: 'Другое'
};

const category = document.createElement('span');
category.className = `event-category event-category-${event.category || 'personal'}`;
category.textContent = categoryNames[event.category || 'personal'];
item.appendChild(category);

    if (event.time) {
      const time = document.createElement('span');
      time.className = 'event-time';
      time.textContent = event.time;
      item.appendChild(time);
    }

    if (event.description) {
      const description = document.createElement('p');
      description.textContent = event.description;
      item.appendChild(description);
    }

    
    // Контейнер для меню действий
    const actions = document.createElement('div');
    actions.className = 'event-actions';

    // Кнопка с тремя точками
    const menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.className = 'event-menu-button';
    menuButton.textContent = '⋯';
    menuButton.title = 'Действия с событием';

    // Выпадающее меню
    const menu = document.createElement('div');
    menu.className = 'event-menu hidden';

    // Кнопка изменения
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Изменить событие';

    editButton.addEventListener('click', () => {
  const modal = document.getElementById('edit-modal');

  document.getElementById('edit-event-id').value = event.id;
  document.getElementById('edit-event-title').value = event.title;
  document.getElementById('edit-event-date').value = event.date;
  document.getElementById('edit-event-time').value = event.time || '';
  document.getElementById('edit-event-category').value =
    event.category || 'personal';
  document.getElementById('edit-event-description').value =
    event.description || '';

  modal.classList.remove('hidden');
});

    // Кнопка удаления
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Удалить событие';

    deleteButton.addEventListener('click', () => {
      if (!confirm(`Удалить событие «${event.title}»?`)) {
        return;
      }

      calendarEvents = calendarEvents.filter(
        savedEvent => savedEvent.id !== event.id
      );

      saveCalendarEvents();
      renderEvents();
      renderCalendar();
    });

    menu.append(editButton, deleteButton);
    actions.append(menuButton, menu);

    menuButton.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });

    item.appendChild(actions);
    eventsList.appendChild(item);
  });
}

// Добавляем новое событие
eventForm.addEventListener('submit', event => {
  event.preventDefault();

  const title = eventTitle.value.trim();

  if (!title) return;

  calendarEvents.push({
  id: String(Date.now()),
  date: formatDate(selectedDate),
  title: title,
  time: eventTime.value,
  category: eventCategory.value,
  description: eventDescription.value.trim()
});
  saveCalendarEvents();

  eventForm.reset();
  renderEvents();
});

// Обновляем события при выборе даты
const originalUpdateSelectedDate = updateSelectedDate;

updateSelectedDate = function() {
  originalUpdateSelectedDate();
  renderEvents();
};

// Первый показ событий
renderEvents();

// Первый запуск календаря
updateSelectedDate();
renderCalendar();


// EDIT EVENT MODAL

const editModal = document.getElementById('edit-modal');
const editEventForm = document.getElementById('edit-event-form');
const closeEditModal = document.getElementById('close-edit-modal');

// Закрытие окна
closeEditModal.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

// Закрытие при нажатии за пределами окна
editModal.addEventListener('click', event => {
  if (event.target === editModal) {
    editModal.classList.add('hidden');
  }
});

// Сохранение изменений
editEventForm.addEventListener('submit', event => {
  event.preventDefault();

  const eventId = document.getElementById('edit-event-id').value;

  const savedEvent = calendarEvents.find(
    item => item.id === eventId
  );

  if (!savedEvent) return;

  const newDate = document.getElementById('edit-event-date').value;

  if (!newDate) {
    alert('Выбери дату события.');
    return;
  }

  savedEvent.title = document.getElementById('edit-event-title').value.trim();
  savedEvent.date = newDate;
  savedEvent.time = document.getElementById('edit-event-time').value;
  savedEvent.category = document.getElementById('edit-event-category').value;
  savedEvent.description = document.getElementById('edit-event-description').value.trim();

  const [year, month, day] = newDate.split('-').map(Number);

  selectedDate = new Date(year, month - 1, day);
  currentMonth = new Date(year, month - 1, 1);

  saveCalendarEvents();

  editModal.classList.add('hidden');

  updateSelectedDate();
  renderCalendar();
  renderEvents();
});

// CLOSE EVENT MENU WHEN CLICKING OUTSIDE

document.addEventListener('click', event => {
  document.querySelectorAll('.event-menu').forEach(menu => {
    const actions = menu.parentElement;

    if (!actions.contains(event.target)) {
      menu.classList.add('hidden');
    }
  });
});