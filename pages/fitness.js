
/* =====================================
   MY LIFE — FITNESS
   Полная версия спортивного раздела
===================================== */

// 1. ОСНОВНЫЕ ЭЛЕМЕНТЫ

const progressCount = document.getElementById('fitness-progress-count');
const progressDays = document.getElementById('fitness-progress-days');
const weekLabel = document.getElementById('fitness-week-label');

const workoutGrid = document.getElementById('fitness-workout-grid');
const fitnessDetail = document.getElementById('fitness-detail');
const fitnessDetailTitle = document.getElementById('fitness-detail-title');
const fitnessVideoList = document.getElementById('fitness-video-list');

const workoutModal = document.getElementById('workout-modal');
const videoModal = document.getElementById('video-modal');

const workoutNameInput = document.getElementById('workout-name');
const videoNameInput = document.getElementById('video-name');
const videoLinkInput = document.getElementById('video-link');

let currentWorkoutId = null;


// 2. СТАНДАРТНЫЕ КАТЕГОРИИ

const fitnessStorageKey = 'myLifeFitnessWorkouts';

const defaultWorkouts = [
  {
    id: 'yoga',
    name: 'Йога',
    description: 'Гибкость и баланс',
    icon: '🪷',
    videos: []
  },
  {
    id: 'arms',
    name: 'Руки',
    description: 'Сильные руки',
    icon: '💪',
    videos: []
  },
  {
    id: 'glutes',
    name: 'Ягодицы',
    description: 'Упругие формы',
    icon: '🍑',
    videos: []
  },
  {
    id: 'legs',
    name: 'Ноги',
    description: 'Сильные ноги',
    icon: '🦵',
    videos: []
  },
  {
    id: 'full-body',
    name: 'Всё тело',
    description: 'Комплексная тренировка',
    icon: '⭐',
    videos: []
  },
  {
    id: 'meditation',
    name: 'Медитация',
    description: 'Спокойствие в твоём ритме',
    icon: '☾',
    videos: []
  }
];

const defaultIds = new Set(
  defaultWorkouts.map(workout => workout.id)
);


// 3. ЗАГРУЗКА И СОХРАНЕНИЕ ТРЕНИРОВОК

function loadWorkouts() {
  let saved = [];

  try {
    const raw = localStorage.getItem(fitnessStorageKey);

    if (raw) {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        saved = parsed;
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки тренировок:', error);
  }

  // Сохраняем прежние видео стандартных категорий
  const standard = defaultWorkouts.map(defaultWorkout => {
    const existing = saved.find(
      workout => workout && workout.id === defaultWorkout.id
    );

    return {
      ...defaultWorkout,
      ...(existing || {}),
      videos: Array.isArray(existing?.videos)
        ? existing.videos
        : []
    };
  });

  // Не теряем пользовательские категории
  const custom = saved
    .filter(workout =>
      workout &&
      workout.id &&
      !defaultIds.has(workout.id)
    )
    .map(workout => ({
      ...workout,
      videos: Array.isArray(workout.videos)
        ? workout.videos
        : []
    }));

  return [...standard, ...custom];
}

let workouts = loadWorkouts();

function saveWorkouts() {
  try {
    localStorage.setItem(
      fitnessStorageKey,
      JSON.stringify(workouts)
    );
  } catch (error) {
    console.error('Ошибка сохранения тренировок:', error);
    alert('Не удалось сохранить данные. Проверь свободное место в браузере.');
    return false;
  }

  return true;
}

// Сохраняем объединённый список, не удаляя старые данные
saveWorkouts();


// 4. НЕДЕЛЬНЫЙ ПРОГРЕСС

const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getWeekStart(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  result.setDate(
    result.getDate() - (day === 0 ? 6 : day - 1)
  );

  return result;
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

let currentWeekStart = getWeekStart(new Date());

function getProgressStorageKey() {
  return `myLifeFitnessProgress_${getDateKey(currentWeekStart)}`;
}

function loadProgress() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(getProgressStorageKey()) || '[]'
    );

    if (!Array.isArray(saved)) return [];

    return saved.filter(
      day => Number.isInteger(day) && day >= 0 && day <= 6
    );

  } catch (error) {
    return [];
  }
}

let completedDays = loadProgress();

function saveProgress() {
  try {
    localStorage.setItem(
      getProgressStorageKey(),
      JSON.stringify(completedDays)
    );
  } catch (error) {
    console.error('Ошибка сохранения прогресса:', error);
  }
}

