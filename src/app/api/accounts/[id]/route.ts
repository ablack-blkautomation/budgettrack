import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await context.params;

  try {
    const { name, type, balance } = await req.json();

    const account = await prisma.account.findUnique({
      where: { id }
    });

    if (!account || account.userId !== userId) {
      return NextResponse.json({ error: "Account not found or access denied" }, { status: 404 });
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: { 
        name: name || account.name,
        type: type || account.type,
        balance: balance !== undefined ? parseFloat(balance) : account.balance
      }
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await context.params;

  try {
    const account = await prisma.account.findUnique({
      where: { id }
    });

    if (!account || account.userId !== userId) {
      return NextResponse.json({ error: "Account not found or access denied" }, { status: 404 });
    }

    // This will delete the account and cascade delete transactions if configured in schema.
    // In our schema transactions aren't cascaded yet, so we need to handle that or let it fail
    // if there are existing relations. To be safe, we'll try to delete.
    await prisma.account.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Cannot delete account with existing transactions" }, { status: 400 });
  }
}
