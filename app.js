// ===========================================
// 📝 MODIFIEZ CETTE SECTION AVEC VOS ÉLÈVES
// ===========================================

const DEFAULT_STUDENTS = {
  'CE1A': [
    'Marie Dubois',
    'Lucas Martin',
    'Emma Petit',
    'Hugo Bernard',
    'Camille Thomas'
  ],
  'CE1B': [
    'Léa Richard',
    'Gabriel Moreau',
    'Jade Lefevre',
    'Nathan Roux',
    'Inès Garcia'
  ],
  'CE1C': [
    'Tom Petit',
    'Lola Simon',
    'Raphaël Laurent',
    'Inès Michel',
    'Louis Fernandez'
  ],
  'CM1': [
    'Arthur Simon',
    'Clara Laurent',
    'Marius Michel',
    'Zoé Fernandez',
    'Tom Chevalier'
  ],
  'CM2': [
    'Nina Girard',
    'Enzo Lemoine',
    'Lilou Renaud',
    'Adam Dumont',
    'Nora Leroy'
  ],
  '6EME': [
    'Alice Petit',
    'Louis Morel',
    'Chloé Rousseau',
    'Mathis Girard',
    'Manon Lemoine'
  ],
  '5EME': [
    'Jade Petit',
    'Hugo Morel',
    'Léa Rousseau',
    'Lucas Girard',
    'Emma Lemoine'
  ],
  '4EME': [
    'Inès Petit',
    'Nathan Morel',
    'Zoé Rousseau',
    'Tom Girard',
    'Camille Lemoine'
  ],
  '3EME': [
    'Lola Petit',
    'Raphaël Morel',
    'Nina Rousseau',
    'Arthur Girard',
    'Clara Lemoine'
  ]
};

// ===========================================
// ⬆️ FIN DE LA SECTION À MODIFIER
// ===========================================

// === GESTION DE LA CLASSE ===

let currentClass = localStorage.getItem('presco-current-class') || 'CE1A';

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('classSelect').value = currentClass;
  document.getElementById('classDisplay').textContent = currentClass;
  document.getElementById('configClassName').textContent = currentClass;
  loadStudents();
  loadPresenceStatus();
  renderStudents();
});

// Changer de classe
function changeClass() {
  currentClass = document.getElementById('classSelect').value;
  localStorage.setItem('presco-current-class', currentClass);
  document.getElementById('classDisplay').textContent = currentClass;
  document.getElementById('configClassName').textContent = currentClass;
  
  loadStudents();
  loadPresenceStatus();
  renderStudents();
  
  const panel = document.getElementById('configPanel');
  if (panel.style.display !== 'none') {
    showConfig();
  }
}

// === CONFIGURATION ÉLÈVES ===

function showConfig() {
  const panel = document.getElementById('configPanel');
  const textarea = document.getElementById('studentNames');
  
  const storageKey = `students-${currentClass}`;
  const existing = localStorage.getItem(storageKey);
  textarea.value = existing || '';
  
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function saveConfig() {
  const namesText = document.getElementById('studentNames').value;
  const namesArray = namesText.split('\n').filter(n => n.trim() !== '');
  
  if (namesArray.length === 0) {
    alert('Veuillez entrer au moins un nom !');
    return;
  }
  
  localStorage.setItem(`students-${currentClass}`, namesText);
  localStorage.setItem(`students-array-${currentClass}`, JSON.stringify(namesArray));
  
  alert(`✅ ${namesArray.length} élèves sauvegardés pour ${currentClass} !`);
  document.getElementById('configPanel').style.display = 'none';
  
  loadStudents();
  renderStudents();
}

function resetStudents() {
  if (confirm('⚠️ Réinitialiser les noms aux valeurs par défaut ?\n\nCela effacera les modifications manuelles.')) {
    localStorage.removeItem(`students-array-${currentClass}`);
    localStorage.removeItem(`students-${currentClass}`);
    loadStudents();
    renderStudents();
    alert('✅ Noms réinitialisés !');
  }
}

// === CHARGEMENT DES ÉLÈVES ===

let students = [];

function loadStudents() {
  const storageKey = `students-array-${currentClass}`;
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    // Utiliser les noms sauvegardés (priorité)
    students = JSON.parse(saved);
  } else if (DEFAULT_STUDENTS[currentClass]) {
    // Utiliser les noms pré-définis pour cette classe
    students = DEFAULT_STUDENTS[currentClass];
    // Sauvegarde automatique dans localStorage
    localStorage.setItem(storageKey, JSON.stringify(students));
    localStorage.setItem(`students-${currentClass}`, students.join('\n'));
  } else {
    // Backup : noms génériques
    students = ['Élève 1', 'Élève 2', 'Élève 3', 'Élève 4', 'Élève 5'];
  }
}

// === GESTION DES PRÉSENCES ===

let status = {};

function loadPresenceStatus() {
  const today = new Date().toISOString().split('T')[0];
  const presenceKey = `presco-${currentClass}-${today}`;
  status = JSON.parse(localStorage.getItem(presenceKey)) || {};
}

function renderStudents() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  students.forEach(name => {
    const div = document.createElement('div');
    div.className = 'student ' + (status[name] || '');
    div.textContent = name;
    div.onclick = () => toggle(name, div);
    app.appendChild(div);
  });
}

function toggle(name, div) {
  if (!status[name] || status[name] === 'present') {
    status[name] = 'absent';
    div.className = 'student absent';
  } else {
    status[name] = 'present';
    div.className = 'student present';
  }
  const today = new Date().toISOString().split('T')[0];
  const presenceKey = `presco-${currentClass}-${today}`;
  localStorage.setItem(presenceKey, JSON.stringify(status));
}

// === EXPORT ===

function exportCSV() {
  const today = new Date().toISOString().split('T')[0];
  let csv = `Classe,${currentClass}\nDate,${today}\n\nNom,Statut\n`;
  students.forEach(name => {
    const etat = status[name] === 'present' ? 'Présent' : 
                 status[name] === 'absent' ? 'Absent' : 'Non renseigné';
    csv += `${name},${etat}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `presco-${currentClass}-${today}.csv`;
  a.click();
}

function sendWhatsApp() {
  const today = new Date().toISOString().split('T')[0];
  let message = `*Presco - ${currentClass} - ${today}*\n\n`;
  students.forEach(name => {
    const symbol = status[name] === 'present' ? '[P] ' : 
                   status[name] === 'absent'  ? '[A] ' : '[N] ';
    message += `${symbol}${name}\n`;
  });
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

// === SERVICE WORKER ===

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}