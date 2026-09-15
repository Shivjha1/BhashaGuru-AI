import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Marathi", "Bengali"] as const;
const registrationSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["STUDENT", "TEACHER", "PARENT"]),
  language: z.enum(languages),
  className: z.string().trim().optional(),
  childEmail: z.string().trim().email("Enter a valid student email.").transform((value) => value.toLowerCase()).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const body = registrationSchema.parse(await req.json());
    const exists = await db.user.findUnique({ where: { email: body.email } });
    if (exists) return NextResponse.json({ error: "Email already registered. Please use another email or log in." }, { status: 409 });

    await db.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: body.name,
          email: body.email,
          passwordHash: await bcrypt.hash(body.password, 12),
          role: body.role,
          language: body.language,
          className: body.className || null,
        },
      });
      if (body.role === "STUDENT") await transaction.studentProfile.create({ data: { userId: user.id } });
      if (body.role !== "PARENT") return;

      const parent = await transaction.parentProfile.create({ data: { userId: user.id } });
      if (!body.childEmail) return;

      const child = await transaction.user.findUnique({ where: { email: body.childEmail }, include: { studentProfile: true } });
      if (!child || child.role !== "STUDENT" || !child.studentProfile) throw new Error("STUDENT_NOT_FOUND");
      if (child.studentProfile.parentId && child.studentProfile.parentId !== parent.id) throw new Error("STUDENT_ALREADY_LINKED");
      await transaction.studentProfile.update({ where: { id: child.studentProfile.id }, data: { parentId: parent.id } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/register failed:", error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Please check the registration fields." }, { status: 400 });
    if (error instanceof Error && error.message === "STUDENT_NOT_FOUND") return NextResponse.json({ error: "No student account was found for that email." }, { status: 400 });
    if (error instanceof Error && error.message === "STUDENT_ALREADY_LINKED") return NextResponse.json({ error: "That student is already linked to another parent account." }, { status: 409 });
    return NextResponse.json({ error: "Registration could not be completed. Please try again." }, { status: 500 });
  }
}
