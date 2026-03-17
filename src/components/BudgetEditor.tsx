"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BudgetEditor({ categories }: { categories: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [color, setColor] = useState("#00ff88");
  
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (id?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: id ? name : name, monthlyBudget: value, color }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingId(null);
      setShowAdd(false);
      setName("");
      setValue("");
      router.refresh();
    } catch (err) {
      alert("Error saving category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${deletingId}?targetId=${targetId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDeletingId(null);
      setTargetId("");
      router.refresh();
    } catch (err) {
      alert("Error deleting category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--muted)" }}>Category Allocation</h3>
        <button className="btn" onClick={() => setShowAdd(true)}>+ Add Category</button>
      </div>

      {showAdd && (
        <div className="card" style={{ background: "var(--card-bg-2)", marginBottom: "1rem" }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="responsive-grid" style={{ marginBottom: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Travel" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Monthly Budget (£)</label>
                <input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Accent Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: "40px", padding: "2px" }} />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn" style={{ flex: 1 }} disabled={loading}>Create Category</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: cat.color || "var(--primary)" }}></div>
            {editingId === cat.id ? (
               <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "0.4rem", width: "150px" }} />
            ) : (
              <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{cat.name}</div>
            )}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {editingId === cat.id ? (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  type="number" 
                  step="0.01"
                  value={value} 
                  onChange={(e) => setValue(e.target.value)}
                  style={{ width: "100px", padding: "0.4rem" }}
                  autoFocus
                />
                <button className="btn" style={{ padding: "0.4rem 0.8rem" }} onClick={() => handleSave(cat.id)} disabled={loading}>✓</button>
                <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem" }} onClick={() => setEditingId(null)}>✕</button>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: "700", color: "var(--primary)" }}>£{cat.monthlyBudget.toLocaleString()}</div>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.7rem" }}
                  onClick={() => {
                    setEditingId(cat.id);
                    setName(cat.name);
                    setValue(cat.monthlyBudget.toString());
                    setColor(cat.color || "#00ff88");
                  }}
                >
                  EDIT
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.7rem", color: "var(--danger)", border: "none" }}
                  onClick={() => setDeletingId(cat.id)}
                >
                  DEL
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {deletingId && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(5px)"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "450px" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--danger)" }}>Delete Category</h3>
            <p style={{ marginBottom: "1.5rem", fontSize: "0.9rem", color: "var(--muted)" }}>
              If you have any transactions or recurring payments in this category, where would you like to move them?
            </p>
            
            <div className="form-group">
              <label>Target Category</label>
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} required>
                <option value="">(None - Set to Uncategorized)</option>
                {categories.filter(c => c.id !== deletingId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button className="btn" style={{ flex: 1, background: "var(--danger)" }} onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setDeletingId(null); setTargetId(""); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
