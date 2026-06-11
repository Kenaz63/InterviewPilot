import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

function App() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);
  const [finalReport, setFinalReport] = useState("");
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
  let interval;

  if (interviewStarted && !interviewFinished) {
    interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
  }

  return () => clearInterval(interval);
}, [interviewStarted, interviewFinished]);

  const generateQuestions = async () => {
    console.log("GENERATE REPORT CALLED");
    if (!file) {
      alert("Please select a PDF resume");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/generate-questions",
        formData
      );

      setQuestions(response.data.questions);
      setInterviewStarted(true);
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("RESPONSE:", error.response);
      console.log("REQUEST:", error.request);
      console.log("MESSAGE:", error.message);

      alert(error.message);
    }

    setLoading(false);
  };

  const evaluateAnswer = async () => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/evaluate-answer",
      {
        question: questions[currentQuestion],
        answer: answer,
      }
    );

    setFeedback(response.data.feedback);
    setAllAnswers([
    ...allAnswers,
    {
      question: questions[currentQuestion],
      answer: answer,
    },
  ]);
  setAllFeedback([
    ...allFeedback,
    response.data.feedback,
  ]);
  } catch (error) {
    console.error(error);
    alert("Evaluation failed");
  }
};
  const generateReport = async () => {
    setReportLoading(true);
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/generate-report",
      {
        feedbacks: allFeedback,
      }
    );

    setFinalReport(response.data.report);
    setReportLoading(false);
    setInterviewFinished(true);
    
  } catch (error) {
    console.error(error);
    setReportLoading(false);
    alert("Failed to generate report");
  }
};
const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("InterviewPilot Report", 20, 20);

  doc.setFontSize(12);

  const cleanReport = finalReport
  .replace(/🎯/g, "")
  .replace(/💪/g, "")
  .replace(/⚠️/g, "")
  .replace(/🗣️/g, "")
  .replace(/📚/g, "")
  .replace(/✅/g, "");

const lines = doc.splitTextToSize(cleanReport, 170);
  doc.text(lines, 20, 40);

  doc.save("InterviewPilot_Report.pdf");
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
            "radial-gradient(circle at top, #162456, #050816)",
        border: "1px solid rgba(56,189,248,0.2)",
        boxShadow: "0 0 40px rgba(56,189,248,0.15)",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
  {!interviewStarted && (
  <>
  <h1
  style={{
   fontSize: "64px",
    margin: "0",
    textAlign: "center",
    textShadow: "0 0 25px rgba(255,255,255,0.25)",
  }}
>
  ⚜ InterviewPilot


</h1>

<h2
  style={{
  color: "#94a3b8",
  textAlign: "center",
  marginTop: "20px",
  marginBottom: "20px",
  fontWeight: "300",
  fontSize: "28px",
}}
>
  Master Technical Interviews with AI
</h2>

<p
  style={{
    textAlign: "center",
    color: "#cbd5e1",
    maxWidth: "700px",
    margin: "0 auto 20px auto",
    fontSize: "18px",
    lineHeight: "1.8",
  }}
>
  Upload your resume, answer personalized interview questions,
  receive AI-powered evaluations, and get a detailed performance
  report to improve your interview skills.
</p>
<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "10px",
    flexWrap: "wrap",
  }}
>
  <div
    style={{
      background: "rgba(255,255,255,0.05)",
      boxShadow: "0 0 20px rgba(56,189,248,0.15)",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "20px",
      borderRadius: "15px",
      width: "220px",
      textAlign: "center",
    }}
  >
    <h3>📄 Resume Analysis</h3>
    <p>AI extracts skills and project details.</p>
  </div>

  <div
    style={{
      background: "rgba(255,255,255,0.05)",
      padding: "20px",
      borderRadius: "15px",
      width: "220px",
      textAlign: "center",
    }}
  >
    <h3>🎤 Mock Interview</h3>
    <p>Personalized technical questions.</p>
  </div>

  <div
    style={{
      background: "rgba(255,255,255,0.05)",
      padding: "20px",
      borderRadius: "15px",
      width: "220px",
      textAlign: "center",
    }}
  >
    <h3>📊 Final Report</h3>
    <p>Detailed feedback and improvement plan.</p>
  </div>
