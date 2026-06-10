from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
import tempfile

import os
from dotenv import load_dotenv
from groq import Groq

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

class AnswerEvaluation(BaseModel):
    question: str
    answer: str
class InterviewReport(BaseModel):
    feedbacks: list[str]

@app.get("/")
def home():
    return {"message": "InterviewPilot Backend Running"}


@app.post("/generate-questions")
async def generate_questions(file: UploadFile = File(...)):

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:

        temp_pdf.write(await file.read())

        reader = PdfReader(temp_pdf.name)

        resume_text = ""

        for page in reader.pages:
            text = page.extract_text()

            if text:
                resume_text += text + "\n"

    prompt = f"""
    You are a senior technical interviewer conducting a real software engineering interview.

    Analyze the resume provided below and generate interview questions.

    STRICT RULES:

    1. Generate questions ONLY from:
    - Skills explicitly mentioned in the resume
    - Technologies explicitly mentioned in the resume
    - Projects explicitly mentioned in the resume
    - Certifications explicitly mentioned in the resume

    2. DO NOT generate questions from technologies, frameworks, tools, programming languages, databases, APIs, cloud services, or concepts that are NOT present in the resume.

    3. DO NOT assume implementation details.
     Example:
    - If the resume says "AI-assisted health tips", do NOT assume OpenAI, Gemini, Llama, RAG, LangChain, Vector DB, etc.
    - If the resume says "Web Application", do NOT assume React, Angular, Node.js, MongoDB, etc.
    - If information is missing, ask exploratory questions instead.

    4. DO NOT generate generic textbook questions.
    Focus on practical interview questions that assess real understanding.

    5. Prioritize project-based questions over theoretical questions.

    6. Questions must sound like they are being asked by a real interviewer.

    7. Include follow-up style questions that force explanation of design decisions, challenges, trade-offs, and implementation choices.

    8. Do NOT repeat similar questions.

    9. Return questions in clean markdown format.

    OUTPUT FORMAT:

    # Technical Questions
    Generate 5 questions based ONLY on skills and technologies found in the resume.

    # Project-Based Questions
    Generate 5 questions based ONLY on projects found in the resume.

    # HR / Behavioral Questions
    Generate 5 questions based on the candidate's experiences, teamwork, learning journey, projects, and career aspirations.

    # Follow-Up Deep Dive Questions
    Generate 5 advanced interviewer-style questions that dig deeper into the candidate's projects and technical decisions.

    Return ONLY a numbered list of interview questions.
    One question per line.
    Do not include introductions, headings, explanations, markdown, or categories.

    Return ONLY the question text.

    Do NOT prefix questions with:
    1.
    2.
    3.
    or any numbering.

    Each question must be on a new line.
    
    Resume:

    {resume_text}
    """

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama-3.3-70b-versatile"
    )

    questions_text = chat_completion.choices[0].message.content

    questions = [
        q.strip()
        for q in questions_text.split("\n")
        if q.strip()
    ]

    return {
        "questions": questions
    }

@app.get("/test-ai")
def test_ai():

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Give me 3 software engineering interview questions."
            }
        ],
        model="llama-3.3-70b-versatile"
    )

    return {
        "response": chat_completion.choices[0].message.content
    }

@app.post("/evaluate-answer")
def evaluate_answer(data: AnswerEvaluation):

    print("EVALUATE ENDPOINT HIT")

    try:
        prompt = f"""
You are a strict technical interviewer.

Question:
{data.question}

Candidate Answer:
{data.answer}

Evaluate ONLY the candidate's answer.

Do NOT create sample answers.
Do NOT invent experience.

Return:

Score: X/10

Strengths:
- ...

Weaknesses:
- ...

Improvement Suggestions:
- ...
"""

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile"
        )

        return {
            "feedback": chat_completion.choices[0].message.content
        }

    except Exception as e:
        print("ERROR:", repr(e))
        raise e
        
@app.post("/generate-report")
def generate_report(data: InterviewReport):

    prompt = f"""
You are a senior technical interviewer.

Based on these interview evaluations:

{chr(10).join(data.feedbacks)}

Generate a final interview report.

Include:

1. Overall Score (out of 10)
2. Technical Strengths
3. Technical Weaknesses
4. Communication Assessment
5. Recommended Topics to Study
6. Hiring Recommendation

Keep it professional.
"""

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama-3.3-70b-versatile"
    )

    return {
        "report": chat_completion.choices[0].message.content
    }