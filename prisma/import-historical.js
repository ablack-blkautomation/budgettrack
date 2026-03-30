const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const BK_DIR = '/home/ablack/Projects/BudgetTrack/2026-03-13-BK';

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim().replace('*', ''));
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') inQuotes = !inQuotes;
      else if (line[i] === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += line[i];
      }
    }
    values.push(current.trim());
    
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

async function main() {
  console.log('Starting historical data import for Alastair & Laura...');

  const hashedPassword = await bcrypt.hash('BudgetTrack2026!', 10);

  // 1. Get/Create Users
  const alastair = await prisma.user.upsert({
    where: { email: 'alastairblack2@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'alastairblack2@gmail.com',
      name: 'Alastair Black',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const laura = await prisma.user.upsert({
    where: { email: 'laura1121@hotmail.co.uk' },
    update: {},
    create: {
      email: 'laura1121@hotmail.co.uk',
      name: 'Laura',
      password: hashedPassword,
      role: 'USER',
    },
  });

  console.log('Users verified.');

  // 2. Import Categories
  const categoriesData = parseCSV(path.join(BK_DIR, 'sure_categories.csv'));
  const categoryMap = new Map();

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { 
        name: cat.name, 
        color: cat.color || '#00ff88',
        monthlyBudget: 0 
      },
    });
    categoryMap.set(cat.name, created.id);
  }
  console.log(`Imported ${categoriesData.length} categories.`);

  // 3. Import Accounts
  const accountsData = parseCSV(path.join(BK_DIR, 'sure_accounts.csv'));
  const accountMap = new Map();

  for (const acc of accountsData) {
    let userId = alastair.id;
    if (acc.Name === 'LK') userId = laura.id;
    
    const type = acc.Account_type === 'Savings' ? 'SAVINGS' : 'CHECKING';
    
    const created = await prisma.account.create({
      data: {
        name: acc.Name,
        type: type,
        balance: parseFloat(acc.Balance) || 0,
        userId: userId
      }
    });
    accountMap.set(acc.Name, created.id);
  }
  console.log(`Imported ${accountsData.length} accounts.`);

  // 4. Import Transactions
  const transactionsData = parseCSV(path.join(BK_DIR, 'sure_transactions.csv'));
  let txCount = 0;

  for (const tx of transactionsData) {
    const accountId = accountMap.get(tx.account);
    const categoryId = categoryMap.get(tx.category);
    
    if (!accountId) continue;

    const [m, d, y] = tx.date.split('/');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));

    const originalAmount = parseFloat(tx.amount);
    const type = originalAmount >= 0 ? 'INCOME' : 'EXPENSE';

    await prisma.transaction.create({
      data: {
        amount: Math.abs(originalAmount),
        description: tx.name + (tx.notes ? ` (${tx.notes})` : ''),
        type: type,
        date: date,
        userId: alastair.id, // Linked to Alastair as primary importer
        accountId: accountId,
        categoryId: categoryId || null
      }
    });
    txCount++;
  }

  console.log(`Imported ${txCount} transactions.`);
  console.log('Import finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
