# 📊 BudgetTrack

**BudgetTrack** is a high-performance, private, and visually-driven personal finance manager. Gain absolute clarity over your capital flow with a sleek, dark-mode command center.

## 🚀 Features

- **Global Command Center:** Real-time overview of total balance and account health.
- **Strategic Budgeting:** Set monthly caps per category with visual progress alerts.
- **History Matrix:** Full lifecycle management for expenses, income, and transfers.
- **Automated Recurring Payments:** Subscriptions and bills process automatically.
- **Financial Intelligence:** 6-month Net Worth evolution, Cash Flow bar charts, and Category spending breakdowns.
- **Mobile First:** Fully responsive design with bottom-docked navigation.

## 🛠️ Built With

- **Framework:** [Next.js](https://nextjs.org/) (App Router + Turbopack)
- **Database:** [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Auth:** [NextAuth.js](https://next-auth.js.org/)
- **Charts:** [Chart.js](https://www.chartjs.org/)
- **Styling:** Vanilla CSS (Modern CSS Variables)

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### 2. Installation
```bash
git clone https://github.com/your-username/budgettrack.git
cd budgettrack
npm install
```

### 3. Environment Setup
Create a `.env` file based on the example:
```bash
cp .env.example .env
```
Generate a secret for NextAuth:
```bash
openssl rand -base64 32
```
Paste the result into `NEXTAUTH_SECRET` in your `.env`.

### 4. Database Setup
Initialize the SQLite database and seed initial categories:
```bash
npx prisma db push
npm run db:seed
```

### 5. Start the Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your matrix.

**Default Login:**
- **Email:** `admin@example.com`
- **Password:** `BudgetTrack2026!`

## 🛡️ Privacy & Security
BudgetTrack is designed to be self-hosted. Your data stays in your local SQLite database and never leaves your server. There are no third-party financial aggregators or data collection scripts.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ for financial sovereignty.
