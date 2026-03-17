"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingsTarget, setSavingsTarget] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setSavingsTarget(data.savingsTarget?.toString() || "");
        }
      } catch (err) {}
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, currentPassword, newPassword, savingsTarget }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setStatus({ type: "success", message: "Profile updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <div className="card">
        <h2 style={{ marginBottom: "1.5rem" }}>User Profile & Security</h2>
        
        {status.message && (
          <div style={{ 
            padding: "1rem", 
            marginBottom: "1.5rem",
            borderRadius: "var(--radius)",
            background: status.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: status.type === "success" ? "var(--accent)" : "var(--danger)",
            border: `1px solid ${status.type === "success" ? "var(--accent)" : "var(--danger)"}`
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--muted)" }}>Basic Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
          </div>

          <div className="form-group">
            <label>Savings Target (£)</label>
            <input 
              type="number" 
              value={savingsTarget} 
              onChange={(e) => setSavingsTarget(e.target.value)} 
              placeholder="e.g. 50000"
            />
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.4rem" }}>
              This target will be used to track your progress in the reports.
            </p>
          </div>

          <hr style={{ margin: "2rem 0", borderColor: "var(--border)" }} />

          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--muted)" }}>Change Password</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to change password" />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
          </div>

          <button type="submit" className="btn" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "Saving Changes..." : "Update Profile"}
          </button>
        </form>

        <div style={{ marginTop: "2.5rem", borderTop: "1px solid var(--border)", paddingTop: "2.5rem" }}>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn"
            style={{ 
              width: "100%", 
              background: "rgba(239, 68, 68, 0.1)", 
              border: "1px solid var(--danger)", 
              color: "var(--danger)",
              fontWeight: "700"
            }}
          >
            🚪 Logout from Session
          </button>
        </div>
      </div>
    </div>
  );
}
