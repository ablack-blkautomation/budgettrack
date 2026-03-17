const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('BudgetTrack2026!', 10);

  // Create Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const partnerUser = await prisma.user.upsert({
    where: { email: 'partner@example.com' },
    update: {},
    create: {
      email: 'partner@example.com',
      name: 'Partner',
      password: hashedPassword,
      role: 'USER',
    },
  });

  // Create Categories
  const categories = [
    { name: 'Rent/Mortgage', budget: 1500, color: '#FF5733' },
    { name: 'Groceries', budget: 400, color: '#00ff88' },
    { name: 'Utilities', budget: 200, color: '#3357FF' },
    { name: 'Dining Out', budget: 200, color: '#F333FF' },
    { name: 'Transport', budget: 150, color: '#33FFF3' },
    { name: 'Savings', budget: 500, color: '#FFBD33' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { monthlyBudget: cat.budget, color: cat.color },
      create: { name: cat.name, monthlyBudget: cat.budget, color: cat.color },
    });
  }

  // Create Initial Accounts for Admin if they don't have any
  const adminAccountsCount = await prisma.account.count({ where: { userId: adminUser.id } });
  if (adminAccountsCount === 0) {
    await prisma.account.create({
      data: {
        name: 'Main Checking',
        type: 'CHECKING',
        balance: 2500,
        userId: adminUser.id,
      },
    });
    await prisma.account.create({
      data: {
        name: 'Savings Account',
        type: 'SAVINGS',
        balance: 10000,
        userId: adminUser.id,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
