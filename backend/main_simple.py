from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os

app = FastAPI(title="Quiz App", description="Simple Quiz Application")

# CORS für Frontend-Verbindung
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Einfache In-Memory Datenbank
questions_db = [
    {
        "id": "1",
        "question": "Was ist die Hauptstadt von Deutschland?",
        "options": ["Berlin", "München", "Hamburg", "Köln"],
        "correct": 0,
        "category": "Geographie"
    },
    {
        "id": "2",
        "question": "Welche Programmiersprache wird für dieses Projekt verwendet?",
        "options": ["Java", "Python", "JavaScript", "C++"],
        "correct": 1,
        "category": "Programmierung"
    },
    {
        "id": "3",
        "question": "Was ist 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correct": 1,
        "category": "Mathematik"
    }
]

# Modelle
class Answer(BaseModel):
    question_id: str
    selected: int

class NewQuestion(BaseModel):
    question: str
    options: List[str]
    correct: int
    category: str

# Root Endpoint
@app.get("/")
def read_root():
    return {"message": "Quiz App API läuft erfolgreich!", "status": "OK"}

# Health Check
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "quiz-app"}

# Alle Fragen abrufen
@app.get("/questions")
def get_all_questions():
    return {"questions": questions_db}

# Fragen nach Kategorie
@app.get("/questions/{category}")
def get_questions_by_category(category: str):
    filtered = [q for q in questions_db if q["category"].lower() == category.lower()]
    return {"questions": filtered, "category": category}

# Kategorien abrufen
@app.get("/categories")
def get_categories():
    categories = list(set(q["category"] for q in questions_db))
    return {"categories": categories}

# Antwort überprüfen
@app.post("/check-answer")
def check_answer(answer: Answer):
    question = next((q for q in questions_db if q["id"] == answer.question_id), None)
    if not question:
        return {"error": "Frage nicht gefunden"}
    
    is_correct = question["correct"] == answer.selected
    return {
        "correct": is_correct,
        "correct_answer": question["correct"],
        "explanation": f"Die richtige Antwort ist: {question['options'][question['correct']]}"
    }

# Neue Frage hinzufügen
@app.post("/add-question")
def add_question(q: NewQuestion):
    new_id = str(len(questions_db) + 1)
    new_question = {
        "id": new_id,
        "question": q.question,
        "options": q.options,
        "correct": q.correct,
        "category": q.category
    }
    questions_db.append(new_question)
    return {"message": "Frage erfolgreich hinzugefügt", "question": new_question}

# API Dokumentation
@app.get("/docs-info")
def docs_info():
    return {
        "message": "API Dokumentation verfügbar unter /docs",
        "endpoints": [
            "GET /",
            "GET /health", 
            "GET /questions",
            "GET /questions/{category}",
            "GET /categories",
            "POST /check-answer",
            "POST /add-question"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)