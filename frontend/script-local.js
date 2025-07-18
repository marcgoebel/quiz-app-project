// Lokale Version ohne Backend - alle Daten im Browser gespeichert
const API_BASE = null; // Kein Backend nötig

// Lokale Datenbank im Browser
let localUsers = JSON.parse(localStorage.getItem('quiz_users') || '[]');
let localQuestions = JSON.parse(localStorage.getItem('quiz_questions') || '[]');
let localHighscores = JSON.parse(localStorage.getItem('quiz_highscores') || '[]');
let currentUser = null;
let currentSession = null;

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
        }
    ];
    localStorage.setItem('quiz_questions', JSON.stringify(localQuestions));
}

// Standard-User falls keiner vorhanden
if (localUsers.length === 0) {
    localUsers = [{ username: 'testuser', password: '12345' }];
    localStorage.setItem('quiz_users', JSON.stringify(localUsers));
}

// Login-Funktion
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = localUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = username;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-menu').style.display = 'block';
        document.getElementById('error-message').textContent = '';
        loadCategories();
    } else {
        document.getElementById('error-message').textContent = 'Ungültige Anmeldedaten!';
    }
}

// Kategorien laden
function loadCategories() {
    const categories = [...new Set(localQuestions.map(q => q.category))];
    const categorySelect = document.getElementById('category-select');
    categorySelect.innerHTML = '<option value="">Alle Kategorien</option>';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

// Quiz starten
function startQuiz() {
    const category = document.getElementById('category-select').value;
    const mode = document.getElementById('mode-select').value;
    
    let questions = localQuestions;
    if (category) {
        questions = questions.filter(q => q.category === category);
    }
    
    if (questions.length === 0) {
        alert('Keine Fragen in dieser Kategorie verfügbar!');
        return;
    }
    
    // Quiz-Session erstellen
    currentSession = {
        id: Date.now().toString(),
        questions: questions.sort(() => Math.random() - 0.5).slice(0, 10),
        currentIndex: 0,
        score: 0,
        category: category || 'Alle',
        mode: mode
    };
    
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    showQuestion();
}

// Frage anzeigen
function showQuestion() {
    const question = currentSession.questions[currentSession.currentIndex];
    
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-counter').textContent = 
        `Frage ${currentSession.currentIndex + 1} von ${currentSession.questions.length}`;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        button.className = 'option-button';
        optionsContainer.appendChild(button);
    });
}

// Antwort auswählen
function selectAnswer(selectedIndex) {
    const question = currentSession.questions[currentSession.currentIndex];
    const buttons = document.querySelectorAll('.option-button');
    
    // Buttons deaktivieren
    buttons.forEach(btn => btn.disabled = true);
    
    // Richtige/Falsche Antwort markieren
    buttons[question.correct].style.backgroundColor = '#4CAF50';
    if (selectedIndex !== question.correct) {
        buttons[selectedIndex].style.backgroundColor = '#f44336';
    } else {
        currentSession.score++;
    }
    
    // Nächste Frage nach 2 Sekunden
    setTimeout(() => {
        currentSession.currentIndex++;
        if (currentSession.currentIndex < currentSession.questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 2000);
}

// Ergebnisse anzeigen
function showResults() {
    const percentage = Math.round((currentSession.score / currentSession.questions.length) * 100);
    
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    document.getElementById('final-score').textContent = 
        `${currentSession.score} von ${currentSession.questions.length} (${percentage}%)`;
    
    // Highscore speichern
    const highscore = {
        username: currentUser,
        score: currentSession.score,
        total: currentSession.questions.length,
        percentage: percentage,
        category: currentSession.category,
        mode: currentSession.mode,
        date: new Date().toLocaleDateString()
    };
    
    localHighscores.push(highscore);
    localStorage.setItem('quiz_highscores', JSON.stringify(localHighscores));
}

// Zurück zum Hauptmenü
function backToMenu() {
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('highscores-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    currentSession = null;
}

// Highscores anzeigen
function showHighscores() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('highscores-screen').style.display = 'block';
    
    const tbody = document.getElementById('highscores-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    // Sortiert nach Prozentsatz
    const sortedScores = localHighscores.sort((a, b) => b.percentage - a.percentage).slice(0, 10);
    
    sortedScores.forEach((score, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.username}</td>
            <td>${score.score}/${score.total}</td>
            <td>${score.percentage}%</td>
            <td>${score.category}</td>
            <td>${score.date}</td>
        `;
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login-Button
    document.getElementById('login-btn').addEventListener('click', login);
    
    // Enter-Taste im Login
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    // Quiz-Start-Button
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    
    // Highscores-Button
    document.getElementById('highscores-btn').addEventListener('click', showHighscores);
    
    // Zurück-Buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', backToMenu);
    });
    
    // Neues Quiz-Button
    document.getElementById('new-quiz-btn').addEventListener('click', backToMenu);
});

// Logout-Funktion
function logout() {
    currentUser = null;
    currentSession = null;
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}