function renderProgress() {
  progressDays.innerHTML = '';

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startLabel = currentWeekStart.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });

  const endLabel = weekEnd.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  weekLabel.textContent = `${startLabel} — ${endLabel}`;

  dayNames.forEach((dayName, index) => {
    const dayButton = document.createElement('button');
    dayButton.type = 'button';
    dayButton.className = 'fitness-progress-day';

    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);

    const isCompleted = completedDays.includes(index);

    if (isCompleted) {
      dayButton.classList.add('completed');
    }

    const circle = document.createElement('span');
    circle.className = 'fitness-progress-circle';
    circle.textContent = isCompleted ? '✓' : '';

    const label = document.createElement('small');
    label.textContent = dayName;

    dayButton.append(circle, label);

    dayButton.addEventListener('click', () => {
      if (completedDays.includes(index)) {
        completedDays = completedDays.filter(
          day => day !== index
        );
      } else {
        completedDays.push(index);
      }

      saveProgress();
      renderProgress();
    });

    progressDays.appendChild(dayButton);
  });

  progressCount.textContent = completedDays.length;
}

// Переключение недель

document.getElementById('fitness-prev-week').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  completedDays = loadProgress();
  renderProgress();
});

document.getElementById('fitness-next-week').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  completedDays = loadProgress();
  renderProgress();
});


// 5. КАРТОЧКИ ТРЕНИРОВОК

function renderWorkoutCards() {
  workoutGrid.innerHTML = '';

  workouts
    .filter(workout => workout.id !== 'meditation')
    .forEach(workout => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'fitness-workout-card';

      const icon = document.createElement('span');
      icon.className = 'fitness-workout-icon';
      icon.textContent = workout.icon || '✧';

      const name = document.createElement('h3');
      name.textContent = workout.name;

      const description = document.createElement('p');
      description.textContent = workout.description || 'Моя тренировка';

      const videoCount = document.createElement('small');
      videoCount.textContent =
        `▶ ${(workout.videos || []).length} видео`;

      card.append(icon, name, description, videoCount);

      card.addEventListener('click', () => {
        openWorkout(workout.id);
      });

      workoutGrid.appendChild(card);
    });
}


// 6. YOUTUBE — ПОЛУЧЕНИЕ ID ВИДЕО

