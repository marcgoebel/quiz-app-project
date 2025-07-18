// Lokale Quiz-Anwendung - Alle Daten werden im localStorage gespeichert

// Globale Variablen
let sessionId = null;
let questions = [];
let current = 0;
let selected = -1;
let playerScore = 0;
let botScore = 0;
let currentCategory = "";
let currentMode = "";
let streakCounter = 0;
let achievements = [];
let unlockedAchievements = [];
let availableCategories = [];
let currentUser = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let quizQuestions = [];
let gameMode = 'classic';
let selectedCategory = 'all';

// Lokale Datenbank im Browser
let localUsers = JSON.parse(localStorage.getItem('quiz_users') || '[]');
let localQuestions = JSON.parse(localStorage.getItem('quiz_questions') || '[]');
let localHighscores = JSON.parse(localStorage.getItem('quiz_highscores') || '[]');
let currentSession = null;

// Standard-Benutzer und Fragen
const defaultUsers = [
    { username: 'testuser', password: '12345' }
];

// Standard-Fragen falls keine vorhanden
if (localQuestions.length === 0) {
    localQuestions = [
        {
            id: '1',
            question: 'Was ist die Hauptstadt von Deutschland?',
            options: ['Berlin', 'München', 'Hamburg', 'Köln'],
            correct: 0,
            category: 'Geographie'
        },
        {
            id: '2', 
            question: 'Welches ist das größte Säugetier?',
            options: ['Elefant', 'Blauwal', 'Giraffe', 'Nashorn'],
            correct: 1,
            category: 'Biologie'
        },
        {
            id: '3',
            question: 'In welchem Jahr fiel die Berliner Mauer?',
            options: ['1987', '1988', '1989', '1990'],
            correct: 2,
            category: 'Geschichte'
        },
        {
            id: '4',
            question: 'Was ist 15 × 8?',
            options: ['110', '120', '125', '130'],
            correct: 1,
            category: 'Mathematik'
        },
        {
            id: '5',
            question: 'Wer schrieb "Faust"?',
            options: ['Schiller', 'Goethe', 'Heine', 'Lessing'],
            correct: 1,
            category: 'Literatur'
        },
        {
            id: '6',
            question: 'Welcher Planet ist der Sonne am nächsten?',
            options: ['Venus', 'Merkur', 'Mars', 'Erde'],
            correct: 1,
            category: 'Astronomie'
        },
        {
            id: '7',
            question: 'Wer komponierte die "Mondscheinsonate"?',
            options: ['Mozart', 'Bach', 'Beethoven', 'Chopin'],
            correct: 2,
            category: 'Musik'
        },
        {
            id: '8',
            question: 'Welches chemische Element hat das Symbol "Au"?',
            options: ['Silber', 'Gold', 'Aluminium', 'Argon'],
            correct: 1,
            category: 'Chemie'
        },
        {
            id: '9',
            question: 'In welchem Jahr wurde die Titanic versenkt?',
            options: ['1910', '1911', '1912', '1913'],
            correct: 2,
            category: 'Geschichte'
        },
        {
            id: '10',
            question: 'Welche Programmiersprache wurde von Guido van Rossum entwickelt?',
            options: ['Java', 'Python', 'C++', 'JavaScript'],
            correct: 1,
            category: 'Informatik'
        },
        {
            id: '11',
            question: 'Wie viele Kontinente gibt es?',
            options: ['5', '6', '7', '8'],
            correct: 2,
            category: 'Geographie'
        },
        {
            id: '12',
            question: 'Wer malte die "Mona Lisa"?',
            options: ['Picasso', 'Van Gogh', 'Da Vinci', 'Michelangelo'],
            correct: 2,
            category: 'Kunst'
        },
        {
            id: '13',
            question: 'Welches ist das kleinste Land der Welt?',
            options: ['Monaco', 'Vatikanstadt', 'San Marino', 'Liechtenstein'],
            correct: 1,
            category: 'Geographie'
        },
        {
            id: '14',
            question: 'Was ist die Quadratwurzel von 144?',
            options: ['11', '12', '13', '14'],
            correct: 1,
            category: 'Mathematik'
        },
        {
            id: '15',
            question: 'Welcher Fußballverein gewann die meisten Champions League Titel?',
            options: ['Barcelona', 'Real Madrid', 'AC Milan', 'Bayern München'],
            correct: 1,
            category: 'Sport'
        }
    ];
    localStorage.setItem('quiz_questions', JSON.stringify(localQuestions));
}

