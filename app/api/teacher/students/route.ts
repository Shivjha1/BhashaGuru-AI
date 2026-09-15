import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const linkSchema = z.object({ studentId: z.string().min(1), parentId: z.string().min(1) });

async function getAuthorizedUser() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.id && ["TEACHER", "ADMIN"].includes(user.role || "") ? user : null;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthorizedUser();
    if (!user) return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
    const result = linkSchema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "Choose a student and parent." }, { status: 400 });

    const [student, parent] = await Promise.all([
      db.studentProfile.findUnique({ where: { userId: result.data.studentId } }),
      db.parentProfile.findUnique({ where: { id: result.data.parentId } }),
    ]);
    if (!student) return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    if (!parent) return NextResponse.json({ error: "Parent account not found." }, { status: 404 });

    const updated = await db.studentProfile.update({
      where: { id: student.id },
      data: { parentId: parent.id },
      include: { user: true, parent: { include: { user: true } } },
    });
    return NextResponse.json({ student: { id: updated.userId, name: updated.user.name }, parent: { id: updated.parent?.id, name: updated.parent?.user.name } });
  } catch (error) {
    console.error("POST /api/teacher/students failed:", error);
    return NextResponse.json({ error: "The parent could not be linked. Please try again." }, { status: 500 });
  }
}