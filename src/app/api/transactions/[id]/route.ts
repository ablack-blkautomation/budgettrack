import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id: transactionId } = await params;

  try {
    const { amount, description, type, categoryId, accountId, toAccountId, date } = await req.json();

    const existingTx = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!existingTx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    // Validate account type for expenses
    if (type === "EXPENSE") {
      const account = await prisma.account.findUnique({ where: { id: accountId } });
      if (account?.type !== "CHECKING") {
        return NextResponse.json({ error: "Expenses can only be posted from Checking accounts" }, { status: 400 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Revert previous balance changes
      if (existingTx.type === "TRANSFER") {
        await tx.account.update({
          where: { id: existingTx.accountId },
          data: { balance: { increment: existingTx.amount } }
        });
        if (existingTx.toAccountId) {
          await tx.account.update({
            where: { id: existingTx.toAccountId },
            data: { balance: { decrement: existingTx.amount } }
          });
        }
      } else {
        const revertChange = existingTx.type === "EXPENSE" ? existingTx.amount : -existingTx.amount;
        await tx.account.update({
          where: { id: existingTx.accountId },
          data: { balance: { increment: revertChange } }
        });
      }

      // 2. Update the transaction
      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          amount: parseFloat(amount),
          description,
          type,
          categoryId: type === "TRANSFER" ? null : categoryId,
          accountId,
          toAccountId: type === "TRANSFER" ? toAccountId : null,
          date: new Date(date),
        }
      });

      // 3. Apply new balance changes
      if (type === "TRANSFER") {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: parseFloat(amount) } }
        });
        if (toAccountId) {
          await tx.account.update({
            where: { id: toAccountId },
            data: { balance: { increment: parseFloat(amount) } }
          });
        }
      } else {
        const newChange = type === "EXPENSE" ? -parseFloat(amount) : parseFloat(amount);
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: newChange } }
        });
      }

      return updatedTx;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update Transaction Error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id: transactionId } = await params;

  try {
    const existingTx = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!existingTx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // Revert balance changes
      if (existingTx.type === "TRANSFER") {
        await tx.account.update({
          where: { id: existingTx.accountId },
          data: { balance: { increment: existingTx.amount } }
        });
        if (existingTx.toAccountId) {
          await tx.account.update({
            where: { id: existingTx.toAccountId },
            data: { balance: { decrement: existingTx.amount } }
          });
        }
      } else {
        const revertChange = existingTx.type === "EXPENSE" ? existingTx.amount : -existingTx.amount;
        await tx.account.update({
          where: { id: existingTx.accountId },
          data: { balance: { increment: revertChange } }
        });
      }

      // Delete the transaction
      await tx.transaction.delete({
        where: { id: transactionId }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Transaction Error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
