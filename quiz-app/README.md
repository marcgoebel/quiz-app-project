# QuizConnect - Interactive Quiz Application

Eine moderne Quiz-Anwendung mit PDF-Upload-Funktionalität, Backend-API und Frontend-Interface.

## 🚀 Features

- **Benutzerauthentifizierung**: Login/Registrierung System
- **Quiz-Modi**: Klassisch, Team-Modus, Experten, Lernmodus
- **Kategorien**: Mathe, Logik, Geschichte und mehr
- **PDF-Upload**: Automatische Fragengenerierung aus PDF-Dokumenten
- **Multiplayer**: Team-basierte Quiz-Räume
- **Highscores**: Punktestand-Tracking
- **Question Editor**: Fragen hinzufügen, bearbeiten und löschen

## 🛠️ Technologie-Stack

### Backend
- **FastAPI**: Moderne, schnelle Web-API
- **Python**: Hauptprogrammiersprache
- **JSON**: Datenspeicherung für Fragen und Benutzer
- **CORS**: Cross-Origin Resource Sharing für Frontend-Integration

### Frontend
- **HTML5**: Struktur der Webanwendung
- **TailwindCSS**: Utility-first CSS Framework
- **JavaScript**: Interaktive Funktionalität
- **Responsive Design**: Mobile-freundliche Benutzeroberfläche

## 📁 Projektstruktur

```
quiz-app/
├── backend/
│   ├── main.py              # FastAPI Hauptanwendung
│   ├── quiz_logic.py        # Quiz-Logik und Session-Management
│   ├── database.py          # Datenbank-Operationen
│   ├── models.py            # Pydantic Datenmodelle
│   ├── pdf_upload.py        # PDF-Upload und Verarbeitung
│   ├── questions.json       # Fragen-Datenbank
│   └── uploaded_pdfs/       # Hochgeladene PDF-Dateien
├── frontend/
│   ├── index.html           # Hauptseite
│   ├── quiz-screens.html    # Quiz-Bildschirme
│   ├── script.js            # JavaScript-Funktionalität
│   ├── style.css            # Zusätzliche Styles
│   └── static/              # Statische Dateien (Bilder, etc.)
├── requirements.txt         # Python-Abhängigkeiten
└── README.md               # Projektdokumentation
```

## 🚀 Installation und Setup

### Voraussetzungen
- Python 3.8+
- pip (Python Package Manager)

### 1. Repository klonen
```bash
git clone <repository-url>
cd quiz-app
```

### 2. Virtuelle Umgebung erstellen (empfohlen)
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Abhängigkeiten installieren
```bash
pip install -r requirements.txt
```

### 4. Backend starten
```bash
cd backend
python main.py
```

Der Server läuft standardmäßig auf `http://localhost:8001`

### 5. Frontend öffnen
Öffnen Sie `frontend/index.html` in Ihrem Webbrowser oder verwenden Sie einen lokalen Webserver:

```bash
# Mit Python
cd frontend
python -m http.server 8000
```

Dann öffnen Sie `http://localhost:8000` in Ihrem Browser.

## 📖 API-Dokumentation

Nach dem Start des Backends ist die automatische API-Dokumentation verfügbar unter:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

### Wichtige Endpunkte

- `POST /register` - Benutzerregistrierung
- `POST /login` - Benutzeranmeldung
- `POST /start-quiz` - Quiz starten
- `POST /submit-answer` - Antwort einreichen
- `GET /questions` - Alle Fragen abrufen
- `GET /categories` - Verfügbare Kategorien
- `POST /add-question` - Neue Frage hinzufügen
- `PUT /edit-question/{id}` - Frage bearbeiten
- `DELETE /delete-question/{id}` - Frage löschen

## 🎮 Verwendung

1. **Anmeldung**: Erstellen Sie ein Konto oder melden Sie sich an
2. **Quiz starten**: Wählen Sie Kategorie und Modus
3. **Fragen beantworten**: Klicken Sie auf die richtige Antwort
4. **Ergebnisse**: Sehen Sie Ihre Punktzahl und Highscores
5. **Fragen hinzufügen**: Verwenden Sie den Editor für eigene Fragen
6. **PDF-Upload**: Laden Sie PDFs hoch für automatische Fragengenerierung

## 🔧 Konfiguration

### Backend-Konfiguration
- Server-Port: Ändern Sie in `main.py` (Standard: 8001)
- CORS-Einstellungen: Anpassen in `main.py`
- Datenbank-Dateien: `questions.json`, `users.json`, `highscores.json`

### Frontend-Konfiguration
- API-URL: Ändern Sie in `script.js` (Standard: localhost:8001)
- Styling: Anpassen in `style.css` oder TailwindCSS-Klassen

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie eine Pull Request

## 📝 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe `LICENSE` Datei für Details.

## 🐛 Bekannte Probleme

- PDF-Upload-Funktionalität ist noch in Entwicklung
- Multiplayer-Features sind Prototyp-Status
- Datenbank ist dateibasiert (für Produktion sollte eine echte DB verwendet werden)

## 📞 Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository.

---

**QuizConnect** - Lernen & Spielen auf Ihrer Quizplattform! 🎯