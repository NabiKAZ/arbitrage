/**
 * Arbitrage Trading Simulator
 * 
 * This script simulates arbitrage trading between two cryptocurrency exchanges using generated price data.
 * It identifies arbitrage opportunities, executes trades, and tracks wallet balances and profits.
 * At the end of the simulation, it generates a price chart visualization and prints trading statistics.
 * 
 * @repository https://github.com/NabiKAZ/arbitrage
 * @author NabiKAZ <https://x.com/NabiKAZ>
 * @channel https://t.me/BotSorati
 * @license GPL-3.0
 * @created 2025
 * 
 */

import { simulatePrices } from './price_simulator.mjs';
import chalk from 'chalk';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'; // Chart library for visualization
import fs from 'fs';

/**
 * Wallet class representing exchange wallets with two assets
 */
class Wallet {
    constructor(x = 100, y = 100) {  // Initial balance set to 100 for both assets
        this.X = x; // Base asset (e.g., USD, IRR)
        this.Y = y; // Quote asset (e.g., BTC, ETH)
    }
}

/**
 * Arbitrage trading function that identifies and executes arbitrage opportunities
 * @param {Object} prices - Price data from two exchanges
 * @param {number} feeA - Trading fee for exchange A (default: 0.5%)
 * @param {number} feeB - Trading fee for exchange B (default: 0.5%)
 * @param {number} tradePercent - Percentage of wallet to use per trade (default: 10%)
 * @param {number} minTradeAmountA - Minimum trade amount for exchange A
 * @param {number} minTradeAmountB - Minimum trade amount for exchange B
 * @returns {number} Total profit generated
 */
function arbitrageTrader(prices, feeA = 0.005, feeB = 0.005, tradePercent = 0.1, minTradeAmountA = 2, minTradeAmountB = 2) {
    const walletA = new Wallet();
    const walletB = new Wallet();
    let totalProfit = 0;
    let totalInitialX = walletA.X + walletB.X;  // Total initial X across both wallets
    let tradeCount = 0;
    let missedOpportunities = 0;
    let buyCount = 0;
    let sellCount = 0;

    // Data arrays for chart visualization
    let priceAData = [];
    let priceBData = [];

    prices.exchangeA.forEach((priceA, index) => {
        const priceB = prices.exchangeB[index];

        // Add prices to arrays for chart visualization
        priceAData.push(priceA);
        priceBData.push(priceB);

        // Check arbitrage opportunity: Buy from A and sell at B
        const buyPriceFromA = priceA * (1 + feeA);
        const sellPriceToB = priceB * (1 - feeB);

        let tradeMade = false;

        // Check minimum conditions for buying from A and selling at B
        const tradeAmountX = walletA.X * tradePercent; // Trade amount based on percentage
        const amountY = tradeAmountX / buyPriceFromA; // Convert X to Y based on buy price

        if (sellPriceToB > buyPriceFromA && tradeAmountX >= minTradeAmountA) {
            walletA.X -= tradeAmountX;
            walletA.Y += amountY;

            const sellAmountX = amountY * sellPriceToB; // Convert Y to X when selling

            walletB.Y -= amountY;
            walletB.X += sellAmountX;

            const profit = sellAmountX - tradeAmountX;
            const profitPercent = (profit / tradeAmountX) * 100; // Calculate profit percentage
            totalProfit += profit;
            tradeCount++;
            buyCount++;
            tradeMade = true;

            console.log(chalk.green(`Arbitrage Opportunity (A->B): Buy from A at ${priceA.toFixed(2)}, Sell at B at ${priceB.toFixed(2)} - Profit: $${profit.toFixed(2)} (${profitPercent.toFixed(2)}%) - Trade Amount: $${tradeAmountX.toFixed(2)}`));
        }

        // Check reverse arbitrage opportunity: Buy from B and sell at A
        const buyPriceFromB = priceB * (1 + feeB);
        const sellPriceToA = priceA * (1 - feeA);

        const tradeAmountXB = walletB.X * tradePercent; // Trade amount based on percentage
        const amountYB = tradeAmountXB / buyPriceFromB; // Convert X to Y based on buy price

        if (sellPriceToA > buyPriceFromB && tradeAmountXB >= minTradeAmountB) {
            walletB.X -= tradeAmountXB;
            walletB.Y += amountYB;

            const sellAmountX = amountYB * sellPriceToA; // Convert Y to X when selling

            walletA.Y -= amountYB;
            walletA.X += sellAmountX;

            const profit = sellAmountX - tradeAmountXB;
            const profitPercent = (profit / tradeAmountXB) * 100; // Calculate profit percentage
            totalProfit += profit;
            tradeCount++;
            sellCount++;
            tradeMade = true;

            console.log(chalk.cyan(`Arbitrage Opportunity (B->A): Buy from B at ${priceB.toFixed(2)}, Sell at A at ${priceA.toFixed(2)} - Profit: $${profit.toFixed(2)} (${profitPercent.toFixed(2)}%) - Trade Amount: $${tradeAmountXB.toFixed(2)}`));
        }

        if (!tradeMade) {
            missedOpportunities++;
            console.log(chalk.yellow(`No Arbitrage Opportunity: PriceA = ${priceA.toFixed(2)}, PriceB = ${priceB.toFixed(2)}`));
        }

        console.log(walletA, walletB);
    });

    const finalWalletX = walletA.X + walletB.X;  // Final total X across both wallets
    const totalProfitPercent = ((totalProfit / totalInitialX) * 100).toFixed(2);  // Calculate profit percentage relative to X

    console.log(`\n${chalk.green(`Final Wallet A: X=${walletA.X.toFixed(2)}, Y=${walletA.Y.toFixed(2)}`)}`);
    console.log(`${chalk.green(`Final Wallet B: X=${walletB.X.toFixed(2)}, Y=${walletB.Y.toFixed(2)}`)}`);
    console.log(`${chalk.cyan(`Total Profit: $${totalProfit.toFixed(2)} (${totalProfitPercent}%)`)}`);
    console.log(`${chalk.blue(`Total Trades: ${tradeCount} (Buy: ${buyCount}, Sell: ${sellCount}, Missed: ${missedOpportunities})`)}`);
    
    // Generate price chart visualization
    drawPriceChart(priceAData, priceBData);

    return totalProfit;
}

/**
 * Generate and save price chart visualization
 * @param {Array} priceAData - Price data for exchange A
 * @param {Array} priceBData - Price data for exchange B
 */
function drawPriceChart(priceAData, priceBData) {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 400, backgroundColour: 'white' });

    const config = {
        type: 'line',
        data: {
            labels: priceAData.map((_, index) => index + 1), // X-axis labels
            datasets: [
                {
                    label: 'Price A',
                    data: priceAData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                },
                {
                    label: 'Price B',
                    data: priceBData,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price'
                    }
                }
            },
        },
    };

    chartJSNodeCanvas.renderToBuffer(config).then(buffer => {
        fs.writeFileSync('price_chart.png', buffer);
        console.log(chalk.blue('Price chart saved as price_chart.png'));
    });
}

// Execute simulation with sample parameters
const prices = simulatePrices(100, 0.5, 100);
arbitrageTrader(prices, 0.005, 0.005, 0.3, 30, 30);
