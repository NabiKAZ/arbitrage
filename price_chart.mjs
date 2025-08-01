/**
 * Price Chart Generator using QuickChart API
 * This module generates price charts for multiple exchanges using the QuickChart service
 * 
 * @repository https://github.com/NabiKAZ/arbitrage
 * @author NabiKAZ <https://x.com/NabiKAZ>
 * @channel https://t.me/BotSorati
 * @license GPL-3.0
 * @created 2025
 * 
 */

import QuickChart from 'quickchart-js';
import { simulatePrices } from './price_simulator.mjs';

// Generate sample price data
const prices = simulatePrices(100, 0.5, 100);

// Extract data for chart visualization
const marketA = prices.exchangeA;
const marketB = prices.exchangeB;
const labels = Array.from({ length: marketA.length }, (_, i) => i + 1); // X-axis labels

// Chart configuration
const chart = new QuickChart();
chart.setConfig({
  type: 'line',
  data: {
    labels: labels,
    datasets: [
      {
        label: 'Market A',
        data: marketA,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
      },
      {
        label: 'Market B',
        data: marketB,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Price Chart of Market A and Market B',
    },
  },
});

// Generate chart URL
const chartUrl = chart.getUrl();
console.log('Chart URL:', chartUrl);
