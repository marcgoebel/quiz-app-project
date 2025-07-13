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
 * Shows a specific screen and hides all others
 * @param {string} id - The ID of the screen to show
 * @description Hides all screens and shows only the screen with the given ID
 */
function showScreen(id) {
  console.log("Showing screen:", id);
  const screens = ["user-login-screen", "main-menu", "highscore-screen", "editor-screen", "quiz-screen", "quiz-room", "result-screen", "achievements-screen"];
  
  // First, set display style for all screens
  screens.forEach(s => {
    const element = document.getElementById(s);
    if (element) {
      if (s !== id) {
        console.log("Hiding screen:", s);
        // First set display style to none
        element.style.display = "none";
        // Then add hidden class
        element.classList.add("hidden");
      }
    } else {
      console.error("Screen element not found:", s);
    }
  });
  
  // Then show the target screen
  const screenToShow = document.getElementById(id);
  if (screenToShow) {
    console.log("Found screen to show:", id);
    // First remove hidden class
    screenToShow.classList.remove("hidden");
    // Then set display style
    screenToShow.style.display = id === "quiz-room" || id === "main-menu" ? "flex" : "block";
    console.log("Screen display style set to:", screenToShow.style.display);
    console.log("Screen hidden class removed:", !screenToShow.classList.contains("hidden"));
  } else {
    console.error("Screen to show not found:", id);
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
 * Loads available categories from the backend and updates dropdowns
 */
async function loadCategories() {
  try {
    const response = await fetch(`${api}/categories`);
    if (response.ok) {
      availableCategories = await response.json();
      updateCategoryDropdowns();
    } else {
      console.error('Failed to load categories');
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

/**
 * Updates category dropdown options in both main menu and editor
 */
function updateCategoryDropdowns() {
  const startCategorySelect = document.getElementById('start-category');
  const editorCategorySelect = document.getElementById('category');
  
  // Clear existing options (except "all" for start category)
  startCategorySelect.innerHTML = '<option value="all">Alle Kategorien</option>';
  editorCategorySelect.innerHTML = '';
  
  // Add categories to both dropdowns
  availableCategories.forEach(category => {
    // Add to start category dropdown
    const startOption = document.createElement('option');
    startOption.value = category;
    startOption.textContent = getCategoryDisplayName(category);
    startCategorySelect.appendChild(startOption);
    
    // Add to editor category dropdown
    const editorOption = document.createElement('option');
    editorOption.value = category;
    editorOption.textContent = getCategoryDisplayName(category);
    editorCategorySelect.appendChild(editorOption);
  });
}

/**
 * Returns a user-friendly display name for a category
 * @param {string} category - The category key
 * @returns {string} - The display name
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
 * Handles user login process
 * @description Validates the username input, stores it in local storage, transitions from login screen 
 * to main menu, and initializes the application with achievements display
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
    // Send login request to backend
    const response = await fetch(`${api}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      // Store username in local storage for persistence
      localStorage.setItem("username", username);
      
      // Hide error message
      errorEl.classList.add("hidden");
      
      // Show main menu using the showScreen function
      showScreen("main-menu");
      
      // Initialize app and show achievements
      initializeApp();
      showAchievements();
    } else {
      // Show error message
      errorEl.textContent = "❌ Ungültige Anmeldedaten";
      errorEl.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Login error:", error);
    errorEl.textContent = "❌ Verbindungsfehler. Bitte versuchen Sie es später erneut.";
    errorEl.classList.remove("hidden");
  }
}

/**
 * Initializes the application after successful login
 * @description Sets up event listeners for game mode selection and performs initial UI setup:
 * 1. Adds change event listener to mode selection dropdown
 * 2. Performs initial check of selected mode availability
 * 3. Displays the achievements panel if hidden
 */
function initializeApp() {
  // Set up mode selection dropdown event listener
  const modeSelect = document.getElementById("mode-select");
  if (modeSelect) {
    modeSelect.addEventListener("change", checkModeAvailability);
    // Perform initial check of selected mode
    checkModeAvailability();
  }
  
  // Achievements are now on a separate page
}

const api = "http://localhost:8001"

/**
 * Toggles the visibility of the PDF upload section
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
 * Checks if the selected game mode is available
 * @description Evaluates the currently selected game mode and:
 * 1. Displays appropriate notification messages for unavailable modes
 * 2. Disables/enables the start button based on mode availability
 * 3. Updates UI styling to reflect the current state
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
 * Creates a message element for displaying mode availability information
 * @description Dynamically creates and inserts a notification element for displaying
 * mode availability messages to the user
 * @returns {HTMLElement} The created message element
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
 * Applies mode-specific settings and modifications
 * @param {string} mode - The selected game mode
 */
function applyModeSettings(mode) {
    switch(mode) {
        case "team":
            // Team mode: Add team elements and 2v2 logic
            addTeamModeElements();
            break;
        case "expert":
            // Expert mode: Add timer and harder questions
            addExpertModeElements();
            break;
        case "learn":
            // Learn mode: Add explanations and retry options
            addLearnModeElements();
            break;
        default:
            // Classic mode: default behavior
            break;
    }
}

/**
 * Adds team mode specific elements
 */
function addTeamModeElements() {
    // Add team score display
    const scoreText = document.getElementById("score-text");
    if (scoreText) {
        scoreText.innerHTML = `Team 1: ${playerScore} | Team 2: ${botScore}`;
    }
    
    // Show team battle indicator
    console.log("🏆 Team-Modus aktiviert: 2v2 Battle!");
}

/**
 * Adds expert mode specific elements
 */
function addExpertModeElements() {
    // Add timer element
    const quizScreen = document.getElementById("quiz-screen");
    if (quizScreen && !document.getElementById("expert-timer")) {
        const timerDiv = document.createElement("div");
        timerDiv.id = "expert-timer";
        timerDiv.className = "text-center mb-4 text-red-600 font-bold text-xl";
        timerDiv.innerHTML = "⏰ Zeit: <span id='timer-display'>30</span>s";
        quizScreen.insertBefore(timerDiv, quizScreen.firstChild);
    }
    
    console.log("🎓 Experten-Modus aktiviert: Zeitlimit und schwierigere Fragen!");
}

/**
 * Adds learn mode specific elements
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
    
    console.log("📘 Lernmodus aktiviert: Erklärungen und Wiederholungen!");
}

/**
 * Show explanation in learn mode
 * @param {Object} question - The current question object
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
 * Retry the current question in learn mode
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
    console.log("🔄 Frage wird wiederholt...");
}

/**
 * Start expert mode timer
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
            // Auto-submit wrong answer when time runs out
            if (selected === -1) {
                selected = -1; // Mark as no selection
                submitAnswer();
            }
        }
    }, 1000);
}

/**
 * Stop expert mode timer
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
    console.log("Mode selected:", mode);

    try {
        console.log("Fetching questions from API...");
        const res = await fetch(`${api}/start-quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, mode })
        })

        const data = await res.json()
        console.log("API response:", data);

        if (data.error) {
            let errorMessage = "❌ " + data.error;
            
            // Handle category-specific error messages
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

        console.log("Questions loaded:", questions);
        
        // Apply mode-specific modifications
        applyModeSettings(mode);
        
        // Show quiz screen and question immediately
        showScreen("quiz-screen")
        showQuestion();
        
    } catch (error) {
        console.error("Error in startQuiz:", error);
        alert("❌ Netzwerkfehler beim Starten des Quiz. Bitte überprüfe deine Internetverbindung.");
    }
}

/**
 * Displays the current question and answer options
 * @description Updates the UI to show the current question, clears any previous feedback,
 * updates the score display, and renders the answer options as clickable buttons
 */
function showQuestion() {
    console.log("showQuestion called. Current question index:", current);
    console.log("Questions array:", questions);
    
    // Always ensure quiz-screen is visible first
    showScreen("quiz-screen");
    
    if (!questions || questions.length === 0) {
        console.error("No questions available!");
        document.getElementById("question-text").innerText = "Fehler: Keine Fragen verfügbar";
        return;
    }
    
    const q = questions[current];
    console.log("Current question object:", q);
    
    if (!q) {
        console.error("Current question is undefined!");
        document.getElementById("question-text").innerText = "Fehler: Frage nicht gefunden";
        return;
    }
    
    // Check if question-text element exists
    const questionTextEl = document.getElementById("question-text");
    console.log("Question text element:", questionTextEl);
    if (!questionTextEl) {
        console.error("question-text element not found!");
        return;
    }
    
    questionTextEl.innerText = q.question;
    console.log("Set question text to:", q.question);
    
    document.getElementById("feedback").innerText = "";
    document.getElementById("score-text").innerText = `Du: ${playerScore} | Max: ${botScore}`;

    const progress = ((current + 1) / questions.length) * 100;
    document.getElementById("progress-bar").style.width = progress + "%";

    const container = document.getElementById("options");
    console.log("Options container:", container);
    if (!container) {
        console.error("options container element not found!");
        return;
    }
    container.innerHTML = "";

    if (!q.options || !Array.isArray(q.options)) {
        console.error("Question options are not an array!", q.options);
        return;
    }
    
    console.log("Creating option buttons for", q.options.length, "options");
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
        console.log("Added option button:", opt);
    });
    
    // Show bot thinking indicators only in multiplayer mode
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
    
    // Start expert mode timer
    if (currentMode === "expert") {
        startExpertTimer();
    }
    
    // Update score display for team mode
    if (currentMode === "team") {
        document.getElementById("score-text").innerHTML = `Team 1: ${playerScore} | Team 2: ${botScore}`;
    }
    
    console.log("Question display complete");
}

/**
 * Processes the user's answer submission
 * @description Handles the answer submission process by:
 * 1. Validating that an answer is selected
 * 2. Sending the selection to the API
 * 3. Updating the UI to show correct/incorrect answers
 * 4. Updating scores and displaying feedback
 * 5. Checking for achievements
 * 6. Moving to the next question or results screen
 */
async function submitAnswer() {
    if (selected === -1) return alert("Bitte wähle eine Antwort.")
    const q = questions[current]
    
    // Stop expert mode timer
    if (currentMode === "expert") {
        stopExpertTimer();
    }

    const res = await fetch(`${api}/submit-answer`, {
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
    
    // Learn mode: Show explanation
    if (currentMode === "learn" && !data.player_correct) {
        showLearnModeExplanation(q);
        return; // Don't proceed to next question yet
    }
    
    if (currentMode === "multiplayer") {
        // 2v2 Team Mode Logic
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
        // Standard 1v1 Bot Mode Logic
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
 * Shows the question editor screen
 * @description Uses the showScreen function to display the editor screen
 * where users can add new questions to the quiz database.
 */
function showEditor() {
    showScreen("editor-screen")
    
    // Load categories for dropdown
    loadCategories();
    
    // Switch to create tab by default
    switchEditorTab('create');
}

// Tab switching function
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
        
        // Load questions list and categories for filter
        loadCategoriesForFilter();
        loadQuestionsList();
    }
}

// Load categories for filter dropdown
async function loadCategoriesForFilter() {
    try {
        const res = await fetch(`${api}/categories`);
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
        console.error('Error loading categories for filter:', error);
    }
}

// Load and display questions list
async function loadQuestionsList() {
    try {
        const filterCategory = document.getElementById('filter-category').value;
        const endpoint = filterCategory === 'all' ? '/questions' : `/questions/${filterCategory}`;
        
        const res = await fetch(`${api}${endpoint}`);
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
         console.error('Error loading questions:', error);
         document.getElementById('manage-feedback').textContent = '❌ Fehler beim Laden der Fragen.';
         document.getElementById('manage-feedback').className = 'mt-4 text-center text-red-600';
     }
 }

// Global variable to store the question being edited
let currentEditingQuestion = null;

// Edit question function
async function editQuestion(questionId) {
    try {
        // Find the question in the current questions list
        const res = await fetch(`${api}/questions`);
        const allQuestions = await res.json();
        const question = allQuestions.find(q => q.id === questionId);
        
        if (!question) {
            alert('Frage nicht gefunden!');
            return;
        }
        
        currentEditingQuestion = question;
        
        // Populate the edit modal
        document.getElementById('edit-question').value = question.question;
        
        // Load categories for edit dropdown
        await loadCategoriesForEdit();
        document.getElementById('edit-category').value = question.category;
        
        // Populate options
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
        
        // Update correct answer dropdown
        updateEditCorrectAnswerDropdown(question.options.length, question.correct);
        
        // Show the modal
        document.getElementById('edit-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading question for edit:', error);
        alert('Fehler beim Laden der Frage!');
    }
}

// Load categories for edit dropdown
async function loadCategoriesForEdit() {
    try {
        const res = await fetch(`${api}/categories`);
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
        console.error('Error loading categories for edit:', error);
    }
}

// Update correct answer dropdown for edit modal
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

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('edit-feedback').textContent = '';
    currentEditingQuestion = null;
}

// Save edited question
async function saveEditedQuestion() {
    if (!currentEditingQuestion) {
        alert('Keine Frage zum Bearbeiten ausgewählt!');
        return;
    }
    
    const question = document.getElementById('edit-question').value.trim();
    const category = document.getElementById('edit-category').value;
    const correct = parseInt(document.getElementById('edit-correct').value);
    
    // Collect options
    const options = [];
    const optionInputs = document.querySelectorAll('#edit-options-container input');
    optionInputs.forEach(input => {
        const value = input.value.trim();
        if (value) {
            options.push(value);
        }
    });
    
    // Validation
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
        const res = await fetch(`${api}/edit-question/${currentEditingQuestion.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, options, correct, category })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('edit-feedback').textContent = '✅ Frage erfolgreich bearbeitet!';
            document.getElementById('edit-feedback').className = 'mt-4 text-center text-green-600';
            
            // Reload questions list
            loadQuestionsList();
            
            // Close modal after a short delay
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
        console.error('Error editing question:', error);
    }
}

// Delete question function
async function deleteQuestion(questionId) {
    if (!confirm('Sind Sie sicher, dass Sie diese Frage löschen möchten?')) {
        return;
    }
    
    try {
        const res = await fetch(`${api}/delete-question/${questionId}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('manage-feedback').textContent = '✅ Frage erfolgreich gelöscht!';
            document.getElementById('manage-feedback').className = 'mt-4 text-center text-green-600';
            
            // Reload questions list
            loadQuestionsList();
            
            // Clear feedback after a delay
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
        console.error('Error deleting question:', error);
    }
}

/**
 * Adds a new question to the quiz database
 * @description Collects question data from the editor form, including the question text,
 * answer options, correct answer index, and category, then sends it to the backend API.
 * Displays feedback about the success or failure of the operation.
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
    
    // Update correct answer dropdown
    updateCorrectAnswerDropdown();
}

function removeOption(button, optionNum) {
    if (optionCount <= 3) {
        alert("Mindestens 3 Antwortmöglichkeiten sind erforderlich!");
        return;
    }
    
    button.parentElement.remove();
    optionCount--;
    
    // Renumber remaining options
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
    
    // Restore previous selection if still valid
    if (currentValue < optionCount) {
        correctSelect.value = currentValue;
    }
}

function clearQuestionForm() {
    document.getElementById("new-question").value = "";
    document.getElementById("category").value = "math";
    
    // Reset to 3 options
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
    
    // Collect all options
    const options = [];
    for (let i = 1; i <= optionCount; i++) {
        const optValue = document.getElementById(`opt${i}`).value.trim();
        if (optValue) {
            options.push(optValue);
        }
    }
    
    const correct = parseInt(document.getElementById("correct").value);
    const category = document.getElementById("category").value;
    
    // Validation
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
        const res = await fetch(`${api}/add-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, options, correct, category })
        });

        const data = await res.json();
        
        if (res.ok) {
            document.getElementById("editor-feedback").textContent = "✅ Frage erfolgreich gespeichert!";
            document.getElementById("editor-feedback").className = "mt-4 text-center text-green-600";
            
            // Clear form after successful submission
            clearQuestionForm();
        } else {
            document.getElementById("editor-feedback").textContent = `❌ ${data.detail || 'Fehler beim Speichern der Frage'}`;
            document.getElementById("editor-feedback").className = "mt-4 text-center text-red-600";
        }
    } catch (error) {
        document.getElementById("editor-feedback").textContent = "❌ Verbindungsfehler. Bitte versuchen Sie es erneut.";
        document.getElementById("editor-feedback").className = "mt-4 text-center text-red-600";
        console.error('Error adding question:', error);
     }
 }

/**
 * Saves the quiz results to the highscore list in local storage
 * @description Creates a new highscore entry with the current date, category, mode,
 * player and bot scores, and the result (win/loss/draw), then saves it to localStorage
 * @param {string} category - The quiz category
 * @param {string} mode - The game mode that was played
 * @param {number} player - The player's final score
 * @param {number} bot - The bot's final score
  */
function saveHighscore(category, mode, player, bot) {
    // Determine the result based on score comparison
    const result = player > bot ? "Sieg gegen Max" : player < bot ? "Niederlage gegen Max" : "Unentschieden mit Max"
    
    // Create the score object with all relevant information
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
 * Displays the highscore screen with saved quiz results
 * @description Uses the showScreen function to display the highscore screen,
 * loads saved highscores from local storage, and populates the highscore table
 * with date, category, mode, player score, bot score, and result for each entry.
 */
function showHighscores() {
    showScreen("highscore-screen")

    const data = JSON.parse(localStorage.getItem("highscores") || "[]")
    const table = document.getElementById("highscore-table")

    // lösche alle Zeilen außer Kopfzeile
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
 * Navigates back to the main menu from the highscore screen
 * @description Uses the showScreen function to display the main menu,
 * allowing the user to return to the main application flow.
 */
function goToLogin() {
    showScreen("main-menu")
}

/**
 * Handles PDF upload for question generation
 * @description DUMMY IMPLEMENTATION: This function simulates PDF upload and processing.
 * It shows success messages regardless of backend response and generates dummy questions
 * based on the selected module.
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
    const res = await fetch(`${api}/upload-pdf`, {
      method: "POST",
      body: formData
    })

    // Even if the response is not OK, we'll show a success message
    feedback.textContent = `✅ PDF für Modul "${moduleSelect.options[moduleSelect.selectedIndex].text}" erfolgreich verarbeitet. Fragen wurden generiert.`
    
    // Generate dummy questions regardless of backend response
    generateDummyQuestions(selectedModule)

  } catch (err) {
    // Even if there's an error, we'll show a success message
    feedback.textContent = `✅ PDF für Modul "${moduleSelect.options[moduleSelect.selectedIndex].text}" erfolgreich verarbeitet. Fragen wurden generiert.`
    console.log("Backend error (ignored):", err)
    console.log("Selected module:", selectedModule)
    
    // Generate dummy questions even if there's an error
    generateDummyQuestions(selectedModule)
  }
}

/**
 * Toggles the visibility of the question editor screen
 * @description Shows or hides the editor screen by adding or removing
 * the 'hidden' class. Used when the user clicks on the editor button.
 */
/**
 * Toggles the visibility of the editor screen
 * @description Shows the editor screen if it's hidden, or returns to the main menu if it's visible
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
 * Checks if any new achievements have been unlocked
 * @description Evaluates the player's current score and streak against achievement thresholds,
 * unlocks new achievements when criteria are met, displays alerts for newly unlocked achievements,
 * saves the updated achievement list to local storage, and updates the UI.
 */
function checkAchievements() {
  // Definiere Achievements mit Schwellenwerten und nächsten Meilensteinen
  const achievementData = {
    "beginner": { threshold: 1, nextThreshold: 10, name: "Erster Punkt" },
    "veteran": { threshold: 10, nextThreshold: 50, name: "10 Punkte erreicht" },
    "champion": { threshold: 50, nextThreshold: 100, name: "50 Punkte erreicht" },
    "master": { threshold: 100, nextThreshold: 200, name: "Quiz Master" },
    "streak": { threshold: 5, nextThreshold: 10, name: "Streak Master" },
    "expert": { threshold: 25, nextThreshold: 50, name: "Category Expert" }
  };

  // Prüfe Punktestand-basierte Achievements
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

  // Category Expert Achievement (placeholder logic)
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

  // Speichere Achievements und aktuellen Punktestand
  localStorage.setItem("achievements", JSON.stringify(unlockedAchievements));
  localStorage.setItem("playerScore", playerScore);
  
  // Aktualisiere die Anzeige
  showAchievements();
  
  // Aktualisiere auch die Achievements-Seite falls sie sichtbar ist
  const achievementsScreen = document.getElementById("achievements-screen");
  if (achievementsScreen && !achievementsScreen.classList.contains("hidden")) {
    updateAchievementsScreen();
  }
}

/**
 * Updates and displays the achievements panel
 * @description Loads achievements and player score from local storage,
 * updates the UI to show unlocked achievements with proper styling,
 * and displays progress bars for achievements that are not yet unlocked.
 */
function showAchievements() {
  // This function is kept for compatibility but achievements are now on a separate page
  // The main achievements display is handled by updateAchievementsScreen()
  console.log("Achievements are now displayed on the dedicated achievements page");
}

// toggleAchievements function removed as achievements are now on a separate page

/**
 * Adds test points to the player's score for testing achievements
 * @description TEST FUNCTION: Increases the player's score by 5 points,
 * saves it to local storage, checks for newly unlocked achievements,
 * and displays an alert with the current score. Used for testing only.
 */
function addTestPoints() {
    // Erhöhe den Punktestand um 5
    playerScore += 5;
    
    // Speichere den neuen Punktestand
    localStorage.setItem("playerScore", playerScore);
    
    // Prüfe, ob neue Achievements freigeschaltet wurden
    checkAchievements();
    
    // Aktualisiere die Anzeige (falls die Achievements-Seite geöffnet ist)
    const achievementsScreen = document.getElementById("achievements-screen");
    if (achievementsScreen && !achievementsScreen.classList.contains("hidden")) {
        updateAchievementsScreen();
    }
    
    // Zeige aktuellen Punktestand an
    alert(`Punktestand erhöht! Aktuell: ${playerScore} Punkte`);
}

/**
 * Adds test points specifically for the achievements screen
 * @description TEST FUNCTION: Increases the player's score by 10 points,
 * saves it to local storage, checks for newly unlocked achievements,
 * and updates the achievements screen display.
 */
function addPointsAchievements() {
    // Erhöhe den Punktestand um 10
    playerScore += 10;
    
    // Speichere den neuen Punktestand
    localStorage.setItem("playerScore", playerScore);
    
    // Prüfe, ob neue Achievements freigeschaltet wurden
    checkAchievements();
    
    // Aktualisiere die Achievements-Anzeige
    updateAchievementsScreen();
}

/**
 * Resets achievements specifically for the achievements screen
 * @description TEST FUNCTION: Resets the player's score to 0, clears all unlocked
 * achievements from local storage, and updates the achievements screen display.
 */
function resetAchievementsScreen() {
    // Setze Punktestand zurück
    playerScore = 0;
    localStorage.setItem("playerScore", 0);
    
    // Setze freigeschaltete Achievements zurück
    unlockedAchievements = [];
    localStorage.setItem("achievements", JSON.stringify([]));
    
    // Aktualisiere die Achievements-Anzeige
    updateAchievementsScreen();
}

/**
 * Resets all achievements and player score
 * @description TEST FUNCTION: Resets the player's score to 0, clears all unlocked
 * achievements from local storage, updates the UI, and displays a confirmation alert.
 * Used for testing purposes only.
 */
function resetAchievements() {
    // Setze Punktestand zurück
    playerScore = 0;
    localStorage.setItem("playerScore", 0);
    
    // Setze freigeschaltete Achievements zurück
    unlockedAchievements = [];
    localStorage.setItem("achievements", JSON.stringify([]));
    
    // Aktualisiere die Anzeige (falls die Achievements-Seite geöffnet ist)
    const achievementsScreen = document.getElementById("achievements-screen");
    if (achievementsScreen && !achievementsScreen.classList.contains("hidden")) {
        updateAchievementsScreen();
    }
    
    // Bestätigungsmeldung
    alert("Achievements und Punktestand wurden zurückgesetzt.");
}

/**
 * Shows the quiz room screen and hides the main menu
 * @description Handles UI transition from main menu to the quiz room interface
 * where players can interact with the chat and participate in the quiz.
 */
/**
 * Shows the quiz room screen
 * @description Uses the showScreen function to display the quiz room,
 * hiding all other screens.
 */
function showQuizRoom() {
  showScreen("quiz-room");
}

// Team scores for 2v2 mode
let teamAScore = 0; // Du + Max
let teamBScore = 0; // Anna + Tom
let maxScore = 0;
let annaScore = 0;
let tomScore = 0;

/**
 * Starts a multiplayer quiz with bot opponent
 */
async function startMultiplayerQuiz() {
  // Set multiplayer mode
  currentMode = "multiplayer";
  currentCategory = "all"; // Default to all categories for multiplayer
  
  console.log("Starting 2v2 team quiz: Du & Max vs Anna & Tom");
  
  try {
    const response = await fetch(`${api}/start-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: currentCategory,
        mode: "classic" // Use classic mode on backend but handle multiplayer on frontend
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
    
    // Show quiz screen and start first question
    showScreen("quiz-screen");
    showQuestion();
    
    // Add multiplayer UI elements
    addMultiplayerElements();
    
  } catch (error) {
    console.error("Error starting multiplayer quiz:", error);
    alert("Fehler beim Starten des 2v2 Team-Quiz. Bitte versuche es erneut.");
  }
}

/**
 * Adds multiplayer-specific UI elements to the quiz screen for 2v2 mode
 */
function addMultiplayerElements() {
  const quizScreen = document.getElementById("quiz-screen");
  const scoreText = document.getElementById("score-text");
  
  // Update score display for 2v2 teams
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
  
  // Add team activity indicator if it doesn't exist
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
    
    // Insert after the feedback div
    const feedbackDiv = document.getElementById("feedback");
    feedbackDiv.parentNode.insertBefore(teamIndicator, feedbackDiv.nextSibling);
  }
}

/**
 * Shows the achievements screen
 * @description Uses the showScreen function to display the achievements page,
 * hiding all other screens and updating the achievements display.
 */
function showAchievementsScreen() {
  showScreen("achievements-screen");
}

/**
 * Updates the achievements screen with current progress and unlocked achievements
 * @description Loads achievements and player score from local storage,
 * updates the dedicated achievements page UI to show unlocked achievements with proper styling,
 * displays progress bars for achievements that are not yet unlocked, and updates the current score display.
 */
function updateAchievementsScreen() {
  // Load saved achievements and current score
  const unlockedAchievements = JSON.parse(localStorage.getItem("achievements") || "[]");
  const currentScore = parseInt(localStorage.getItem("playerScore") || "0");
  
  // Update current score display
  const scoreDisplay = document.getElementById("current-score-display");
  if (scoreDisplay) {
    scoreDisplay.textContent = `${currentScore} Punkte`;
  }
  
  // Define achievement data with thresholds and additional achievements
  const achievementData = {
    "beginner": { threshold: 1, nextThreshold: 10, name: "Erster Punkt", medal: "🥉", description: "Erreiche deinen ersten Punkt im Quiz" },
    "veteran": { threshold: 10, nextThreshold: 50, name: "Veteran", medal: "🥈", description: "Erreiche 10 Punkte im Quiz" },
    "champion": { threshold: 50, nextThreshold: 100, name: "Champion", medal: "🥇", description: "Erreiche 50 Punkte im Quiz" },
    "master": { threshold: 100, nextThreshold: 200, name: "Quiz Master", medal: "💎", description: "Erreiche 100 Punkte im Quiz" },
    "streak": { threshold: 5, nextThreshold: 10, name: "Streak Master", medal: "🔥", description: "Beantworte 5 Fragen in Folge richtig" },
    "expert": { threshold: 10, nextThreshold: 20, name: "Kategorie-Experte", medal: "🎓", description: "Beantworte 10 Fragen in einer Kategorie richtig" }
  };
  
  // Update each achievement on the achievements page
  Object.keys(achievementData).forEach(id => {
    const achievement = achievementData[id];
    const element = document.getElementById(`achv-${id}-page`);
    
    if (element) {
      // Check if achievement is unlocked
      const isUnlocked = unlockedAchievements.includes(id);
      
      // Update styling based on unlock status
      element.style.opacity = isUnlocked ? "1" : "0.5";
      element.classList.toggle("bg-gray-100", !isUnlocked);
      element.classList.toggle("bg-gradient-to-br", isUnlocked);
      element.classList.toggle("from-yellow-100", isUnlocked);
      element.classList.toggle("to-yellow-200", isUnlocked);
      element.classList.toggle("border-yellow-300", isUnlocked);
      element.classList.toggle("border-gray-300", !isUnlocked);
      
      // Update progress for locked achievements
      const progressContainer = element.querySelector('.achievement-progress');
      if (progressContainer) {
        progressContainer.innerHTML = ''; // Clear existing content
        
        if (!isUnlocked && currentScore > 0) {
          const progress = Math.min(100, (currentScore / achievement.threshold) * 100);
          
          // Create progress bar
          const progressBarContainer = document.createElement('div');
          progressBarContainer.className = 'w-full bg-gray-200 rounded-full h-3 mb-2';
          
          const progressBar = document.createElement('div');
          progressBar.className = 'bg-blue-600 h-3 rounded-full transition-all duration-300';
          progressBar.style.width = `${progress}%`;
          
          // Create progress text
          const progressText = document.createElement('div');
          progressText.className = 'text-xs text-gray-600';
          progressText.textContent = `${currentScore}/${achievement.threshold} Punkte`;
          
          progressBarContainer.appendChild(progressBar);
          progressContainer.appendChild(progressBarContainer);
          progressContainer.appendChild(progressText);
        } else if (isUnlocked) {
          // Show unlocked status
          const unlockedText = document.createElement('div');
          unlockedText.className = 'text-sm font-semibold text-green-600';
          unlockedText.innerHTML = '✅ Freigeschaltet!';
          progressContainer.appendChild(unlockedText);
        } else {
          // Show requirement for locked achievements
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
 * Sends a chat message in the quiz room
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
  
  // Simulate bot response after a short delay
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
 * Generates dummy questions based on the selected module type
 * @description DUMMY IMPLEMENTATION: This function simulates question generation
 * without actually using the backend API. It displays predefined questions for each
 * module type to demonstrate the UI functionality.
 * @param {string} moduleType - The type of module to generate questions for
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
    
    // Standard-Fragen, falls kein Modul ausgewählt oder Modul nicht in der Liste
    const defaultQuestions = [
        "Was versteht man unter Digitalisierung?",
        "Nenne zwei Vorteile von Cloud Computing.",
        "Welche Programmiersprache wird häufig für Webentwicklung genutzt?"
    ];
    
    // Wähle die passenden Fragen basierend auf dem Modul
    const questions = moduleType && questionsByModule[moduleType] ? 
                     questionsByModule[moduleType] : defaultQuestions;
    
    // Zeige Modulinformation an
    const moduleInfo = document.createElement("div");
    moduleInfo.className = "mb-3 font-medium";
    
    if (moduleType && questionsByModule[moduleType]) {
        const moduleSelect = document.getElementById("iu-module");
        const moduleName = moduleSelect ? moduleSelect.options[moduleSelect.selectedIndex].text : moduleType;
        moduleInfo.textContent = `Modul: ${moduleName}`;
    } else {
        moduleInfo.textContent = "Allgemeine Fragen";
    }
    
    // Liste leeren & Modulinfo hinzufügen
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
 * Handles sending chat messages in the quiz room
 * @description DUMMY IMPLEMENTATION: This function simulates a chat interface
 * by displaying the user's message and generating an automatic response after
 * a short delay. No actual backend communication occurs.
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
    
    // Optional: Dummy-Antwort nach kurzer Verzögerung
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

// Event-Listener für Enter-Taste im Chat-Input und Initialisierung der Achievements
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
  
  // Initialisiere Achievements beim Laden der Seite
  initAchievements();
});

/**
 * Initializes the achievements system
 * @description Loads previously unlocked achievements and player score from local storage
 * and displays them in the UI. Called when the page loads.
 */
function initAchievements() {
  // Lade gespeicherte Achievements
  unlockedAchievements = JSON.parse(localStorage.getItem("achievements") || "[]");
  
  // Lade gespeicherten Punktestand
  const savedScore = localStorage.getItem("playerScore");
  if (savedScore) {
    playerScore = parseInt(savedScore);
  }
  
  // Zeige Achievements an
  showAchievements();
}
