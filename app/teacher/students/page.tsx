import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import StudentsManager from "./client";

export default async function TeacherStudentsPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) redirect("/login");
  if (!user.role || !["TEACHER", "ADMIN"].includes(user.role)) redirect("/student");

  const [students, parents] = await Promise.all([
    db.studentProfile.findMany({ include: { user: true, parent: { include: { user: true } } }, orderBy: { user: { name: "asc" } } }),
    db.parentProfile.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
  ]);

  return (
    <main className="dashboard-page">
      <header className="navbar"><Link className="logo" href="/">🌐 <span>BhashaGuru AI</span></Link><nav><Link href="/teacher">Dashboard</Link><Link href="/teacher/lessons">Manage lessons</Link><Link href="/">Home</Link></nav></header>
      <section className="dashboard-shell">
        <p className="eyebrow">TEACHER WORKSPACE</p>
        <h1>Students and families</h1>
        <p className="muted">Connect each student with a parent account so families can follow learning activity.</p>
        <StudentsManager
          initialStudents={students.map((student) => ({
            id: student.userId,
            name: student.user.name,
            email: student.user.email,
            className: student.user.className || "Class not set",
            language: student.user.language,
            parent: student.parent ? { id: student.parent.id, name: student.parent.user.name, email: student.parent.user.email } : null,
          }))}
          parents={parents.map((parent) => ({ id: parent.id, name: parent.user.name, email: parent.user.email }))}
        />
      </section>
      <footer>© 2026 BhashaGuru AI · Teacher workspace</footer>
    </main>
  );
}