</div>

      <br />

      <div
  style={{
  maxWidth: "500px",
  margin: "20px auto",
  padding: "30px",
  background: "rgba(255,255,255,0.08)",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 0 30px rgba(56,189,248,0.15)",
  textAlign: "center",
}}
>
  <h3
    style={{
      marginBottom: "20px",
    }}
  >
    📄 Upload Resume
  </h3>

  <input
    type="file"
    accept=".pdf"
    onChange={(e) => setFile(e.target.files[0])}
  />

  <br />
  <br />

  {loading ? (
  <div
    style={{
      marginTop: "20px",
      color: "#38bdf8",
      fontWeight: "bold",
      fontSize: "20px",
    }}
  >
    🚀 Generating Interview Questions...
  </div>
) : (
  <button
    onClick={generateQuestions}
    disabled={loading}
    style={{
      padding: "12px 24px",
      borderRadius: "10px",
      border: "none",
      background: loading ? "#64748b" : "#38bdf8",
      color: "white",
      fontWeight: "bold",
      cursor: loading ? "not-allowed" : "pointer",
    }}
  >
    {loading ? "Generating..." : "Generate Questions"}
  </button>
)}
</div>

      <br />
      <br />

</>
)}

{interviewStarted && !interviewFinished && (
  <div
    style={{
      marginTop: "30px",
      background: "#1e293b",
      padding: "20px",
      borderRadius: "10px",
    }}
  >
    <h2>
      Question {currentQuestion + 1} / {questions.length}
    </h2>
    <p
  style={{
  display: "inline-block",
  background: "rgba(56,189,248,0.12)",
  border: "1px solid rgba(56,189,248,0.3)",
  padding: "8px 16px",
  borderRadius: "20px",
  color: "#38bdf8",
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "15px",
}}
>
  ⏱ Time Elapsed: {Math.floor(secondsElapsed / 60)}:
  {(secondsElapsed % 60).toString().padStart(2, "0")}
</p>
    <p
  style={{
    color: "#94a3b8",
    marginTop: "-10px",
    marginBottom: "15px",
  }}
>
  {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
</p>

    <div
      style={{
        width: "100%",
        height: "12px",
        background: "#334155",
        borderRadius: "10px",
        marginBottom: "20px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          height: "100%",
          background: "#38bdf8",
          transition: "0.4s",
        }}
      />
    </div>

    <p>
      {questions[currentQuestion]}
    </p>
    <textarea
      rows="8"
      cols="80"
      value={answer}
      onChange={(e) => setAnswer(e.target.value)}
      placeholder="Type your answer here..."
      style={{
        marginTop: "20px",
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
      }}
    />
  <button
  onClick={evaluateAnswer}
  style={{
    marginTop: "20px",
    marginRight: "10px",
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "#38bdf8",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Submit Answer
</button>

    <button
      onClick={() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setAnswer("");
          setFeedback("");
        } else {
          generateReport();
        }
      }}
      style={{
        padding: "12px 24px",
        borderRadius: "10px",
        border: "none",
        background: "#22c55e",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Next Question
    </button>

    {feedback && (
      
      <div
    style={{
      marginTop: "20px",
      background: "#111827",
      padding: "15px",
      borderRadius: "10px",
    }}
      >
    <div
  style={{
    textAlign: "left",
    lineHeight: "1.8",
  }}
>
  <div
    style={{
      display: "inline-block",
      background: "rgba(56,189,248,0.12)",
      border: "1px solid rgba(56,189,248,0.3)",
      padding: "10px 20px",
      borderRadius: "20px",
      color: "#38bdf8",
      fontWeight: "bold",
      marginBottom: "20px",
    }}
  >
    {feedback.split("\n")[0].replace(/\*/g, "")}
  </div>

  <ReactMarkdown>
  {feedback.split("\n").slice(2).join("\n")}
</ReactMarkdown>
</div>
      </div>
    )}
  </div>
)}
{reportLoading && (
  <div
    style={{
      textAlign: "center",
      marginTop: "50px",
      padding: "40px",
      background: "#111827",
      borderRadius: "15px",
      boxShadow: "0 0 25px rgba(56,189,248,0.25)",
    }}
  >
    <h1>🎉 Interview Completed!</h1>

    <h3
      style={{
        color: "#38bdf8",
      }}
    >
      Generating Final Report...
    </h3>
  </div>
)}
{finalReport && (
  <div
    style={{
      background: "#111827",
      padding: "30px",
      borderRadius: "15px",
      marginTop: "30px",
      boxShadow: "0 0 25px rgba(56,189,248,0.25)",
      maxWidth: "1000px",
      margin: "30px auto",
      textAlign: "left",
      lineHeight: "1.8",
    }}
  >

    <div
      style={{
        textAlign: "center",
        fontSize: "42px",
        fontWeight: "bold",
        marginBottom: "25px",
      }}
    >
      🎯 Final Interview Report
    </div>

    <button
  onClick={downloadPDF}
  style={{
    display: "block",
    margin: "0 auto 25px auto",
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "#22c55e",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  ⬇ Download PDF Report
</button>

    <ReactMarkdown>
      {finalReport.replace("# Final Interview Report", "")}
    </ReactMarkdown>
  </div>
)}

    </div>
  );
}

export default App;