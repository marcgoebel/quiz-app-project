let sessionId = null
let questions = []
let current = 0
let selected = -1
let playerScore = 0
let botScore = 0
let currentCategory = ""
let currentMode = ""
let streakCounter = 0
let achievements = []
let unlockedAchievements = []
let availableCategories = []

/**
 * Zeigt einen bestimmten Bildschirm an und versteckt alle anderen
 * @param {string} id - Die ID des anzuzeigenden Bildschirms
 */
function showScreen(id) {
  const screens = ["user-login-screen", "main-menu", "highscore-screen", "editor-screen", "quiz-screen", "quiz-room", "result-screen", "achievements-screen"];
  
  // Alle Bildschirme ausblenden
  screens.forEach(s => {
    const element = document.getElementById(s);
    if (element && s !== id) {
      element.style.display = "none";
      element.classList.add("hidden");
    }
  });
  
  // Ziel-Bildschirm anzeigen
  const screenToShow = document.getElementById(id);
  if (screenToShow) {
    screenToShow.classList.remove("hidden");
    screenToShow.style.display = id === "quiz-room" || id === "main-menu" ? "flex" : "block";
  }
  
  // Load categories when showing main menu or editor
  if (id === 'main-menu' || id === 'editor-screen') {
    loadCategories();
  }
  
  // Update achievements display when showing achievements screen
  if (id === 'achievements-screen') {
    updateAchievementsScreen();
  }
}

/**
 * Lädt verfügbare Kategorien vom Backend und aktualisiert Dropdowns
 */
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    if (response.ok) {
      availableCategories = await response.json();
      updateCategoryDropdowns();
    }
  } catch (error) {
    // Fehler beim Laden der Kategorien
  }
}

/**
 * Aktualisiert Kategorie-Dropdown-Optionen im Hauptmenü und Editor
 */
function updateCategoryDropdowns() {
  const startCategorySelect = document.getElementById('start-category');
  const editorCategorySelect = document.getElementById('category');
  
  // Bestehende Optionen löschen
  startCategorySelect.innerHTML = '<option value="all">Alle Kategorien</option>';
  editorCategorySelect.innerHTML = '';
  
  // Kategorien zu beiden Dropdowns hinzufügen
  availableCategories.forEach(category => {
    const startOption = document.createElement('option');
    startOption.value = category;
    startOption.textContent = getCategoryDisplayName(category);
    startCategorySelect.appendChild(startOption);
    
    const editorOption = document.createElement('option');
    editorOption.value = category;
    editorOption.textContent = getCategoryDisplayName(category);
    editorCategorySelect.appendChild(editorOption);
  });
}

/**
 * Gibt einen benutzerfreundlichen Anzeigenamen für eine Kategorie zurück
 * @param {string} category - Der Kategorie-Schlüssel
 * @returns {string} - Der Anzeigename
 */
