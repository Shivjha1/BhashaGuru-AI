import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

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

    const contentType = req.headers.get("content-type") || "";
    const uploadDir = path.join(process.cwd(), "public", "uploads", "lessons");

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("pdf") as File | null;
      const title = String(formData.get("title") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const className = String(formData.get("className") || "").trim();
      const sourceText = String(formData.get("sourceText") || "").trim();
      const language = String(formData.get("language") || "English").trim();

      let pdfUrl: string | undefined;
      let pdfName: string | undefined;

      if (file && file instanceof File) {
        if (file.type !== "application/pdf") {
          return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const fileName = `${Date.now()}-${safeName}`;
        await mkdir(uploadDir, { recursive: true });
        const bytes = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(uploadDir, fileName), bytes);
        pdfUrl = `/uploads/lessons/${fileName}`;
        pdfName = file.name;
      }

      body = {
        title,
        subject,
        className,
        sourceText,
        pdfUrl,
        pdfName,
        language,
      };
    } else {
      body = await req.json();
    }

    const result = z
      .object({
        title: z.string().trim().min(2, "Title must be at least 2 characters."),
        subject: z.string().trim().min(1, "Subject is required."),
        className: z.string().trim().min(1, "Class is required."),
        sourceText: z.string().trim().optional().default(""),
        pdfUrl: z
          .string()
          .trim()
          .optional()
          .refine((value) => !value || value.startsWith("/uploads/") || /^https?:\/\//i.test(value), {
            message: "PDF must be a valid upload path or URL.",
          }),
        pdfName: z.string().trim().max(200).optional(),
        language: z.string().trim().min(1).default("English"),
      })
      .refine((data) => data.sourceText.length >= 20 || Boolean(data.pdfUrl), {
        message: "Add lesson text or upload a PDF file.",
        path: ["sourceText"],
      })
      .safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid lesson details." },
        { status: 400 }
      );
    }

    const normalizedLesson = {
      ...result.data,
      sourceText:
        result.data.sourceText.trim() ||
        (result.data.pdfName ? `PDF lesson attached: ${result.data.pdfName}` : "PDF lesson attached."),
    };

    const lesson = await db.lesson.create({
      data: {
        ...normalizedLesson,
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