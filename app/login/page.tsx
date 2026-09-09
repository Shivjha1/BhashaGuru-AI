 "use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
	const [email, setEmail] = useState("student@bhashaguru.demo");
	const [password, setPassword] = useState("demo123");
	const [err, setErr] = useState("");
	const router = useRouter();

	async function go(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErr("");
		const result = await signIn("credentials", { email, password, redirect: false });
		if (result?.error) {
			setErr("Invalid email or password.");
			return;
		}
		const session = await fetch("/api/auth/session", { cache: "no-store" }).then((response) => response.json());
		const destination = session?.user?.role === "TEACHER" ? "/teacher" : session?.user?.role === "PARENT" ? "/parent" : "/student";
		router.push(destination);
	}

	return <main className="auth-page"><div className="card auth-card"><Link className="logo" href="/">🌐 <span>BhashaGuru AI</span></Link><h1>Welcome back 👋</h1><p className="muted">Sign in to your learning workspace.</p><form onSubmit={go}><label htmlFor="email">Email</label><input id="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required /><label htmlFor="password">Password</label><input id="password" className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />{err && <p className="notice danger">{err}</p>}<button className="btn" style={{ width: "100%" }}>Sign in</button></form><p className="muted">New team member? <Link href="/register">Create account</Link></p></div></main>;
}