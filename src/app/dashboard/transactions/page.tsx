import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { TransactionHistory } from "@/components/TransactionHistory";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const [categories, accounts, transactions] = await Promise.all([
    prisma.category.findMany(),
    prisma.account.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { category: true, account: true, toAccount: true, user: true },
      take: 50
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
