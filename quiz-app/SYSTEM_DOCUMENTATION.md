# Quiz-App Systemdokumentation

## Inhaltsverzeichnis
1. [Systemübersicht](#systemübersicht)
2. [Architektur](#architektur)
3. [Backend-Dokumentation](#backend-dokumentation)
4. [Frontend-Dokumentation](#frontend-dokumentation)
5. [Datenmodelle](#datenmodelle)
6. [API-Spezifikation](#api-spezifikation)
7. [Deployment](#deployment)
8. [Sicherheit](#sicherheit)
9. [Performance](#performance)
10. [Wartung & Monitoring](#wartung--monitoring)

## Systemübersicht

### Zweck
Die Quiz-App ist eine interaktive Webanwendung, die es Benutzern ermöglicht, Quizzes in verschiedenen Modi zu spielen, eigene Fragen zu erstellen und Achievements zu sammeln.

### Technologie-Stack
- **Backend**: FastAPI (Python 3.8+)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS (CDN)
- **Deployment**: Render.com
- **Versionskontrolle**: Git/GitHub

### Systemanforderungen
- Python 3.8 oder höher
- Moderne Webbrowser (Chrome, Firefox, Safari, Edge)
- Internetverbindung für Render-Deployment

## Architektur

### Gesamtarchitektur
```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│                 │ ◄──────────────► │                 │
│    Frontend     │                  │     Backend     │
│  (Static HTML)  │                  │   (FastAPI)     │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
         │                                     │
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│   Web Browser   │                  │  JSON Database  │
│   (Client)      │                  │ (questions.json)│
└─────────────────┘                  └─────────────────┘
```

### Komponentenübersicht
- **Frontend**: Statische HTML/JS-Anwendung
- **Backend**: RESTful API mit FastAPI
- **Datenspeicherung**: JSON-basierte Datenhaltung
- **Kommunikation**: HTTP/REST mit JSON-Payloads

## Backend-Dokumentation

### Dateistruktur
```
backend/
├── main.py          # FastAPI Hauptanwendung
├── database.py      # Datenbank-Logik und Benutzer
├── models.py        # Pydantic Datenmodelle
├── quiz_logic.py    # Quiz-Geschäftslogik
├── pdf_upload.py    # PDF-Verarbeitung
└── questions.json   # Fragen-Datenbank
```

### Hauptkomponenten

#### main.py
- **Zweck**: FastAPI-Anwendung und Routing
- **CORS**: Konfiguriert für Frontend-URLs
- **Port**: Dynamisch über PORT-Umgebungsvariable
- **Endpoints**: Alle API-Routen definiert

#### database.py
- **Zweck**: Datenverwaltung und Benutzerauthentifizierung
- **Benutzer**: Hardcodierte Testbenutzer
- **Fragen**: JSON-basierte Speicherung
- **Kategorien**: Dynamische Kategorieextraktion

#### models.py
- **Zweck**: Pydantic-Modelle für Datenvalidierung
- **Modelle**: LoginRequest, Question, QuizSession, etc.
- **Validierung**: Automatische Eingabevalidierung

#### quiz_logic.py
- **Zweck**: Quiz-Spiellogik
- **Session-Management**: Quiz-Sitzungen verwalten
- **Scoring**: Punkteberechnung und Bewertung
- **Modi**: Solo, Team, Experten-Modus

### Datenfluss
1. **Login**: Frontend → `/login` → Benutzervalidierung
2. **Quiz Start**: Frontend → `/start-quiz` → Session-Erstellung
3. **Frage Abruf**: Frontend → `/next-question` → Frage-Lieferung
4. **Antwort**: Frontend → `/submit-answer` → Bewertung
5. **Ergebnis**: Frontend → `/quiz-result` → Endergebnis

## Frontend-Dokumentation

### Dateistruktur
```
frontend/
├── index.html           # Hauptseite mit allen Screens
├── quiz-screens.html    # Zusätzliche Quiz-Screens
├── script.js           # Hauptlogik
├── style.css           # Custom Styling
└── static/             # Statische Assets
```

### Hauptkomponenten

#### Screen-Management
- **showScreen()**: Zentrale Funktion für Screen-Navigation
- **Screens**: Login, Hauptmenü, Quiz, Editor, Achievements
- **State**: Lokaler State für aktuelle Session

#### API-Integration
- **API_BASE**: Konfigurierbare Backend-URL
- **Fetch-Calls**: Asynchrone HTTP-Requests
- **Error-Handling**: Benutzerfreundliche Fehlermeldungen

#### UI-Komponenten
- **Responsive Design**: Mobile-first Ansatz
- **Tailwind CSS**: Utility-first Styling
- **Interaktivität**: Event-basierte Benutzerinteraktion

## Datenmodelle

### Benutzer
```python
class User:
    username: str
    password: str  # In Produktion: gehashed
    achievements: List[str]
    high_scores: Dict[str, int]
```

### Frage
```python
class Question:
    id: str
    question: str
    options: List[str]
    correct_answer: int
    category: str
    difficulty: str
    explanation: Optional[str]
```

### Quiz-Session
```python
class QuizSession:
    session_id: str
    user: str
    mode: str
    category: str
    questions: List[Question]
    current_question: int
    score: int
    start_time: datetime
```

## API-Spezifikation

### Authentication

#### POST /login
**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful"
}
```

### Quiz-Management

#### POST /start-quiz
**Request:**
```json
{
  "mode": "solo|team|expert",
  "category": "string|all",
  "difficulty": "easy|medium|hard"
}
```
**Response:**
```json
{
  "session_id": "string",
  "total_questions": 10
}
```

#### GET /next-question/{session_id}
**Response:**
```json
{
  "question": "string",
  "options": ["string"],
  "question_number": 1,
  "total_questions": 10
}
```

#### POST /submit-answer
**Request:**
```json
{
  "session_id": "string",
  "answer": 0
}
```
**Response:**
```json
{
  "correct": true,
  "explanation": "string",
  "current_score": 100
}
```

### Fragen-Management

#### GET /questions
**Response:**
```json
[
  {
    "id": "string",
    "question": "string",
    "options": ["string"],
    "correct_answer": 0,
    "category": "string",
    "difficulty": "easy"
  }
]
```

#### POST /questions
**Request:**
```json
{
  "question": "string",
  "options": ["string"],
  "correct_answer": 0,
  "category": "string",
  "difficulty": "easy",
  "explanation": "string"
}
```

#### GET /categories
**Response:**
```json
["math", "science", "history", "geography"]
```

## Deployment

### Lokale Entwicklung
1. **Backend starten:**
   ```bash
   cd backend
   python main.py
   ```

2. **Frontend starten:**
   ```bash
   cd frontend
   python -m http.server 8000
   ```

### Render.com Deployment

#### Backend-Konfiguration
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment**: Python 3.8+

#### Frontend-Konfiguration
- **Build Command**: Keine (statische Dateien)
- **Publish Directory**: `frontend`
- **Static Site**: Ja

#### render.yaml
```yaml
services:
  - type: web
    name: quiz-app-backend
    env: python
    buildCommand: cd backend && pip install -r ../requirements.txt
    startCommand: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.8.10
```

### Automatisches Deployment
- **Trigger**: Push auf `main` Branch
- **GitHub Integration**: Automatische Builds
- **Rollback**: Über Render Dashboard

## Sicherheit

### Authentifizierung
- **Methode**: Einfache Benutzername/Passwort-Validierung
- **Session**: Keine persistente Session (stateless)
- **Verbesserungen**: JWT-Token, Password-Hashing empfohlen

### CORS-Konfiguration
```python
allow_origins=[
    "https://quizconnect.onrender.com",
    "https://quiz-app-project-0k81.onrender.com",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]
```

### Datenschutz
- **Lokale Speicherung**: Nur Benutzername im localStorage
- **Keine sensiblen Daten**: Keine Passwörter im Frontend
- **HTTPS**: Automatisch über Render

## Performance

### Backend-Optimierung
- **FastAPI**: Asynchrone Request-Verarbeitung
- **JSON-Dateien**: Schnelle Lese-/Schreiboperationen
- **Memory-Cache**: Fragen werden im Speicher gehalten

### Frontend-Optimierung
- **Vanilla JS**: Keine Framework-Overhead
- **CDN**: Tailwind CSS über CDN
- **Lazy Loading**: Screens werden bei Bedarf geladen

### Skalierung
- **Horizontal**: Mehrere Backend-Instanzen möglich
- **Vertikal**: CPU/Memory-Upgrade über Render
- **Database**: Migration zu PostgreSQL empfohlen

## Wartung & Monitoring

### Logging
- **FastAPI**: Automatische Request-Logs
- **Uvicorn**: Server-Logs
- **Render**: Deployment-Logs verfügbar

### Monitoring
- **Health Check**: `/` Endpoint für Status
- **Render Metrics**: CPU, Memory, Response Time
- **Error Tracking**: Console-Logs im Browser

### Backup
- **Code**: Git-Repository als Backup
- **Daten**: `questions.json` regelmäßig sichern
- **Deployment**: Render-Snapshots

### Updates
1. **Code-Änderungen**: Git commit & push
2. **Dependencies**: `requirements.txt` aktualisieren
3. **Deployment**: Automatisch über GitHub
4. **Testing**: Lokale Tests vor Deployment

## Troubleshooting

### Häufige Probleme

#### CORS-Fehler
- **Ursache**: Frontend-URL nicht in `allow_origins`
- **Lösung**: URL in `main.py` hinzufügen

#### 502 Bad Gateway
- **Ursache**: Backend nicht erreichbar
- **Lösung**: PORT-Umgebungsvariable prüfen

#### Login-Fehler
- **Ursache**: Falsche Credentials oder Backend-Verbindung
- **Lösung**: Testuser-Daten prüfen, Backend-Status checken

#### Deployment-Fehler
- **Ursache**: Fehlende Dependencies oder falsche Befehle
- **Lösung**: `requirements.txt` und `render.yaml` prüfen

### Debug-Tipps
1. **Browser DevTools**: Console für Frontend-Fehler
2. **Render Logs**: Backend-Logs für Server-Fehler
3. **Network Tab**: API-Requests überwachen
4. **Local Testing**: Immer lokal testen vor Deployment

---

**Dokumentation erstellt am:** $(date)
**Version:** 1.0
**Autor:** Quiz-App Development Team