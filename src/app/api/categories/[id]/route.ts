import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('targetId');

  try {
    // Perform in transaction to move all relations safely
    await prisma.$transaction(async (tx) => {
      // 1. Update transactions to new category
      await tx.transaction.updateMany({
        where: { categoryId: id },
        data: { categoryId: targetId || null }
      });

      // 2. Update scheduled payments to new category
      await tx.scheduledPayment.updateMany({
        where: { categoryId: id },
        data: { categoryId: targetId || null }
      });

      // 3. Delete the category itself
      await tx.category.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