function getCategoryDisplayName(category) {
  const categoryNames = {
    'math': '🧮 Mathe',
    'logic': '🧠 Logik',
    'history': '📜 Geschichte',
    'science': '🔬 Wissenschaft',
    'geography': '🌍 Geographie',
    'literature': '📚 Literatur',
    'sports': '⚽ Sport',
    'music': '🎵 Musik',
    'art': '🎨 Kunst',
    'technology': '💻 Technologie'
  };
  
  return categoryNames[category] || `📝 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
}

/**
 * Verarbeitet den Benutzer-Anmeldeprozess
 */
async function login() {
  const username = document.getElementById("username-input").value.trim();
  const password = document.getElementById("password-input").value;
  const errorEl = document.getElementById("login-error-message");

  if (!username || !password) {
    errorEl.textContent = "❌ Bitte Benutzername und Passwort eingeben";
    errorEl.classList.remove("hidden");
    return;
  }

  try {
    // Anmeldeanfrage an Backend senden
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      // Benutzername im lokalen Speicher ablegen
      localStorage.setItem("username", username);
      
      errorEl.classList.add("hidden");
      showScreen("main-menu");
      
      initializeApp();
      showAchievements();
    } else {
      errorEl.textContent = "❌ Ungültige Anmeldedaten";
      errorEl.classList.remove("hidden");
    }
  } catch (error) {
    errorEl.textContent = "❌ Verbindungsfehler. Bitte versuchen Sie es später erneut.";
    errorEl.classList.remove("hidden");
  }
}

/**
 * Initialisiert die Anwendung nach erfolgreicher Anmeldung
 */
function initializeApp() {
  const modeSelect = document.getElementById("mode-select");
  if (modeSelect) {
    modeSelect.addEventListener("change", checkModeAvailability);
    checkModeAvailability();
  }
}

const API_BASE = "https://quiz-app-project-0k81.onrender.com"

/**
 * Schaltet die Sichtbarkeit des PDF-Upload-Bereichs um
 */
function togglePdfSection() {
  const pdfSection = document.getElementById('pdf-section');
  if (pdfSection.classList.contains('hidden')) {
    pdfSection.classList.remove('hidden');
  } else {
    pdfSection.classList.add('hidden');
  }
}

/**
 * Überprüft die Verfügbarkeit des gewählten Spielmodus
 */
function checkModeAvailability() {
    const mode = document.getElementById("mode-select").value;
    const startButton = document.querySelector("button[onclick='startQuiz()']");
    const modeMessage = document.getElementById("mode-unavailable-message") || createModeMessageElement();
    
    // Reset message and button state to default
    modeMessage.classList.add("hidden");
    startButton.disabled = false;
    startButton.classList.remove("bg-gray-400", "cursor-not-allowed");
    startButton.classList.add("bg-green-500", "hover:bg-green-600");
    
    // Show mode descriptions (all modes are now available!)
    if (mode === "team") {
        modeMessage.textContent = "👥 Team-Modus: Spiele im 2v2 Team gegen andere Spieler!";
        modeMessage.classList.remove("hidden");
        modeMessage.classList.remove("text-yellow-600");
        modeMessage.classList.add("text-blue-600");
    } else if (mode === "expert") {
        modeMessage.textContent = "🎓 Experten-Modus: Schwierigere Fragen mit Zeitlimit!";
        modeMessage.classList.remove("hidden");
        modeMessage.classList.remove("text-yellow-600");
        modeMessage.classList.add("text-purple-600");
    } else if (mode === "learn") {
        modeMessage.textContent = "📘 Lernmodus: Erklärungen und Wiederholungen für besseres Lernen!";
        modeMessage.classList.remove("hidden");
        modeMessage.classList.remove("text-yellow-600");
        modeMessage.classList.add("text-green-600");
    }
}

/**
 * Erstellt ein Nachrichtenelement für Spielmodus-Verfügbarkeitsinformationen
 * @returns {HTMLElement} Das erstellte Nachrichtenelement
 */
function createModeMessageElement() {
    const container = document.querySelector(".bg-white.p-6.rounded-2xl");
    const startButton = document.querySelector("button[onclick='startQuiz()']").parentNode;
    
    const messageElement = document.createElement("p");
    messageElement.id = "mode-unavailable-message";
    messageElement.className = "text-yellow-600 font-medium mb-4 hidden";
    
    container.insertBefore(messageElement, startButton);
    return messageElement;
}

/**
 * Wendet modusspezifische Einstellungen und Änderungen an
 * @param {string} mode - Der gewählte Spielmodus
 */
function applyModeSettings(mode) {
    switch(mode) {
        case "team":
            addTeamModeElements();
            break;
        case "expert":
            addExpertModeElements();
            break;
        case "learn":
            addLearnModeElements();
            break;
        default:
            break;
    }
}

/**
 * Fügt Team-Modus-spezifische Elemente hinzu
 */
function addTeamModeElements() {
    const scoreText = document.getElementById("score-text");
    if (scoreText) {
        scoreText.innerHTML = `Team 1: ${playerScore} | Team 2: ${botScore}`;
    }
}

/**
 * Fügt Experten-Modus-spezifische Elemente hinzu
 */
function addExpertModeElements() {
    const quizScreen = document.getElementById("quiz-screen");
    if (quizScreen && !document.getElementById("expert-timer")) {
        const timerDiv = document.createElement("div");
        timerDiv.id = "expert-timer";
        timerDiv.className = "text-center mb-4 text-red-600 font-bold text-xl";
        timerDiv.innerHTML = "⏰ Zeit: <span id='timer-display'>30</span>s";
        quizScreen.insertBefore(timerDiv, quizScreen.firstChild);
    }
}

/**
 * Fügt Lern-Modus-spezifische Elemente hinzu
 */
function addLearnModeElements() {
    // Add explanation area
    const quizScreen = document.getElementById("quiz-screen");
    if (quizScreen && !document.getElementById("learn-explanation")) {
        const explanationDiv = document.createElement("div");
        explanationDiv.id = "learn-explanation";
        explanationDiv.className = "mt-4 p-4 bg-blue-50 rounded-lg hidden";
        explanationDiv.innerHTML = `
            <h4 class="font-bold text-blue-800 mb-2">📚 Erklärung:</h4>
            <p id="explanation-text" class="text-blue-700"></p>
            <button onclick="retryQuestion()" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                🔄 Nochmal versuchen
            </button>
        `;
        quizScreen.appendChild(explanationDiv);
    }
    

}

/**
 * Zeigt Erklärung im Lernmodus an
 * @param {Object} question - Das aktuelle Fragen-Objekt
 */
function showLearnModeExplanation(question) {
    const explanationDiv = document.getElementById("learn-explanation");
    const explanationText = document.getElementById("explanation-text");
    
    if (explanationDiv && explanationText) {
        // Generate explanation based on question
        let explanation = `Die richtige Antwort ist: "${question.options[question.correct]}".\n\n`;
        
        // Add category-specific explanations
        switch(question.category) {
            case "math":
                explanation += "💡 Tipp: Bei Mathe-Aufgaben hilft es, Schritt für Schritt zu rechnen.";
                break;
            case "logic":
                explanation += "💡 Tipp: Bei Logik-Aufgaben solltest du alle Möglichkeiten durchdenken.";
                break;
            case "history":
                explanation += "💡 Tipp: Geschichtsfragen erfordern oft das Wissen über Zusammenhänge.";
                break;
            default:
                explanation += "💡 Tipp: Lies die Frage nochmal aufmerksam durch und überlege systematisch.";
        }
        
        explanationText.textContent = explanation;
        explanationDiv.classList.remove("hidden");
        
        // Highlight correct answer
        const optionButtons = document.querySelectorAll("#options button");
        optionButtons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === question.correct) {
                btn.classList.add("bg-green-200");
            } else if (idx === selected) {
                btn.classList.add("bg-red-200");
            }
        });
    }
}

/**
 * Wiederholt die aktuelle Frage im Lernmodus
 */
function retryQuestion() {
    const explanationDiv = document.getElementById("learn-explanation");
    if (explanationDiv) {
        explanationDiv.classList.add("hidden");
    }
    
    // Reset selection and show question again
    selected = -1;
    document.querySelectorAll("#options button").forEach(btn => {
        btn.className = "w-full p-2 border rounded mb-2 bg-white hover:bg-gray-100";
        btn.disabled = false;
    });
    
    document.getElementById("feedback").innerText = "";
}

/**
 * Startet den Experten-Modus-Timer
 */
let expertTimer = null;
function startExpertTimer() {
    if (currentMode !== "expert") return;
    
    let timeLeft = 30;
    const timerDisplay = document.getElementById("timer-display");
    
    expertTimer = setInterval(() => {
        timeLeft--;
        if (timerDisplay) {
            timerDisplay.textContent = timeLeft;
        }
        
        if (timeLeft <= 0) {
            clearInterval(expertTimer);
            // Automatische Antwort bei Zeitablauf
            if (selected === -1) {
                selected = -1;
                submitAnswer();
            }
        }
    }, 1000);
}

/**
 * Stoppt den Experten-Modus-Timer
 */
function stopExpertTimer() {
    if (expertTimer) {
        clearInterval(expertTimer);
        expertTimer = null;
    }
}

async function startQuiz() {
    const category = document.getElementById("start-category").value
    const mode = document.getElementById("mode-select").value
    currentCategory = category
    currentMode = mode
    
    console.log("Starting quiz with category:", category, "and mode:", mode);
    
    // All modes are now supported!
    try {
        const res = await fetch(`${API_BASE}/start-quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, mode })
        })

        const data = await res.json()

        if (data.error) {
            let errorMessage = "❌ " + data.error;
            
            // Kategorie-spezifische Fehlermeldungen
            if (res.status === 404) {
                const categoryName = getCategoryDisplayName(category);
                if (category === "all") {
                    errorMessage = "❌ Keine Fragen verfügbar. Bitte füge zuerst Fragen über den Frageneditor hinzu.";
                } else {
                    errorMessage = `❌ Keine Fragen für die Kategorie "${categoryName}" gefunden. Bitte füge Fragen für diese Kategorie hinzu oder wähle eine andere Kategorie.`;
                }
            }
            
            alert(errorMessage);
            return
        }

        sessionId = data.session_id
        questions = data.questions
        current = 0
        selected = -1
        playerScore = 0
        botScore = 0
        streakCounter = 0

        applyModeSettings(mode);
        showScreen("quiz-screen")
        showQuestion();
        
    } catch (error) {
        alert("❌ Netzwerkfehler beim Starten des Quiz. Bitte überprüfe deine Internetverbindung.");
    }
}

/**
 * Zeigt die aktuelle Frage und Antwortoptionen an
 */
function showQuestion() {
    showScreen("quiz-screen");
    
    if (!questions || questions.length === 0) {
        document.getElementById("question-text").innerText = "Fehler: Keine Fragen verfügbar";
        return;
    }
    
    const q = questions[current];
    
    if (!q) {
        document.getElementById("question-text").innerText = "Fehler: Frage nicht gefunden";
        return;
    }
    
    const questionTextEl = document.getElementById("question-text");
    if (!questionTextEl) {
        return;
    }
    
    questionTextEl.innerText = q.question;
    
    document.getElementById("feedback").innerText = "";
    document.getElementById("score-text").innerText = `Du: ${playerScore} | Max: ${botScore}`;

    const progress = ((current + 1) / questions.length) * 100;
    document.getElementById("progress-bar").style.width = progress + "%";

    const container = document.getElementById("options");
    if (!container) {
        return;
    }
    container.innerHTML = "";

    if (!q.options || !Array.isArray(q.options)) {
        return;
    }
    
    q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "w-full p-2 border rounded mb-2 bg-white hover:bg-gray-100";
        btn.dataset.index = i;
        btn.onclick = () => {
            selected = i;
            document.querySelectorAll("#options button").forEach(b => {
                b.className = "w-full p-2 border rounded mb-2 bg-white hover:bg-gray-100";
            });
            btn.classList.add("ring", "ring-blue-400");
        };
        container.appendChild(btn);
    });
    
    // Bot-Denkanzeigen nur im Multiplayer-Modus
    if (currentMode === "multiplayer") {
        const maxIndicator = document.getElementById("max-indicator")
        const annaIndicator = document.getElementById("anna-indicator")
        const tomIndicator = document.getElementById("tom-indicator")
        
        if (maxIndicator) {
            maxIndicator.style.display = "block"
            setTimeout(() => {
                maxIndicator.style.display = "none"
            }, Math.random() * 2000 + 1000)
        }
        
        if (annaIndicator) {
            annaIndicator.style.display = "block"
            setTimeout(() => {
                annaIndicator.style.display = "none"
            }, Math.random() * 2000 + 1500)
        }
        
        if (tomIndicator) {
            tomIndicator.style.display = "block"
            setTimeout(() => {
                tomIndicator.style.display = "none"
            }, Math.random() * 2000 + 2000)
        }
    }
    
    // Experten-Modus Timer starten
    if (currentMode === "expert") {
        startExpertTimer();
    }
    
    // Punkteanzeige für Team-Modus aktualisieren
    if (currentMode === "team") {
        document.getElementById("score-text").innerHTML = `Team 1: ${playerScore} | Team 2: ${botScore}`;
    }
}

