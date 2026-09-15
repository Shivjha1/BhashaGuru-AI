"use client";

import { useEffect, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  subject: string;
  className: string;
  sourceText: string;
  pdfUrl?: string;
  pdfName?: string;
  language?: string;
  status?: string;
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [language, setLanguage] = useState("English");
  const [sourceText, setSourceText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadLessons() {
    try {
      setLoading(true);

      const response = await fetch("/api/lessons", { cache: "no-store" });
      const data = (await response.json()) as Lesson[] | { error?: string };

      if (response.ok) {
        setLessons(data as Lesson[]);
      } else {
        setMessage((data as { error?: string }).error || "Failed to load lessons.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load lessons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLessons();
  }, []);

  async function handlePdfUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPdfFile(null);
      setPdfName("");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Please upload a PDF file only.");
      event.target.value = "";
      return;
    }

    setPdfFile(file);
    setPdfName(file.name);
    setMessage(`PDF selected: ${file.name}`);
  }

  async function createLesson() {
    setMessage("");

    const trimmedText = sourceText.trim();
    const hasPdf = Boolean(pdfFile);

    if (!title || !subject || !className) {
      setMessage("Please fill in the title, subject, and class.");
      return;
    }

    if (!trimmedText && !hasPdf) {
      setMessage("Please write lesson content or upload a PDF.");
      return;
    }

    if (trimmedText && trimmedText.length < 20 && !hasPdf) {
      setMessage("Lesson content must be at least 20 characters or include a PDF.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("className", className);
      formData.append("sourceText", trimmedText);
      formData.append("language", language);
      if (pdfFile) {
        formData.append("pdf", pdfFile, pdfFile.name);
      }

      const response = await fetch("/api/lessons", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as Lesson | { error?: string };

      if (!response.ok) {
        setMessage((data as { error?: string }).error || "Failed to create lesson.");
        return;
      }

      setMessage(`Lesson "${title}" saved successfully! 🎉`);

      setTitle("");
      setSubject("");
      setClassName("");
      setLanguage("English");
      setSourceText("");
      setPdfFile(null);
      setPdfName("");

      await loadLessons();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="teacher-page">
      <header className="navbar">
        <div className="logo">
          🌐 <span>BhashaGuru AI</span>
        </div>

        <nav>
          <a href="/">Home</a>
          <a href="/student">Student</a>
          <a href="/teacher">Teacher</a>
          <a href="/parent">Parent</a>
          <a href="/login">Login</a>
        </nav>
      </header>

      <section className="teacher-hero">
        <p className="small-title">TEACHER</p>

        <h1>Manage Lessons 📚</h1>

        <p>
          Create and save learning lessons for your students.
        </p>
      </section>

      <section className="dashboard-grid">

        <div className="dashboard-card">
          <h2>Create New Lesson</h2>

          <p>Enter the details of your new lesson.</p>

          <label>Lesson Title</label>

          <input
            type="text"
            placeholder="Example: Water Cycle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Subject</label>

          <input
            type="text"
            placeholder="Example: Science"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <label>Class</label>

          <input
            type="text"
            placeholder="Example: Class 6"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />

          <label>Language</label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
            <option value="Hindi">Hindi</option>
          </select>

          <label>Lesson Content</label>

          <textarea
            placeholder="Write the lesson content here..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={6}
          />

          <label className="upload-label" htmlFor="lesson-pdf-upload">
            Add PDF lesson
          </label>

          <input
            id="lesson-pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
          />

          {pdfName && (
            <p className="lesson-message">
              PDF attached: {pdfName}
            </p>
          )}

          <button
            className="btn"
            onClick={createLesson}
            disabled={saving}
          >
            {saving ? "Saving..." : "➕ Save Lesson"}
          </button>

          {message && (
            <p className="lesson-message">
              {message}
            </p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Existing Lessons 📚</h2>

          {loading ? (
            <p>Loading lessons...</p>
          ) : lessons.length === 0 ? (
            <p>No lessons found. Create your first lesson.</p>
          ) : (
            <div className="lessons-list">

              {lessons.map((lesson) => (
                <div
                  className="quick-card"
                  key={lesson.id}
                >
                  <span>📘</span>

                  <div>
                    <h3>{lesson.title}</h3>

                    <p>
                      {lesson.subject} • {lesson.className}
                    </p>

                    <p>
                      Language: {lesson.language || "English"}
                    </p>

                    <a
                      href={`/lesson/${lesson.id}`}
                      className="btn"
                    >
                      Open Lesson
                    </a>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

      </section>

      <footer>
        © 2026 BhashaGuru AI • Learn in your own language 🌍
      </footer>
    </main>
  );
}