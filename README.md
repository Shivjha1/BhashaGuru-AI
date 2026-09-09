# BhashaGuru AI — Full-stack SIH build

## Stack
- Next.js App Router + TypeScript
- NextAuth credentials authentication
- PostgreSQL + Prisma
- OpenAI Responses API through `/api/ai`
- Browser SpeechSynthesis for voice output
- Role-based Student / Teacher / Parent / Admin access

## 1. Install
Node.js 20.9+ is recommended by the Next.js learning docs.

```bash
npm install
```

## 2. Database
Create a PostgreSQL database and copy `.env.example` to `.env`.

Set:
- DATABASE_URL
- AUTH_SECRET
- OPENAI_API_KEY
- OPENAI_MODEL (optional)

Then:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

## 3. Run
```bash
npm run dev
```
Open http://localhost:3000

## Demo accounts
- Student: student@bhashaguru.demo / demo123
- Teacher: teacher@bhashaguru.demo / demo123
- Parent: parent@bhashaguru.demo / demo123

## 4. GitHub
Upload the complete folder to a GitHub repository. NEVER upload `.env`.

## 5. Production deployment
Deploy the Next.js app to Vercel or another Node-compatible host. Add the same environment variables in the hosting dashboard and connect a managed PostgreSQL provider.

## Architecture
Browser → Next.js UI → protected server routes/actions → Prisma/PostgreSQL
                                  ↘ OpenAI API
                                  ↘ SpeechSynthesis

## SIH hardening still recommended
- Email verification / password reset
- Rate limiting and audit logging
- Teacher approval workflow for AI-generated content
- Real speech-to-text provider for microphone input
- Object storage + PDF/DOCX extraction for lesson uploads
- Parent-child invitation/linking flow
- Fine-grained authorization and database-level isolation
- Data retention/deletion policy for child data
- Human review of important educational content
- Automated tests and monitoring

This repository is designed as a strong working full-stack SIH base, not as a claim that child-data production compliance is already complete.
