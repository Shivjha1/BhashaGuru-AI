"use client";

import { useState } from "react";

type QuizQuestion = { question: string; options: string[]; answer: number; topic?: string };
const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Marathi", "Bengali"];

export default function LessonClient({ lesson, language: initialLanguage }: { lesson: any; language: string }) {
  const [language, setLanguage] = useState(initialLanguage);
  const [explanation, setExplanation] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [error, setError] = useState("");

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceLanguages: Record<string, string> = { English: "en-IN", Hindi: "hi-IN", Telugu: "te-IN", Tamil: "ta-IN", Kannada: "kn-IN", Marathi: "mr-IN", Bengali: "bn-IN" };
    utterance.lang = voiceLanguages[language] || "en-IN";
    speechSynthesis.speak(utterance);
  };

  async function ai(action: "explain" | "ask" | "quiz", text: string, lessonText?: string) {
    setBusy(true);
    setBusyLabel(action === "explain" ? "Generating explanation" : action === "ask" ? "Preparing answer" : "Generating assessment");
    setError("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text, lessonText, language, className: lesson.className }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI service unavailable.");
      return data.result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach the AI Teacher.");
      return "";
    } finally {
      setBusy(false);
      setBusyLabel("");
    }
  }

  async function generateAssessment() {
    const result = await ai("quiz", lesson.sourceText);
    if (!result) return;
    try {
      const cleaned = result.replace(/```json|```/gi, "").trim();
      const start = cleaned.indexOf("[");
      const end = cleaned.lastIndexOf("]");
      if (start < 0 || end <= start) throw new Error("Missing quiz data");
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      const questions = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(questions) || questions.length === 0 || questions.some((item) => !item.question || !Array.isArray(item.options) || item.options.length !== 4 || typeof item.answer !== "number")) {
        throw new Error("Invalid quiz data");
      }
      setQuiz(questions.slice(0, 5));
      setSelected({});
      setScore(null);
      setSaved(false);
    } catch {
      setError("The assessment could not be read. Please click Generate assessment again.");
    }
  }

  async function submitAssessment() {
    const total = quiz.reduce((count, item, index) => count + (selected[index] === Number(item.answer) ? 1 : 0), 0);
    setScore(total);
    setSaved(false);
    setBusy(true);
    setBusyLabel("Saving assessment");
    setError("");
    try {
      const weakTopic = quiz.find((item, index) => selected[index] !== Number(item.answer))?.topic;
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, score: total, total: quiz.length, weakTopic }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The assessment result could not be saved.");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assessment result could not be saved.");
    } finally {
      setBusy(false);
      setBusyLabel("");
    }
  }

  return (
    <main className="wrap">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span className="pill">{lesson.subject} · {lesson.className}</span>
        <label>Explanation language <select className="select" value={languages.includes(language) ? language : "English"} onChange={(event) => { setLanguage(event.target.value); setExplanation(""); setAnswer(""); }} aria-label="Choose explanation language">{languages.map((option) => <option key={option}>{option}</option>)}</select></label>
      </div>
      <h1>{lesson.title}</h1>

      <section className="card">
        <h2>📖 Original lesson</h2>
        {lesson.pdfUrl ? (
          <div style={{ marginBottom: 16 }}>
            <p className="muted">This lesson includes a PDF attachment.</p>
            <a className="btn" href={lesson.pdfUrl} target="_blank" rel="noreferrer">📄 Open lesson PDF</a>
          </div>
        ) : null}
        <p style={{ lineHeight: 1.8 }}>{lesson.sourceText}</p>
        <button className="btn" disabled={busy} onClick={async () => setExplanation(await ai("explain", lesson.sourceText))}>✨ Explain in My Language</button>
        {busy && <p className="muted" role="status" style={{ marginTop: 12 }}>{busyLabel} in {language}...</p>}
        {explanation && <div className="notice" style={{ marginTop: 15 }}><b>AI Teacher ({language})</b><p>{explanation}</p><button className="btn green" onClick={() => speak(explanation)}>🔊 Listen</button></div>}
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h2>🎤 Ask AI Teacher</h2>
        <input className="input" placeholder={`Ask in ${language}...`} value={question} onChange={(event) => setQuestion(event.target.value)} />
        <button className="btn" disabled={busy || !question.trim()} onClick={async () => setAnswer(await ai("ask", question, lesson.sourceText))}>Ask in {language}</button>
        {answer && <div className="notice" style={{ marginTop: 15 }}><p>{answer}</p><button className="btn green" onClick={() => speak(answer)}>🔊 Speak answer</button></div>}
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h2>📝 Assessment in {language}</h2>
        <p className="muted">Generate a five-question assessment from this lesson in your selected language.</p>
        <button className="btn" disabled={busy} onClick={generateAssessment}>Generate assessment</button>
        {quiz.map((item, index) => <fieldset key={`${item.question}-${index}`} style={{ marginTop: 18, border: 0, padding: 0 }}><legend><b>{index + 1}. {item.question}</b></legend>{item.options.map((option, optionIndex) => <label key={option} style={{ display: "block", marginTop: 8 }}><input type="radio" name={`question-${index}`} checked={selected[index] === optionIndex} onChange={() => setSelected({ ...selected, [index]: optionIndex })} /> {option}</label>)}</fieldset>)}
        {quiz.length > 0 && <button className="btn green" style={{ marginTop: 20 }} disabled={busy} onClick={submitAssessment}>{busy ? "Saving..." : "Submit assessment"}</button>}
        {score !== null && <div className="notice" style={{ marginTop: 15 }}><b>Score: {score} / {quiz.length}</b>{saved && <p>Saved to your progress. Your parent can now see this result.</p>}{quiz.map((item, index) => selected[index] !== Number(item.answer) && <p key={`review-${index}`}><b>Question {index + 1}:</b> {selected[index] === undefined ? "Not answered." : `Your answer: ${item.options[selected[index]]}.`} Correct answer: {item.options[Number(item.answer)]}.</p>)}</div>}
      </section>
      {error && <p className="notice danger" style={{ marginTop: 20 }}>{error}</p>}
    </main>
  );
}
