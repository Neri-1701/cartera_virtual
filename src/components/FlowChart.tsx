import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../components/charts/ChartSetup';

interface Props {
  labels: string[];
  debitData: number[];
  creditData: number[];
  msiData: number[];
}

export const FlowChart = ({ labels, debitData, creditData, msiData }: Props) => {
  const data = {
    labels,
    datasets: [
      { label: 'MSI (Comprometido)', data: msiData, backgroundColor: '#D98C75', stack: 'Stack 0' },
      { label: 'Crédito (Pago Único)', data: creditData, backgroundColor: '#5C7DA6', stack: 'Stack 0' },
      { label: 'Débito / Efectivo', data: debitData, backgroundColor: '#84A98C', stack: 'Stack 0' }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { position: 'bottom' as const }
    }
  };

  return (
    <div className="chart-container">
      <Bar data={data} options={options} />
    </div>
  );
};

export default FlowChart;
