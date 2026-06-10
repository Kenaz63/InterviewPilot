import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

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
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/generate-report",
      {
        feedbacks: allFeedback,
      }
    );

    setFinalReport(response.data.report);
    setInterviewFinished(true);
    
  } catch (error) {
    console.error(error);
    alert("Failed to generate report");
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>InterviewPilot 🚀</h1>
      <h3>AI Mock Interview Platform</h3>

      <br />

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button 
        onClick={generateQuestions}>
        Generate Questions
      </button>

      <br />
      <br />

      {loading && <h3>Generating Questions...</h3>}

    {questions.length > 0 && (
    <div
      style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <ol>
        {questions.map((q, index) => (
          <li key={index} style={{ marginBottom: "12px" }}>
            {q}
          </li>
        ))}
      </ol>
  </div>
)}
{questions.length > 0 && (
  <button
    onClick={() => setInterviewStarted(true)}
  >
    Start Interview
  </button>
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
      Question {currentQuestion + 1}
    </h2>

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
    padding: "10px 20px",
    borderRadius: "8px",
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
      whiteSpace: "pre-wrap",
    }}
      >
        <ReactMarkdown>{feedback}</ReactMarkdown>
      </div>
    )}
  </div>
)}

{finalReport && (
  <div
    style={{
      background: "#1e293b",
      padding: "20px",
      borderRadius: "10px",
      marginTop: "20px",
    }}
  >
    <h2>Final Interview Report</h2>

    <ReactMarkdown>
      {finalReport}
    </ReactMarkdown>
  </div>
)}

    </div>
  );
}

export default App;