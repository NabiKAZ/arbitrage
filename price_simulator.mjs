/**
 * 
 * @repository https://github.com/NabiKAZ/arbitrage
 * @author NabiKAZ <https://x.com/NabiKAZ>
 * @channel https://t.me/BotSorati
 * @license GPL-3.0
 * @created 2025
 * 
 */

/**
 * Simulate price data for two exchanges with random fluctuations
 * @param {number} initialPrice - Starting price for both exchanges (default: 100)
 * @param {number} fluctuationChance - Probability of price increase vs decrease (default: 0.5)
 * @param {number} numPrices - Number of price points to generate (default: 100)
 * @returns {Object} Object containing price arrays for exchangeA and exchangeB
 */
export function simulatePrices(initialPrice = 100, fluctuationChance = 0.5, numPrices = 100) {
    const prices = { exchangeA: [], exchangeB: [] };

    let priceA = initialPrice;
    let priceB = initialPrice;

    for (let i = 0; i < numPrices; i++) {
        // Random walk with configurable direction probability
        priceA += (Math.random() < fluctuationChance ? 1 : -1) * (Math.random() * 2);
        priceB += (Math.random() < fluctuationChance ? 1 : -1) * (Math.random() * 2);

        // Store prices with 2 decimal precision
        prices.exchangeA.push(parseFloat(priceA.toFixed(2)));
        prices.exchangeB.push(parseFloat(priceB.toFixed(2)));
    }

    return prices;
}
