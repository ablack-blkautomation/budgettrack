import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AccountManager } from "@/components/AccountManager";

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const accounts = await prisma.account.findMany({
    where: { userId }
  });

  return (
    <div style={{ maxWidth: "800px" }}>
      <div className="card">
        <header style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>Account Management Matrix</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Add, edit, or remove your financial access points.</p>
        </header>

        <AccountManager accounts={accounts} />
      </div>
    </div>
  );
}
