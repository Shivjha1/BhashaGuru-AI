import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import LessonClient from "./client";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!lesson) notFound();

  const language = (session.user as { language?: string }).language || "English";
  return <LessonClient lesson={lesson} language={language} />;
}
