import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FinancialCharts } from "@/components/FinancialCharts";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const now = new Date();
  const months = [];
  const incomeHistory = [];
  const expenseHistory = [];

  // Generate the last 6 months labels and fetch income/expense data
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = start.toLocaleString('default', { month: 'short' });
    months.push(monthName);

    const income = await prisma.transaction.aggregate({
      where: { userId, type: 'INCOME', date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    const expense = await prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true }
    });

    incomeHistory.push(income._sum.amount || 0);
    expenseHistory.push(expense._sum.amount || 0);
  }

  // Calculate Net Worth Evolution
  // We start from current total balance and work backwards
  const currentTotalBalance = (await prisma.account.aggregate({
    where: { userId },
    _sum: { balance: true }
  }))._sum.balance || 0;

  const netWorthValues = new Array(6).fill(0);
  let runningBalance = currentTotalBalance;
  
  // Set current month (index 5)
  netWorthValues[5] = runningBalance;

  // Work backwards from month 4 down to 0
  for (let i = 4; i >= 0; i--) {
    // The balance at the end of month i is:
    // Balance at end of month (i+1) - (Net change during month i+1)
    const netChangeNextMonth = incomeHistory[i + 1] - expenseHistory[i + 1];
    runningBalance -= netChangeNextMonth;
    netWorthValues[i] = runningBalance;
  }

  // Top Spending Categories with vibrant colors
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const categories = await prisma.category.findMany({
    include: {
      transactions: {
        where: { userId, type: 'EXPENSE', date: { gte: startOfMonth } }
      }
    }
  });

  const colorPalette = [
    '#00ff88', // Emerald
    '#a78bfa', // Violet
    '#fbbf24', // Amber
    '#3b82f6', // Blue
    '#f472b6', // Pink
    '#2dd4bf', // Teal
    '#fb7185', // Rose
    '#818cf8', // Indigo
  ];

  const categorySpending = categories
    .map((c, index) => ({
      name: c.name,
      amount: c.transactions.reduce((acc, t) => acc + t.amount, 0),
      color: c.color || colorPalette[index % colorPalette.length]
    }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  // If there's overlap in colors, force unique ones from palette
  categorySpending.forEach((c, i) => {
    if (!categories.find(cat => cat.id === c.name)?.color) {
      c.color = colorPalette[i % colorPalette.length];
    }
  });

  const topCategoriesData = {
    labels: categorySpending.map(c => c.name),
    values: categorySpending.map(c => c.amount),
    colors: categorySpending.map(c => c.color)
  };

  const incomeExpenseData = {
    labels: months,
    income: incomeHistory,
    expense: expenseHistory
  };

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <header>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Financial Intelligence</h1>
        <p style={{ color: "var(--muted)" }}>Strategic overview of your capital flow.</p>
      </header>

      <FinancialCharts 
        netWorthData={{ labels: months, values: netWorthValues }}
        incomeExpenseData={incomeExpenseData}
        topCategoriesData={topCategoriesData}
      />

      <div className="card">
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Summary Report</h2>
        <div className="responsive-grid">
          <div>
            <h3 style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>THIS MONTH'S PROFIT/LOSS</h3>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: (incomeHistory[5] - expenseHistory[5]) >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
              £{(incomeHistory[5] - expenseHistory[5]).toLocaleString()}
            </div>
          </div>
          <div>
            <h3 style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>TOTAL CASH ON HAND</h3>
            <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
              £{currentTotalBalance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
