# GitHub Repository Setup - Anleitung

Da die automatische Repository-Erstellung fehlgeschlagen ist, folgen Sie bitte diesen Schritten, um Ihr QuizConnect-Projekt auf GitHub hochzuladen:

## 🚀 Schritt-für-Schritt Anleitung

### 1. GitHub Repository manuell erstellen

1. Gehen Sie zu [GitHub.com](https://github.com) und melden Sie sich an
2. Klicken Sie auf das "+" Symbol oben rechts und wählen Sie "New repository"
3. Repository-Details:
   - **Repository name**: `quiz-app-project` oder `quizconnect`
   - **Description**: `Interactive Quiz Application with PDF upload and multiplayer features`
   - **Visibility**: Public (empfohlen) oder Private
   - ✅ **Add a README file** (ankreuzen)
   - ✅ **Add .gitignore** → Template: Python
   - **License**: MIT License (empfohlen)
4. Klicken Sie auf "Create repository"

### 2. Git in Ihrem Projekt initialisieren

Öffnen Sie ein Terminal/Command Prompt im Projektordner:

```bash
cd "c:\Users\mgoeb\Desktop\Software Engineering\quiz-app"
```

### 3. Git Repository initialisieren

```bash
# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: QuizConnect application with backend and frontend"

# Main Branch setzen
git branch -M main

# Remote Repository hinzufügen (ersetzen Sie USERNAME mit Ihrem GitHub-Benutzernamen)
git remote add origin https://github.com/USERNAME/quiz-app-project.git

# Code zu GitHub pushen
git push -u origin main
```

### 4. Alternative: GitHub Desktop verwenden

Falls Sie GitHub Desktop bevorzugen:

1. Laden Sie [GitHub Desktop](https://desktop.github.com/) herunter
2. Installieren und mit GitHub-Account anmelden
3. "Add an Existing Repository from your Hard Drive" wählen
4. Projektordner auswählen: `c:\Users\mgoeb\Desktop\Software Engineering\quiz-app`
5. "Publish repository" klicken
6. Repository-Name und Beschreibung eingeben
7. "Publish Repository" bestätigen

### 5. Dateien manuell hochladen (falls Git nicht funktioniert)

1. Gehen Sie zu Ihrem erstellten GitHub Repository
2. Klicken Sie auf "uploading an existing file"
3. Ziehen Sie alle Projektdateien in den Upload-Bereich:
   - `backend/` Ordner mit allen Python-Dateien
   - `frontend/` Ordner mit HTML, CSS, JS
   - `requirements.txt`
   - `README.md`
   - `.gitignore`
4. Commit-Nachricht eingeben: "Add QuizConnect application files"
5. "Commit changes" klicken

## 📁 Wichtige Dateien für Upload

### Backend-Dateien:
- `backend/main.py` - FastAPI Hauptanwendung
- `backend/quiz_logic.py` - Quiz-Logik
- `backend/database.py` - Datenbank-Operationen
- `backend/models.py` - Datenmodelle
- `backend/pdf_upload.py` - PDF-Upload-Funktionalität
- `backend/questions.json` - Fragen-Datenbank

### Frontend-Dateien:
- `frontend/index.html` - Hauptseite
- `frontend/quiz-screens.html` - Quiz-Bildschirme
- `frontend/script.js` - JavaScript-Funktionalität
- `frontend/style.css` - Zusätzliche Styles
- `frontend/static/` - Statische Dateien

### Konfigurationsdateien:
- `requirements.txt` - Python-Abhängigkeiten
- `README.md` - Projektdokumentation
- `.gitignore` - Git-Ignore-Regeln

## 🔧 Nach dem Upload

### Repository-URL teilen
Ihr Repository ist dann verfügbar unter:
```
https://github.com/IHR-BENUTZERNAME/quiz-app-project
```

### Clone-Anweisungen für andere
```bash
git clone https://github.com/IHR-BENUTZERNAME/quiz-app-project.git
cd quiz-app-project
pip install -r requirements.txt
```

### GitHub Pages aktivieren (optional)
Für das Frontend:
1. Gehen Sie zu Repository → Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: main, Folder: `/frontend`
4. Save

Ihr Frontend ist dann verfügbar unter:
```
https://IHR-BENUTZERNAME.github.io/quiz-app-project/
```

## 🎯 Nächste Schritte

1. **Repository erstellen** (Schritt 1-3)
2. **README anpassen** mit Ihrer Repository-URL
3. **Issues erstellen** für geplante Features
4. **Branches erstellen** für neue Features
5. **Collaborators hinzufügen** falls Teamarbeit

## 🆘 Hilfe bei Problemen

- **Git nicht installiert**: [Git herunterladen](https://git-scm.com/download/win)
- **Authentifizierung**: Personal Access Token in GitHub Settings erstellen
- **Große Dateien**: Git LFS für Dateien > 100MB verwenden
- **Merge-Konflikte**: GitHub Desktop oder VS Code für einfache Lösung

---

**Viel Erfolg beim Upload Ihres QuizConnect-Projekts! 🚀**