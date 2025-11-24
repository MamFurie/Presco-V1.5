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
  },
  
  'ECOLE-LUMIERE-2024': {
    nom: 'École Primaire Lumière',
    classes: ['CE1A', 'CE1B', 'CE1C'],
    expire: '2025-06-30',
    accessCodes: {
      'CE1A': '1111',
      'CE1B': '2222',
      'CE1C': '3333'
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
let students = [];
let status = {};

// Vérification de la licence
async function verifyLicense() {
  const saved = localStorage.getItem('presco-license-key');
  if (saved && LICENSES[saved] && new Date() <= new Date(LICENSES[saved].expire)) {
    currentLicense = saved;
    updateLicenseDisplay();
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

// Afficher les classes disponibles
function displayClassSelection() {
  const license = LICENSES[currentLicense];
  if (!license) return;
  
  const classContainer = document.getElementById('classButtons');
  classContainer.innerHTML = '';
  
  license.classes.forEach(classe => {
    const btn = document.createElement('button');
    btn.className = 'class-btn';
    btn.textContent = classe;
    btn.onclick = () => selectClass(classe);
    classContainer.appendChild(btn);
  });
  
  document.getElementById('classSelection').style.display = 'block';
}

// Gérer la sélection de classe
async function selectClass(classe) {
  const license = LICENSES[currentLicense];
  if (!license) return;
  
  if (!license.classes.includes(classe)) {
    alert('❌ Classe non disponible pour cette licence.');
    return;
  }
  
  // Vérifier l'accès (code)
  const today = new Date().toISOString().split('T')[0];
  const accessKey = `access-${currentLicense}-${classe}-${today}`;
  
  if (!localStorage.getItem(accessKey)) {
    const code = prompt(`🔐 Code d'accès pour la classe ${classe} :`);
    if (code !== license.accessCodes[classe]) {
      document.getElementById('accessMessageText').textContent = 
        '❌ Code incorrect. Contactez l\'administrateur.';
      document.getElementById('classAccessMessage').style.display = 'block';
      setTimeout(() => {
        document.getElementById('classAccessMessage').style.display = 'none';
      }, 3000);
      return;
    }
    localStorage.setItem(accessKey, 'true');
  }
  
  // Accès autorisé
  currentClass = classe;
  localStorage.setItem('presco-current-class', currentClass);
  
  // Masquer la sélection et charger les données
  document.getElementById('classSelection').style.display = 'none';
  document.getElementById('mainNav').style.display = 'flex';
  
  // ✅ CHARGEMENT GARANTI avant affichage
  loadStudents();
  loadPresenceStatus();
  renderStudents();
  showSection('presences');
}

// ===========================================
// 🧭 NAVIGATION & SECTIONS
// ===========================================

function showSection(section, event) {
  // Masquer toutes les sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  // Afficher la section demandée
  document.getElementById(section).classList.add('active');
  
  // Mettre à jour le bouton actif
  if (event && event.target) {
    event.target.classList.add('active');
  } else {
    // Fallback
    document.querySelector(`[onclick*="${section}"]`)?.classList.add('active');
  }
  
  // ✅ CHARGER LES DONNÉES SI NÉCESSAIRE
  if (section === 'stats') {
    // S'assurer que students est chargé
    if (students.length === 0) {
      loadStudents();
    }
    showPeriod('week');
  }
}

// ===========================================
// 📊 PRÉSENCES - GESTION DES ÉLÈVES
// ===========================================

function loadStudents() {
  students = DEFAULT_STUDENTS[currentClass] || [];
  document.getElementById('totalStudents').textContent = students.length;
}

function loadPresenceStatus() {
  const today = new Date().toISOString().split('T')[0];
  const presenceKey = `presco-${currentClass}-${today}`;
  status = JSON.parse(localStorage.getItem(presenceKey)) || {};
  
  // Initialiser les élèves non renseignés
  students.forEach(name => {
    if (!status[name]) {
      status[name] = 'non-renseigne';
    }
  });
}

function renderStudents() {
  const container = document.getElementById('studentsList');
  container.innerHTML = '';
  
  students.forEach(name => {
    const studentDiv = document.createElement('div');
    studentDiv.className = 'student-item';
    
    const isPresent = status[name] === 'present';
    const isAbsent = status[name] === 'absent';
    
    studentDiv.innerHTML = `
      <span class="student-name">${name}</span>
      <div class="status-buttons">
        <button class="status-btn present ${isPresent ? 'active' : ''}" 
                onclick="setStatus('${name}', 'present')">
          ✅ Présent
        </button>
        <button class="status-btn absent ${isAbsent ? 'active' : ''}" 
                onclick="setStatus('${name}', 'absent')">
          ❌ Absent
        </button>
      </div>
    `;
    
    container.appendChild(studentDiv);
  });
  
  updateTotals();
}

function setStatus(name, newStatus) {
  const today = new Date().toISOString().split('T')[0];
  const presenceKey = `presco-${currentClass}-${today}`;
  
  status[name] = newStatus;
  localStorage.setItem(presenceKey, JSON.stringify(status));
  logChange(name, status[name], newStatus);
  renderStudents();
}

function updateTotals() {
  let present = 0, absent = 0;
  students.forEach(name => {
    if (status[name] === 'present') present++;
    else if (status[name] === 'absent') absent++;
  });
  
  document.getElementById('totalPresent').textContent = present;
  document.getElementById('totalAbsent').textContent = absent;
}

// ===========================================
// 📊 STATISTIQUES - CORRIGÉ & OPTIMISÉ
// ===========================================

function showPeriod(period) {
  const statsContent = document.getElementById('statsContent');
  const now = new Date();
  
  // ✅ VALIDATION
  if (!period || !['week', 'month', 'quarter'].includes(period)) {
    console.error('Période invalide:', period);
    return;
  }
  
  const periodName = {
    'week': 'Cette semaine',
    'month': 'Ce mois',
    'quarter': 'Ce trimestre'
  }[period];
  
  // ✅ S'ASSURER QUE STUDENTS EST CHARGÉ
  if (students.length === 0) {
    loadStudents();
  }
  
  // ✅ Indicateur de chargement
  statsContent.innerHTML = `
    <div style="text-align:center; padding:40px;">
      <div class="spinner"></div>
      <p>Chargement des statistiques...</p>
    </div>
  `;
  
  // Calcul asynchrone pour éviter blocage UI
  setTimeout(() => {
    try {
      const { startDate, endDate } = getPeriodDates(period);
      const { absences, presences } = calculateStats(startDate, endDate);
      
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
        <table class="stats-table">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Absences</th>
              <th>Présences</th>
              <th>Taux</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      const sorted = Object.entries(absences).sort((a, b) => b[1] - a[1]);
      sorted.forEach(([name, absCount]) => {
        const presCount = presences[name];
        const total = absCount + presCount;
        const rate = total > 0 ? Math.round((presCount / total) * 100) : 0;
        
        const color = absCount >= 3 ? 'high' : absCount >= 1 ? 'medium' : 'low';
        html += `
          <tr class="risk-${color}">
            <td>${name}</td>
            <td style="color:var(--danger); font-weight:bold;">${absCount}</td>
            <td style="color:var(--success); font-weight:bold;">${presCount}</td>
            <td>${rate}%</td>
          </tr>
        `;
      });
      
      html += '</tbody></table>';
      statsContent.innerHTML = html;
    } catch (error) {
      console.error('Erreur calcul stats:', error);
      statsContent.innerHTML = `
        <div style="color:var(--danger); padding:20px; text-align:center;">
          ❌ Erreur lors du calcul des statistiques
        </div>
      `;
    }
  }, 50);
}

// ===========================================
// 📅 UTILITAIRES DE DATES - CORRIGÉS
// ===========================================

function getPeriodDates(period) {
  const now = new Date();
  let startDate, endDate;
  
  switch(period) {
    case 'week':
      startDate = getStartOfWeek(now);
      endDate = getEndOfWeek(now);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'quarter':
      startDate = getStartOfQuarter(now);
      endDate = getEndOfQuarter(now);
      break;
    default:
      throw new Error(`Période inconnue: ${period}`);
  }
  
  return { startDate, endDate };
}

function calculateStats(startDate, endDate) {
  const absences = {};
  const presences = {};
  
  // ✅ Initialiser pour TOUS les élèves
  students.forEach(name => {
    absences[name] = 0;
    presences[name] = 0;
  });
  
  // ✅ Boucle sécurisée
  const maxDays = 366;
  let days = 0;
  const current = new Date(startDate);
  
  while (current <= endDate && days < maxDays) {
    const dateKey = current.toISOString().split('T')[0];
    const presenceKey = `presco-${currentClass}-${dateKey}`;
    const dayStatus = JSON.parse(localStorage.getItem(presenceKey)) || {};
    
    students.forEach(name => {
      if (dayStatus[name] === 'absent') absences[name]++;
      else if (dayStatus[name] === 'present') presences[name]++;
    });
    
    current.setDate(current.getDate() + 1);
    days++;
  }
  
  return { absences, presences };
}

function getWorkingDays(startDate, endDate) {
  if (!(startDate instanceof Date) || !(endDate instanceof Date) || startDate > endDate) {
    return 0;
  }
  
  const HOLIDAYS = [
    '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08',
    '2025-05-29', '2025-06-09', '2025-07-14', '2025-08-15',
    '2025-11-11', '2025-12-25'
  ];
  
  let count = 0;
  let safety = 0;
  const current = new Date(startDate);
  
  while (current <= endDate && safety < 366) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !HOLIDAYS.includes(dateStr)) {
      count++;
    }
    
    current.setDate(current.getDate() + 1);
    safety++;
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
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
}

function getStartOfQuarter(date) {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

function getEndOfQuarter(date) {
  const start = getStartOfQuarter(date);
  return new Date(start.getFullYear(), start.getMonth() + 3, 0);
}

// ===========================================
// 📤 EXPORTS
// ===========================================

function exportCSV() {
  const today = new Date().toISOString().split('T')[0];
  const license = LICENSES[currentLicense];
  
  if (!license) {
    alert('❌ Licence non valide.');
    return;
  }
  
  let csv = `ÉCOLE;${license.nom}\nCLASSE;${currentClass}\nDATE;${today}\n\nNOM;STATUT\n`;
  
  students.forEach(name => {
    const etat = status[name] === 'present' ? 'Présent' : 
                 status[name] === 'absent' ? 'Absent' : 'Non renseigné';
    csv += `${name};${etat}\n`;
  });
  
  downloadFile(csv, `presco-${currentClass}-${today}.csv`, 'text/csv');
}

function exportStats() {
  const now = new Date();
  const license = LICENSES[currentLicense];
  
  if (!license) {
    alert('❌ Licence non valide.');
    return;
  }
  
  let csv = `STATISTIQUES - ${license.nom} - Classe ${currentClass}\nExporté le : ${now.toLocaleString('fr-FR')}\n\n`;
  
  ['week', 'month', 'quarter'].forEach(period => {
    const periodName = period === 'week' ? 'Semaine' : 
                       period === 'month' ? 'Mois' : 'Trimestre';
    csv += `=== ${periodName} ===\nÉlève;Absences;Présences;Taux\n`;
    
    const { startDate, endDate } = getPeriodDates(period);
    const { absences, presences } = calculateStats(startDate, endDate);
    
    const sorted = Object.entries(absences).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([name, absCount]) => {
      const presCount = presences[name];
      const total = absCount + presCount;
      const rate = total > 0 ? Math.round((presCount / total) * 100) : 0;
      csv += `${name};${absCount};${presCount};${rate}%\n`;
    });
    
    csv += '\n';
  });
  
  downloadFile(csv, `stats-${currentClass}-${now.toISOString().split('T')[0]}.csv`, 'text/csv');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===========================================
// 📝 LOGGING & AUDIT
// ===========================================

function logChange(student, oldStatus, newStatus) {
  const log = {
    timestamp: new Date().toISOString(),
    license: currentLicense,
    class: currentClass,
    student,
    oldStatus,
    newStatus,
    userAgent: navigator.userAgent
  };
  
  const logs = JSON.parse(localStorage.getItem('presco-logs') || '[]');
  logs.push(log);
  
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  
  localStorage.setItem('presco-logs', JSON.stringify(logs));
}

// ===========================================
// 🔐 INITIALISATION
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
  if (!await verifyLicense()) {
    const code = prompt('🏫 Code licence école :');
    if (LICENSES[code] && new Date() <= new Date(LICENSES[code].expire)) {
      localStorage.setItem('presco-license-key', code);
      currentLicense = code;
      updateLicenseDisplay();
    } else {
      alert('❌ Licence invalide ou expirée.');
      document.body.innerHTML = '<h1 style="text-align:center; margin-top:50px;">Accès refusé</h1>';
      return;
    }
  }
  
  displayClassSelection();
  updateLicenseDisplay();
  
  // ✅ S'assurer que students est chargé même si on recharge la page
  if (currentClass && currentLicense) {
    const license = LICENSES[currentLicense];
    if (license && license.classes.includes(currentClass)) {
      // Vérifier si on a déjà accès à cette classe aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const accessKey = `access-${currentLicense}-${currentClass}-${today}`;
      if (localStorage.getItem(accessKey)) {
        document.getElementById('classSelection').style.display = 'none';
        document.getElementById('mainNav').style.display = 'flex';
        loadStudents();
        loadPresenceStatus();
        renderStudents();
        showSection('presences');
      }
    }
  }
  
  window.addEventListener('error', (e) => {
    console.error('❌ Erreur critique:', e.error);
    alert('Une erreur est survenue. Rechargez la page.');
  });
});

// ===========================================
// 🔄 CHANGER DE CLASSE (NOUVELLE FONCTION)
// ===========================================

function changeClass() {
  // Demander confirmation
  const confirmChange = confirm('🔄 Voulez-vous vraiment changer de classe ?\n\nLes données de la classe actuelle seront sauvegardées.');
  
  if (!confirmChange) return;
  
  // Sauvegarder l'état actuel
  try {
    const today = new Date().toISOString().split('T')[0];
    const presenceKey = `presco-${currentClass}-${today}`;
    localStorage.setItem(`${presenceKey}-backup`, JSON.stringify({
      timestamp: new Date().toISOString(),
      class: currentClass,
      data: status
    }));
  } catch (e) {
    console.warn('Erreur sauvegarde backup:', e);
  }
  
  // Réinitialiser l'interface
  currentClass = null;
  students = [];
  status = {};
  
  // Cacher les sections
  document.getElementById('mainNav').style.display = 'none';
  document.getElementById('changeClassBtn').style.display = 'none';
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  // Réafficher le sélecteur de classe
  document.getElementById('classSelection').style.display = 'block';
  document.getElementById('classAccessMessage').style.display = 'none';
  
  // Mettre à jour l'affichage
  document.getElementById('studentsList').innerHTML = '';
  document.getElementById('totalStudents').textContent = '0';
  document.getElementById('totalPresent').textContent = '0';
  document.getElementById('totalAbsent').textContent = '0';
  
  // Afficher les classes disponibles
  displayClassSelection();
  
  console.log('✅ Retour au sélecteur de classe');
}

// ===========================================
// 🔐 INITIALISATION MODIFIÉE
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
  if (!await verifyLicense()) {
    const code = prompt('🏫 Code licence école :');
    if (LICENSES[code] && new Date() <= new Date(LICENSES[code].expire)) {
      localStorage.setItem('presco-license-key', code);
      currentLicense = code;
      updateLicenseDisplay();
    } else {
      alert('❌ Licence invalide ou expirée.');
      document.body.innerHTML = '<h1 style="text-align:center; margin-top:50px;">Accès refusé</h1>';
      return;
    }
  }
  
  displayClassSelection();
  updateLicenseDisplay();
  
  // ✅ S'assurer que students est chargé même si on recharge la page
  if (currentClass && currentLicense) {
    const license = LICENSES[currentLicense];
    if (license && license.classes.includes(currentClass)) {
      const today = new Date().toISOString().split('T')[0];
      const accessKey = `access-${currentLicense}-${currentClass}-${today}`;
      
      // ✅ VÉRIFICATION CLÉ : Si accès valide aujourd'hui, restaurer
      if (localStorage.getItem(accessKey)) {
        document.getElementById('classSelection').style.display = 'none';
        document.getElementById('mainNav').style.display = 'flex';
        document.getElementById('changeClassBtn').style.display = 'block';
        
        loadStudents();
        loadPresenceStatus();
        renderStudents();
        showSection('presences');
      }
    }
  }
});