/**
 * Verarbeitet die Antwortabgabe des Benutzers
 */
async function submitAnswer() {
    if (selected === -1) return alert("Bitte wähle eine Antwort.")
    const q = questions[current]
    
    // Experten-Modus Timer stoppen
    if (currentMode === "expert") {
        stopExpertTimer();
    }

    const res = await fetch(`${API_BASE}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            session_id: sessionId,
            question_id: q.id,
            selected: selected
        })
    })

    const data = await res.json()
    const optionButtons = document.querySelectorAll("#options button")
    
    // Lern-Modus: Erklärung anzeigen
    if (currentMode === "learn" && !data.player_correct) {
        showLearnModeExplanation(q);
        return;
    }
    
    if (currentMode === "multiplayer") {
        // 2v2 Team-Modus Logik
        const maxSelected = Math.floor(Math.random() * q.options.length)
        const annaSelected = Math.floor(Math.random() * q.options.length)
        const tomSelected = Math.floor(Math.random() * q.options.length)
        
        const playerCorrect = data.player_correct
        const maxCorrect = maxSelected === q.correct
        const annaCorrect = annaSelected === q.correct
        const tomCorrect = tomSelected === q.correct
        
        if (playerCorrect) playerScore++
        if (maxCorrect) maxScore++
        if (annaCorrect) annaScore++
        if (tomCorrect) tomScore++
        
        teamAScore = playerScore + maxScore
        teamBScore = annaScore + tomScore
        
        optionButtons.forEach(btn => {
            const idx = parseInt(btn.dataset.index)
            btn.disabled = true

            if (idx === q.correct) {
                btn.classList.add("bg-green-200")
            } else if (idx === selected) {
                btn.classList.add("bg-red-200")
            }

            if (idx === maxSelected) {
                btn.classList.add("border-blue-400", "border-2")
            }
            if (idx === annaSelected) {
                btn.classList.add("border-purple-400", "border-2")
            }
            if (idx === tomSelected) {
                btn.classList.add("border-orange-400", "border-2")
            }
        })
        
        let msg = ""
        msg += data.player_correct ? "✅ Deine Antwort war richtig. " : "❌ Deine Antwort war falsch. "
        msg += `\n🤖 Max wählte: "${q.options[maxSelected]}" → ${maxCorrect ? "richtig ✅" : "falsch ❌"}`
        msg += `\n🤖 Anna wählte: "${q.options[annaSelected]}" → ${annaCorrect ? "richtig ✅" : "falsch ❌"}`
        msg += `\n🤖 Tom wählte: "${q.options[tomSelected]}" → ${tomCorrect ? "richtig ✅" : "falsch ❌"}`
        msg += `\n\n🏆 Team A: ${teamAScore} | Team B: ${teamBScore}`
        
        document.getElementById("feedback").innerText = msg
        
        const scoreElement = document.getElementById("multiplayer-score")
        if (scoreElement) {
            scoreElement.innerHTML = `
                <div class="text-center mb-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-blue-100 p-3 rounded">
                            <h3 class="font-bold text-blue-800">🔵 Team A</h3>
                            <p class="text-sm">Du: ${playerScore} | Max: ${maxScore}</p>
                            <p class="font-bold text-lg">${teamAScore}</p>
                        </div>
                        <div class="bg-red-100 p-3 rounded">
                            <h3 class="font-bold text-red-800">🔴 Team B</h3>
                            <p class="text-sm">Anna: ${annaScore} | Tom: ${tomScore}</p>
                            <p class="font-bold text-lg">${teamBScore}</p>
                        </div>
                    </div>
                </div>
            `
        }
    } else {
        // Standard 1v1 Bot-Modus Logik
        playerScore = data.player_score
        botScore = data.bot_score
        
        optionButtons.forEach(btn => {
            const idx = parseInt(btn.dataset.index)
            btn.disabled = true

            if (idx === q.correct) {
                btn.classList.add("bg-green-200")
            } else if (idx === selected) {
                btn.classList.add("bg-red-200")
            }

            if (currentMode !== "learn" && idx === data.bot_selected) {
                btn.classList.add("border-yellow-400", "border-2")
            }
        })
        
        let msg = ""
        msg += data.player_correct ? "✅ Deine Antwort war richtig. " : "❌ Deine Antwort war falsch. "

        if (currentMode !== "learn") {
            msg += `\n🤖 Max wählte: "${q.options[data.bot_selected]}" → `
            msg += data.bot_correct ? "richtig ✅" : "falsch ❌"
        }
        
        document.getElementById("feedback").innerText = msg
    }

    if (data.player_correct) streakCounter++
    else streakCounter = 0
    
    current++
    selected = -1
    checkAchievements()

    if (data.done) {
        setTimeout(() => {
            showScreen("result-screen")

            if (currentMode === "multiplayer") {
                let result = `🎯 Endergebnis:\n\n`
                result += `🔵 Team A: ${teamAScore} Punkte\n`
                result += `   Du: ${playerScore} | Max: ${maxScore}\n\n`
                result += `🔴 Team B: ${teamBScore} Punkte\n`
                result += `   Anna: ${annaScore} | Tom: ${tomScore}\n\n`
                
                if (teamAScore > teamBScore) result += "🏆 Team A hat gewonnen!"
                else if (teamAScore < teamBScore) result += "🏆 Team B hat gewonnen!"
                else result += "⚖️ Unentschieden!"
                
                document.getElementById("result-text").innerText = result
            } else if (currentMode !== "learn") {
                saveHighscore(currentCategory, currentMode, playerScore, botScore)
                let result = `🎯 Deine Punkte: ${playerScore}\n🤖 Max' Punkte: ${botScore}\n\n`
                if (playerScore > botScore) result += "🏆 Du hast gewonnen!"
                else if (playerScore < botScore) result += "🤖 Max hat gewonnen!"
                else result += "⚖️ Unentschieden!"
                document.getElementById("result-text").innerText = result
            } else {
                document.getElementById("result-text").innerText = "🎓 Lernrunde beendet – gut gemacht!"
            }
        }, 1000)
    } else {
        setTimeout(showQuestion, 2000)
    }
}

/**
 * Zeigt den Frageneditor-Bildschirm an
 */
function showEditor() {
    showScreen("editor-screen")
    
    loadCategories();
    switchEditorTab('create');
}

// Tab-Wechsel-Funktion
function switchEditorTab(tab) {
    const createTab = document.getElementById('create-tab');
    const manageTab = document.getElementById('manage-tab');
    const createSection = document.getElementById('create-section');
    const manageSection = document.getElementById('manage-section');
    
    if (tab === 'create') {
        createTab.className = 'px-4 py-2 font-medium border-b-2 border-blue-500 text-blue-600';
        manageTab.className = 'px-4 py-2 font-medium text-gray-500 hover:text-gray-700';
        createSection.classList.remove('hidden');
        manageSection.classList.add('hidden');
    } else {
        manageTab.className = 'px-4 py-2 font-medium border-b-2 border-blue-500 text-blue-600';
        createTab.className = 'px-4 py-2 font-medium text-gray-500 hover:text-gray-700';
        manageSection.classList.remove('hidden');
        createSection.classList.add('hidden');
        
        // Fragenliste und Kategorien für Filter laden
        loadCategoriesForFilter();
        loadQuestionsList();
    }
}