// Standard-Benutzer falls keiner vorhanden
if (localUsers.length === 0) {
    localUsers = [{ username: 'testuser', password: '12345' }];
    localStorage.setItem('quiz_users', JSON.stringify(localUsers));
}

// Login Funktionalität
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Bitte Benutzername und Passwort eingeben!');
        return;
    }
    
    const user = localUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        showScreen('main-menu');
        updateCategoryDropdown();
        updateUserPoints();
    } else {
        alert('Ungültige Anmeldedaten!');
    }
}



// Quiz starten
function startQuiz() {
    const category = document.getElementById('category-select').value;
    const mode = document.getElementById('mode-select').value;
    
    selectedCategory = category;
    gameMode = mode;
    currentCategory = category;
    currentMode = mode;
    
    // Fragen filtern
    if (category === 'all') {
        quizQuestions = [...localQuestions];
    } else {
        quizQuestions = localQuestions.filter(q => q.category === category);
    }
    
    if (quizQuestions.length === 0) {
        alert('Keine Fragen für diese Kategorie verfügbar!');
        return;
    }
    
    // Fragen mischen
    quizQuestions = shuffleArray(quizQuestions);
    questions = quizQuestions;
    
    // Quiz-Session starten
    currentQuestionIndex = 0;
    current = 0;
    score = 0;
    playerScore = 0;
    selectedAnswer = null;
    selected = -1;
    streakCounter = 0;
    
    showScreen('quiz-screen');
    displayQuestion();
}

// Frage anzeigen
function showQuestion() {
    const question = currentSession.questions[currentSession.currentQuestionIndex];
    const questionCounter = document.getElementById('question-counter');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    
    questionCounter.textContent = `Frage ${currentSession.currentQuestionIndex + 1} von ${currentSession.questions.length}`;
    questionText.textContent = question.question;
    
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(button);
    });
}

// Antwort auswählen
function selectAnswer(answerIndex) {
    selectedAnswer = answerIndex;
    selected = answerIndex;
    const question = quizQuestions[currentQuestionIndex];
    const answerButtons = document.querySelectorAll('.answer-option');
    
    // Alle Buttons zurücksetzen
    answerButtons.forEach(button => {
        button.classList.remove('bg-green-200', 'bg-red-200', 'bg-blue-200');
    });
    
    // Richtige Antwort markieren
    answerButtons[question.correct].classList.add('bg-green-200');
    
    // Falsche Antwort markieren (falls ausgewählt)
    if (answerIndex !== question.correct) {
        answerButtons[answerIndex].classList.add('bg-red-200');
        streakCounter = 0;
    } else {
        score++;
        playerScore++;
        streakCounter++;
    }
    
    // Alle Buttons deaktivieren
    answerButtons.forEach(button => {
        button.disabled = true;
    });
    
    // Next Button anzeigen
    const nextButton = document.getElementById('next-question');
    if (nextButton) {
        nextButton.style.display = 'block';
    }
}

// Ergebnisse anzeigen
function showResults() {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    const finalScore = document.getElementById('final-score');
    const finalPercentage = document.getElementById('final-percentage');
    
    if (finalScore) {
        finalScore.textContent = `${score} von ${quizQuestions.length} Fragen richtig`;
    }
    if (finalPercentage) {
        finalPercentage.textContent = `${percentage}%`;
    }
    
    // Highscore speichern
    const highscoreEntry = {
        username: currentUser.username,
        score: score,
        total: quizQuestions.length,
        percentage: percentage,
        category: selectedCategory,
        mode: gameMode,
        date: new Date().toISOString()
    };
    
    localHighscores.push(highscoreEntry);
    localStorage.setItem('quiz_highscores', JSON.stringify(localHighscores));
    
    // Achievements prüfen
    checkAchievements();
    
    showScreen('result-screen');
}

