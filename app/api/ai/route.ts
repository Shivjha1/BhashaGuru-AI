import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Marathi", "Bengali"] as const;
const requestSchema = z.object({
  action: z.enum(["explain", "translate", "quiz", "ask"]),
  text: z.string().trim().min(1, "Lesson content or question is required."),
  lessonText: z.string().trim().optional(),
  language: z.enum(languages).default("English"),
  className: z.string().trim().min(1).default("Class 5"),
});

const assessmentSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
          answer: { type: "integer", minimum: 0, maximum: 3 },
          topic: { type: "string" },
        },
        required: ["question", "options", "answer", "topic"],
      },
    },
  },
  required: ["questions"],
};

function providerError(error: unknown) {
  const status = (error as { status?: number })?.status;
  if (status === 401 || status === 403) return { status: 502, message: "Gemini rejected the server API key. Check GEMINI_API_KEY." };
  if (status === 404) return { status: 502, message: "The configured Gemini model is unavailable. Check GEMINI_MODEL in Vercel." };
  if (status === 429) return { status: 429, message: "Gemini free-tier rate limit reached. Please wait and try again." };
  return { status: 502, message: "Gemini could not complete the request. Please try again." };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Please sign in before using the AI Teacher." }, { status: 401 });
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 503 });

    const body = requestSchema.parse(await req.json());
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction = `You are BhashaGuru AI, a safe primary-school tutor. The student is in ${body.className}. Always respond in simple ${body.language}. Stay focused on the requested task. Never repeat the whole lesson unless the student explicitly asks for a complete explanation. Do not invent facts outside the supplied lesson.`;
    const prompts = {
      explain: `Explain the current lesson completely in simple ${body.language}. Preserve its important facts and examples.\n\nCURRENT LESSON:\n${body.text}`,
      translate: `Translate the current educational lesson into ${body.language}, preserving its meaning and educational detail.\n\nCURRENT LESSON:\n${body.text}`,
      ask: `Answer ONLY the student's question below in simple ${body.language}. Give a direct, concise answer about what they asked. Do not summarize or reproduce the lesson. Use the lesson only to understand and support the answer. If the question is not answered by the lesson, say that you can only answer from this lesson.\n\nSTUDENT QUESTION:\n${body.text}\n\nLESSON CONTEXT:\n${body.lessonText || "No lesson context was supplied."}`,
      quiz: `Create exactly five multiple-choice questions in ${body.language} from the lesson below. Test the lesson's key facts, not the student's question. Write every question and all four options in ${body.language}. The answer field is the zero-based correct option index and topic is the tested concept. Return only the requested JSON object, with no markdown or explanation.\n\nLESSON:\n${body.text}`,
    };
    const config: Record<string, unknown> = { systemInstruction, temperature: 0.2 };
    if (body.action === "quiz") {
      config.responseMimeType = "application/json";
      config.responseSchema = assessmentSchema;
    }

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      contents: prompts[body.action],
      config,
    });
    const text = result.text?.trim();
    if (!text) return NextResponse.json({ error: "Gemini returned an empty response. Please try again." }, { status: 502 });
    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("POST /api/ai failed:", error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid AI request." }, { status: 400 });
    const failure = providerError(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}
