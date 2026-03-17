"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function FinancialCharts({ 
  netWorthData, 
  incomeExpenseData,
  topCategoriesData
}: { 
  netWorthData: any, 
  incomeExpenseData: any,
  topCategoriesData: any
}) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#8888a8', font: { family: 'Inter' } }
      },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8888a8' } },
      x: { grid: { display: false }, ticks: { color: '#8888a8' } }
    }
  };

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      {/* Net Worth Line Graph */}
      <div className="card" style={{ height: "400px" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Financial Value Evolution (Net Worth)</h2>
        <div style={{ height: "300px" }}>
          <Line 
            options={chartOptions} 
            data={{
              labels: netWorthData.labels,
              datasets: [{
                label: 'Total Balance (£)',
                data: netWorthData.values,
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                fill: true,
                tension: 0.4
              }]
            }} 
          />
        </div>
      </div>

      <div className="responsive-grid">
        {/* Income vs Outgoings Bar Chart */}
        <div className="card" style={{ height: "400px" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Income vs Outgoings</h2>
          <div style={{ height: "300px" }}>
            <Bar 
              options={chartOptions} 
              data={{
                labels: incomeExpenseData.labels,
                datasets: [
                  {
                    label: 'Income',
                    data: incomeExpenseData.income,
                    backgroundColor: '#00ff88',
                  },
                  {
                    label: 'Outgoings',
                    data: incomeExpenseData.expense,
                    backgroundColor: '#ef4444',
                  }
                ]
              }} 
            />
          </div>
        </div>

        {/* Top Categories Doughnut */}
        <div className="card" style={{ height: "400px" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Spending by Category</h2>
          <div style={{ height: "300px" }}>
            <Doughnut 
              options={{
                ...chartOptions,
                scales: { x: { display: false }, y: { display: false } }
              }} 
              data={{
                labels: topCategoriesData.labels,
                datasets: [{
                  data: topCategoriesData.values,
                  backgroundColor: topCategoriesData.colors,
                  borderWidth: 0,
                }]
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
