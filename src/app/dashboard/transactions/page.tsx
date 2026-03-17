import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { TransactionHistory } from "@/components/TransactionHistory";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [categories, accounts, transactions] = await Promise.all([
    prisma.category.findMany(),
    prisma.account.findMany(),
    prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: { category: true, account: true, toAccount: true, user: true },
      take: 100 // Increased for shared view
    })
  ]);

  return (
    <TransactionHistory 
      initialTransactions={transactions} 
      categories={categories} 
      accounts={accounts} 
    />
  );
}
