"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const Logo = () => (
  <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1.5rem' }}>
    <rect width="32" height="32" rx="8" fill="#111118"/>
    <text x="6" y="24" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="800" fontSize="20" fill="#00ff88">B</text>
    <circle cx="26" cy="26" r="3" fill="#00ff88"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "var(--background)",
      padding: "1rem"
    }}>
      <Logo />
      
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <h1 style={{ marginBottom: "0.5rem", textAlign: "center", fontSize: "1.8rem" }}>BudgetTrack</h1>
        <p style={{ 
          marginBottom: "2rem", 
          textAlign: "center", 
          color: "var(--muted)",
          fontSize: "0.9rem" 
        }}>
          Secure Financial Matrix
        </p>

        {error && (
          <div style={{ 
            padding: "0.8rem", 
            background: "rgba(239, 68, 68, 0.1)", 
            color: "var(--danger)",
            borderRadius: "var(--radius)",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="btn" 
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Authorizing..." : "Enter Matrix"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <a 
          href="https://blkautomation.uk" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none" }}
        >
          Built by <span style={{ color: "var(--primary)", fontWeight: "600" }}>BlkAutomation.uk</span>
        </a>
      </div>
    </div>
  );
}
