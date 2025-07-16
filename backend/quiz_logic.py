import uuid
import random
from database import questions

sessions = {}

def start_quiz(category: str = None, mode: str = "classic"):
    if mode != "classic":
        return {"error": f"Spielmodus '{mode}' ist noch in Entwicklung!"}

    # Filter questions by category
    if category and category != "all":
        filtered = [q for q in questions if q.get("category") == category]
        if not filtered:
            return {"error": f"⚠️ Keine Fragen in Kategorie '{category}' gefunden. Bitte Fragen hinzufügen oder andere Kategorie wählen."}
    else:
        filtered = questions
        if not filtered:
            return {"error": "⚠️ Keine Fragen verfügbar. Bitte fügen Sie zuerst Fragen hinzu."}

    # Shuffle questions and select up to 5
    import random
    shuffled = filtered.copy()
    random.shuffle(shuffled)
    selected = shuffled[:min(5, len(shuffled))]
    
    # Generate new session
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "questions": selected,
        "current": 0,
        "player_score": 0,
        "bot_score": 0,
        "category": category
    }

    return {
        "session_id": session_id,
        "questions": selected,
        "category": category,
        "total_questions": len(selected)
    }


def check_answer(session_id, question_id, selected):
    session = sessions.get(session_id)
    if not session:
        return {"error": "invalid session"}
    
    q = session["questions"][session["current"]]
    correct_index = q["correct"]

    player_correct = (correct_index == selected)

    bot_selected = random.randint(0, len(q["options"]) - 1)
    bot_correct = (correct_index == bot_selected)

    if player_correct:
        session["player_score"] += 1
    if bot_correct:
        session["bot_score"] += 1

    session["current"] += 1
    done = session["current"] >= len(session["questions"])

    return {
        "player_correct": player_correct,
        "bot_selected": bot_selected,
        "bot_correct": bot_correct,
        "player_score": session["player_score"],
        "bot_score": session["bot_score"],
        "done": done
    }
