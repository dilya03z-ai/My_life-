
// MY LIFE — MAIN FUNCTIONALITY

// 1. DATE
const now = new Date();

const dateOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
};

document.getElementById('header-date').textContent =
  now.toLocaleDateString('ru-RU', dateOptions);

document.getElementById('day-number').textContent =
  now.getDate();

document.getElementById('day-name').textContent =
  now.toLocaleDateString('ru-RU', { month: 'long' });


// 2. TASKS
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('myLifeTasks')) || [];

function saveTasks() {
  localStorage.setItem('myLifeTasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const item = document.createElement('label');
    item.className = 'task-item' + (task.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;

    checkbox.addEventListener('change', () => {
      tasks[index].done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement('span');
    text.textContent = task.text;

    item.appendChild(checkbox);
    item.appendChild(text);
    taskList.appendChild(item);
  });

  updateProgress();
}

function updateProgress() {
  const completed = tasks.filter(task => task.done).length;
  const total = tasks.length;

  document.getElementById('task-count').textContent =
    `${completed} / ${total}`;

  const percentage = total ? (completed / total) * 100 : 0;

  document.getElementById('task-progress-fill').style.width =
    percentage + '%';
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const value = taskInput.value.trim();

  if (!value) return;

  tasks.push({
    text: value,
    done: false
  });

  saveTasks();
  renderTasks();

  taskInput.value = '';
});

renderTasks();


// 3. HABITS — FULL TRACKER

const habitsList = document.getElementById('habits-list');
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');

const habitsToday = [
  new Date().getFullYear(),
  String(new Date().getMonth() + 1).padStart(2, '0'),
  String(new Date().getDate()).padStart(2, '0')
].join('-');

const oldHabits = JSON.parse(
  localStorage.getItem('myLifeHabits') || '{}'
);

const oldHabitsDate = localStorage.getItem('myLifeHabitsDate');

// Переносим старые привычки в новую систему
let habitsData = localStorage.getItem('myLifeHabitsList');

if (habitsData === null) {
  habitsData = [
    { id: 'water', name: 'Выпить воду', emoji: '💧' },
    { id: 'book', name: 'Почитать книгу', emoji: '📖' },
    { id: 'walk', name: 'Прогулка', emoji: '🚶' }
  ];

  localStorage.setItem(
    'myLifeHabitsList',
    JSON.stringify(habitsData)
  );
}

let habits = JSON.parse(
  localStorage.getItem('myLifeHabitsList')
);

// Восстанавливаем отметки за сегодняшний день
let completedHabits = [];

if (oldHabitsDate === habitsToday) {
  completedHabits = ['water', 'book', 'walk']
    .filter((id, index) => oldHabits[index] === true);
}

// Если новая система уже использовалась,
// загружаем её сохранённые отметки
const savedCompletionDate = localStorage.getItem(
  'myLifeHabitCompletionDate'
);

if (savedCompletionDate === habitsToday) {
  completedHabits = JSON.parse(
    localStorage.getItem('myLifeHabitCompletions') || '[]'
  );
}

// При новом дне начинаем с нуля
localStorage.setItem(
  'myLifeHabitCompletionDate',
  habitsToday
);

function saveHabits() {
  localStorage.setItem(
    'myLifeHabitsList',
    JSON.stringify(habits)
  );

  localStorage.setItem(
    'myLifeHabitCompletions',
    JSON.stringify(completedHabits)
  );
}

// Обновляем прогресс
function updateHabitProgress() {
  const total = habits.length;
  const completed = completedHabits.length;

  const percentage = total
    ? (completed / total) * 100
    : 0;

  document.getElementById('habit-progress-text').textContent =
    `${completed} из ${total}`;

  document.getElementById('habit-progress-fill').style.width =
    percentage + '%';
}

// Отрисовываем привычки
function renderHabits() {
  habitsList.innerHTML = '';

  if (habits.length === 0) {
    habitsList.innerHTML =
      '<p class="habits-empty">Пока привычек нет. Добавь первую ✨</p>';
  }

  habits.forEach(habit => {
    const item = document.createElement('div');

    item.className = 'habit-item';

    if (completedHabits.includes(habit.id)) {
      item.classList.add('checked');
    }

    const emoji = document.createElement('span');
    emoji.textContent = habit.emoji;

    const name = document.createElement('span');
    name.className = 'habit-name';
    name.textContent = habit.name;

    const check = document.createElement('span');
    check.className = 'habit-check';
    check.textContent = completedHabits.includes(habit.id)
      ? '✓'
      : '○';

    const actions = document.createElement('div');
    actions.className = 'habit-actions';

    // Редактирование
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = '✎';
    editButton.title = 'Изменить привычку';

    editButton.addEventListener('click', event => {
      event.stopPropagation();

      const newName = prompt(
        'Новое название привычки:',
        habit.name
      );

      if (newName === null) return;

      if (!newName.trim()) {
        alert('Название не может быть пустым.');
        return;
      }

      habit.name = newName.trim();

      saveHabits();
      renderHabits();
    });

    // Удаление
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = '×';
    deleteButton.title = 'Удалить привычку';

    deleteButton.addEventListener('click', event => {
      event.stopPropagation();

      if (!confirm(`Удалить привычку «${habit.name}»?`)) {
        return;
      }

      habits = habits.filter(item => item.id !== habit.id);

      completedHabits = completedHabits.filter(
        id => id !== habit.id
      );

      saveHabits();
      renderHabits();
    });

    actions.append(editButton, deleteButton);

    // Отметка выполнения
    item.addEventListener('click', () => {
      if (completedHabits.includes(habit.id)) {
        completedHabits = completedHabits.filter(
          id => id !== habit.id
        );
      } else {
        completedHabits.push(habit.id);
      }

      saveHabits();
      renderHabits();
    });

    item.append(emoji, name, check, actions);
    habitsList.appendChild(item);
  });

  updateHabitProgress();
}

// Добавление новой привычки
habitForm.addEventListener('submit', event => {
  event.preventDefault();

  const name = habitInput.value.trim();

  if (!name) return;

  habits.push({
    id: String(Date.now()),
    name: name,
    emoji: '✨'
  });

  habitInput.value = '';

  saveHabits();
  renderHabits();
});

// Первый запуск
saveHabits();
renderHabits();


// 4. NAVIGATION
document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => {
    const page = button.dataset.page;

    if (page === 'finance') {
      window.location.href = 'pages/finance.html';
      return;
    }

    if (page === 'calendar') {
  window.location.href = 'pages/calendar.html';
  return;
}

if (page === 'notes') {
  window.location.href = 'pages/notes.html';
  return;
}

if (page === 'nutrition') {
  window.location.href = 'pages/nutrition.html';
  return;
}

if (page === 'fitness') {
  window.location.href = 'pages/fitness.html';
  return;
}

    document.querySelectorAll('[data-page]').forEach(nav => {
      nav.classList.toggle(
        'active',
        nav.dataset.page === page
      );
    });

    if (page !== 'home') {
      alert('Раздел «' + page + '» мы скоро разработаем!');
    }
  });
});


// 5. WELCOME
console.log('My Life успешно запущен!');
// 5. FINANCE DASHBOARD SYNC

function updateFinanceDashboard() {
  const transactions = JSON.parse(
    localStorage.getItem('myLifeTransactions') || '[]'
  );

  const income = transactions
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expenses;

  const money = amount =>
    new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';

  document.getElementById('balance').textContent = money(balance);
  document.getElementById('income').textContent = money(income);
  document.getElementById('expenses').textContent = money(expenses);
}

updateFinanceDashboard();