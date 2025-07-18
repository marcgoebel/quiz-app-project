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

// Login-Funktion
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    
    const user = localUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-menu').classList.add('active');
        loadCategories();
        errorDiv.textContent = '';
    } else {
        errorDiv.textContent = 'Ungültiger Benutzername oder Passwort!';
    }
}

// Kategorien laden
function loadCategories() {
    const categorySelect = document.getElementById('category-select');
    const categories = [...new Set(localQuestions.map(q => q.category))];
    
    categorySelect.innerHTML = '<option value="">Alle Kategorien</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Quiz starten
function startQuiz() {
    const selectedCategory = document.getElementById('category-select').value;
    const selectedMode = document.getElementById('mode-select').value;
    
    let questions = localQuestions;
    if (selectedCategory) {
        questions = questions.filter(q => q.category === selectedCategory);
    }
    
    // Fragen mischen
    questions = questions.sort(() => Math.random() - 0.5);
    
    currentSession = {
        questions: questions.slice(0, 10), // Maximal 10 Fragen
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        mode: selectedMode,
        category: selectedCategory || 'Alle Kategorien'
    };
    
    document.getElementById('main-menu').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('active');
    showQuestion();
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
function selectAnswer(selectedIndex) {
    const question = currentSession.questions[currentSession.currentQuestionIndex];
    const isCorrect = selectedIndex === question.correct;
    
    if (isCorrect) {
        currentSession.score++;
    }
    
    currentSession.answers.push({
        questionId: question.id,
        selectedIndex,
        correct: question.correct,
        isCorrect
    });
    
    // Optionen deaktivieren
    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach((button, index) => {
        button.disabled = true;
        if (index === question.correct) {
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
        } else if (index === selectedIndex && !isCorrect) {
            button.style.backgroundColor = '#f44336';
            button.style.color = 'white';
        }
    });
    
    // Nächste Frage nach 2 Sekunden
    setTimeout(() => {
        currentSession.currentQuestionIndex++;
        if (currentSession.currentQuestionIndex < currentSession.questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 2000);
}

// Ergebnisse anzeigen
function showResults() {
    const totalQuestions = currentSession.questions.length;
    const score = currentSession.score;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Highscore speichern
    const highscore = {
        username: currentUser.username,
        score: score,
        total: totalQuestions,
        percentage: percentage,
        category: currentSession.category,
        mode: currentSession.mode,
        date: new Date().toLocaleDateString('de-DE')
    };
    
    localHighscores.push(highscore);
    localHighscores.sort((a, b) => b.percentage - a.percentage);
    localStorage.setItem('quiz_highscores', JSON.stringify(localHighscores));
    
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('results-screen').classList.add('active');
    document.getElementById('final-score').textContent = `${score} von ${totalQuestions} (${percentage}%)`;
}

// Zurück zum Hauptmenü
function backToMenu() {
    document.querySelector('.screen.active').classList.remove('active');
    document.getElementById('main-menu').classList.add('active');
}

// Bestenliste anzeigen
function showHighscores() {
    const tbody = document.querySelector('#highscores-table tbody');
    tbody.innerHTML = '';
    
    localHighscores.slice(0, 10).forEach((score, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.username}</td>
            <td>${score.score}/${score.total}</td>
            <td>${score.percentage}%</td>
            <td>${score.category}</td>
            <td>${score.date}</td>
        `;
        tbody.appendChild(row);
    });
    
    document.querySelector('.screen.active').classList.remove('active');
    document.getElementById('highscores-screen').classList.add('active');
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
    document.querySelector('.screen.active').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}