function getYoutubeVideoId(url) {
  try {
    const normalized = url.startsWith('http')
      ? url
      : `https://${url}`;

    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

    let id = '';

    if (host === 'youtu.be') {
      id = parsed.pathname.split('/')[1] || '';
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com'
    ) {
      id = parsed.searchParams.get('v') || '';

      if (!id) {
        const parts = parsed.pathname.split('/').filter(Boolean);

        if (
          ['embed', 'shorts', 'live'].includes(parts[0])
        ) {
          id = parts[1] || '';
        }
      }
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;

  } catch (error) {
    return null;
  }
}


// 7. ОТКРЫТИЕ ТРЕНИРОВКИ

function openWorkout(workoutId) {
  const workout = workouts.find(
    item => item.id === workoutId
  );

  if (!workout) return;

  currentWorkoutId = workoutId;

  fitnessDetailTitle.textContent = workout.name;

  const deleteButton = document.getElementById(
    'delete-workout-button'
  );

  // Стандартные категории нельзя случайно удалить
  deleteButton.style.display = defaultIds.has(workoutId)
    ? 'none'
    : 'inline-flex';

  renderWorkoutVideos(workout);

  fitnessDetail.classList.remove('hidden');
  fitnessDetail.style.display = 'block';

  fitnessDetail.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


// 8. ОТОБРАЖЕНИЕ ВИДЕО

function renderWorkoutVideos(workout) {
  fitnessVideoList.innerHTML = '';

  if (!workout.videos || workout.videos.length === 0) {
    const emptyMessage = document.createElement('p');

    emptyMessage.className = 'fitness-empty';
    emptyMessage.textContent =
      'Пока нет видео. Нажми «Добавить видео» и добавь свою тренировку.';

    fitnessVideoList.appendChild(emptyMessage);
    return;
  }

  workout.videos.forEach(video => {
    const card = document.createElement('div');
    card.className = 'fitness-video-card';

    const title = document.createElement('h3');
    title.textContent = video.name || 'Моя тренировка';

    card.appendChild(title);

    const videoId = getYoutubeVideoId(video.url || '');

    if (videoId) {
      const iframe = document.createElement('iframe');

      const embedUrl = new URL(
        `https://www.youtube.com/embed/${videoId}`
      );

      embedUrl.searchParams.set('rel', '0');
      embedUrl.searchParams.set('playsinline', '1');

      iframe.src = embedUrl.toString();
      iframe.title = video.name || 'YouTube video';
      iframe.loading = 'lazy';

      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

      iframe.allowFullscreen = true;

      // Передаём YouTube информацию об источнике
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';

      card.appendChild(iframe);

      
const actions = document.createElement('div');
actions.className = 'fitness-video-actions';

// Ссылка на YouTube
const openYoutube = document.createElement('a');

openYoutube.href = `https://www.youtube.com/watch?v=${videoId}`;
openYoutube.target = '_blank';
openYoutube.rel = 'noopener noreferrer';
openYoutube.textContent = 'Смотреть на YouTube ↗';
openYoutube.className = 'fitness-youtube-link';

actions.appendChild(openYoutube);

// Удаление видео
const deleteButton = document.createElement('button');

deleteButton.type = 'button';
deleteButton.textContent = 'Удалить';
deleteButton.className = 'fitness-video-delete';

deleteButton.addEventListener('click', () => {
  if (!confirm(`Удалить видео «${video.name}»?`)) return;

  workout.videos = workout.videos.filter(
    item => item.id !== video.id
  );

  if (saveWorkouts()) {
    renderWorkoutVideos(workout);
    renderWorkoutCards();
  }
});

actions.appendChild(deleteButton);
card.appendChild(actions);


    } else {
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Ссылка на видео недоступна.';

      card.appendChild(errorMessage);
    }
    fitnessVideoList.appendChild(card);
  });
}


// 9. МЕДИТАЦИЯ

document.getElementById('open-meditation').addEventListener('click', () => {
  openWorkout('meditation');
});


// 10. ВОЗВРАТ К КАРТОЧКАМ

document.getElementById('back-to-workouts').addEventListener('click', () => {
  fitnessDetail.classList.add('hidden');
  fitnessDetail.style.display = 'none';

  currentWorkoutId = null;

  document.querySelector('.fitness-workouts').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
});


// 11. ДОБАВЛЕНИЕ СВОЕЙ КАТЕГОРИИ

const addWorkoutButton = document.getElementById('add-workout-button');
const saveWorkoutButton = document.getElementById('save-workout-button');
const closeWorkoutModal = document.getElementById('close-workout-modal');

addWorkoutButton.addEventListener('click', () => {
  workoutNameInput.value = '';
  workoutModal.classList.remove('hidden');
});

saveWorkoutButton.addEventListener('click', () => {
  const name = workoutNameInput.value.trim();

  if (!name) {
    alert('Напиши название тренировки.');
    return;
  }

  const exists = workouts.some(
    workout => workout.name.toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    alert('Такая тренировка уже существует.');
    return;
  }

  const newWorkout = {
    id: `custom-${Date.now()}`,
    name: name,
    description: 'Моя тренировка',
    icon: '✧',
    videos: []
  };

  workouts.push(newWorkout);

  if (saveWorkouts()) {
    renderWorkoutCards();
    workoutModal.classList.add('hidden');
    workoutNameInput.value = '';
  }
});

closeWorkoutModal.addEventListener('click', () => {
  workoutModal.classList.add('hidden');
});


// 12. УДАЛЕНИЕ СВОЕЙ КАТЕГОРИИ

document.getElementById('delete-workout-button').addEventListener('click', () => {
  const workout = workouts.find(
    item => item.id === currentWorkoutId
  );

  if (!workout || defaultIds.has(currentWorkoutId)) return;

  if (!confirm(`Удалить категорию «${workout.name}» вместе с её видео?`)) {
    return;
  }

  const previous = workouts;

  workouts = workouts.filter(
    item => item.id !== currentWorkoutId
  );

  if (saveWorkouts()) {
    renderWorkoutCards();

    fitnessDetail.classList.add('hidden');
    fitnessDetail.style.display = 'none';

    currentWorkoutId = null;
  } else {
    workouts = previous;
  }
});


// 13. ДОБАВЛЕНИЕ YOUTUBE-ВИДЕО

const addVideoButton = document.getElementById('add-video-button');
const saveVideoButton = document.getElementById('save-video-button');
const closeVideoModal = document.getElementById('close-video-modal');

addVideoButton.addEventListener('click', () => {
  videoNameInput.value = '';
  videoLinkInput.value = '';

  videoModal.classList.remove('hidden');
});

saveVideoButton.addEventListener('click', () => {
  const name = videoNameInput.value.trim();
  const url = videoLinkInput.value.trim();

  if (!name || !url) {
    alert('Заполни название и ссылку на видео.');
    return;
  }

  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    alert('Проверь ссылку. Нужна корректная ссылка на YouTube.');
    return;
  }

  const workout = workouts.find(
    item => item.id === currentWorkoutId
  );

  if (!workout) {
    alert('Сначала открой тренировку.');
    return;
  }

  if (!Array.isArray(workout.videos)) {
    workout.videos = [];
  }

  workout.videos.push({
    id: String(Date.now()),
    name: name,
    url: `https://www.youtube.com/watch?v=${videoId}`
  });

  if (saveWorkouts()) {
    renderWorkoutVideos(workout);
    renderWorkoutCards();

    videoModal.classList.add('hidden');

    videoNameInput.value = '';
    videoLinkInput.value = '';
  }
});

closeVideoModal.addEventListener('click', () => {
  videoModal.classList.add('hidden');
});


// 14. ЗАКРЫТИЕ ОКОН ПО ФОНУ

[workoutModal, videoModal].forEach(modal => {
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
  });
});


