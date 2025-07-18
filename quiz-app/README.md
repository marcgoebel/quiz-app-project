# Quiz-App 🎯

Eine interaktive Quiz-Anwendung mit FastAPI Backend und HTML/JavaScript Frontend.

## Features
- 🔐 Benutzer-Login
- 🎮 Verschiedene Quiz-Modi (Solo, Team, Experte)
- 📝 Fragen-Editor
- 🏆 Achievement-System
- 📊 Highscore-Tracking
- 📄 PDF-Upload für Fragen

## Lokale Entwicklung

### Voraussetzungen
- Python 3.8+
- Git

### Installation & Start

1. **Repository klonen:**
   ```bash
   git clone https://github.com/marcgoebel/quiz-app-project.git
   cd quiz-app-project
   ```

2. **Backend starten:**
   ```bash
   cd backend
   python main.py
   ```
   Das Backend läuft auf: `http://localhost:8001`

3. **Frontend starten (neues Terminal):**
   ```bash
   cd frontend
   python -m http.server 8000
   ```
   Das Frontend läuft auf: `http://localhost:8000`

### Login-Daten
- **Benutzername:** `testuser`
- **Passwort:** `12345`

## Deployment auf Render

Die App ist automatisch für Render konfiguriert:

- **Backend:** https://quiz-app-project-0k81.onrender.com
- **Frontend:** https://quizconnect.onrender.com

### Automatisches Deployment
Änderungen werden automatisch deployed, wenn sie auf den `main` Branch gepusht werden.

## Projektstruktur
```
quiz-app/
├── backend/
│   ├── main.py          # FastAPI Server
│   ├── database.py      # Datenbank & Benutzer
│   ├── models.py        # Datenmodelle
│   ├── quiz_logic.py    # Quiz-Logik
│   └── questions.json   # Fragen-Datenbank
├── frontend/
│   ├── index.html       # Hauptseite
│   ├── script.js        # JavaScript-Logik
│   └── style.css        # Styling
├── requirements.txt     # Python Dependencies
└── render.yaml         # Render Konfiguration
```

## Entwicklung

### Neue Fragen hinzufügen
1. Über den integrierten Editor im Frontend
2. Oder direkt in `backend/questions.json`

### API-Endpunkte
- `POST /login` - Benutzer-Anmeldung
- `GET /categories` - Verfügbare Kategorien
- `POST /start-quiz` - Quiz starten
- `POST /submit-answer` - Antwort einreichen
- `GET /questions` - Alle Fragen abrufen
- `POST /questions` - Neue Frage hinzufügen

## Technologien
- **Backend:** FastAPI, Python
- **Frontend:** HTML5, JavaScript (Vanilla), CSS3
- **Deployment:** Render
- **Styling:** Tailwind CSS (CDN)

---

**Viel Spaß beim Quizzen! 🎉**