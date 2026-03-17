import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, email, password, role } = await req.json();

    if (id) {
      // Update existing
      const updateData: any = { name, email, role };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      const user = await prisma.user.update({
        where: { id },
        data: updateData
      });
      return NextResponse.json(user);
    } else {
      // Create new (Invite)
      const hashedPassword = await bcrypt.hash(password || "BudgetTrack2026!", 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role }
      });
      return NextResponse.json(user);
    }
  } catch (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
