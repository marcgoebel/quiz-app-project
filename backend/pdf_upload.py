import os
import uuid
import json
import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import load_json
from database import questions

router = APIRouter()

UPLOAD_FOLDER = "uploaded_pdfs"
QUESTIONS_FILE = "questions.json"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def extract_text_from_pdf(path, max_pages=1):
    # Simplified version that doesn't actually parse the PDF
    # Just return some dummy text for demonstration purposes
    return "This is dummy text from a PDF file. It will be used to generate sample questions."
    # In a real implementation, we would use a PDF parsing library like PyMuPDF (fitz)

def generate_questions_from_text(text: str) -> list:
    lines = text.split("\n")
    questions = []

    for i, line in enumerate(lines):
        clean_line = line.strip()
        if len(clean_line.split()) >= 3:  # mind. 3 Wörter
            questions.append({
                "id": f"auto_{i}",
                "question": f"Was bedeutet: '{clean_line}'?",
                "options": [
                    "Eine Beschreibung der Bedeutung.",
                    "Eine Definition.",
                    "Ein Beispiel.",
                    "Eine Erklärung."
                ],
                "answer": "Eine Beschreibung der Bedeutung.",
                "category": "Automatisch",
                "difficulty": "Mittel"
            })

    return questions

def save_questions(questions):
    path = QUESTIONS_FILE
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            existing = json.load(f)
    else:
        existing = []
    existing.extend(questions)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)

class PDFUpload(BaseModel):
    filename: str
    content: str  # Base64 encoded PDF content

@router.post("/upload-pdf")
def upload_pdf(upload: PDFUpload):
    global questions  # Muss ganz nach oben!

    if not upload.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Bitte nur PDF-Dateien hochladen.")

    try:
        # Decode base64 content
        pdf_content = base64.b64decode(upload.content)
    except Exception:
        raise HTTPException(status_code=400, detail="Ungültiger PDF-Inhalt.")

    pdf_id = uuid.uuid4().hex
    save_path = os.path.join(UPLOAD_FOLDER, f"{pdf_id}.pdf")
    with open(save_path, "wb") as f:
        f.write(pdf_content)

    text = extract_text_from_pdf(save_path)
    new_questions = generate_questions_from_text(text)
    save_questions(new_questions)

    questions.clear()
    questions.extend(load_json("questions.json"))

    return {"msg": f"{len(new_questions)} Fragen generiert und gespeichert.", "questions": questions}
