import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AccountManager } from "@/components/AccountManager";

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const accounts = await prisma.account.findMany({
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  return (
    <div style={{ maxWidth: "1000px" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Accounts Matrix</h1>
        <p style={{ color: "var(--muted)" }}>Shared liquidity and capital management.</p>
      </header>

      <AccountManager accounts={accounts} />
    </div>
  );
}
