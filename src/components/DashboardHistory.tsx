"use client";

import { useState } from "react";
import { TransactionForm } from "./TransactionForm";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export function DashboardHistory({ 
  recentTransactions, 
  categories, 
  accounts 
}: { 
  recentTransactions: any[], 
  categories: any[], 
  accounts: any[] 
}) {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Recent Transactions</h2>
        <Link href="/dashboard/transactions" style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>
          VIEW ALL ⌛
        </Link>
      </div>

      <ul className="transaction-list">
        {recentTransactions.length === 0 && (
          <p style={{ color: "var(--muted)", textAlign: "center", padding: "2rem 0" }}>No transactions yet.</p>
        )}
        {recentTransactions.map(tx => (
          <li 
            key={tx.id} 
            className="transaction-item" 
            onClick={() => setSelectedTransaction(tx)}
            style={{ cursor: "pointer" }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
              <div style={{ fontWeight: "500", fontSize: "0.9rem", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tx.type === 'TRANSFER' ? (
                  <span style={{ color: '#a78bfa' }}>Transfer: {tx.account.name} → {tx.toAccount?.name}</span>
                ) : (
                  tx.description || tx.category?.name || "Uncategorized"
                )}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {formatDate(tx.date)} • {tx.user.name}
              </div>
            </div>
            <div className={tx.type === "EXPENSE" ? "amount-expense" : tx.type === "TRANSFER" ? "" : "amount-income"} style={{ whiteSpace: 'nowrap', color: tx.type === 'TRANSFER' ? '#a78bfa' : '' }}>
              {tx.type === "EXPENSE" ? "-" : tx.type === "TRANSFER" ? "⇄" : "+"}£{tx.amount.toLocaleString()}
            </div>
          </li>
        ))}
      </ul>

      {selectedTransaction && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, backdropFilter: "blur(5px)", padding: "1rem"
        }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
            <button 
              onClick={() => setSelectedTransaction(null)}
              style={{
                position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none",
                color: "var(--muted)", cursor: "pointer", fontSize: "1.5rem", zIndex: 1
              }}
            >
              ×
            </button>
            <TransactionForm 
              categories={categories} 
              accounts={accounts} 
              initialData={selectedTransaction}
              onSuccess={() => setSelectedTransaction(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