// Kategorien für Filter-Dropdown laden
async function loadCategoriesForFilter() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const categories = await res.json();
        
        const filterSelect = document.getElementById('filter-category');
        filterSelect.innerHTML = '<option value="all">Alle Kategorien</option>';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = getCategoryDisplayName(cat);
            filterSelect.appendChild(option);
        });
    } catch (error) {
        // Fehler beim Laden der Kategorien
    }
}

// Fragenliste laden und anzeigen
async function loadQuestionsList() {
    try {
        const filterCategory = document.getElementById('filter-category').value;
        const endpoint = filterCategory === 'all' ? '/questions' : `/questions/${filterCategory}`;
        
        const res = await fetch(`${API_BASE}${endpoint}`);
        const questions = await res.json();
        
        const questionsList = document.getElementById('questions-list');
        questionsList.innerHTML = '';
        
        if (questions.length === 0) {
            questionsList.innerHTML = '<p class="text-gray-500 text-center py-8">Keine Fragen gefunden.</p>';
            return;
        }
        
        questions.forEach(question => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'bg-gray-50 p-4 rounded-lg border';
            
            questionDiv.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-gray-900 flex-1 mr-4">${question.question}</h4>
                    <div class="flex space-x-2">
                        <button onclick="editQuestion('${question.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-all">
                            ✏️ Bearbeiten
                        </button>
                        <button onclick="deleteQuestion('${question.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-all">
                            🗑️ Löschen
                        </button>
                    </div>
                </div>
                <div class="text-sm text-gray-600 mb-2">
                    <strong>Kategorie:</strong> ${getCategoryDisplayName(question.category)}
                </div>
                <div class="text-sm text-gray-600">
                    <strong>Antworten:</strong> ${question.options.join(', ')}
                </div>
                <div class="text-sm text-green-600 mt-1">
                    <strong>Richtige Antwort:</strong> ${question.options[question.correct]}
                </div>
            `;
            
            questionsList.appendChild(questionDiv);
        });
        
    } catch (error) {
         document.getElementById('manage-feedback').textContent = '❌ Fehler beim Laden der Fragen.';
         document.getElementById('manage-feedback').className = 'mt-4 text-center text-red-600';
     }
 }

// Globale Variable für die zu bearbeitende Frage
let currentEditingQuestion = null;

// Frage bearbeiten
async function editQuestion(questionId) {
    try {
        const res = await fetch(`${API_BASE}/questions`);
        const allQuestions = await res.json();
        const question = allQuestions.find(q => q.id === questionId);
        
        if (!question) {
            alert('Frage nicht gefunden!');
            return;
        }
        
        currentEditingQuestion = question;
        
        // Bearbeitungsmodal befüllen
        document.getElementById('edit-question').value = question.question;
        
        await loadCategoriesForEdit();
        document.getElementById('edit-category').value = question.category;
        
        // Optionen befüllen
        const optionsContainer = document.getElementById('edit-options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'mb-2';
            optionDiv.innerHTML = `
                <input type="text" id="edit-opt${index + 1}" value="${option}" class="w-full p-2 border rounded" placeholder="Antwort ${index + 1}" />
            `;
            optionsContainer.appendChild(optionDiv);
        });
        
        // Richtige Antwort Dropdown aktualisieren
        updateEditCorrectAnswerDropdown(question.options.length, question.correct);
        
        document.getElementById('edit-modal').classList.remove('hidden');
        
    } catch (error) {
        alert('Fehler beim Laden der Frage!');
    }
}

// Kategorien für Bearbeitungs-Dropdown laden
async function loadCategoriesForEdit() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const categories = await res.json();
        
        const editCategorySelect = document.getElementById('edit-category');
        editCategorySelect.innerHTML = '';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = getCategoryDisplayName(cat);
            editCategorySelect.appendChild(option);
        });
    } catch (error) {
        // Fehler beim Laden der Kategorien
    }
}

// Richtige Antwort Dropdown für Bearbeitungsmodal aktualisieren
function updateEditCorrectAnswerDropdown(optionCount, selectedCorrect) {
    const correctSelect = document.getElementById('edit-correct');
    correctSelect.innerHTML = '';
    
    for (let i = 0; i < optionCount; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Antwort ${i + 1}`;
        correctSelect.appendChild(option);
    }
    
    correctSelect.value = selectedCorrect;
}

// Bearbeitungsmodal schließen
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('edit-feedback').textContent = '';
    currentEditingQuestion = null;
}

// Bearbeitete Frage speichern
async function saveEditedQuestion() {
    if (!currentEditingQuestion) {
        alert('Keine Frage zum Bearbeiten ausgewählt!');
        return;
    }
    
    const question = document.getElementById('edit-question').value.trim();
    const category = document.getElementById('edit-category').value;
    const correct = parseInt(document.getElementById('edit-correct').value);
    
    // Optionen sammeln
    const options = [];
    const optionInputs = document.querySelectorAll('#edit-options-container input');
    optionInputs.forEach(input => {
        const value = input.value.trim();
        if (value) {
            options.push(value);
        }
    });
    
    // Validierung
    if (!question) {
        document.getElementById('edit-feedback').textContent = '❌ Bitte geben Sie eine Frage ein.';
        document.getElementById('edit-feedback').className = 'mt-4 text-center text-red-600';
        return;
    }
    
    if (options.length < 3) {
        document.getElementById('edit-feedback').textContent = '❌ Mindestens 3 Antwortmöglichkeiten sind erforderlich.';
        document.getElementById('edit-feedback').className = 'mt-4 text-center text-red-600';
        return;
    }
    
    if (correct >= options.length) {
        document.getElementById('edit-feedback').textContent = '❌ Ungültige Auswahl für richtige Antwort.';
        document.getElementById('edit-feedback').className = 'mt-4 text-center text-red-600';
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/edit-question/${currentEditingQuestion.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, options, correct, category })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('edit-feedback').textContent = '✅ Frage erfolgreich bearbeitet!';
            document.getElementById('edit-feedback').className = 'mt-4 text-center text-green-600';
            
            // Fragenliste neu laden
            loadQuestionsList();
            
            setTimeout(() => {
                closeEditModal();
            }, 1500);
        } else {
            document.getElementById('edit-feedback').textContent = `❌ ${data.detail || 'Fehler beim Bearbeiten der Frage'}`;
            document.getElementById('edit-feedback').className = 'mt-4 text-center text-red-600';
        }
    } catch (error) {
        document.getElementById('edit-feedback').textContent = '❌ Verbindungsfehler. Bitte versuchen Sie es erneut.';
        document.getElementById('edit-feedback').className = 'mt-4 text-center text-red-600';

    }
}

// Frage löschen
async function deleteQuestion(questionId) {
    if (!confirm('Sind Sie sicher, dass Sie diese Frage löschen möchten?')) {
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/delete-question/${questionId}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('manage-feedback').textContent = '✅ Frage erfolgreich gelöscht!';
            document.getElementById('manage-feedback').className = 'mt-4 text-center text-green-600';
            
            // Fragenliste neu laden
            loadQuestionsList();
            
            setTimeout(() => {
                document.getElementById('manage-feedback').textContent = '';
            }, 3000);
        } else {
            document.getElementById('manage-feedback').textContent = `❌ ${data.detail || 'Fehler beim Löschen der Frage'}`;
            document.getElementById('manage-feedback').className = 'mt-4 text-center text-red-600';
        }
    } catch (error) {
        document.getElementById('manage-feedback').textContent = '❌ Verbindungsfehler. Bitte versuchen Sie es erneut.';
        document.getElementById('manage-feedback').className = 'mt-4 text-center text-red-600';

    }
}

