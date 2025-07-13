from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from quiz_logic import start_quiz, check_answer
from database import questions, users, save_json, load_json
from pdf_upload import router as pdf_router

app = FastAPI()

# CORS für Frontend-Verbindung
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://quiz-app-project-0k81.onrender.com",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Modelle
class User(BaseModel):
    username: str
    password: str

class Answer(BaseModel):
    session_id: str
    question_id: str
    selected: int

class QuizRequest(BaseModel):
    category: Optional[str] = None
    mode: Optional[str] = "classic"

class NewQuestion(BaseModel):
    question: str
    options: List[str]
    correct: int
    category: str

class Score(BaseModel):
    category: str
    mode: str
    player_score: int
    bot_score: int

# 🧑‍💻 Benutzer-Endpunkte
@app.post("/register")
def register(user: User):
    if user.username in users:
        raise HTTPException(status_code=400, detail="User exists")
    users[user.username] = user.password
    return {"msg": "registered"}

@app.post("/login")
def login(user: User):
    if users.get(user.username) != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"msg": "login successful"}

# 🎯 Quiz-Endpunkte
@app.post("/start-quiz")
def start(q: QuizRequest):
    return start_quiz(q.category)

@app.post("/submit-answer")
def submit(answer: Answer):
    return check_answer(answer.session_id, answer.question_id, answer.selected)

@app.get("/questions")
def get_all_questions():
    return questions

@app.get("/questions/{category}")
def get_questions_by_category(category: str):
    if category == "all":
        return questions
    
    filtered_questions = [q for q in questions if q.get("category") == category]
    if not filtered_questions:
        raise HTTPException(status_code=404, detail=f"No questions found for category '{category}'")
    
    return filtered_questions

@app.get("/categories")
def get_categories():
    """Get all available categories"""
    categories = set()
    for q in questions:
        if q.get("category"):
            categories.add(q.get("category"))
    return sorted(list(categories))

@app.post("/add-question")
def add_question(q: NewQuestion):
    # Validation checks
    if q.correct >= len(q.options) or q.correct < 0:
        raise HTTPException(status_code=400, detail="Invalid correct option index")
    
    if len(q.options) < 3:
        raise HTTPException(status_code=400, detail="Minimum 3 options required")
    
    if not q.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    if not q.category.strip():
        raise HTTPException(status_code=400, detail="Category cannot be empty")
    
    # Check for duplicate questions in the same category
    for existing_q in questions:
        if (existing_q.get("question", "").strip().lower() == q.question.strip().lower() and 
            existing_q.get("category", "") == q.category):
            raise HTTPException(status_code=400, detail=f"Question already exists in category '{q.category}'")
    
    # Generate unique ID
    import uuid
    new_q = {
        "id": f"q_{str(uuid.uuid4())[:8]}",
        "question": q.question.strip(),
        "options": [opt.strip() for opt in q.options],
        "correct": q.correct,
        "category": q.category
    }
    
    questions.append(new_q)
    save_json("questions.json", questions)
    return {"msg": "Frage erfolgreich hinzugefügt", "question": new_q}

@app.put("/edit-question/{question_id}")
def edit_question(question_id: str, q: NewQuestion):
    # Find the question to edit
    question_index = None
    for i, existing_q in enumerate(questions):
        if existing_q.get("id") == question_id:
            question_index = i
            break
    
    if question_index is None:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Validation checks
    if q.correct >= len(q.options) or q.correct < 0:
        raise HTTPException(status_code=400, detail="Invalid correct option index")
    
    if len(q.options) < 3:
        raise HTTPException(status_code=400, detail="Minimum 3 options required")
    
    if not q.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    if not q.category.strip():
        raise HTTPException(status_code=400, detail="Category cannot be empty")
    
    # Check for duplicate questions in the same category (excluding current question)
    for i, existing_q in enumerate(questions):
        if (i != question_index and 
            existing_q.get("question", "").strip().lower() == q.question.strip().lower() and 
            existing_q.get("category", "") == q.category):
            raise HTTPException(status_code=400, detail=f"Question already exists in category '{q.category}'")
    
    # Update the question
    questions[question_index].update({
        "question": q.question.strip(),
        "options": [opt.strip() for opt in q.options],
        "correct": q.correct,
        "category": q.category
    })
    
    save_json("questions.json", questions)
    return {"msg": "Frage erfolgreich bearbeitet", "question": questions[question_index]}

@app.delete("/delete-question/{question_id}")
def delete_question(question_id: str):
    # Find and remove the question
    question_index = None
    for i, existing_q in enumerate(questions):
        if existing_q.get("id") == question_id:
            question_index = i
            break
    
    if question_index is None:
        raise HTTPException(status_code=404, detail="Question not found")
    
    deleted_question = questions.pop(question_index)
    save_json("questions.json", questions)
    return {"msg": "Frage erfolgreich gelöscht", "deleted_question": deleted_question}

# 🏆 Highscores
@app.post("/save-score")
def save_score(s: Score):
    highscores = load_json("highscores.json")
    highscores.append(s.dict())
    save_json("highscores.json", highscores)
    return {"msg": "Gespeichert"}

# 📄 PDF-Upload integrieren
app.include_router(pdf_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
