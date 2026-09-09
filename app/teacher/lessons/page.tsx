"use client";

import { useEffect, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  subject: string;
  className: string;
  sourceText: string;
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

  async function createLesson() {
    setMessage("");

    if (!title || !subject || !className || !sourceText) {
      setMessage("Please fill all the fields.");
      return;
    }

    if (sourceText.length < 20) {
      setMessage("Lesson content must be at least 20 characters.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          subject,
          className,
          sourceText,
          language,
        }),
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