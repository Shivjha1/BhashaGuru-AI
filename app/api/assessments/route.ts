import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const assessmentSchema = z.object({
  lessonId: z.string().min(1),
  score: z.number().int().min(0),
  total: z.number().int().positive(),
  weakTopic: z.string().trim().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Student access required." }, { status: 403 });
    }

    const result = assessmentSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: "Invalid assessment result." }, { status: 400 });
    }
    if (result.data.score > result.data.total) {
      return NextResponse.json({ error: "Assessment score is invalid." }, { status: 400 });
    }

    const lesson = await db.lesson.findUnique({ where: { id: result.data.lessonId }, select: { id: true } });
    if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

    const attempt = await db.quizAttempt.create({
      data: { ...result.data, studentId: user.id },
    });
    return NextResponse.json({ attemptId: attempt.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/assessments failed:", error);
    return NextResponse.json({ error: "The assessment result could not be saved." }, { status: 500 });
  }
}
