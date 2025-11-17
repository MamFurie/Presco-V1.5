// === GESTION DE LA CLASSE ===

let currentClass = localStorage.getItem('presco-current-class') || 'CE1A';

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('classSelect').value = currentClass;
  document.getElementById('classDisplay').textContent = currentClass;
  document.getElementById('configClassName').textContent = currentClass;
  loadStudents();
  loadPresenceStatus(); // ✅ Nouvelle fonction pour charger les statuts
  renderStudents();
});

// Changer de classe
function changeClass() {
  currentClass = document.getElementById('classSelect').value;
  localStorage.setItem('presco-current-class', currentClass);
  document.getElementById('classDisplay').textContent = currentClass;
  document.getElementById('configClassName').textContent = currentClass;
  
  // Recharger les élèves pour cette classe
  loadStudents();
  loadPresenceStatus(); // ✅ Recharger les statuts de présence
  renderStudents();
  
  // Recharger le panneau de config si ouvert
  const panel = document.getElementById('configPanel');
  if (panel.style.display !== 'none') {
    showConfig();
  }
}

// === CONFIGURATION ÉLÈVES ===

function showConfig() {
  const panel = document.getElementById('configPanel');
  const textarea = document.getElementById('studentNames');
  
  // Charger les noms de la classe actuelle
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
  
  // Sauvegarder pour la classe actuelle
  localStorage.setItem(`students-${currentClass}`, namesText);
  localStorage.setItem(`students-array-${currentClass}`, JSON.stringify(namesArray));
  
  alert(`✅ ${namesArray.length} élèves sauvegardés pour ${currentClass} !`);
  document.getElementById('configPanel').style.display = 'none';
  
  // Recharger la liste
  loadStudents();
  renderStudents();
}

// === CHARGEMENT DES ÉLÈVES ===

let students = [];

function loadStudents() {
  const storageKey = `students-array-${currentClass}`;
  const saved = localStorage.getItem(storageKey);
  students = saved ? JSON.parse(saved) : [
    'Élève 1',
    'Élève 2', 
    'Élève 3',
    'Élève 4',
    'Élève 5'
  ];
}

// === GESTION DES PRÉSENCES ===

let status = {}; // ✅ Déplacé ici pour être réinitialisé à chaque changement

function loadPresenceStatus() {
  const today = new Date().toISOString().split('T')[0];
  const presenceKey = `presco-${currentClass}-${today}`;
  status = JSON.parse(localStorage.getItem(presenceKey)) || {};
}

const app = document.getElementById('app');

function renderStudents() {
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
  // ✅ Sauvegarder avec la bonne clé
  const today = new Date().toISOString().split('T')[0];
  const presenceKey = `presco-${currentClass}-${today}`;
  localStorage.setItem(presenceKey, JSON.stringify(status));
}

// === EXPORT ===

function exportCSV() {
  const today = new Date().toISOString().split('T')[0]; // ✅ Ajouté ici
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
  const today = new Date().toISOString().split('T')[0]; // ✅ Ajouté ici
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