// ===========================================
// 🏫 LICENCES PAR ÉCOLE (À PERSONNALISER)
// ===========================================

const LICENSES = {
  'ECOLE-CYGNE-2024': {
    nom: 'École Primaire Les Cygnes',
    classes: ['CE1A', 'CE1B', 'CM1', 'CM2'],
    expire: '2025-12-31',
    accessCodes: {
      'CE1A': '7845',
      'CE1B': '1234',
      'CM1': '5678',
      'CM2': '9012'
    }
  }
};

// ===========================================
// 📝 ÉLÈVES PAR CLASSE (NON MODIFIABLES)
// ===========================================

const DEFAULT_STUDENTS = {
  'CE1A': ['Marie Dubois', 'Lucas Martin', 'Emma Petit', 'Hugo Bernard', 'Camille Thomas'],
  'CE1B': ['Léa Richard', 'Gabriel Moreau', 'Jade Lefevre', 'Nathan Roux', 'Inès Garcia'],
  'CE1C': ['Tom Petit', 'Lola Simon', 'Raphaël Laurent', 'Inès Michel', 'Louis Fernandez'],
  'CM1': ['Arthur Simon', 'Clara Laurent', 'Marius Michel', 'Zoé Fernandez', 'Tom Chevalier'],
  'CM2': ['Nina Girard', 'Enzo Lemoine', 'Lilou Renaud', 'Adam Dumont', 'Nora Leroy'],
  '6EME': ['Alice Petit', 'Louis Morel', 'Chloé Rousseau', 'Mathis Girard', 'Manon Lemoine'],
  '5EME': ['Jade Petit', 'Hugo Morel', 'Léa Rousseau', 'Lucas Girard', 'Emma Lemoine'],
  '4EME': ['Inès Petit', 'Nathan Morel', 'Zoé Rousseau', 'Tom Girard', 'Camille Lemoine'],
  '3EME': ['Lola Petit', 'Raphaël Morel', 'Nina Rousseau', 'Arthur Girard', 'Clara Lemoine']
};

// ===========================================
// 🔐 SÉCURITÉ & GESTION DES LICENCES
// ===========================================

let currentLicense = null;
let currentClass = localStorage.getItem('presco-current-class') || 'CE1A';

// Vérification de la licence
function verifyLicense() {
  const saved = localStorage.getItem('presco-license-key');
  if (saved && LICENSES[saved] && new Date() <= new Date(LICENSES[saved].expire)) {
    currentLicense = saved;
    updateLicenseDisplay();
    populateClassSelector(); // ➜ CRUCIAL : remplit le menu déroulant
    showMainInterface();     // ➜ CRUCIAL : affiche l'interface principale
    return true;
  }
  return false;
}

function updateLicenseDisplay() {
  const license = LICENSES[currentLicense];
  if (license) {
    document.getElementById('schoolName').textContent = license.nom;
    document.getElementById('licenseCode').textContent = currentLicense;
  }
}

// ➜ NOUVELLE FONCTION : remplit le menu déroulant des classes
function populateClassSelector() {
  const license = LICENSES[currentLicense];
  if (!license) return;
  
  const select = document.getElementById('classSelect');
  select.innerHTML = ''; // Vider
  
  license.classes.forEach(classe => {
    const option = document.createElement('option');
    option.value = classe;
    option.textContent = classe;
    select.appendChild(option);
  });
  
  // Sélectionner la classe actuelle si elle existe
  if (license.classes.includes(currentClass)) {
    select.value = currentClass;
  } else {
    currentClass = license.classes[0] || 'CE1A';
    select.value = currentClass;
  }
}

// ➜ NOUVELLE FONCTION : affiche l'interface principale
function showMainInterface() {
  document.getElementById('classSelector').style.display = 'block';
  document.getElementById('mainNav').style.display = 'flex';
  showSection('presences');
}

// ➜ NOUVELLE FONCTION : gestion du changement de classe
function changeClass() {
  if (!isLicenseValid()) {
    if (!verifyLicense()) return;
  }
  
  currentClass = document.getElementById('classSelect').value;
  
  // Vérifier que la classe est autorisée
  const license = LICENSES[currentLicense];
  if (!license || !license.classes.includes(currentClass)) {
    alert(`❌ La classe ${currentClass} n'est pas incluse dans votre licence.\n\nClasses disponibles : ${license.classes.join(', ')}`);
    return;
  }
  
  // Vérifier le code d'accès
  if (!checkClassAccess(currentClass)) return;
  
  // Sauvegarder et recharger
  localStorage.setItem('presco-current-class', currentClass);
  document.getElementById('classDisplay').textContent = currentClass;
  loadStudents();
  loadPresenceStatus();
  renderStudents();
  updateTotals();
}

// ===========================================
// 📊 STATISTIQUES & EXPORTS
// ===========================================

function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(section).classList.add('active');
  event.target.classList.add('active');
  
  if (section === 'stats') {
    showPeriod('week');
  }
}

