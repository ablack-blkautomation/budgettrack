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
  topCategoriesData,
  savingsData
}: { 
  netWorthData: any, 
  incomeExpenseData: any,
  topCategoriesData: any,
  savingsData: any
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
      {/* Primary Evolution Chart */}
      <div className="card" style={{ height: "400px" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Capital Evolution Matrix</h2>
        <div style={{ height: "300px" }}>
          <Line 
            options={chartOptions} 
            data={{
              labels: netWorthData.labels,
              datasets: [
                {
                  label: 'Net Worth (£)',
                  data: netWorthData.values,
                  borderColor: '#a78bfa',
                  backgroundColor: 'rgba(167, 139, 250, 0.1)',
                  fill: true,
                  tension: 0.4
                },
                {
                  label: 'Savings (£)',
                  data: savingsData.values,
                  borderColor: '#00ff88',
                  borderDash: [5, 5],
                  tension: 0.4
                },
                {
                  label: 'Checking (£)',
                  data: savingsData.checkingValues,
                  borderColor: '#fbbf24',
                  borderDash: [2, 2],
                  tension: 0.4
                }
              ]
            }} 
          />
        </div>
      </div>

      {/* Savings Progress Chart */}
      <div className="card" style={{ height: "400px" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Strategic Savings vs Target</h2>
        <div style={{ height: "300px" }}>
          <Line 
            options={chartOptions} 
            data={{
              labels: savingsData.labels,
              datasets: [
                {
                  label: 'Current Savings',
                  data: savingsData.values,
                  borderColor: '#00ff88',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  fill: true,
                  tension: 0.4
                },
                {
                  label: 'Savings Target',
                  data: savingsData.target,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 2,
                  pointRadius: 0,
                  fill: false,
                  borderDash: [10, 5],
                }
              ]
            }} 
          />
        </div>
      </div>

      <div className="responsive-grid">
        <div className="card" style={{ height: "400px" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Cash Flow Matrix</h2>
          <div style={{ height: "300px" }}>
            <Bar 
              options={chartOptions} 
              data={{
                labels: incomeExpenseData.labels,
                datasets: [
                  { label: 'Income', data: incomeExpenseData.income, backgroundColor: '#00ff88' },
                  { label: 'Outgoings', data: incomeExpenseData.expense, backgroundColor: '#ef4444' }
                ]
              }} 
            />
          </div>
        </div>

        <div className="card" style={{ height: "400px" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Sector Allocation</h2>
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
