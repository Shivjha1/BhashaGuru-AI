import Link from "next/link";

const roles = [
  {
    icon: "🎓",
    title: "Student",
    text: "Learn lessons, ask the AI Teacher, practice quizzes, and track progress.",
    href: "/student",
    action: "Open Student Dashboard",
  },
  {
    icon: "👨‍🏫",
    title: "Teacher",
    text: "Create multilingual lessons and support every learner with better content.",
    href: "/teacher",
    action: "Open Teacher Dashboard",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Parent",
    text: "Follow your child's participation, quiz results, and learning progress.",
    href: "/parent",
    action: "View Family Progress",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <header className="navbar home-nav">
        <Link className="logo" href="/">🌐 <span>BhashaGuru AI</span></Link>
        <nav>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#roles">Roles</a>
          <Link href="/login">Login</Link>
          <Link className="nav-cta" href="/register">Get started</Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">AI-POWERED MULTILINGUAL LEARNING</p>
          <h1>Understand more. Learn in your language.</h1>
          <p className="hero-lead">BhashaGuru AI helps students learn clearly through interactive lessons, friendly explanations, and practice that fits their learning journey.</p>
          <div className="hero-actions">
            <Link className="btn" href="/register">Start learning</Link>
            <Link className="btn btn-light" href="#roles">Explore the platform</Link>
          </div>
          <div className="hero-proof"><span>✓ Telugu, Hindi and English</span><span>✓ Lessons for every learner</span></div>
        </div>
        <div className="hero-visual" aria-label="A student learning with BhashaGuru AI">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="learning-board"><span className="board-kicker">TODAY'S LEARNING</span><strong>Water Cycle</strong><div className="progress-track"><span /></div><small>78% lesson progress</small></div>
          <div className="student-illustration">🧑‍🎓</div><div className="language-bubble">నమస్తే · Hello · नमस्ते</div>
        </div>
      </section>

      <section className="feature-strip" id="features">
        <div><strong>📚 Smart lessons</strong><span>Understand concepts step by step</span></div>
        <div><strong>🌐 Your language</strong><span>Learn in Telugu, Hindi, or English</span></div>
        <div><strong>🤖 AI Teacher</strong><span>Get help whenever you need it</span></div>
        <div><strong>📈 Real progress</strong><span>See learning growth over time</span></div>
      </section>

      <section className="roles-section" id="roles">
        <div className="section-heading"><p className="eyebrow">ONE PLATFORM, THREE EXPERIENCES</p><h2>Choose how you want to learn</h2><p>Each dashboard is designed around the people who use it.</p></div>
        <div className="role-grid">{roles.map((role) => <article className="role-card" key={role.title}><span className="role-icon">{role.icon}</span><h3>{role.title}</h3><p>{role.text}</p><Link className="text-link" href={role.href}>{role.action} →</Link></article>)}</div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-heading"><p className="eyebrow">A CLEARER WAY TO LEARN</p><h2>From curiosity to confidence</h2></div>
        <div className="steps-grid">{[["01", "Choose a lesson", "Find a topic that matches your class and goals."], ["02", "Learn with AI", "Ask questions and explore explanations in your language."], ["03", "Practice", "Use quizzes to turn understanding into confidence."], ["04", "Track growth", "Students, teachers, and parents see progress together."]].map(([number, title, text]) => <div className="step" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
      </section>

      <section className="home-cta"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Learning feels better when it makes sense.</h2></div><Link className="btn btn-light" href="/register">Create your account →</Link></section>
      <footer>© 2026 BhashaGuru AI · Learn in your own language.</footer>
    </main>
  );
}
