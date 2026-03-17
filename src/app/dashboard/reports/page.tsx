import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FinancialCharts } from "@/components/FinancialCharts";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // We fetch the target from the current user, but the data is shared
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { savingsTarget: true }
  });

  const now = new Date();
  const months = [];
  const incomeHistory = [];
  const expenseHistory = [];
  
  // Historical data for specific account types (Global Shared)
  const savingsChangeHistory = [];
  const checkingChangeHistory = [];

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = start.toLocaleString('default', { month: 'short' });
    months.push(monthName);

    // Global income/expense
    const income = await prisma.transaction.aggregate({
      where: { type: 'INCOME', date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    const expense = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true }
    });

    incomeHistory.push(income._sum.amount || 0);
    expenseHistory.push(expense._sum.amount || 0);

    // Savings accounts changes
    const savingsIncome = await prisma.transaction.aggregate({
      where: { type: 'INCOME', account: { type: 'SAVINGS' }, date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    const savingsExpense = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE', account: { type: 'SAVINGS' }, date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    const savingsTransfersIn = await prisma.transaction.aggregate({
      where: { type: 'TRANSFER', toAccount: { type: 'SAVINGS' }, date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    const savingsTransfersOut = await prisma.transaction.aggregate({
      where: { type: 'TRANSFER', account: { type: 'SAVINGS' }, date: { gte: start, lte: end } },
      _sum: { amount: true }
    });

    savingsChangeHistory.push(
      (savingsIncome._sum.amount || 0) - (savingsExpense._sum.amount || 0) + 
      (savingsTransfersIn._sum.amount || 0) - (savingsTransfersOut._sum.amount || 0)
    );

    // Checking accounts changes
    const checkingIncome = await prisma.transaction.aggregate({
      where: { type: 'INCOME', account: { type: 'CHECKING' }, date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    const checkingExpense = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE', account: { type: 'CHECKING' }, date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    const checkingTransfersIn = await prisma.transaction.aggregate({
      where: { type: 'TRANSFER', toAccount: { type: 'CHECKING' }, date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    const checkingTransfersOut = await prisma.transaction.aggregate({
      where: { type: 'TRANSFER', account: { type: 'CHECKING' }, date: { gte: start, lte: end } },
      _sum: { amount: true }
    });

    checkingChangeHistory.push(
      (checkingIncome._sum.amount || 0) - (checkingExpense._sum.amount || 0) + 
      (checkingTransfersIn._sum.amount || 0) - (checkingTransfersOut._sum.amount || 0)
    );
  }

  // Calculate current balances to work backwards
  const accounts = await prisma.account.findMany();
  const currentTotal = accounts.reduce((acc, a) => acc + a.balance, 0);
  const currentSavings = accounts.filter(a => a.type === 'SAVINGS').reduce((acc, a) => acc + a.balance, 0);
  const currentChecking = accounts.filter(a => a.type === 'CHECKING').reduce((acc, a) => acc + a.balance, 0);

  const netWorthValues = new Array(6);
  const savingsValues = new Array(6);
  const checkingValues = new Array(6);

  let runTotal = currentTotal;
  let runSavings = currentSavings;
  let runChecking = currentChecking;

  netWorthValues[5] = runTotal;
  savingsValues[5] = runSavings;
  checkingValues[5] = runChecking;

  for (let i = 4; i >= 0; i--) {
    const totalChange = incomeHistory[i+1] - expenseHistory[i+1];
    runTotal -= totalChange;
    netWorthValues[i] = runTotal;

    runSavings -= savingsChangeHistory[i+1];
    savingsValues[i] = runSavings;

    runChecking -= checkingChangeHistory[i+1];
    checkingValues[i] = runChecking;
  }

  // Prepare chart data
  const chartData = {
    months,
    netWorth: netWorthValues,
    savings: savingsValues,
    checking: checkingValues,
    target: new Array(6).fill(user?.savingsTarget || 0),
    income: incomeHistory,
    expense: expenseHistory,
  };

  // Categories logic
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const categories = await prisma.category.findMany({
    include: { transactions: { where: { type: 'EXPENSE', date: { gte: startOfMonth } } } }
  });

  const colorPalette = ['#00ff88', '#a78bfa', '#fbbf24', '#3b82f6', '#f472b6', '#2dd4bf', '#fb7185', '#818cf8'];
  const categorySpending = categories
    .map((c, index) => ({
      name: c.name,
      amount: c.transactions.reduce((acc, t) => acc + t.amount, 0),
      color: c.color || colorPalette[index % colorPalette.length]
    }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const topCategoriesData = {
    labels: categorySpending.map(c => c.name),
    values: categorySpending.map(c => c.amount),
    colors: categorySpending.map(c => c.color)
  };

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <header>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Financial Intelligence</h1>
        <p style={{ color: "var(--muted)" }}>Strategic overview of the collective capital flow.</p>
      </header>

      <FinancialCharts 
        netWorthData={{ labels: months, values: netWorthValues }}
        incomeExpenseData={{ labels: months, income: incomeHistory, expense: expenseHistory }}
        topCategoriesData={topCategoriesData}
        savingsData={{ 
          labels: months, 
          values: savingsValues, 
          checkingValues: checkingValues,
          target: chartData.target 
        }}
      />

      <div className="card">
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Shared Summary Report</h2>
        <div className="responsive-grid">
          <div>
            <h3 style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>SAVINGS GOAL PROGRESS</h3>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: 'var(--primary)' }}>
              {user?.savingsTarget ? Math.round((currentSavings / user.savingsTarget) * 100) : 0}%
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Of £{(user?.savingsTarget || 0).toLocaleString()} target</p>
          </div>
          <div>
            <h3 style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>NET PROFIT/LOSS (6M)</h3>
            <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
              £{(incomeHistory.reduce((a,b)=>a+b,0) - expenseHistory.reduce((a,b)=>a+b,0)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
