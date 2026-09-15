"use client";

import { useState } from "react";

type Parent = { id: string; name: string; email: string };
type Student = { id: string; name: string; email: string; className: string; language: string; parent: Parent | null };

export default function StudentsManager({ initialStudents, parents }: { initialStudents: Student[]; parents: Parent[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [selectedParents, setSelectedParents] = useState<Record<string, string>>(() => Object.fromEntries(initialStudents.map((student) => [student.id, student.parent?.id || ""])));
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function linkParent(studentId: string) {
    const parentId = selectedParents[studentId];
    if (!parentId) {
      setMessage({ type: "error", text: "Select a parent account first." });
      return;
    }
    setSavingId(studentId);
    setMessage(null);
    try {
      const response = await fetch("/api/teacher/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, parentId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The parent could not be linked.");
      setStudents((current) => current.map((student) => student.id === studentId ? { ...student, parent: parents.find((parent) => parent.id === parentId) || null } : student));
      setMessage({ type: "success", text: "Parent linked successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "The parent could not be linked." });
    } finally {
      setSavingId(null);
    }
  }

  return <div className="student-management"><div className="card"><h2>Student accounts</h2><p className="muted">{students.length} student{students.length === 1 ? "" : "s"} · {parents.length} parent account{parents.length === 1 ? "" : "s"}</p>{message && <p className={`notice ${message.type === "error" ? "danger" : "success"}`} role="status">{message.text}</p>}{students.length ? <div className="student-list">{students.map((student) => <div className="student-management-row" key={student.id}><div><h3>{student.name}</h3><p className="muted">{student.email} · {student.className} · {student.language}</p><p className="linked-parent">{student.parent ? <>Linked parent: <strong>{student.parent.name}</strong> ({student.parent.email})</> : "No parent linked yet"}</p></div><div className="parent-assignment"><label htmlFor={`parent-${student.id}`}>{student.parent ? "Change parent" : "Assign parent"}</label><select id={`parent-${student.id}`} className="select" value={selectedParents[student.id] || ""} onChange={(event) => setSelectedParents((current) => ({ ...current, [student.id]: event.target.value }))} disabled={!parents.length || savingId === student.id}><option value="">Select a parent</option>{parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.name} · {parent.email}</option>)}</select><button className="btn" type="button" onClick={() => linkParent(student.id)} disabled={!parents.length || savingId === student.id}>{savingId === student.id ? "Saving…" : student.parent ? "Update parent" : "Link parent"}</button></div></div>)}</div> : <p className="muted">No student accounts found.</p>}{!parents.length && <p className="notice danger">No parent accounts exist yet. Ask a parent to register before assigning a link.</p>}</div></div>;
}