import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, name, monthlyBudget, color } = await req.json();

    if (id) {
      // Update existing
      const updated = await prisma.category.update({
        where: { id },
        data: {
          name,
          monthlyBudget: parseFloat(monthlyBudget),
          color
        }
      });
      return NextResponse.json(updated);
    } else {
      // Create new
      const created = await prisma.category.create({
        data: {
          name,
          monthlyBudget: parseFloat(monthlyBudget) || 0,
          color: color || "#00ff88"
        }
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
