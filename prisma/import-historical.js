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
    // Simple CSV parser that handles quotes if any (though sample doesn't show them)
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
  console.log('Starting historical data import...');

  const hashedPassword = await bcrypt.hash('BudgetTrack2026!', 10);

  // 1. Create Users
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

  const partner = await prisma.user.upsert({
    where: { email: 'partner@example.com' },
    update: {},
    create: {
      email: 'partner@example.com',
      name: 'Partner',
      password: hashedPassword,
      role: 'USER',
    },
  });

  console.log('Users created.');

  // 2. Import Categories
  const categoriesData = parseCSV(path.join(BK_DIR, 'sure_categories.csv'));
  const categoryMap = new Map();

  for (const cat of categoriesData) {
    const isIncome = cat.classification === 'income';
    // We'll use a default budget of 0 for now as it's not in the CSV
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: { color: cat.color || '#00ff88' },
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
    // Logic to assign user: AB -> Alastair, LK -> Partner, others -> Alastair
    let userId = alastair.id;
    if (acc.Name === 'LK') userId = partner.id;
    
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

    // Parse date MM/DD/YYYY
    const [m, d, y] = tx.date.split('/');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));

    const amount = Math.abs(parseFloat(tx.amount));
    // Determine type: Income if amount is positive in original data? 
    // Looking at sample: Starting Balance Wage is positive. Usual expenses usually negative?
    // In our CSV, amount is signed? Head showed positive 1523.36 for Wage.
    const originalAmount = parseFloat(tx.amount);
    const type = originalAmount >= 0 ? 'INCOME' : 'EXPENSE';

    await prisma.transaction.create({
      data: {
        amount: Math.abs(originalAmount),
        description: tx.name + (tx.notes ? ` (${tx.notes})` : ''),
        type: type,
        date: date,
        userId: alastair.id, // Assign to Alastair as creator for history
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
