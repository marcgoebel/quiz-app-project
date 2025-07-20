# 🐍 PythonAnywhere Deployment Guide

## 📋 Schritt-für-Schritt Anleitung

### 1. Account erstellen
1. Gehe zu **www.pythonanywhere.com**
2. Klicke auf **"Create a Beginner account"**
3. Registriere dich (kostenlos, keine Kreditkarte nötig)
4. Bestätige deine E-Mail

### 2. Code hochladen

**Option A: Git (Empfohlen)**
1. Öffne eine **Bash Console** in PythonAnywhere
2. Führe aus:
```bash
git clone https://github.com/marcgoebel/quiz-app-project.git quiz-app
cd quiz-app/backend
```

**Option B: Files hochladen**
1. Gehe zu **"Files"** Tab
2. Erstelle Ordner `quiz-app`
3. Lade alle Dateien aus dem `backend/` Ordner hoch

### 3. Dependencies installieren
1. Öffne eine **Bash Console**
2. Führe aus:
```bash
cd quiz-app/backend
pip3.11 install --user -r requirements.txt
```

### 4. Web App konfigurieren
1. Gehe zum **"Web"** Tab
2. Klicke **"Add a new web app"**
3. Wähle **"Manual configuration"**
4. Wähle **"Python 3.11"**
5. Klicke **"Next"**

### 5. WSGI File konfigurieren
1. Im Web Tab, klicke auf **"WSGI configuration file"** Link
2. **Lösche** den gesamten Inhalt
3. **Kopiere** den Inhalt aus `wsgi.py` (aus diesem Projekt)
4. **Ändere** `yourusername` zu deinem echten PythonAnywhere Username
5. **Speichere** die Datei (Ctrl+S)

### 6. Static Files (Optional)
1. Im Web Tab, unter **"Static files"**
2. URL: `/static/`
3. Directory: `/home/yourusername/quiz-app/frontend/static/`

### 7. App starten
1. Klicke **"Reload"** Button im Web Tab
2. Deine App ist verfügbar unter: `yourusername.pythonanywhere.com`

## 🔧 Troubleshooting

### Fehler: "No module named 'main'"
- Überprüfe den Pfad in `wsgi.py`
- Stelle sicher, dass `main.py` im backend Ordner ist

### Fehler: "Application not found"
- Überprüfe, dass `from main import app` funktioniert
- Teste in der Bash Console: `cd backend && python3.11 -c "from main import app; print('OK')"`

### Dependencies fehlen
```bash
cd quiz-app/backend
pip3.11 install --user fastapi uvicorn python-multipart pydantic
```

## 🌐 Frontend Update

Nach erfolgreichem Deployment:
1. Öffne `frontend/script.js`
2. Ändere die API_BASE_URL:
```javascript
const API_BASE_URL = 'https://yourusername.pythonanywhere.com';
```
3. Committe und pushe zu GitHub Pages

## ✅ Fertig!

Deine Quiz-App läuft jetzt auf:
- **Backend**: `yourusername.pythonanywhere.com`
- **Frontend**: `marcgoebel.github.io/quiz-app-project`

**Viel Erfolg! 🎉**