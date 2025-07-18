@echo off
echo ========================================
echo QuizConnect GitHub Setup Script
echo ========================================
echo.

:: Wechsel in das quiz-app Verzeichnis
cd /d "c:\Users\mgoeb\Desktop\Software Engineering\quiz-app"

echo Aktuelles Verzeichnis: %cd%
echo.

:: Prüfen ob Git installiert ist
git --version >nul 2>&1
if errorlevel 1 (
    echo FEHLER: Git ist nicht installiert!
    echo Bitte laden Sie Git von https://git-scm.com/download/win herunter
    pause
    exit /b 1
)

echo Git ist installiert ✓
echo.

:: Benutzer nach GitHub-Benutzername fragen
set /p GITHUB_USER=Geben Sie Ihren GitHub-Benutzernamen ein: 
if "%GITHUB_USER%"=="" (
    echo FEHLER: Benutzername darf nicht leer sein!
    pause
    exit /b 1
)

:: Benutzer nach Repository-Namen fragen
set /p REPO_NAME=Geben Sie den Repository-Namen ein (Standard: quiz-app-project): 
if "%REPO_NAME%"=="" set REPO_NAME=quiz-app-project

echo.
echo Konfiguration:
echo - GitHub Benutzer: %GITHUB_USER%
echo - Repository Name: %REPO_NAME%
echo - Repository URL: https://github.com/%GITHUB_USER%/%REPO_NAME%.git
echo.

set /p CONFIRM=Ist das korrekt? (j/n): 
if /i not "%CONFIRM%"=="j" (
    echo Setup abgebrochen.
    pause
    exit /b 0
)

echo.
echo ========================================
echo Git Repository wird initialisiert...
echo ========================================

:: Git Repository initialisieren
echo Schritt 1: Git Repository initialisieren...
git init
if errorlevel 1 (
    echo FEHLER beim Initialisieren des Git Repository!
    pause
    exit /b 1
)

:: Git Konfiguration (falls noch nicht gesetzt)
echo Schritt 2: Git Konfiguration prüfen...
git config user.name >nul 2>&1
if errorlevel 1 (
    set /p GIT_NAME=Git Benutzername eingeben: 
    git config user.name "%GIT_NAME%"
)

git config user.email >nul 2>&1
if errorlevel 1 (
    set /p GIT_EMAIL=Git E-Mail eingeben: 
    git config user.email "%GIT_EMAIL%"
)

:: Alle Dateien hinzufügen
echo Schritt 3: Dateien zum Repository hinzufügen...
git add .
if errorlevel 1 (
    echo FEHLER beim Hinzufügen der Dateien!
    pause
    exit /b 1
)

:: Ersten Commit erstellen
echo Schritt 4: Ersten Commit erstellen...
git commit -m "Initial commit: QuizConnect application with backend and frontend"
if errorlevel 1 (
    echo FEHLER beim Erstellen des Commits!
    pause
    exit /b 1
)

:: Main Branch setzen
echo Schritt 5: Main Branch setzen...
git branch -M main
if errorlevel 1 (
    echo FEHLER beim Setzen des Main Branch!
    pause
    exit /b 1
)

:: Remote Repository hinzufügen
echo Schritt 6: Remote Repository hinzufügen...
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
if errorlevel 1 (
    echo FEHLER beim Hinzufügen des Remote Repository!
    echo Möglicherweise existiert bereits ein Remote Repository.
    git remote set-url origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
)

echo.
echo ========================================
echo WICHTIG: Repository auf GitHub erstellen
echo ========================================
echo.
echo Bevor Sie fortfahren, müssen Sie das Repository auf GitHub erstellen:
echo.
echo 1. Gehen Sie zu: https://github.com/new
echo 2. Repository Name: %REPO_NAME%
echo 3. Description: Interactive Quiz Application with PDF upload and multiplayer features
echo 4. Public oder Private wählen
echo 5. NICHT "Add a README file" ankreuzen (wir haben bereits eine)
echo 6. "Create repository" klicken
echo.
set /p REPO_CREATED=Haben Sie das Repository auf GitHub erstellt? (j/n): 
if /i not "%REPO_CREATED%"=="j" (
    echo Bitte erstellen Sie zuerst das Repository auf GitHub.
    echo Führen Sie dann dieses Script erneut aus.
    pause
    exit /b 0
)

:: Code zu GitHub pushen
echo.
echo Schritt 7: Code zu GitHub pushen...
echo HINWEIS: Sie werden möglicherweise nach Ihren GitHub-Anmeldedaten gefragt.
git push -u origin main
if errorlevel 1 (
    echo.
    echo FEHLER beim Pushen zu GitHub!
    echo.
    echo Mögliche Lösungen:
    echo 1. Prüfen Sie Ihre GitHub-Anmeldedaten
    echo 2. Erstellen Sie einen Personal Access Token in GitHub Settings
    echo 3. Verwenden Sie: git push -u origin main --force (nur wenn sicher)
    echo.
    echo Repository URL: https://github.com/%GITHUB_USER%/%REPO_NAME%
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ ERFOLGREICH! ✅
echo ========================================
echo.
echo Ihr QuizConnect-Projekt wurde erfolgreich zu GitHub hochgeladen!
echo.
echo Repository URL: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo Clone URL: https://github.com/%GITHUB_USER%/%REPO_NAME%.git
echo.
echo Nächste Schritte:
echo 1. Besuchen Sie Ihr Repository: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo 2. Überprüfen Sie, ob alle Dateien korrekt hochgeladen wurden
echo 3. Passen Sie die README.md an (Repository-URL einfügen)
echo 4. Aktivieren Sie GitHub Pages für das Frontend (optional)
echo.
echo Viel Spaß mit Ihrem QuizConnect-Projekt! 🎯
echo.
pause