
const weekContainer = document.getElementById('nutrition-week');
const weekTitle = document.getElementById('nutrition-week-title');
const prevWeekButton = document.getElementById('prev-week');
const nextWeekButton = document.getElementById('next-week');

// MEAL MODAL

const mealModal = document.getElementById('meal-modal');
const mealNameInput = document.getElementById('meal-name');
const mealPhotoInput = document.getElementById('meal-photo');
const mealPhotoPreview = document.getElementById('meal-photo-preview');
const closeMealModal = document.getElementById('close-meal-modal');
const saveMealButton = document.getElementById('save-meal-button');

let selectedMealDate = '';
let selectedMealType = '';

let editingMealId = null;

// NUTRITION STORAGE

let nutritionMeals = JSON.parse(
  localStorage.getItem('myLifeNutritionMeals') || '[]'
);

function saveNutritionMeals() {
  localStorage.setItem(
    'myLifeNutritionMeals',
    JSON.stringify(nutritionMeals)
  );
}


// PHOTO PREVIEW

mealPhotoInput.addEventListener('change', () => {
  const file = mealPhotoInput.files[0];

  mealPhotoPreview.innerHTML = '';

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выбери изображение.');
    mealPhotoInput.value = '';
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const image = document.createElement('img');
    image.src = reader.result;
    image.alt = 'Фото блюда';

    mealPhotoPreview.appendChild(image);
  };

  reader.readAsDataURL(file);
});


// Названия дней
const dayNames = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье'
];

// Приёмы пищи
const mealNames = [
  'Завтрак',
  'Обед',
  'Ужин'
];

// Начинаем с текущей недели
let currentWeekStart = new Date();

currentWeekStart.setHours(0, 0, 0, 0);

const currentDay = currentWeekStart.getDay();
const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

currentWeekStart.setDate(
  currentWeekStart.getDate() - daysFromMonday
);

