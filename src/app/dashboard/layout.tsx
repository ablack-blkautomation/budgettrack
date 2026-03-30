import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TransactionModal } from "@/components/TransactionModal";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [categories, accounts] = await Promise.all([
    prisma.category.findMany(),
    prisma.account.findMany()
  ]);

  return (
    <div>
      <Sidebar />
      <main className="main-content">
        <header className="dashboard-header" style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Hello, {session.user?.name}</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>Your financial matrix is active.</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <TransactionModal categories={categories} accounts={accounts} />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
