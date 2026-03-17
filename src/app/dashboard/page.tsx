import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { processScheduledPayments } from "@/lib/payments";
import { DashboardHistory } from "@/components/DashboardHistory";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  // Process any due scheduled payments
  if (userId) {
    await processScheduledPayments(userId);
  }

  // Fetch Accounts
  const accounts = await prisma.account.findMany({
    where: { userId }
  });

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Fetch Categories and current month transactions
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const categories = await prisma.category.findMany({
    include: {
      transactions: {
        where: {
          date: { gte: firstDayOfMonth },
          userId: userId
        }
      }
    }
  });

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    take: 10,
    orderBy: { date: 'desc' },
    include: { category: true, account: true, toAccount: true, user: true }
  });

  return (
    <div>
      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Total Balance</h3>
          <div className="stat-value">£{totalBalance.toLocaleString()}</div>
        </div>
        {accounts.map(acc => (
          <div key={acc.id} className="card stat-card">
            <h3>{acc.name}</h3>
            <div className="stat-value" style={{ fontSize: "1.2rem" }}>£{acc.balance.toLocaleString()}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>{acc.type}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <div className="card">
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Monthly Budgets</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {categories.map(cat => {
              const spent = cat.transactions.reduce((acc, curr) => acc + curr.amount, 0);
              const percentage = Math.min((spent / cat.monthlyBudget) * 100, 100);
              const isOver = spent > cat.monthlyBudget;
              const isClose = !isOver && (spent / cat.monthlyBudget) >= 0.8;
              
              const barColor = isOver ? "var(--danger)" : isClose ? "#fbbf24" : (cat.color || "var(--accent)");

              return (
                <div key={cat.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: "500", color: isOver ? 'var(--danger)' : isClose ? '#fbbf24' : 'inherit' }}>{cat.name}</span>
                    <span style={{ fontSize: "0.9rem" }}>
                      £{spent.toLocaleString()} / £{cat.monthlyBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        background: barColor,
                        boxShadow: `0 0 10px ${barColor}44`
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DashboardHistory 
          recentTransactions={recentTransactions} 
          categories={categories} 
          accounts={accounts} 
        />
      </div>
    </div>
  );
}
