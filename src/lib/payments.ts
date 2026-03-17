import { prisma } from "./prisma";

export async function processScheduledPayments(userId: string) {
  const now = new Date();
  
  // Find all active scheduled payments that are due
  const duePayments = await prisma.scheduledPayment.findMany({
    where: {
      active: true,
      nextRunDate: { lte: now },
      account: { userId: userId }
    },
    include: {
      account: true
    }
  });

  if (duePayments.length === 0) return;

  for (const payment of duePayments) {
    await prisma.$transaction(async (tx) => {
      // Create the transaction record
      await tx.transaction.create({
        data: {
          amount: payment.amount,
          description: `[Scheduled] ${payment.description}`,
          type: "EXPENSE",
          categoryId: payment.categoryId,
          accountId: payment.accountId,
          userId: userId,
          date: payment.nextRunDate,
        }
      });

      // Update account balance
      await tx.account.update({
        where: { id: payment.accountId },
        data: {
          balance: { decrement: payment.amount }
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