// Формат даты
function formatNutritionDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}.${month}.${date.getFullYear()}`;
}

// Формирование заголовка недели
function renderWeekTitle() {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const firstDay = currentWeekStart.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });

  const lastDay = weekEnd.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  weekTitle.textContent = `${firstDay} — ${lastDay}`;
}

// Отображение недели
function renderNutritionWeek() {
  weekContainer.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);

    const dayCard = document.createElement('section');
    dayCard.className = 'nutrition-day';

    const dayHeader = document.createElement('div');
    dayHeader.className = 'nutrition-day-header';

    const dayName = document.createElement('h3');
    dayName.textContent = dayNames[i];

    const dayDate = document.createElement('span');
    dayDate.textContent = formatNutritionDate(date);

    dayHeader.append(dayName, dayDate);
    dayCard.appendChild(dayHeader);

    mealNames.forEach(mealName => {
      const mealCard = document.createElement('div');
      mealCard.className = 'nutrition-meal';

      
const mealTitle = document.createElement('h4');
mealTitle.textContent = mealName;

mealCard.appendChild(mealTitle);

mealCard.appendChild(mealTitle);

const savedMeals = nutritionMeals.filter(meal =>
  meal.date === formatNutritionDate(date) &&
  meal.type === mealName
);

// Показываем сохранённые блюда
savedMeals.forEach(savedMeal => {
  const mealEntry = document.createElement('div');
  mealEntry.className = 'nutrition-meal-entry';

  const name = document.createElement('p');
  name.className = 'nutrition-meal-name';
  name.textContent = savedMeal.name;

  mealEntry.appendChild(name);


const actions = document.createElement('div');
actions.className = 'nutrition-meal-actions';

const menuButton = document.createElement('button');
menuButton.type = 'button';
menuButton.className = 'nutrition-meal-menu-button';
menuButton.textContent = '⋯';

const menu = document.createElement('div');
menu.className = 'nutrition-meal-menu hidden';

// Редактирование блюда
const editButton = document.createElement('button');
editButton.textContent = 'Изменить блюдо';

editButton.addEventListener('click', () => {
  editingMealId = savedMeal.id;
  selectedMealDate = savedMeal.date;
  selectedMealType = savedMeal.type;

  mealNameInput.value = savedMeal.name;
  mealPhotoInput.value = '';
  mealPhotoPreview.innerHTML = '';

  if (savedMeal.photo) {
    const preview = document.createElement('img');
    preview.src = savedMeal.photo;
    preview.alt = savedMeal.name;
    mealPhotoPreview.appendChild(preview);
  }

  document.getElementById('meal-modal-title').textContent = 'Изменить блюдо';
  mealModal.classList.remove('hidden');
  menu.classList.add('hidden');
});

// Удаление фотографии
const removePhotoButton = document.createElement('button');
removePhotoButton.textContent = 'Удалить фотографию';

removePhotoButton.addEventListener('click', () => {
  if (!savedMeal.photo) {
    alert('У этого блюда нет фотографии.');
    return;
  }

  if (!confirm('Удалить фотографию?')) return;

  savedMeal.photo = '';
  saveNutritionMeals();
  renderNutritionWeek();
});

// Удаление блюда
const deleteMealButton = document.createElement('button');
deleteMealButton.textContent = 'Удалить блюдо';

deleteMealButton.addEventListener('click', () => {
  if (!confirm(`Удалить блюдо «${savedMeal.name}»?`)) return;

  nutritionMeals = nutritionMeals.filter(
    meal => meal.id !== savedMeal.id
  );

  saveNutritionMeals();
  renderNutritionWeek();
});

menu.append(editButton, removePhotoButton, deleteMealButton);
actions.append(menuButton, menu);
mealEntry.appendChild(actions);

menuButton.addEventListener('click', event => {
  event.stopPropagation();

  document.querySelectorAll('.nutrition-meal-menu').forEach(openMenu => {
    if (openMenu !== menu) {
      openMenu.classList.add('hidden');
    }
  });

  menu.classList.toggle('hidden');
});


  if (savedMeal.photo) {
    const image = document.createElement('img');
    image.src = savedMeal.photo;
    image.alt = savedMeal.name;
    image.className = 'nutrition-meal-photo';

    mealEntry.appendChild(image);
  }

  mealCard.appendChild(mealEntry);
});

// Кнопка добавления

const addText = document.createElement('button');
addText.type = 'button';
addText.className = 'nutrition-empty';
addText.textContent = '+ Добавить блюдо';

addText.addEventListener('click', () => {
  selectedMealDate = formatNutritionDate(date);
  selectedMealType = mealName;
  editingMealId = null;

  mealNameInput.value = '';
  mealPhotoInput.value = '';
  mealPhotoPreview.innerHTML = '';

  mealModal.classList.remove('hidden');
});

mealCard.appendChild(addText);


      dayCard.appendChild(mealCard);
    });

    weekContainer.appendChild(dayCard);
  }

  renderWeekTitle();
}

// Переключение недель
prevWeekButton.addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderNutritionWeek();
});

nextWeekButton.addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderNutritionWeek();
});

// Первый запуск
renderNutritionWeek();


// Сжатие фотографии для экономии места
function compressMealPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 900;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height)
        );

        const canvas = document.createElement('canvas');
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Сохранение блюда

saveMealButton.addEventListener('click', async () => {
  const name = mealNameInput.value.trim();

  if (!name) {
    alert('Напиши название блюда.');
    return;
  }

  const photoFile = mealPhotoInput.files[0];

  try {
    let newPhoto = null;

    if (photoFile) {
      newPhoto = await compressMealPhoto(photoFile);
    }

    // Редактирование существующего блюда
    if (editingMealId) {
      const savedMeal = nutritionMeals.find(
        meal => meal.id === editingMealId
      );

      if (!savedMeal) return;

      savedMeal.name = name;

      // Заменяем фото, только если выбрано новое
      if (newPhoto !== null) {
        savedMeal.photo = newPhoto;
      }

    } else {
      // Создание нового блюда
      nutritionMeals.push({
        id: String(Date.now()),
        date: selectedMealDate,
        type: selectedMealType,
        name: name,
        photo: newPhoto || ''
      });
    }

    saveNutritionMeals();

    editingMealId = null;
    mealModal.classList.add('hidden');

    mealNameInput.value = '';
    mealPhotoInput.value = '';
    mealPhotoPreview.innerHTML = '';

    document.getElementById('meal-modal-title').textContent = 'Добавить блюдо';

    renderNutritionWeek();

  } catch (error) {
    alert('Не удалось сохранить фотографию. Попробуй другое изображение.');
  }
});
// CLOSE MEAL MODAL

closeMealModal.addEventListener('click', () => {
  mealModal.classList.add('hidden');
  editingMealId = null;
});

// Закрытие при нажатии на затемнённый фон
mealModal.addEventListener('click', event => {
  if (event.target === mealModal) {
    mealModal.classList.add('hidden');
    editingMealId = null;
  }
});