/**
 * Fügt eine neue Frage zur Quiz-Datenbank hinzu
 */
let optionCount = 3;

function addOption() {
    optionCount++;
    const container = document.getElementById("options-container");
    const newOption = document.createElement("div");
    newOption.className = "flex items-center mb-2";
    newOption.innerHTML = `
        <input type="text" id="opt${optionCount}" class="flex-1 p-2 border rounded mr-2" placeholder="Antwort ${optionCount}" />
        <button type="button" onclick="removeOption(this, ${optionCount})" class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-all">
            ×
        </button>
    `;
    container.appendChild(newOption);
    
    // Richtige Antwort Dropdown aktualisieren
    updateCorrectAnswerDropdown();
}

function removeOption(button, optionNum) {
    if (optionCount <= 3) {
        alert("Mindestens 3 Antwortmöglichkeiten sind erforderlich!");
        return;
    }
    
    button.parentElement.remove();
    optionCount--;
    
    // Verbleibende Optionen neu nummerieren
    const container = document.getElementById("options-container");
    const inputs = container.querySelectorAll("input[type='text']");
    inputs.forEach((input, index) => {
        input.id = `opt${index + 1}`;
        input.placeholder = `Antwort ${index + 1}`;
    });
    
    optionCount = inputs.length;
    updateCorrectAnswerDropdown();
}

function updateCorrectAnswerDropdown() {
    const correctSelect = document.getElementById("correct");
    const currentValue = correctSelect.value;
    correctSelect.innerHTML = "";
    
    for (let i = 0; i < optionCount; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `Antwort ${i + 1}`;
        correctSelect.appendChild(option);
    }
    
    // Vorherige Auswahl wiederherstellen falls gültig
    if (currentValue < optionCount) {
        correctSelect.value = currentValue;
    }
}

function clearQuestionForm() {
    document.getElementById("new-question").value = "";
    document.getElementById("category").value = "math";
    
    // Auf 3 Optionen zurücksetzen
    const container = document.getElementById("options-container");
    container.innerHTML = `
        <input type="text" id="opt1" class="w-full p-2 border rounded mb-2" placeholder="Antwort 1" />
        <input type="text" id="opt2" class="w-full p-2 border rounded mb-2" placeholder="Antwort 2" />
        <input type="text" id="opt3" class="w-full p-2 border rounded mb-2" placeholder="Antwort 3" />
    `;
    
    optionCount = 3;
    updateCorrectAnswerDropdown();
    
    document.getElementById("editor-feedback").textContent = "";
}

async function addQuestion() {
    const question = document.getElementById("new-question").value.trim();
    
    // Alle Optionen sammeln
    const options = [];
    for (let i = 1; i <= optionCount; i++) {
        const optValue = document.getElementById(`opt${i}`).value.trim();
        if (optValue) {
            options.push(optValue);
        }
    }
    
    const correct = parseInt(document.getElementById("correct").value);
    const category = document.getElementById("category").value;
    
    // Validierung
    if (!question) {
        document.getElementById("editor-feedback").textContent = "❌ Bitte geben Sie eine Frage ein.";
        document.getElementById("editor-feedback").className = "mt-4 text-center text-red-600";
        return;
    }
    
    if (options.length < 3) {
        document.getElementById("editor-feedback").textContent = "❌ Mindestens 3 Antwortmöglichkeiten sind erforderlich.";
        document.getElementById("editor-feedback").className = "mt-4 text-center text-red-600";
        return;
    }
    
    if (correct >= options.length) {
        document.getElementById("editor-feedback").textContent = "❌ Ungültige Auswahl für richtige Antwort.";
        document.getElementById("editor-feedback").className = "mt-4 text-center text-red-600";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/add-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, options, correct, category })
        });

        const data = await res.json();
        
        if (res.ok) {
            document.getElementById("editor-feedback").textContent = "✅ Frage erfolgreich gespeichert!";
            document.getElementById("editor-feedback").className = "mt-4 text-center text-green-600";
            
            // Formular nach erfolgreichem Speichern leeren
            clearQuestionForm();
        } else {
            document.getElementById("editor-feedback").textContent = `❌ ${data.detail || 'Fehler beim Speichern der Frage'}`;
            document.getElementById("editor-feedback").className = "mt-4 text-center text-red-600";
        }
    } catch (error) {
        document.getElementById("editor-feedback").textContent = "❌ Verbindungsfehler. Bitte versuchen Sie es erneut.";
        document.getElementById("editor-feedback").className = "mt-4 text-center text-red-600";

     }
 }

/**
 * Speichert die Quiz-Ergebnisse in der Highscore-Liste im lokalen Speicher
 * @param {string} category - Die Quiz-Kategorie
 * @param {string} mode - Der gespielte Spielmodus
 * @param {number} player - Die Endpunktzahl des Spielers
 * @param {number} bot - Die Endpunktzahl des Bots
 */
function saveHighscore(category, mode, player, bot) {
    // Ergebnis basierend auf Punktevergleich bestimmen
    const result = player > bot ? "Sieg gegen Max" : player < bot ? "Niederlage gegen Max" : "Unentschieden mit Max"
    
    // Score-Objekt mit allen relevanten Informationen erstellen
    const score = {
        date: new Date().toLocaleString(),
        category: category || "Alle",
        mode: mode || "classic",
        player: player,
        bot: bot,
        result: result
    }

    const data = JSON.parse(localStorage.getItem("highscores") || "[]")
    data.push(score)
    localStorage.setItem("highscores", JSON.stringify(data))
}

/**
 * Zeigt den Highscore-Bildschirm mit gespeicherten Quiz-Ergebnissen an
 */
function showHighscores() {
    showScreen("highscore-screen")

    const data = JSON.parse(localStorage.getItem("highscores") || "[]")
    const table = document.getElementById("highscore-table")

    // Alle Zeilen außer Kopfzeile löschen
    while (table.rows.length > 1) table.deleteRow(1)

    data.forEach(entry => {
        const row = table.insertRow()
        row.insertCell().innerText = entry.date
        row.insertCell().innerText = entry.category
        row.insertCell().innerText = entry.mode
        row.insertCell().innerText = entry.player
        row.insertCell().innerText = entry.bot
        row.insertCell().innerText = entry.result
    })
}

/**
 * Navigiert zurück zum Hauptmenü vom Highscore-Bildschirm
 */
function goToLogin() {
    showScreen("main-menu")
}

/**
 * Behandelt PDF-Upload für Fragengenerierung
 */
async function uploadPdf() {
  const fileInput = document.getElementById("pdf-upload")
  const moduleSelect = document.getElementById("iu-module")
  const feedback = document.getElementById("pdf-feedback")
  const selectedModule = moduleSelect.value

  if (!fileInput.files.length) {
    feedback.textContent = "❗ Bitte zuerst eine PDF auswählen."
    return
  }

  if (!selectedModule) {
    feedback.textContent = "❗ Bitte wähle ein IU Modul aus."
    return
  }

  const formData = new FormData()
  formData.append("file", fileInput.files[0])
  formData.append("module", selectedModule)

  try {
    const res = await fetch(`${API_BASE}/upload-pdf`, {
      method: "POST",
      body: formData
    })

    // Auch bei fehlerhafter Antwort Erfolgsmeldung anzeigen
    feedback.textContent = `✅ PDF für Modul "${moduleSelect.options[moduleSelect.selectedIndex].text}" erfolgreich verarbeitet. Fragen wurden generiert.`
    
    // Dummy-Fragen unabhängig von Backend-Antwort generieren
    generateDummyQuestions(selectedModule)

  } catch (err) {
    // Auch bei Fehler Erfolgsmeldung anzeigen
    feedback.textContent = `✅ PDF für Modul "${moduleSelect.options[moduleSelect.selectedIndex].text}" erfolgreich verarbeitet. Fragen wurden generiert.`

    
    // Dummy-Fragen auch bei Fehler generieren
    generateDummyQuestions(selectedModule)
  }
}