// Zurück zum Hauptmenü
function backToMenu() {
    showScreen('main-menu');
}

// Highscores anzeigen
function showHighscores() {
    const highscoresList = document.getElementById('highscores-list');
    if (!highscoresList) return;
    
    const sortedHighscores = localHighscores
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);
    
    highscoresList.innerHTML = '';
    
    if (sortedHighscores.length === 0) {
        highscoresList.innerHTML = '<tr><td colspan="4" class="text-center py-4">Noch keine Highscores vorhanden</td></tr>';
        return;
    }
    
    sortedHighscores.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-2 px-4 border-b">${index + 1}</td>
            <td class="py-2 px-4 border-b">${entry.username}</td>
            <td class="py-2 px-4 border-b">${entry.score}/${entry.total}</td>
            <td class="py-2 px-4 border-b">${entry.percentage}%</td>
        `;
        highscoresList.appendChild(row);
    });
    
    showScreen('highscore-screen');
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Standarddaten laden falls nicht vorhanden
    if (localUsers.length === 0) {
        localUsers = defaultUsers;
        localStorage.setItem('quiz_users', JSON.stringify(localUsers));
    }
    
    // Achievements initialisieren
    initializeAchievements();
    
    // Kategorien laden
    loadCategories();
    
    showScreen('login-screen');
}

// Screen Management
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
    }
}

// Achievements System
function initializeAchievements() {
    achievements = [
        { id: 'first_point', name: 'Erster Punkt', description: 'Erste richtige Antwort', unlocked: false },
        { id: 'veteran', name: 'Veteran', description: '10 Quiz gespielt', unlocked: false },
        { id: 'champion', name: 'Champion', description: '100 Punkte erreicht', unlocked: false },
        { id: 'quiz_master', name: 'Quiz Master', description: '50 richtige Antworten', unlocked: false },
        { id: 'streak_master', name: 'Streak Master', description: '5 richtige Antworten hintereinander', unlocked: false },
        { id: 'category_expert', name: 'Kategorie-Experte', description: 'Alle Kategorien gespielt', unlocked: false }
    ];
    
    const savedAchievements = localStorage.getItem('quiz_achievements');
    if (savedAchievements) {
        achievements = JSON.parse(savedAchievements);
    }
}

function checkAchievements() {
    const userStats = getUserStats();
    let newUnlocks = [];
    
    // Erster Punkt
    if (userStats.totalCorrect >= 1 && !achievements.find(a => a.id === 'first_point').unlocked) {
        unlockAchievement('first_point');
        newUnlocks.push('Erster Punkt');
    }
    
    // Veteran
    if (userStats.quizCount >= 10 && !achievements.find(a => a.id === 'veteran').unlocked) {
        unlockAchievement('veteran');
        newUnlocks.push('Veteran');
    }
    
    // Champion
    if (userStats.totalPoints >= 100 && !achievements.find(a => a.id === 'champion').unlocked) {
        unlockAchievement('champion');
        newUnlocks.push('Champion');
    }
    
    if (newUnlocks.length > 0) {
        alert('Neue Achievements freigeschaltet: ' + newUnlocks.join(', '));
    }
}

function unlockAchievement(achievementId) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
        achievement.unlocked = true;
        localStorage.setItem('quiz_achievements', JSON.stringify(achievements));
    }
}

function getUserStats() {
    const userHighscores = localHighscores.filter(h => h.username === currentUser?.username);
    return {
        quizCount: userHighscores.length,
        totalCorrect: userHighscores.reduce((sum, h) => sum + h.score, 0),
        totalPoints: userHighscores.reduce((sum, h) => sum + h.score, 0)
    };
}

// Kategorien laden
function loadCategories() {
    availableCategories = [
        { id: 'geography', name: 'Geographie' },
        { id: 'biology', name: 'Biologie' },
        { id: 'history', name: 'Geschichte' },
        { id: 'science', name: 'Wissenschaft' },
        { id: 'literature', name: 'Literatur' }
    ];
    updateCategoryDropdown();
}

function updateUserPoints() {
    const stats = getUserStats();
    const pointsElement = document.getElementById('current-points');
    if (pointsElement) {
        pointsElement.textContent = stats.totalPoints;
    }
}

// Kategorie-Dropdown aktualisieren
function updateCategoryDropdown() {
    const categorySelect = document.getElementById('category-select');
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="all">Alle Kategorien</option>';
    availableCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

function getCategoryDisplayName(category) {
    const cat = availableCategories.find(c => c.id === category);
    return cat ? cat.name : category;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Frage anzeigen
function displayQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        showResults();
        return;
    }
    
    const question = quizQuestions[currentQuestionIndex];
    
    // Progress Bar aktualisieren
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    
    const questionCounter = document.getElementById('question-counter');
    if (questionCounter) {
        questionCounter.textContent = `Frage ${currentQuestionIndex + 1} von ${quizQuestions.length}`;
    }
    
    // Frage anzeigen
    const questionText = document.getElementById('question-text');
    if (questionText) {
        questionText.textContent = question.question;
    }
    
    // Antwortoptionen anzeigen
    const answersContainer = document.getElementById('answers-container');
    if (answersContainer) {
        answersContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-option w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-blue-50 transition-colors';
            button.textContent = option;
            button.onclick = () => selectAnswer(index);
            answersContainer.appendChild(button);
        });
    }
    
    selectedAnswer = null;
    selected = -1;
    const nextButton = document.getElementById('next-question');
    if (nextButton) {
        nextButton.style.display = 'none';
    }
}

// Nächste Frage
function nextQuestion() {
    currentQuestionIndex++;
    current++;
    displayQuestion();
}

// Achievements anzeigen
function showAchievements() {
    updateUserPoints();
    
    const achievementsList = document.getElementById('achievements-list');
    if (!achievementsList) return;
    
    achievementsList.innerHTML = '';
    
    achievements.forEach(achievement => {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = `achievement-item p-4 border rounded-lg ${
            achievement.unlocked ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'
        }`;
        
        achievementDiv.innerHTML = `
            <div class="flex items-center">
                <div class="achievement-icon mr-3 text-2xl">
                    ${achievement.unlocked ? '🏆' : '🔒'}
                </div>
                <div>
                    <h3 class="font-bold ${achievement.unlocked ? 'text-green-800' : 'text-gray-600'}">
                        ${achievement.name}
                    </h3>
                    <p class="text-sm ${achievement.unlocked ? 'text-green-600' : 'text-gray-500'}">
                        ${achievement.description}
                    </p>
                </div>
            </div>
        `;
        
        achievementsList.appendChild(achievementDiv);
    });
    
    showScreen('achievements-screen');
}

// Editor Funktionen
function showEditor() {
    showScreen('editor-screen');
    showEditorTab('create');
}

function showEditorTab(tab) {
    const createTab = document.getElementById('create-tab');
    const manageTab = document.getElementById('manage-tab');
    const createContent = document.getElementById('create-content');
    const manageContent = document.getElementById('manage-content');
    
    if (tab === 'create') {
        createTab.classList.add('bg-blue-500', 'text-white');
        createTab.classList.remove('bg-gray-200', 'text-gray-700');
        manageTab.classList.add('bg-gray-200', 'text-gray-700');
        manageTab.classList.remove('bg-blue-500', 'text-white');
        createContent.style.display = 'block';
        manageContent.style.display = 'none';
    } else {
        manageTab.classList.add('bg-blue-500', 'text-white');
        manageTab.classList.remove('bg-gray-200', 'text-gray-700');
        createTab.classList.add('bg-gray-200', 'text-gray-700');
        createTab.classList.remove('bg-blue-500', 'text-white');
        manageContent.style.display = 'block';
        createContent.style.display = 'none';
        loadQuestionsList();
    }
}

function createQuestion() {
    const questionText = document.getElementById('new-question').value;
    const option1 = document.getElementById('option1').value;
    const option2 = document.getElementById('option2').value;
    const option3 = document.getElementById('option3').value;
    const option4 = document.getElementById('option4').value;
    const correctAnswer = parseInt(document.getElementById('correct-answer').value);
    const category = document.getElementById('question-category').value;
    
    if (!questionText || !option1 || !option2 || !option3 || !option4 || isNaN(correctAnswer)) {
        alert('Bitte alle Felder ausfüllen!');
        return;
    }
    
    const newQuestion = {
        id: Date.now(),
        question: questionText,
        options: [option1, option2, option3, option4],
        correct: correctAnswer,
        category: category
    };
    
    localQuestions.push(newQuestion);
    localStorage.setItem('quiz_questions', JSON.stringify(localQuestions));
    
    // Formular zurücksetzen
    document.getElementById('new-question').value = '';
    document.getElementById('option1').value = '';
    document.getElementById('option2').value = '';
    document.getElementById('option3').value = '';
    document.getElementById('option4').value = '';
    document.getElementById('correct-answer').value = '0';
    
    alert('Frage erfolgreich erstellt!');
}

function loadQuestionsList() {
    const questionsList = document.getElementById('questions-list');
    if (!questionsList) return;
    
    questionsList.innerHTML = '';
    
    localQuestions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item p-4 border border-gray-300 rounded-lg mb-4';
        
        questionDiv.innerHTML = `
            <h3 class="font-bold mb-2">${question.question}</h3>
            <p class="text-sm text-gray-600 mb-2">Kategorie: ${getCategoryDisplayName(question.category)}</p>
            <div class="options mb-2">
                ${question.options.map((option, index) => 
                    `<p class="${index === question.correct ? 'text-green-600 font-bold' : 'text-gray-700'}">
                        ${index + 1}. ${option} ${index === question.correct ? '(Richtig)' : ''}
                    </p>`
                ).join('')}
            </div>
            <div class="actions">
                <button onclick="editQuestion(${question.id})" class="bg-blue-500 text-white px-3 py-1 rounded mr-2">Bearbeiten</button>
                <button onclick="deleteQuestion(${question.id})" class="bg-red-500 text-white px-3 py-1 rounded">Löschen</button>
            </div>
        `;
        
        questionsList.appendChild(questionDiv);
    });
}

function deleteQuestion(questionId) {
    if (confirm('Frage wirklich löschen?')) {
        localQuestions = localQuestions.filter(q => q.id !== questionId);
        localStorage.setItem('quiz_questions', JSON.stringify(localQuestions));
        loadQuestionsList();
    }
}

function editQuestion(questionId) {
    const question = localQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    // Hier könnte ein Edit-Modal geöffnet werden
    alert('Edit-Funktionalität noch nicht implementiert');
}

// Test-Funktionen für Achievements
function addTestPoints() {
    if (!currentUser) return;
    
    const testEntry = {
        username: currentUser.username,
        score: 5,
        total: 5,
        percentage: 100,
        category: 'test',
        mode: 'classic',
        date: new Date().toISOString()
    };
    
    localHighscores.push(testEntry);
    localStorage.setItem('quiz_highscores', JSON.stringify(localHighscores));
    
    checkAchievements();
    updateUserPoints();
}

function resetAchievements() {
    achievements.forEach(a => a.unlocked = false);
    localStorage.setItem('quiz_achievements', JSON.stringify(achievements));
    alert('Achievements zurückgesetzt!');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });
    
    // Quiz starten
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    
    // Neues Quiz
    document.getElementById('new-quiz-btn').addEventListener('click', () => {
        document.getElementById('results-screen').classList.remove('active');
        document.getElementById('main-menu').classList.add('active');
    });
    
    // Bestenliste
    document.getElementById('highscores-btn').addEventListener('click', showHighscores);
    
    // Zurück-Buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', backToMenu);
    });
});

// Logout
function logout() {
    currentUser = null;
    currentSession = null;
    showScreen('login-screen');
    
    // Felder leeren
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}