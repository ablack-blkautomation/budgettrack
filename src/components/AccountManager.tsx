"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountManager({ accounts }: { accounts: any[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  
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

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          type, 
          balance: parseFloat(balance) 
        }),
      });
      if (res.ok) {
        setEditingAccount(null);
        router.refresh();
      }
    } catch (err) {
      alert("Failed to update account");
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

  const openEdit = (acc: any) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance.toString());
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--muted)" }}>Manage Matrix Accounts</h3>
        <button className="btn" onClick={() => setShowAdd(true)}>+ Add Account</button>
      </div>

      {(showAdd || editingAccount) && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(5px)", padding: "1rem"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "450px" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>{editingAccount ? "Edit Account" : "Add New Account"}</h3>
            <form onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount}>
              <div className="form-group">
                <label>Account Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Current Account" />
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="CHECKING">CHECKING</option>
                  <option value="SAVINGS">SAVINGS</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </div>

              <div className="form-group">
                <label>Current Balance (£)</label>
                <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} required />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="submit" className="btn" style={{ flex: 1 }} disabled={loading}>
                  {loading ? "Processing..." : "Save Changes"}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => { setShowAdd(false); setEditingAccount(null); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {accounts.map(acc => (
        <div key={acc.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg-2)" }}>
          <div>
            <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{acc.name}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{acc.type}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)" }}>£{acc.balance.toLocaleString()}</div>
            <button 
              className="btn btn-secondary" 
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.7rem" }}
              onClick={() => openEdit(acc)}
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
          </div>
        </div>
      ))}
    </div>
  );
}
