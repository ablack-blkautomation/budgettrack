import { prisma } from "@/lib/prisma";
import { BudgetEditor } from "@/components/BudgetEditor";

export default async function BudgetsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div style={{ maxWidth: "800px" }}>
      <div className="card">
        <header style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>Monthly Budget Matrix</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Configure your monthly spending limits per category.</p>
        </header>
        
        <BudgetEditor categories={categories} />
      </div>
    </div>
  );
}
