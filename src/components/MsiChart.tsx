import React from 'react';
import { Line } from 'react-chartjs-2';
import '../components/charts/ChartSetup';

interface Props {
  labels: string[];
  dataPoints: number[];
}

export const MsiChart = ({ labels, dataPoints }: Props) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Carga Mensual MSI',
        data: dataPoints,
        borderColor: '#D98C75',
        backgroundColor: 'rgba(217, 140, 117, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { display: false }, x: { grid: { display: false } } }
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
};

export default MsiChart;
