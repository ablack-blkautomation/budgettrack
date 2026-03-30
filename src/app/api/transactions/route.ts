import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const { amount, description, type, categoryId, accountId, toAccountId, date, recurring } = await req.json();

    if (!amount || !accountId) {
      return NextResponse.json({ error: "Amount and Account are required" }, { status: 400 });
    }

    if (type === "TRANSFER" && !toAccountId) {
      return NextResponse.json({ error: "Destination account is required for transfers" }, { status: 400 });
    }

    // Validate account type for expenses
    if (type === "EXPENSE") {
      const account = await prisma.account.findUnique({ where: { id: accountId } });
      if (account?.type !== "CHECKING") {
        return NextResponse.json({ error: "Expenses can only be posted from Checking accounts" }, { status: 400 });
      }
    }

    // Execute in a transaction to ensure balance is updated
    const result = await prisma.$transaction(async (tx) => {
      const parsedDate = date ? new Date(date) : new Date();

      // Create the transaction
      const newTransaction = await tx.transaction.create({
        data: {
          amount: parseFloat(amount),
          description,
          type,
          categoryId: type === "TRANSFER" ? null : categoryId,
          accountId,
          toAccountId: type === "TRANSFER" ? toAccountId : null,
          userId,
          date: parsedDate,
        }
      });

      // Handle Recurring
      if (recurring && type !== "TRANSFER") {
        const nextDate = new Date(parsedDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        
        await tx.scheduledPayment.create({
          data: {
            amount: parseFloat(amount),
            description: description || "Recurring Payment",
            frequency: "MONTHLY",
            type: type, // Pass the type (INCOME or EXPENSE)
            nextRunDate: nextDate,
            categoryId: categoryId || null,
            accountId,
          }
        });
      }

      // Update account balances
      if (type === "TRANSFER") {
        // Decrease source
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: parseFloat(amount) } }
        });
        // Increase destination
        await tx.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: parseFloat(amount) } }
        });
      } else {
        const balanceChange = type === "EXPENSE" ? -parseFloat(amount) : parseFloat(amount);
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: { increment: balanceChange }
          }
        });
      }

      return newTransaction;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
