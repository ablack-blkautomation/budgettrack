"use client";

import { useState } from "react";
import { TransactionForm } from "./TransactionForm";
import { formatDate } from "@/lib/utils";

export function TransactionHistory({ 
  initialTransactions, 
  categories, 
  accounts 
}: { 
  initialTransactions: any[], 
  categories: any[], 
  accounts: any[] 
}) {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  return (
    <div className="dashboard-main-grid">
      <div className="card">
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>History Matrix</h2>
        <ul className="transaction-list">
          {initialTransactions.map(tx => (
            <li 
              key={tx.id} 
              className="transaction-item" 
              onClick={() => setSelectedTransaction(tx)}
              style={{ cursor: "pointer", borderLeft: selectedTransaction?.id === tx.id ? "3px solid var(--primary)" : "none" }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                <div style={{ fontWeight: "500", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.type === 'TRANSFER' ? (
                    <span style={{ color: '#a78bfa' }}>Transfer: {tx.account.name} → {tx.toAccount?.name}</span>
                  ) : (
                    tx.description || tx.category?.name || "Uncategorized"
                  )}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {formatDate(tx.date)} • {tx.account.name} {tx.type === 'TRANSFER' ? '' : `• ${tx.category?.name || "No Category"}`} • {tx.user.name}
                </div>
              </div>
              <div className={tx.type === "EXPENSE" ? "amount-expense" : tx.type === "TRANSFER" ? "" : "amount-income"} style={{ fontWeight: "600", whiteSpace: 'nowrap', color: tx.type === 'TRANSFER' ? '#a78bfa' : '' }}>
                {tx.type === "EXPENSE" ? "-" : tx.type === "TRANSFER" ? "⇄" : "+"}£{tx.amount.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {selectedTransaction ? (
          <div style={{ position: "sticky", top: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem" }}>Edit Mode</h3>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: "0.7rem", padding: "0.4rem 0.8rem" }}
                onClick={() => setSelectedTransaction(null)}
              >
                Cancel
              </button>
            </div>
            <TransactionForm 
              categories={categories} 
              accounts={accounts} 
              initialData={selectedTransaction}
              onSuccess={() => setSelectedTransaction(null)}
            />
          </div>
        ) : (
          <TransactionForm categories={categories} accounts={accounts} />
        )}
      </div>
    </div>
  );
}
