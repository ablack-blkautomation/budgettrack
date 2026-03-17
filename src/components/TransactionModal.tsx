"use client";

import { useState } from "react";
import { TransactionForm } from "./TransactionForm";

export function TransactionModal({ categories, accounts }: { categories: any[], accounts: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="btn" 
        onClick={() => setIsOpen(true)}
        style={{ boxShadow: "0 0 20px rgba(0, 255, 136, 0.15)" }}
      >
        + Add Transaction
      </button>

      {isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(5px)"
        }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "1.5rem",
                zIndex: 1
              }}
            >
              ×
            </button>
            <TransactionForm 
              categories={categories} 
              accounts={accounts} 
              onSuccess={() => setIsOpen(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
