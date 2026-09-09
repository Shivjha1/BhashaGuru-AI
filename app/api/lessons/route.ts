import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const s = await auth();
    const user = s?.user as { id?: string; role?: string } | undefined;

    if (!user?.id || !["TEACHER", "ADMIN"].includes(user.role || "")) {
      return NextResponse.json(
        { error: "Teacher access required. Please sign in with a teacher account." },
        { status: 403 }
      );
    }

    const lessons = await db.lesson.findMany({
      where: user.role === "TEACHER" ? { teacherId: user.id } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("GET /api/lessons failed:", error);
    return NextResponse.json(
      { error: "Unable to load lessons from the database." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let body: unknown;

  try {
    const s = await auth();
    const user = s?.user as { id?: string; role?: string } | undefined;

    if (!user?.id || !["TEACHER", "ADMIN"].includes(user.role || "")) {
      return NextResponse.json(
        { error: "Teacher access required. Please sign in with a teacher account." },
        { status: 403 }
      );
    }

    body = await req.json();
    const result = z
      .object({
        title: z.string().trim().min(2, "Title must be at least 2 characters."),
        subject: z.string().trim().min(1, "Subject is required."),
        className: z.string().trim().min(1, "Class is required."),
        sourceText: z
          .string()
          .trim()
          .min(20, "Lesson content must be at least 20 characters."),
        language: z.string().trim().min(1).default("English"),
      })
      .safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid lesson details." },
        { status: 400 }
      );
    }

    const lesson = await db.lesson.create({
      data: {
        ...result.data,
        teacherId: user.id,
        status: "PUBLISHED",
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("POST /api/lessons failed:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "The request body must be valid JSON." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "The lesson could not be saved to the database." },
      { status: 500 }
    );
  }
}