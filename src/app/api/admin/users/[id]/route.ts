import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const { id } = params;

  try {
    // Check if user is trying to delete themselves
    if (id === (session.user as any).id) {
      return NextResponse.json({ error: "Cannot delete yourself while logged in" }, { status: 400 });
    }

    // Perform cascading delete manually since SQLite relation might not be configured for cascade
    await prisma.$transaction(async (tx) => {
      // 1. Delete transactions created by this user
      await tx.transaction.deleteMany({ where: { userId: id } });
      
      // 2. Delete scheduled payments for accounts owned by this user
      await tx.scheduledPayment.deleteMany({
        where: { account: { userId: id } }
      });

      // 3. Delete accounts owned by this user
      await tx.account.deleteMany({ where: { userId: id } });

      // 4. Delete the user
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Deletion failed - user might have complex dependencies" }, { status: 500 });
  }
}