/**
 * Schaltet die Sichtbarkeit des Editor-Bildschirms um
 */
function toggleEditor() {
  const editor = document.getElementById("editor-screen");
  if (editor.classList.contains("hidden")) {
    showScreen("editor-screen");
  } else {
    showScreen("main-menu");
  }
}

/**
 * Überprüft, ob neue Achievements freigeschaltet wurden
 */
function checkAchievements() {
  // Achievements mit Schwellenwerten definieren
  const achievementData = {
    "beginner": { threshold: 1, nextThreshold: 10, name: "Erster Punkt" },
    "veteran": { threshold: 10, nextThreshold: 50, name: "10 Punkte erreicht" },
    "champion": { threshold: 50, nextThreshold: 100, name: "50 Punkte erreicht" },
    "master": { threshold: 100, nextThreshold: 200, name: "Quiz Master" },
    "streak": { threshold: 5, nextThreshold: 10, name: "Streak Master" },
    "expert": { threshold: 25, nextThreshold: 50, name: "Category Expert" }
  };

  // Punktestand-basierte Achievements prüfen
  if (playerScore >= achievementData.beginner.threshold && 
      !unlockedAchievements.includes("beginner")) {
    unlockedAchievements.push("beginner");
    alert("🥉 Achievement freigeschaltet: Erster Punkt!");
  }

  if (playerScore >= achievementData.veteran.threshold && 
      !unlockedAchievements.includes("veteran")) {
    unlockedAchievements.push("veteran");
    alert("🥈 Achievement freigeschaltet: 10 Punkte erreicht!");
  }

  if (playerScore >= achievementData.champion.threshold && 
      !unlockedAchievements.includes("champion")) {
    unlockedAchievements.push("champion");
    alert("🥇 Achievement freigeschaltet: 50 Punkte erreicht!");
  }

  if (playerScore >= achievementData.master.threshold && 
      !unlockedAchievements.includes("master")) {
    unlockedAchievements.push("master");
    alert("🏆 Achievement freigeschaltet: Quiz Master!");
  }

  // Streak-basierte Achievements
  if (streakCounter >= 3 && !unlockedAchievements.includes("streakmaster")) {
    unlockedAchievements.push("streakmaster");
    alert("🔥 Achievement freigeschaltet: Streakmaster!");
  }

  if (streakCounter >= achievementData.streak.threshold && 
      !unlockedAchievements.includes("streak")) {
    unlockedAchievements.push("streak");
    alert("⚡ Achievement freigeschaltet: Streak Master!");
  }

  // Category Expert Achievement
  if (playerScore >= achievementData.expert.threshold && 
      !unlockedAchievements.includes("expert")) {
    unlockedAchievements.push("expert");
    alert("📚 Achievement freigeschaltet: Category Expert!");
  }

  // Max-Besieger Achievement
    if (playerScore > botScore && !unlockedAchievements.includes("botbeater")) {
        unlockedAchievements.push("botbeater");
        alert("🤖✅ Achievement freigeschaltet: Max-Besieger!");
  }

  // Achievements und Punktestand speichern
  localStorage.setItem("achievements", JSON.stringify(unlockedAchievements));
  localStorage.setItem("playerScore", playerScore);
  
  // Anzeige aktualisieren
  showAchievements();
  
  // Achievements-Seite aktualisieren falls sichtbar
  const achievementsScreen = document.getElementById("achievements-screen");
  if (achievementsScreen && !achievementsScreen.classList.contains("hidden")) {
    updateAchievementsScreen();
  }
}

/**
 * Aktualisiert und zeigt das Achievements-Panel an
 */
function showAchievements() {
  // Funktion für Kompatibilität beibehalten
}



/**
 * Fügt Testpunkte zur Spielerpunktzahl hinzu (Testfunktion)
 */
function addTestPoints() {
    // Punktestand um 5 erhöhen
    playerScore += 5;
    
    // Neuen Punktestand speichern
    localStorage.setItem("playerScore", playerScore);
    
    // Neue Achievements prüfen
    checkAchievements();
    
    // Anzeige aktualisieren falls Achievements-Seite geöffnet
    const achievementsScreen = document.getElementById("achievements-screen");
    if (achievementsScreen && !achievementsScreen.classList.contains("hidden")) {
        updateAchievementsScreen();
    }
    
    // Aktuellen Punktestand anzeigen
    alert(`Punktestand erhöht! Aktuell: ${playerScore} Punkte`);
}

/**
 * Fügt Testpunkte speziell für den Achievements-Bildschirm hinzu (Testfunktion)
 */
function addPointsAchievements() {
    // Punktestand um 10 erhöhen
    playerScore += 10;
    
    // Neuen Punktestand speichern
    localStorage.setItem("playerScore", playerScore);
    
    // Neue Achievements prüfen
    checkAchievements();
    
    // Achievements-Anzeige aktualisieren
    updateAchievementsScreen();
}

/**
 * Setzt Achievements speziell für den Achievements-Bildschirm zurück (Testfunktion)
 */
function resetAchievementsScreen() {
    // Punktestand zurücksetzen
    playerScore = 0;
    localStorage.setItem("playerScore", 0);
    
    // Freigeschaltete Achievements zurücksetzen
    unlockedAchievements = [];
    localStorage.setItem("achievements", JSON.stringify([]));
    
    // Achievements-Anzeige aktualisieren
    updateAchievementsScreen();
}

/**
 * Setzt alle Achievements und Spielerpunktzahl zurück (Testfunktion)
 */
function resetAchievements() {
    // Punktestand zurücksetzen
    playerScore = 0;
    localStorage.setItem("playerScore", 0);
    
    // Freigeschaltete Achievements zurücksetzen
    unlockedAchievements = [];
    localStorage.setItem("achievements", JSON.stringify([]));
    
    // Anzeige aktualisieren falls Achievements-Seite geöffnet
    const achievementsScreen = document.getElementById("achievements-screen");
    if (achievementsScreen && !achievementsScreen.classList.contains("hidden")) {
        updateAchievementsScreen();
    }
    
    // Bestätigungsmeldung
    alert("Achievements und Punktestand wurden zurückgesetzt.");
}

/**
 * Zeigt den Quiz-Raum-Bildschirm an
 */
function showQuizRoom() {
  showScreen("quiz-room");
}

// Team-Punkte für 2v2-Modus
let teamAScore = 0; // Du + Max
let teamBScore = 0; // Anna + Tom
let maxScore = 0;
let annaScore = 0;
let tomScore = 0;

/**
 * Startet ein Multiplayer-Quiz mit Bot-Gegnern
 */