function showPeriod(period) {
  // Code identique à la version précédente
  const statsContent = document.getElementById('statsContent');
  const now = new Date();
  let periodName;
  
  switch(period) {
    case 'week': periodName = 'Cette semaine'; break;
    case 'month': periodName = 'Ce mois'; break;
    case 'quarter': periodName = 'Ce trimestre'; break;
  }
  
  // Calcul des stats (code identique)
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
  const joursTravailles = getWorkingDays(startDate, endDate);
  
  let html = `
    <div class="stats-summary">
      <div class="stat-card">
        <div class="stat-number">${totalAbsences}</div>
        <div class="stat-label">Absences</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${totalPresences}</div>
        <div class="stat-label">Présences</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${joursTravailles}</div>
        <div class="stat-label">Jours travaillés</div>
      </div>
    </div>
    
    <h3>Détails par élève</h3>
    <table>
      <thead>
        <tr>
          <th>Élève</th>
          <th>Absences</th>
          <th>Présences</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  const sorted = Object.entries(absences).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([name, absCount]) => {
    const presCount = presences[name];
    const color = absCount >= 3 ? 'high' : absCount >= 1 ? 'medium' : 'low';
    html += `
      <tr class="risk-${color}">
        <td>${name}</td>
        <td style="color:var(--danger); font-weight:bold;">${absCount}</td>
        <td style="color:var(--success); font-weight:bold;">${presCount}</td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  statsContent.innerHTML = html;
}

function exportCSV() {
  const today = new Date().toISOString().split('T')[0];
  const license = LICENSES[currentLicense];
  let csv = `ÉCOLE;${license.nom}\nCLASSE;${currentClass}\nDATE;${today}\n\nNOM;STATUT\n`;
  
  students.forEach(name => {
    const etat = status[name] === 'present' ? 'Présent' : 
                 status[name] === 'absent' ? 'Absent' : 'Non renseigné';
    csv += `${name};${etat}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `presco-${currentClass}-${today}.csv`;
  a.click();
}

function exportStats() {
  const now = new Date();
  const license = LICENSES[currentLicense];
  let csv = `STATISTIQUES - ${license.nom} - Classe ${currentClass}\nExporté le : ${now.toLocaleString('fr-FR')}\n\n`;
  
  ['week', 'month', 'quarter'].forEach(period => {
    const periodName = period === 'week' ? 'Semaine' : 
                       period === 'month' ? 'Mois' : 'Trimestre';
    csv += `=== ${periodName} ===\nÉlève;Absences;Présences\n`;
    
    // Récupération des données
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
    
    const sorted = Object.entries(absences).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([name, absCount]) => {
      csv += `${name};${absCount};${presences[name]}\n`;
    });
    
    csv += '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stats-${currentClass}-${now.toISOString().split('T')[0]}.csv`;
  a.click();
}

// ===========================================
// 📋 GESTION DES PRÉSENCES
// ===========================================

let students = [];
let status = {};

function loadStudents() {
  console.log('🔍 DEBUG - Chargement élèves pour classe:', currentClass);
  
  const storageKey = `students-array-${currentClass}`;
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    students = JSON.parse(saved);
    console.log('✅ Élèves chargés depuis localStorage:', students);
  } else {
    students = DEFAULT_STUDENTS[currentClass] || [
      'Élève 1', 'Élève 2', 'Élève 3', 'Élève 4', 'Élève 5'
    ];
    console.log('✅ Élèves chargés depuis DEFAULT_STUDENTS:', students);
    
    localStorage.setItem(storageKey, JSON.stringify(students));
  }
}

function loadPresenceStatus() {
  const today = new Date().toISOString().split('T')[0];
  const presenceKey = `presco-${currentClass}-${today}`;
  status = JSON.parse(localStorage.getItem(presenceKey)) || {};
}

function renderStudents() {
  const app = document.getElementById('studentsList');
  app.innerHTML = '';
  
  const sortedStudents = [...students].sort((a, b) => a.localeCompare(b));
  
  sortedStudents.forEach(name => {
    const div = document.createElement('div');
    div.className = 'student ' + (status[name] || '');
    div.textContent = name;
    div.onclick = () => toggle(name, div);
    app.appendChild(div);
  });
  
  updateTotals();
}

function updateTotals() {
  const totalStudents = students.length;
  let totalPresent = 0;
  let totalAbsent = 0;
  
  students.forEach(name => {
    if (status[name] === 'present') totalPresent++;
    else if (status[name] === 'absent') totalAbsent++;
  });
  
  document.getElementById('totalStudents').textContent = totalStudents;
  document.getElementById('totalPresent').textContent = totalPresent;
  document.getElementById('totalAbsent').textContent = totalAbsent;
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
  
  updateTotals();
}

// ===========================================
// 🧮 UTILITAIRES DATES
// ===========================================

function getWorkingDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
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

// ===========================================
// 🚀 INITIALISATION
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initialisation Presco V1.5');
  
  if (!verifyLicense()) {
    // Demander la licence si pas valide
    const code = prompt('🏫 Code licence école :');
    if (LICENSES[code] && new Date() <= new Date(LICENSES[code].expire)) {
      localStorage.setItem('presco-license-key', code);
      currentLicense = code;
      updateLicenseDisplay();
      populateClassSelector();
      showMainInterface();
    } else {
      alert('❌ Licence invalide ou expirée.');
      return;
    }
  }
  
  // Initialisation complète
  updateLicenseDisplay();
  populateClassSelector();
  showMainInterface();
  loadStudents();
  loadPresenceStatus();
  renderStudents();
  showSection('presences');
});