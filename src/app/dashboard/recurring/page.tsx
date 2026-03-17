import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@ /app/api/auth/[...nextauth]/route";
import { formatDate } from "@/lib/utils";

export default async function RecurringPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Fetch all recurring payments across the system
  const recurring = await prisma.scheduledPayment.findMany({
    include: { 
      category: true, 
      account: {
        include: { user: { select: { name: true } } }
      } 
    }
  });

  return (
    <div style={{ maxWidth: "800px" }}>
      <div className="card">
        <h2 style={{ marginBottom: "1.5rem" }}>Shared Recurring Payments</h2>
        {recurring.length === 0 ? (
          <p style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>No recurring payments scheduled.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {recurring.map(pay => (
              <div key={pay.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1c1c22" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{pay.description}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                    {pay.frequency} • Next: {formatDate(pay.nextRunDate)} • {pay.account.name} ({pay.account.user.name})
                  </div>
                </div>
                <div style={{ fontWeight: "700", color: pay.type === 'INCOME' ? 'var(--primary)' : 'var(--danger)' }}>
                  {pay.type === 'INCOME' ? '+' : '-'}£{pay.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
        <p style={{ marginTop: "2rem", color: "var(--muted)", fontSize: "0.9rem", textAlign: "center" }}>
          Automated payments are processed when anyone visits the dashboard.
        </p>
      </div>
    </div>
  );
}
