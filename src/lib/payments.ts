import { prisma } from "./prisma";

/**
 * Process all scheduled payments due across the entire system.
 * This runs when any user visits the dashboard.
 */
export async function processScheduledPayments() {
  const now = new Date();
  
  // Find all active scheduled payments that are due (System-wide)
  const duePayments = await prisma.scheduledPayment.findMany({
    where: {
      active: true,
      nextRunDate: { lte: now }
    },
    include: {
      account: true // Need account to update balance and know user
    }
  });

  if (duePayments.length === 0) return;

  for (const payment of duePayments) {
    await prisma.$transaction(async (tx) => {
      // Create the transaction record
      await tx.transaction.create({
        data: {
          amount: payment.amount,
          description: `[Recurring] ${payment.description}`,
          type: payment.type,
          categoryId: payment.categoryId,
          accountId: payment.accountId,
          userId: payment.account.userId, // Attributed to account owner
          date: payment.nextRunDate,
        }
      });

      // Update account balance
      const balanceChange = payment.type === "EXPENSE" ? -payment.amount : payment.amount;
      await tx.account.update({
        where: { id: payment.accountId },
        data: {
          balance: { increment: balanceChange }
        }
      });

      // Update the scheduled payment with the next run date
      let nextDate = new Date(payment.nextRunDate);
      if (payment.frequency === "MONTHLY") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (payment.frequency === "WEEKLY") {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (payment.frequency === "DAILY") {
        nextDate.setDate(nextDate.getDate() + 1);
      }

      await tx.scheduledPayment.update({
        where: { id: payment.id },
        data: {
          nextRunDate: nextDate
        }
      });
    });
  }
}
