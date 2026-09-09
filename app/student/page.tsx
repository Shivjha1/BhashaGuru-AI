import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function Student() {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string; role?: string; language?: string } | undefined;
  if (!user?.id) redirect("/login");
  if (user.role !== "STUDENT") redirect(user.role === "TEACHER" ? "/teacher" : "/parent");

  const [lessons, attempts] = await Promise.all([
    db.lesson.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } }),
    db.quizAttempt.findMany({ where: { studentId: user.id }, include: { lesson: true }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const average = attempts.length ? Math.round(attempts.reduce((total, attempt) => total + (attempt.score / attempt.total) * 100, 0) / attempts.length) : 0;

  return <main className="wrap"><span className="pill">STUDENT · {user.language || "English"}</span><h1>Namaste, {user.name}! 👋</h1><p className="muted">Continue your learning journey.</p><div className="grid"><div className="card"><div className="stat">{average}%</div><p className="muted">Average quiz score</p></div><div className="card"><div className="stat">{lessons.length}</div><p className="muted">Available lessons</p></div></div><h2 style={{ marginTop: 35 }}>Available lessons</h2><div className="grid">{lessons.map((lesson) => <div className="card" key={lesson.id}><span className="pill">{lesson.subject} · {lesson.className}</span><h3>{lesson.title}</h3><p className="muted">Language: {lesson.language || "English"}</p><p className="muted">{lesson.sourceText.slice(0, 130)}…</p><Link className="btn" href={`/lesson/${lesson.id}`}>Open lesson →</Link></div>)}</div><h2 style={{ marginTop: 35 }}>Recent attempts</h2><div className="card"><table className="table"><tbody>{attempts.map((attempt) => <tr key={attempt.id}><td>{attempt.lesson.title}</td><td>{attempt.score}/{attempt.total}</td><td>{attempt.weakTopic || "Strong"}</td></tr>)}</tbody></table></div></main>;
}
