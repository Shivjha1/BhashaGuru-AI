import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function Parent() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) redirect("/login");
  if (user.role !== "PARENT") redirect(user.role === "TEACHER" ? "/teacher" : "/student");
  const profile = await db.parentProfile.findUnique({ where: { userId: user.id }, include: { children: { include: { user: true } } } });

  return <main className="wrap"><span className="pill">PARENT · FAMILY OVERVIEW</span><h1>Your child's learning</h1><p className="muted">Follow participation, quiz results, and progress in one place.</p>{profile?.children.length ? <div className="grid">{profile.children.map((child) => <Child key={child.userId} id={child.userId} name={child.user.name} email={child.user.email} className={child.user.className || "Class not set"} language={child.user.language} />)}</div> : <div className="card"><h3>No child linked yet</h3><p className="muted">A teacher can link a student, or the student email can be added during parent registration.</p></div>}</main>;
}

async function Child({ id, name, email, className, language }: { id: string; name: string; email: string; className: string; language: string }) {
  const attempts = await db.quizAttempt.findMany({ where: { studentId: id }, include: { lesson: true }, orderBy: { createdAt: "desc" }, take: 10 });
  const average = attempts.length ? Math.round(attempts.reduce((total, attempt) => total + (attempt.score / attempt.total) * 100, 0) / attempts.length) : 0;
  const completed = new Set(attempts.map((attempt) => attempt.lessonId)).size;
  return <div className="card"><h2>👧 {name}</h2><p className="muted">{email} · {className} · {language}</p><div className="stats-grid"><div className="stat-card"><span>Average score</span><strong>{average}%</strong></div><div className="stat-card"><span>Lessons completed</span><strong>{completed}</strong></div><div className="stat-card"><span>Quiz attempts</span><strong>{attempts.length}</strong></div></div><h3>Recent participation</h3>{attempts.length ? <div className="activity-list">{attempts.map((attempt) => <p key={attempt.id}><b>{attempt.lesson.title}</b> · {attempt.score}/{attempt.total} · {attempt.weakTopic || "Strong"}</p>)}</div> : <p className="muted">No quiz activity recorded yet.</p>}</div>;
}
