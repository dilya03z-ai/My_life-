
const notesList = document.getElementById('notes-list');
const addNoteButton = document.getElementById('add-note-button');

const noteEditor = document.getElementById('note-editor');
const noteEditorDate = document.getElementById('note-editor-date');
const noteContent = document.getElementById('note-content');
const closeNoteEditor = document.getElementById('close-note-editor');
const saveNoteButton = document.getElementById('save-note-button');
let notes = JSON.parse(
  localStorage.getItem('myLifeNotes') || '[]'
);

function saveNotes() {
  localStorage.setItem('myLifeNotes', JSON.stringify(notes));
}

function renderNotes() {
  notesList.innerHTML = '';

  if (notes.length === 0) {
    notesList.innerHTML = '<p class="notes-empty">Здесь пока пусто ✨</p>';
    return;
  }

  notes.forEach(note => {
    const item = document.createElement('div');
    item.className = 'note-item';

    const date = document.createElement('span');
    date.className = 'note-date';
    date.textContent = note.date;

    const content = document.createElement('p');
content.textContent = note.content;

const deleteButton = document.createElement('button');
deleteButton.type = 'button';
deleteButton.className = 'note-delete';
deleteButton.textContent = '×';
deleteButton.title = 'Удалить заметку';

deleteButton.addEventListener('click', () => {
  if (!confirm('Удалить эту заметку?')) return;

  notes = notes.filter(savedNote => savedNote.id !== note.id);

  saveNotes();
  renderNotes();
});

item.append(date, content, deleteButton);
    notesList.appendChild(item);
  });
}


let currentNoteDate = '';

function getTodayDate() {
  return new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

// Открытие редактора
addNoteButton.addEventListener('click', () => {
  currentNoteDate = getTodayDate();
  noteEditorDate.textContent = currentNoteDate;
  noteContent.value = '';
  noteEditor.classList.remove('hidden');
  noteContent.focus();
});

// Закрытие редактора
closeNoteEditor.addEventListener('click', () => {
  noteEditor.classList.add('hidden');
});

// Сохранение заметки
saveNoteButton.addEventListener('click', () => {
  const content = noteContent.value.trim();

  if (!content) return;

  notes.unshift({
    id: String(Date.now()),
    date: currentNoteDate,
    content: content
  });

  saveNotes();
  renderNotes();

  noteContent.value = '';
  noteEditor.classList.add('hidden');
});




// Первый запуск
renderNotes();