// 15. ЗАКРЫТИЕ ОКОН ПО ESCAPE

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    workoutModal.classList.add('hidden');
    videoModal.classList.add('hidden');
  }
});


// 16. ПЕРВЫЙ ЗАПУСК

fitnessDetail.classList.add('hidden');
fitnessDetail.style.display = 'none';

renderProgress();
renderWorkoutCards();


// =====================================
// MONTHLY FITNESS CALENDAR
// =====================================

const monthModal = document.getElementById('fitness-month-modal');
const monthButton = document.getElementById('fitness-month-button');
const closeMonthModal = document.getElementById('close-fitness-month');

const monthTitle = document.getElementById('fitness-month-title');
const monthGrid = document.getElementById('fitness-month-grid');

const prevMonthButton = document.getElementById('fitness-prev-month');
const nextMonthButton = document.getElementById('fitness-next-month');

let displayedMonth = new Date();
displayedMonth.setDate(1);

// Получаем все отмеченные дни из недельного трекера

function getMarkedDatesForMonth(year, month) {
  const markedDates = new Set();
  const storagePrefix = 'myLifeFitnessProgress_';

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (!key || !key.startsWith(storagePrefix)) continue;

    try {
      const savedDays = JSON.parse(localStorage.getItem(key));

      if (!Array.isArray(savedDays)) continue;

      const weekDateText = key.slice(storagePrefix.length);
      const [weekYear, weekMonth, weekDay] = weekDateText
        .split('-')
        .map(Number);

      if (!weekYear || !weekMonth || !weekDay) continue;

      const weekStartDate = new Date(
        weekYear,
        weekMonth - 1,
        weekDay
      );

      savedDays.forEach(dayIndex => {
        if (
          !Number.isInteger(dayIndex) ||
          dayIndex < 0 ||
          dayIndex > 6
        ) {
          return;
        }

        const markedDate = new Date(weekStartDate);

        markedDate.setDate(
          markedDate.getDate() + dayIndex
        );

        if (
          markedDate.getFullYear() === year &&
          markedDate.getMonth() === month
        ) {
          markedDates.add(getDateKey(markedDate));
        }
      });

    } catch (error) {
      console.error('Ошибка чтения истории тренировок:', error);
    }
  }

  return markedDates;
}


// Отображение календаря

function renderMonthlyCalendar() {
  monthGrid.innerHTML = '';

  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();

  const monthName = displayedMonth.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric'
  });

  monthTitle.textContent =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const markedDates = getMarkedDatesForMonth(year, month);

  const firstDay = new Date(year, month, 1);

  // Понедельник — первый день недели
  const startOffset = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Пустые ячейки перед первым числом
  for (let i = 0; i < startOffset; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'fitness-calendar-empty';

    monthGrid.appendChild(emptyCell);
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);

    const dayCell = document.createElement('div');
    dayCell.className = 'fitness-calendar-day';
    dayCell.textContent = day;

    if (markedDates.has(dateKey)) {
      dayCell.classList.add('completed');
      dayCell.title = 'В этот день была тренировка';
    }

    const today = new Date();

    if (dateKey === getDateKey(today)) {
      dayCell.classList.add('today');
    }

    monthGrid.appendChild(dayCell);
  }
}


// Открытие календаря

monthButton.addEventListener('click', () => {
  displayedMonth = new Date();
  displayedMonth.setDate(1);

  renderMonthlyCalendar();

  monthModal.classList.remove('hidden');
});


// Предыдущий месяц

prevMonthButton.addEventListener('click', () => {
  displayedMonth.setMonth(
    displayedMonth.getMonth() - 1
  );

  renderMonthlyCalendar();
});


// Следующий месяц

nextMonthButton.addEventListener('click', () => {
  displayedMonth.setMonth(
    displayedMonth.getMonth() + 1
  );

  renderMonthlyCalendar();
});


// Закрытие календаря

closeMonthModal.addEventListener('click', () => {
  monthModal.classList.add('hidden');
});

monthModal.addEventListener('click', event => {
  if (event.target === monthModal) {
    monthModal.classList.add('hidden');
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    monthModal.classList.add('hidden');
  }
});
