import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TeacherDashboard() {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  if (!user?.id) redirect("/login");
  if (!user.role || !["TEACHER", "ADMIN"].includes(user.role)) redirect("/student");

  const teacherFilter = user.role === "TEACHER" ? { teacherId: user.id } : undefined;
  const [lessonCount, studentCount, publishedCount] = await Promise.all([
    db.lesson.count({ where: teacherFilter }),
    db.user.count({ where: { role: "STUDENT" } }),
    db.lesson.count({ where: { status: "PUBLISHED", ...(teacherFilter || {}) } }),
  ]);

  return (
    <main className="dashboard-page">
      <header className="navbar"><Link className="logo" href="/">🌐 <span>BhashaGuru AI</span></Link><nav><Link href="/teacher">Dashboard</Link><Link href="/teacher/lessons">Manage lessons</Link><Link href="/">Home</Link></nav></header>
      <section className="dashboard-shell">
        <p className="eyebrow">TEACHER WORKSPACE</p><h1>Welcome back, {user.name || "Teacher"}.</h1><p className="muted">Create clear, multilingual learning experiences for your students.</p>
        <div className="stats-grid"><div className="stat-card"><span>Total lessons</span><strong>{lessonCount}</strong></div><div className="stat-card"><span>Published lessons</span><strong>{publishedCount}</strong></div><div className="stat-card"><span>Students</span><strong>{studentCount}</strong></div></div>
        <div className="dashboard-grid teacher-actions"><Link className="dashboard-card action-card" href="/teacher/lessons"><span className="card-icon">📚</span><h2>Manage lessons</h2><p>Create, edit, and open your database-backed lessons.</p><span className="text-link">Open lesson manager →</span></Link><Link className="dashboard-card action-card" href="/teacher/students"><span className="card-icon">👥</span><h2>Students</h2><p>Keep your class learning content organized in one place.</p><span className="text-link">Manage students →</span></Link><div className="dashboard-card action-card"><span className="card-icon">📊</span><h2>Performance</h2><p>Use lesson and quiz activity to guide your next lesson.</p><span className="muted">Performance reports will appear here.</span></div></div>
      </section><footer>© 2026 BhashaGuru AI · Teacher workspace</footer>
    </main>
  );
}
