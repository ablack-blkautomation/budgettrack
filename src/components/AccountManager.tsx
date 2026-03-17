"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountManager({ accounts }: { accounts: any[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("CHECKING");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, balance: parseFloat(balance) || 0 }),
      });
      if (res.ok) {
        setShowAdd(false);
        setName("");
        setBalance("");
        router.refresh();
      }
    } catch (err) {
      alert("Failed to add account");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async (id: string, newBalance: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: parseFloat(newBalance) }),
      });
      if (res.ok) {
        setEditingId(null);
        router.refresh();
      }
    } catch (err) {
      alert("Failed to update balance");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure? This will fail if there are transactions associated with this account.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) {
      alert("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--muted)" }}>Manage Matrix Accounts</h3>
        <button className="btn" onClick={() => setShowAdd(true)}>+ Add Account</button>
      </div>

      {showAdd && (
        <div className="card" style={{ background: "var(--card-bg-2)", marginBottom: "1rem" }}>
          <form onSubmit={handleAddAccount}>
            <div className="responsive-grid" style={{ marginBottom: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Account Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Current Account" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="CHECKING">CHECKING</option>
                  <option value="SAVINGS">SAVINGS</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Initial Balance (£)</label>
              <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} required />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn" style={{ flex: 1 }} disabled={loading}>Save Account</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {accounts.map(acc => (
        <div key={acc.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg-2)" }}>
          <div>
            <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{acc.name}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{acc.type}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {editingId === acc.id ? (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  type="number" 
                  step="0.01"
                  value={balance} 
                  onChange={(e) => setBalance(e.target.value)}
                  style={{ width: "120px", padding: "0.4rem" }}
                  autoFocus
                />
                <button className="btn" style={{ padding: "0.4rem 0.8rem" }} onClick={() => handleUpdateBalance(acc.id, balance)} disabled={loading}>✓</button>
                <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem" }} onClick={() => setEditingId(null)}>✕</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--primary)" }}>£{acc.balance.toLocaleString()}</div>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.7rem" }}
                  onClick={() => {
                    setEditingId(acc.id);
                    setBalance(acc.balance.toString());
                  }}
                >
                  EDIT
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.7rem", color: "var(--danger)", border: "none" }}
                  onClick={() => handleDeleteAccount(acc.id)}
                >
                  DEL
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
