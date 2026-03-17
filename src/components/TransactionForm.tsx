"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { toISODate } from "@/lib/utils";

export function TransactionForm({ 
  categories, 
  accounts,
  onSuccess,
  initialData
}: { 
  categories: any[], 
  accounts: any[],
  onSuccess?: () => void,
  initialData?: any
}) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState(initialData?.type || "EXPENSE");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [accountId, setAccountId] = useState(initialData?.accountId || "");
  const [toAccountId, setToAccountId] = useState(initialData?.toAccountId || "");
  const [date, setDate] = useState(toISODate(initialData?.date || new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
    if (accounts.length > 1 && !toAccountId) {
      setToAccountId(accounts[1].id);
    }
  }, [accounts, accountId, toAccountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = initialData ? `/api/transactions/${initialData.id}` : "/api/transactions";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          type,
          categoryId: type === "TRANSFER" ? null : (categoryId || null),
          accountId,
          toAccountId: type === "TRANSFER" ? toAccountId : null,
          date: new Date(date).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save transaction");

      if (!initialData) {
        setAmount("");
        setDescription("");
      }
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !confirm("Are you sure you want to delete this transaction?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${initialData.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: "500px" }}>
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>
        {initialData ? "Edit Transaction" : "Log Activity"}
      </h2>
      
      {error && <div style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["EXPENSE", "INCOME", "TRANSFER"].map((t) => (
          <button 
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`btn ${type === t ? "" : "btn-secondary"}`}
            style={{ 
              flex: 1, 
              fontSize: "0.7rem", 
              padding: "0.6rem",
              background: type === t ? (t === 'INCOME' ? 'var(--primary)' : t === 'TRANSFER' ? 'var(--purple, #a78bfa)' : 'var(--danger)') : '',
              color: type === t ? '#000' : ''
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="form-group">
        <label>Amount (£)</label>
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
      </div>

      <div className="form-group">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>{type === "TRANSFER" ? "From Account" : "Account"}</label>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name} (£{acc.balance.toLocaleString()})</option>
          ))}
        </select>
      </div>

      {type === "TRANSFER" && (
        <div className="form-group">
          <label>To Account</label>
          <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} required>
            {accounts.filter(a => a.id !== accountId).map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} (£{acc.balance.toLocaleString()})</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Description</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this for?" />
      </div>

      {type === "EXPENSE" && (
        <div className="form-group">
          <label>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Uncategorized</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button type="submit" className="btn" style={{ flex: 1 }} disabled={loading}>
          {loading ? "Processing..." : initialData ? "Update" : `Log ${type}`}
        </button>
        {initialData && (
          <button type="button" onClick={handleDelete} className="btn" style={{ background: "var(--danger)", color: "#fff" }} disabled={loading}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
