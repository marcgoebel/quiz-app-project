import json
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

def load_json(filename):
    path = os.path.join(BASE_PATH, filename)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(filename, data):
    path = os.path.join(BASE_PATH, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
# Initialize users with testuser
users = {
    "testuser": "12345"
}

# Load questions from JSON file, with fallback to default questions
questions = load_json("questions.json")
if not questions:
    questions = [
        {
            "id": "q1",
            "question": "Was ist 2 + 2?",
            "options": ["3", "4", "5"],
            "correct": 1,
            "category": "math"
        },
        {
            "id": "q2",
            "question": "Was ist die Hauptstadt von Frankreich?",
            "options": ["Berlin", "Madrid", "Paris"],
            "correct": 2,
            "category": "history"
        },
        {
            "id": "q3",
            "question": "Welche Sprache sprechen die meisten Menschen?",
            "options": ["Deutsch", "Englisch", "Mandarin"],
            "correct": 2,
            "category": "logic"
        }
    ]
    # Save default questions to file
    save_json("questions.json", questions)

