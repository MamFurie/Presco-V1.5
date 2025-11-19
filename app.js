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

// === UTILITAIRES DATES ===

function getWeekKey(date) {
  const d = new Date(date);
  const week = getWeekNumber(d);
  return `${d.getFullYear()}-W${week}`;
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getQuarterKey(date) {
  const d = new Date(date);
  const quarter = Math.ceil((d.getMonth() + 1) / 3);
  return `${d.getFullYear()}-Q${quarter}`;
}

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
  hideStats();
  
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
    students = JSON.parse(saved);
  } else if (DEFAULT_STUDENTS[currentClass]) {
    students = DEFAULT_STUDENTS[currentClass];
    localStorage.setItem(storageKey, JSON.stringify(students));
    localStorage.setItem(`students-${currentClass}`, students.join('\n'));
  } else {
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

// === ACTUALISATION AUTOMATIQUE DÉJÀ PRÉSENTE ===
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
  // La ligne ci-dessus sauvegarde automatiquement
  // renderStudents() est appelé à chaque toggle via le DOM
}

// === STATISTIQUES ===

function showStats() {
  const panel = document.getElementById('statsPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  document.getElementById('statsClass').textContent = currentClass;
  showPeriod('week');
}

function hideStats() {
  document.getElementById('statsPanel').style.display = 'none';
}

function showPeriod(period) {
  const statsContent = document.getElementById('statsContent');
  const now = new Date();
  let periodKey, periodName;
  
  switch(period) {
    case 'week':
      periodKey = getWeekKey(now);
      periodName = 'Cette semaine';
      break;
    case 'month':
      periodKey = getMonthKey(now);
      periodName = 'Ce mois';
      break;
    case 'quarter':
      periodKey = getQuarterKey(now);
      periodName = 'Ce trimestre';
      break;
  }
  
  // Compter les absences ET présences par élève
  const absences = {};
  const presences = {};
  students.forEach(name => {
    absences[name] = 0;
    presences[name] = 0;
  });
  
  // Parcourir toutes les dates de la période
  const startDate = period === 'week' ? getStartOfWeek(now) :
                   period === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) :
                   getStartOfQuarter(now);
  
  const endDate = period === 'week' ? getEndOfWeek(now) :
                  period === 'month' ? new Date(now.getFullYear(), now.getMonth() + 1, 0) :
                  getEndOfQuarter(now);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    const presenceKey = `presco-${currentClass}-${dateKey}`;
    const dayStatus = JSON.parse(localStorage.getItem(presenceKey)) || {};
    
    students.forEach(name => {
      if (dayStatus[name] === 'absent') {
        absences[name]++;
      } else if (dayStatus[name] === 'present') {
        presences[name]++;
      }
    });
  }
  
  // Calculer totaux
  const totalAbsences = Object.values(absences).reduce((a, b) => a + b, 0);
  const totalPresences = Object.values(presences).reduce((a, b) => a + b, 0);
  const joursTravailles = getWorkingDays(startDate, endDate);
  
  // Afficher les résultats
  let html = `
    <h4>📊 Statistiques ${periodName}</h4>
    <div style="background:#e8f4f8; padding:10px; border-radius:5px; margin:10px 0;">
      <p><strong>📉 Absences totales :</strong> ${totalAbsences}</p>
      <p><strong>✅ Présences totales :</strong> ${totalPresences}</p>
      <p><strong>📅 Jours travaillés :</strong> ${joursTravailles} jours</p>
    </div>
    <h5>📋 Détails par élève :</h5>
    <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:12px;">
      <thead>
        <tr style="background:#0066FF; color:white;">
          <th style="padding:8px; text-align:left;">Élève</th>
          <th style="padding:8px; text-align:center; width:80px;">Absences</th>
          <th style="padding:8px; text-center; width:80px;">Présences</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Trier par nombre d'absences (desc)
  const sortedStudents = Object.entries(absences).sort((a, b) => b[1] - a[1]);
  
  sortedStudents.forEach(([name, absCount]) => {
    const presCount = presences[name];
    const color = absCount >= 3 ? '#ff6b6b' : absCount >= 1 ? '#ffa726' : '#66bb6a';
    html += `
      <tr style="background:${color}20; border-bottom:1px solid #ddd;">
        <td style="padding:8px;">${name}</td>
        <td style="padding:8px; text-align:center; font-weight:bold; color:#d32f2f;">${absCount}</td>
        <td style="padding:8px; text-align:center; font-weight:bold; color:#388e3c;">${presCount}</td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  html += `<p style="margin-top:15px;"><small>💡 Mise à jour : ${new Date().toLocaleString('fr-FR')}</small></p>`;
  
  statsContent.innerHTML = html;
}

function getWorkingDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getEndOfWeek(date) {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

function getStartOfQuarter(date) {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

function getEndOfQuarter(date) {
  const start = getStartOfQuarter(date);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 3);
  end.setDate(0);
  return end;
}

// === EXPORT STATISTIQUES ===

function exportStats() {
  const now = new Date();
  let csv = `STATISTIQUES D'ABSENCES - ${currentClass}\n`;
  csv += `Exporté le : ${now.toLocaleString('fr-FR')}\n\n`;
  
  // Export semaine
  csv += `📅 SEMAINE ${getWeekKey(now)}\n`;
  csv += exportPeriodStats('week');
  csv += `\n`;
  
  // Export mois
  csv += `📅 MOIS ${getMonthKey(now)}\n`;
  csv += exportPeriodStats('month');
  csv += `\n`;
  
  // Export trimestre
  csv += `📅 TRIMESTRE ${getQuarterKey(now)}\n`;
  csv += exportPeriodStats('quarter');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stats-${currentClass}-${now.toISOString().split('T')[0]}.csv`;
  a.click();
}

function exportPeriodStats(period) {
  const now = new Date();
  const startDate = period === 'week' ? getStartOfWeek(now) :
                   period === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) :
                   getStartOfQuarter(now);
  
  const endDate = period === 'week' ? getEndOfWeek(now) :
                  period === 'month' ? new Date(now.getFullYear(), now.getMonth() + 1, 0) :
                  getEndOfQuarter(now);
  
  const absences = {};
  const presences = {};
  students.forEach(name => {
    absences[name] = 0;
    presences[name] = 0;
  });
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    const presenceKey = `presco-${currentClass}-${dateKey}`;
    const dayStatus = JSON.parse(localStorage.getItem(presenceKey)) || {};
    
    students.forEach(name => {
      if (dayStatus[name] === 'absent') absences[name]++;
      else if (dayStatus[name] === 'present') presences[name]++;
    });
  }
  
  const totalAbsences = Object.values(absences).reduce((a, b) => a + b, 0);
  const totalPresences = Object.values(presences).reduce((a, b) => a + b, 0);
  
  let csv = `Élève,Absences,Présences\n`;
  const sortedStudents = Object.entries(absences).sort((a, b) => b[1] - a[1]);
  
  sortedStudents.forEach(([name, absCount]) => {
    csv += `${name},${absCount},${presences[name]}\n`;
  });
  
  csv += `\nTOTAL,${totalAbsences},${totalPresences}\n`;
  return csv;
}

// === EXPORT DU JOUR ===

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

// === SERVICE WORKER ===

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}