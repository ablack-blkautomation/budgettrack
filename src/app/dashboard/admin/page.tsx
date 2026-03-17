"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");

  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: any) => {
    setCurrentUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword(""); // Clear password field
    setShowModal(true);
  };

  const handleCreate = () => {
    setCurrentUser(null);
    setName("");
    setEmail("");
    setRole("USER");
    setPassword("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: currentUser?.id,
      name,
      email,
      role,
      ...(password ? { password } : {})
    };

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Operation failed");
      }
    } catch (err) {
      alert("Error processing request");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Deletion failed");
      }
    } catch (err) {
      alert("Error deleting user");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>User Management</h2>
        <button className="btn" onClick={handleCreate}>+ Invite New User</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "1rem" }}>Name</th>
              <th style={{ padding: "1rem" }}>Email</th>
              <th style={{ padding: "1rem" }}>Role</th>
              <th style={{ padding: "1rem" }}>Joined</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "1rem" }}>{user.name}</td>
                <td style={{ padding: "1rem" }}>{user.email}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ 
                    padding: "0.2rem 0.5rem", 
                    borderRadius: "4px", 
                    fontSize: "0.7rem",
                    background: user.role === "ADMIN" ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 255, 255, 0.05)",
                    color: user.role === "ADMIN" ? "var(--primary)" : "var(--muted)",
                    border: `1px solid ${user.role === "ADMIN" ? "var(--primary)" : "var(--border)"}`
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: "1rem", color: "var(--muted)", fontSize: "0.9rem" }}>
                  {formatDate(user.createdAt)}
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: "0.4rem 0.8rem", marginRight: "0.5rem", fontSize: "0.7rem" }}
                    onClick={() => handleEdit(user)}
                  >
                    EDIT
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: "0.4rem 0.8rem", color: "var(--danger)", border: "none", fontSize: "0.7rem" }}
                    onClick={() => handleDelete(user.id)}
                  >
                    DELETE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
          </div>
          </div>
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(5px)"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "450px" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>{currentUser ? "Edit User" : "Invite User"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password {currentUser && "(Leave blank to keep current)"}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!currentUser} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>{currentUser ? "Update" : "Create"}</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
