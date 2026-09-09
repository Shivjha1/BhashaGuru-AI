"use client";

import { useState } from "react";

export default function LessonPage() {
  const [teluguExplanation, setTeluguExplanation] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showAssessment, setShowAssessment] = useState(false);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("");

  const lessonText =
    "Water evaporates because of heat from the sun. Water vapour rises, cools and condenses into droplets that form clouds. Precipitation brings water back to Earth.";

  function explainInTelugu() {
    setTeluguExplanation(
      "సూర్యుని వేడి వల్ల నీరు ఆవిరిగా మారుతుంది. నీటి ఆవిరి పైకి వెళ్లి చల్లబడుతుంది. ఆవిరి చిన్న నీటి బిందువులుగా మారి మేఘాలను ఏర్పరుస్తుంది. తరువాత వర్షం రూపంలో నీరు తిరిగి భూమికి వస్తుంది."
    );
  }

  function askTeacher() {
    if (!question.trim()) {
      setAnswer("Please type a question first.");
      return;
    }

    const q = question.toLowerCase();

    if (q.includes("water") || q.includes("నీరు")) {
      setAnswer(
        "Water evaporates because of heat from the Sun. The vapour rises, cools and forms clouds. Finally, precipitation brings water back to Earth."
      );
    } else if (q.includes("evaporation")) {
      setAnswer(
        "Evaporation is the process in which water changes from liquid water into water vapour because of heat."
      );
    } else if (q.includes("cloud")) {
      setAnswer(
        "Clouds form when water vapour rises, cools and condenses into tiny water droplets."
      );
    } else {
      setAnswer(
        "Based on this lesson, think about how heat from the Sun changes water into vapour and how vapour later returns to Earth."
      );
    }
  }

  function checkAnswer(option: string) {
    setSelected(option);

    if (option === "Evaporation") {
      setResult("✅ Correct answer!");
    } else {
      setResult("❌ Incorrect. The correct answer is Evaporation.");
    }
  }

  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "35px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, color: "#2563eb" }}>
          🌐 BhashaGuru AI
        </h2>

        <span style={{ color: "#64748b" }}>
          Student Learning
        </span>
      </div>

      {/* Lesson */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "25px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontSize: "30px", marginBottom: "10px" }}>
          📖
        </div>

        <h1 style={{ marginTop: 0, color: "#1e293b" }}>
          Water Cycle
        </h1>

        <p
          style={{
            fontSize: "17px",
            lineHeight: 1.8,
            color: "#475569",
          }}
        >
          {lessonText}
        </p>

        <button
          onClick={explainInTelugu}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "13px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "bold",
          }}
        >
          🌐 Explain in Telugu
        </button>

        {/* Telugu explanation */}
        {teluguExplanation && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "#eff6ff",
              borderRadius: "10px",
              border: "1px solid #bfdbfe",
            }}
          >
            <h3 style={{ marginTop: 0 }}>తెలుగులో వివరణ</h3>

            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.8,
              }}
            >
              {teluguExplanation}
            </p>
          </div>
        )}
      </section>

      {/* AI Teacher */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "25px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ color: "#1e293b" }}>
          🎤 Ask AI Teacher
        </h2>

        <p style={{ color: "#64748b" }}>
          Ask a question about this lesson.
        </p>

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askTeacher();
            }
          }}
          placeholder="Ask in your mother tongue..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "16px",
            marginBottom: "12px",
          }}
        />

        <button
          onClick={askTeacher}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "bold",
          }}
        >
          Ask
        </button>

        {answer && (
          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#f8fafc",
              borderRadius: "10px",
              borderLeft: "4px solid #2563eb",
            }}
          >
            <strong>🤖 AI Teacher:</strong>

            <p
              style={{
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              {answer}
            </p>
          </div>
        )}
      </section>

      {/* Assessment */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "25px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ color: "#1e293b" }}>
          📝 Assessment
        </h2>

        <p style={{ fontSize: "17px" }}>
          What is the process of water changing into water vapour?
        </p>

        {!showAssessment ? (
          <button
            onClick={() => setShowAssessment(true)}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "13px 22px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Start Assessment
          </button>
        ) : (
          <div>
            {[
              "Condensation",
              "Evaporation",
              "Precipitation",
              "Collection",
            ].map((option) => (
              <button
                key={option}
                onClick={() => checkAnswer(option)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "14px",
                  marginBottom: "10px",
                  border:
                    selected === option
                      ? "2px solid #2563eb"
                      : "1px solid #cbd5e1",
                  background:
                    selected === option ? "#eff6ff" : "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                {option}
              </button>
            ))}

            {result && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  fontWeight: "bold",
                }}
              >
                {result}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          color: "#64748b",
        }}
      >
        © 2026 BhashaGuru AI • Learn in your own language 🌍
      </div>
    </main>
  );
}