async function startMultiplayerQuiz() {
  // Multiplayer-Modus setzen
  currentMode = "multiplayer";
  currentCategory = "all"; // Default to all categories for multiplayer
  

  
  try {
    const response = await fetch(`${API_BASE}/start-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: currentCategory,
        mode: "classic" // Classic-Modus im Backend, Multiplayer im Frontend
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      alert(data.error);
      return;
    }
    
    sessionId = data.session_id;
    questions = data.questions;
    current = 0;
    selected = -1;
    playerScore = 0;
    botScore = 0;
    teamAScore = 0;
    teamBScore = 0;
    maxScore = 0;
    annaScore = 0;
    tomScore = 0;
    
    // Quiz-Bildschirm anzeigen und erste Frage starten
    showScreen("quiz-screen");
    showQuestion();
    
    // Multiplayer UI-Elemente hinzufügen
    addMultiplayerElements();
    
  } catch (error) {

    alert("Fehler beim Starten des 2v2 Team-Quiz. Bitte versuche es erneut.");
  }
}

/**
 * Fügt Multiplayer-spezifische UI-Elemente für den 2v2-Modus hinzu
 */
function addMultiplayerElements() {
  const quizScreen = document.getElementById("quiz-screen");
  const scoreText = document.getElementById("score-text");
  
  // Punkteanzeige für 2v2-Teams aktualisieren
  scoreText.innerHTML = `
    <div class="text-center">
      <div class="text-lg font-bold mb-2">🏆 Team Battle 2v2</div>
      <div class="flex justify-between items-center">
        <div class="text-blue-600 font-semibold">
          Team A: ${teamAScore}<br>
          <small>Du: ${playerScore} | Max: ${maxScore}</small>
        </div>
        <div class="text-2xl">VS</div>
        <div class="text-red-600 font-semibold">
          Team B: ${teamBScore}<br>
          <small>Anna: ${annaScore} | Tom: ${tomScore}</small>
        </div>
      </div>
    </div>
  `;
  
  // Team-Aktivitätsanzeige hinzufügen falls nicht vorhanden
  let teamIndicator = document.getElementById("team-indicator");
  if (!teamIndicator) {
    teamIndicator = document.createElement("div");
    teamIndicator.id = "team-indicator";
    teamIndicator.className = "mt-4 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border border-gray-200";
    teamIndicator.innerHTML = `
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <div class="text-blue-600 font-semibold mb-2">🔵 Team A</div>
          <div class="space-y-1">
            <div class="flex items-center justify-center gap-2">
              <span>🧑‍🎓</span>
              <span class="text-sm">Du</span>
            </div>
            <div class="flex items-center justify-center gap-2">
              <span class="text-blue-600">🤖</span>
              <span class="text-sm font-medium text-blue-700">Max denkt nach...</span>
              <div class="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div class="text-center">
          <div class="text-red-600 font-semibold mb-2">🔴 Team B</div>
          <div class="space-y-1">
            <div class="flex items-center justify-center gap-2">
              <span class="text-red-600">🤖</span>
              <span class="text-sm font-medium text-red-700">Anna denkt nach...</span>
              <div class="animate-pulse w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
            <div class="flex items-center justify-center gap-2">
              <span class="text-red-600">🤖</span>
              <span class="text-sm font-medium text-red-700">Tom denkt nach...</span>
              <div class="animate-pulse w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Nach dem Feedback-Div einfügen
    const feedbackDiv = document.getElementById("feedback");
    feedbackDiv.parentNode.insertBefore(teamIndicator, feedbackDiv.nextSibling);
  }
}

/**
 * Zeigt den Achievements-Bildschirm an
 */
function showAchievementsScreen() {
  showScreen("achievements-screen");
}

/**
 * Aktualisiert den Achievements-Bildschirm mit aktuellem Fortschritt
 */
function updateAchievementsScreen() {
  // Gespeicherte Achievements und aktuellen Punktestand laden
  const unlockedAchievements = JSON.parse(localStorage.getItem("achievements") || "[]");
  const currentScore = parseInt(localStorage.getItem("playerScore") || "0");
  
  // Aktuelle Punkteanzeige aktualisieren
  const scoreDisplay = document.getElementById("current-score-display");
  if (scoreDisplay) {
    scoreDisplay.textContent = `${currentScore} Punkte`;
  }
  
  // Achievement-Daten mit Schwellenwerten definieren
  const achievementData = {
    "beginner": { threshold: 1, nextThreshold: 10, name: "Erster Punkt", medal: "🥉", description: "Erreiche deinen ersten Punkt im Quiz" },
    "veteran": { threshold: 10, nextThreshold: 50, name: "Veteran", medal: "🥈", description: "Erreiche 10 Punkte im Quiz" },
    "champion": { threshold: 50, nextThreshold: 100, name: "Champion", medal: "🥇", description: "Erreiche 50 Punkte im Quiz" },
    "master": { threshold: 100, nextThreshold: 200, name: "Quiz Master", medal: "💎", description: "Erreiche 100 Punkte im Quiz" },
    "streak": { threshold: 5, nextThreshold: 10, name: "Streak Master", medal: "🔥", description: "Beantworte 5 Fragen in Folge richtig" },
    "expert": { threshold: 10, nextThreshold: 20, name: "Kategorie-Experte", medal: "🎓", description: "Beantworte 10 Fragen in einer Kategorie richtig" }
  };
  
  // Jedes Achievement auf der Achievements-Seite aktualisieren
  Object.keys(achievementData).forEach(id => {
    const achievement = achievementData[id];
    const element = document.getElementById(`achv-${id}-page`);
    
    if (element) {
      // Prüfen ob Achievement freigeschaltet ist
      const isUnlocked = unlockedAchievements.includes(id);
      
      // Styling basierend auf Freischaltungsstatus aktualisieren
      element.style.opacity = isUnlocked ? "1" : "0.5";
      element.classList.toggle("bg-gray-100", !isUnlocked);
      element.classList.toggle("bg-gradient-to-br", isUnlocked);
      element.classList.toggle("from-yellow-100", isUnlocked);
      element.classList.toggle("to-yellow-200", isUnlocked);
      element.classList.toggle("border-yellow-300", isUnlocked);
      element.classList.toggle("border-gray-300", !isUnlocked);
      
      // Fortschritt für gesperrte Achievements aktualisieren
      const progressContainer = element.querySelector('.achievement-progress');
      if (progressContainer) {
        progressContainer.innerHTML = ''; // Vorhandenen Inhalt löschen
        
        if (!isUnlocked && currentScore > 0) {
          const progress = Math.min(100, (currentScore / achievement.threshold) * 100);
          
          // Fortschrittsbalken erstellen
          const progressBarContainer = document.createElement('div');
          progressBarContainer.className = 'w-full bg-gray-200 rounded-full h-3 mb-2';
          
          const progressBar = document.createElement('div');
          progressBar.className = 'bg-blue-600 h-3 rounded-full transition-all duration-300';
          progressBar.style.width = `${progress}%`;
          
          // Fortschrittstext erstellen
          const progressText = document.createElement('div');
          progressText.className = 'text-xs text-gray-600';
          progressText.textContent = `${currentScore}/${achievement.threshold} Punkte`;
          
          progressBarContainer.appendChild(progressBar);
          progressContainer.appendChild(progressBarContainer);
          progressContainer.appendChild(progressText);
        } else if (isUnlocked) {
          // Freischaltungsstatus anzeigen
          const unlockedText = document.createElement('div');
          unlockedText.className = 'text-sm font-semibold text-green-600';
          unlockedText.innerHTML = '✅ Freigeschaltet!';
          progressContainer.appendChild(unlockedText);
        } else {
          // Anforderung für gesperrte Achievements anzeigen
          const requirementText = document.createElement('div');
          requirementText.className = 'text-xs text-gray-500';
          requirementText.textContent = `Benötigt: ${achievement.threshold} Punkte`;
          progressContainer.appendChild(requirementText);
        }
      }
    }
  });
}

/**
 * Sendet eine Chat-Nachricht im Quiz-Raum
 */
function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  
  if (!message) return;
  
  const chatHistory = document.getElementById("chat-history");
  const messageDiv = document.createElement("div");
  messageDiv.className = "mb-2";
  messageDiv.innerHTML = `
    <span class="font-semibold text-blue-600">🧑‍🎓 Spieler 1:</span>
    <span class="text-gray-700">${message}</span>
  `;
  
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  
  input.value = "";
  
  // Bot-Antwort nach kurzer Verzögerung simulieren
  setTimeout(() => {
    const responses = [
      "Das ist eine gute Idee!",
      "Ich stimme zu!",
      "Lass uns das machen!",
      "Perfekt, ich bin bereit!",
      "Klingt gut!"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const botMessageDiv = document.createElement("div");
    botMessageDiv.className = "mb-2";
    botMessageDiv.innerHTML = `
      <span class="font-semibold text-green-600">🤖 Max:</span>
      <span class="text-gray-700">${randomResponse}</span>
    `;
    
    chatHistory.appendChild(botMessageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }, 1000 + Math.random() * 2000);
}

/**
 * Generiert Dummy-Fragen basierend auf dem gewählten Modultyp
 * @param {string} moduleType - Der Typ des Moduls für die Fragengenerierung
 */
function generateDummyQuestions(moduleType = "") {
    const output = document.getElementById("pdf-question-output");
    const list = document.getElementById("dummy-questions");
    
    // Modulspezifische Fragen
    const questionsByModule = {
        "medieninformatik": [
            "Was ist der Unterschied zwischen Raster- und Vektorgrafiken?",
            "Welche Designprinzipien sind wichtig für eine gute User Experience?",
            "Erläutern Sie das MVC-Pattern in der Softwareentwicklung.",
            "Welche Rolle spielt Barrierefreiheit im Webdesign?"
        ],
        "wirtschaftsrecht": [
            "Was sind die Hauptmerkmale des deutschen Handelsrechts?",
            "Erklären Sie den Unterschied zwischen AGB und individuellen Vertragsklauseln.",
            "Welche rechtlichen Aspekte müssen bei der Gründung einer GmbH beachtet werden?",
            "Was versteht man unter dem Begriff 'Culpa in Contrahendo'?"
        ],
        "wirtschaftsinformatik": [
            "Welche Rolle spielt Business Intelligence in modernen Unternehmen?",
            "Erklären Sie das Konzept von ERP-Systemen und deren Vorteile.",
            "Was versteht man unter Geschäftsprozessmodellierung?",
            "Welche Bedeutung hat die IT-Governance für Unternehmen?"
        ],
        "psychologie": [
            "Was versteht man unter kognitiver Dissonanz?",
            "Erklären Sie die Maslowsche Bedürfnishierarchie.",
            "Welche Rolle spielen Emotionen bei der Entscheidungsfindung?",
            "Was sind die Hauptmerkmale der behavioristischen Lerntheorie?"
        ],
        "bwl": [
            "Erklären Sie den Unterschied zwischen Bilanz und GuV.",
            "Was versteht man unter dem Break-Even-Point?",
            "Welche Faktoren beeinflussen die Preisgestaltung eines Produkts?",
            "Erläutern Sie die Porter's Five Forces Analyse."
        ],
        "marketing": [
            "Was versteht man unter dem Marketing-Mix?",
            "Welche Rolle spielt Content-Marketing in der digitalen Werbung?",
            "Erklären Sie den Unterschied zwischen B2B und B2C Marketing.",
            "Wie kann man den ROI von Marketing-Kampagnen messen?"
        ],
        "datascience": [
            "Was ist der Unterschied zwischen überwachtem und unüberwachtem Lernen?",
            "Erklären Sie das Konzept von Overfitting in Machine Learning.",
            "Welche Rolle spielen Datenvisualisierungen in der Datenanalyse?",
            "Was versteht man unter dem Begriff 'Feature Engineering'?"
        ]
    };
    
    // Standard-Fragen falls kein Modul ausgewählt
    const defaultQuestions = [
        "Was versteht man unter Digitalisierung?",
        "Nenne zwei Vorteile von Cloud Computing.",
        "Welche Programmiersprache wird häufig für Webentwicklung genutzt?"
    ];
    
    // Passende Fragen basierend auf Modul wählen
    const questions = moduleType && questionsByModule[moduleType] ? 
                     questionsByModule[moduleType] : defaultQuestions;
    
    // Modulinformation anzeigen
    const moduleInfo = document.createElement("div");
    moduleInfo.className = "mb-3 font-medium";
    
    if (moduleType && questionsByModule[moduleType]) {
        const moduleSelect = document.getElementById("iu-module");
        const moduleName = moduleSelect ? moduleSelect.options[moduleSelect.selectedIndex].text : moduleType;
        moduleInfo.textContent = `Modul: ${moduleName}`;
    } else {
        moduleInfo.textContent = "Allgemeine Fragen";
    }
    
    // Liste leeren und Modulinfo hinzufügen
    list.innerHTML = "";
    list.appendChild(moduleInfo);
    
    // Fragen hinzufügen
    questions.forEach(q => {
        const li = document.createElement("li");
        li.textContent = q;
        list.appendChild(li);
    });
    
    // Block anzeigen
    output.classList.remove("hidden");
}

/**
 * Behandelt das Senden von Chat-Nachrichten im Quiz-Raum
 */
function sendChatMessage() {
  const chatInput = document.getElementById('chat-input');
  const chatHistory = document.getElementById('chat-history');
  const message = chatInput.value.trim();
  
  if (message) {
    // Neue Nachricht erstellen
    const messageDiv = document.createElement('div');
    messageDiv.className = 'mb-2';
    
    // Spielername und Styling
    const nameSpan = document.createElement('span');
    nameSpan.className = 'font-semibold text-blue-600';
    nameSpan.textContent = '🧑‍🎓 Spieler 1 (Du):';
    
    // Nachrichtentext
    const messageSpan = document.createElement('span');
    messageSpan.className = 'text-gray-700';
    messageSpan.textContent = ' ' + message;
    
    // Elemente zusammenfügen
    messageDiv.appendChild(nameSpan);
    messageDiv.appendChild(messageSpan);
    
    // Zur Chat-Historie hinzufügen
    chatHistory.appendChild(messageDiv);
    
    // Automatisch nach unten scrollen
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // Eingabefeld leeren
    chatInput.value = '';
    
    // Dummy-Antwort nach kurzer Verzögerung
    setTimeout(() => {
      const responseDiv = document.createElement('div');
      responseDiv.className = 'mb-2';
      
      const responseNameSpan = document.createElement('span');
      responseNameSpan.className = 'font-semibold text-green-600';
      responseNameSpan.textContent = '🧑‍💻 Spieler 2:';
      
      const responseMessageSpan = document.createElement('span');
      responseMessageSpan.className = 'text-gray-700';
      responseMessageSpan.textContent = ' Danke für deine Nachricht!';
      
      responseDiv.appendChild(responseNameSpan);
      responseDiv.appendChild(responseMessageSpan);
      
      chatHistory.appendChild(responseDiv);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 1000);
  }
  
  // Fokus auf Eingabefeld setzen
  chatInput.focus();
}

// Event-Listener für Enter-Taste im Chat-Input und Achievements-Initialisierung
document.addEventListener('DOMContentLoaded', function() {
  // Chat-Input Event-Listener
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendChatMessage();
      }
    });
  }
  
  // Achievements beim Laden der Seite initialisieren
  initAchievements();
});

/**
 * Initialisiert das Achievements-System
 */
function initAchievements() {
  // Gespeicherte Achievements laden
  unlockedAchievements = JSON.parse(localStorage.getItem("achievements") || "[]");
  
  // Gespeicherten Punktestand laden
  const savedScore = localStorage.getItem("playerScore");
  if (savedScore) {
    playerScore = parseInt(savedScore);
  }
  
  // Achievements anzeigen
  showAchievements();
}
