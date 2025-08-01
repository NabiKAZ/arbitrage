/**
 * Orderbook Data Processor and Normalizer
 * This module reads stored orderbook data from the database, normalizes formats across
 * different exchanges, and provides analysis of real market data for arbitrage opportunities
 * 
 * @repository https://github.com/NabiKAZ/arbitrage
 * @author NabiKAZ <https://x.com/NabiKAZ>
 * @channel https://t.me/BotSorati
 * @license GPL-3.0
 * @created 2025
 * 
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { databaseConfig } from './trading_config.mjs';

// Initialize database connection
const db = await open({
    filename: databaseConfig.filename,
    driver: sqlite3.Database
});

/**
 * Normalize orderbook data from different exchange formats
 * Each exchange has its own API response format, this function standardizes them
 * @param {string} exchangeName - Name of the exchange
 * @param {Object} data - Raw orderbook data from exchange API
 * @returns {Object} Normalized orderbook with ask/bid structure
 */
export function normalizeOrderbook(exchangeName, data) {
    let ask = null;
    let bid = null;

    switch (exchangeName) {
        case 'nobitex':
            // Format: {"asks": [["price", "amount"]], "bids": [["price", "amount"]]}
            // Currency: Rial (no conversion needed)
            if (data.asks && data.asks.length > 0) {
                ask = {
                    price: parseFloat(data.asks[0][0]),
                    amount: parseFloat(data.asks[0][1])
                };
            }
            if (data.bids && data.bids.length > 0) {
                bid = {
                    price: parseFloat(data.bids[0][0]),
                    amount: parseFloat(data.bids[0][1])
                };
            }
            break;

        case 'ompfinex':
            // Format: {"asks": [{"price": "price", "amount": "amount"}], "bids": [{"price": "price", "amount": "amount"}]}
            // Currency: Rial (no conversion needed)
            // Special handling: In ompfinex, asks/bids are swapped
            // asks = buy orders, bids = sell orders (opposite of standard)
            // So we swap them: ask from bids[0], bid from asks[0]
            if (data.bids && data.bids.length > 0) {
                ask = {
                    price: parseFloat(data.bids[0].price),
                    amount: parseFloat(data.bids[0].amount)
                };
            }
            if (data.asks && data.asks.length > 0) {
                bid = {
                    price: parseFloat(data.asks[0].price),
                    amount: parseFloat(data.asks[0].amount)
                };
            }
            break;

        case 'raastin':
            // Format: {"asks": [{"price": "price", "amount": "amount"}], "bids": [{"price": "price", "amount": "amount"}]}
            // Currency: Toman (convert to Rial by multiplying by 10)
            if (data.asks && data.asks.length > 0) {
                ask = {
                    price: parseFloat(data.asks[0].price) * 10,
                    amount: parseFloat(data.asks[0].amount)
                };
            }
            if (data.bids && data.bids.length > 0) {
                bid = {
                    price: parseFloat(data.bids[0].price) * 10,
                    amount: parseFloat(data.bids[0].amount)
                };
            }
            break;

        case 'ramzinex':
            // Format: {"data": {"sells": [[price, amount, ...]], "buys": [[price, amount, ...]]}}
            // Currency: Rial (no conversion needed)
            if (data.data && data.data.sells && data.data.sells.length > 0) {
                ask = {
                    price: parseFloat(data.data.sells[0][0]),
                    amount: parseFloat(data.data.sells[0][1])
                };
            }
            if (data.data && data.data.buys && data.data.buys.length > 0) {
                bid = {
                    price: parseFloat(data.data.buys[0][0]),
                    amount: parseFloat(data.data.buys[0][1])
                };
            }
            break;

        case 'exir':
            // Format: {"asks": [[price, amount]], "bids": [[price, amount]]}
            // Currency: Toman (convert to Rial by multiplying by 10)
            if (data.asks && data.asks.length > 0) {
                ask = {
                    price: parseFloat(data.asks[0][0]) * 10,
                    amount: parseFloat(data.asks[0][1])
                };
            }
            if (data.bids && data.bids.length > 0) {
                bid = {
                    price: parseFloat(data.bids[0][0]) * 10,
                    amount: parseFloat(data.bids[0][1])
                };
            }
            break;

        case 'wallex':
            // Format: {"result": {"ask": [{"price": price, "quantity": quantity}], "bid": [{"price": price, "quantity": quantity}]}}
            // Currency: Toman (convert to Rial by multiplying by 10)
            if (data.result && data.result.ask && data.result.ask.length > 0) {
                ask = {
                    price: parseFloat(data.result.ask[0].price) * 10,
                    amount: parseFloat(data.result.ask[0].quantity)
                };
            }
            if (data.result && data.result.bid && data.result.bid.length > 0) {
                bid = {
                    price: parseFloat(data.result.bid[0].price) * 10,
                    amount: parseFloat(data.result.bid[0].quantity)
                };
            }
            break;

        default:
            console.warn(`Unknown exchange: ${exchangeName}`);
            break;
    }

    return { ask, bid };
}

/**
 * Validate orderbook data for consistency
 * @param {Object} exchange - Normalized exchange data
 * @returns {Object} Validation result with status and reason
 */
export function validateOrderbook(exchange) {
    if (!exchange.ask || !exchange.bid) {
        return { isValid: false, reason: 'Missing ask or bid data' };
    }
    
    if (exchange.ask.price <= exchange.bid.price) {
        return { 
            isValid: false, 
            reason: `Ask price (${exchange.ask.price}) should be higher than bid price (${exchange.bid.price})` 
        };
    }
    
    return { isValid: true };
}

// Process and analyze stored orderbook data
const orderbooks = {};
const rows = await db.all('SELECT * FROM orderbooks ORDER BY date ASC');

for (let row of rows) {
    try {
        const data = JSON.parse(row.data);
        const normalized = normalizeOrderbook(row.name, data);
        
        // Skip if no valid ask/bid data
        if (!normalized.ask && !normalized.bid) {
            continue;
        }

        const orderbook = {
            name: row.name,
            date: row.date,
            ask: normalized.ask,
            bid: normalized.bid
        };

        // Validate orderbook data
        const validation = validateOrderbook(orderbook);
        if (!validation.isValid) {
            console.warn(`⚠️  Invalid data for ${row.name} at ${row.date}: ${validation.reason}`);
            continue;
        }

        // Group by date for analysis
        if (!orderbooks[row.date]) {
            orderbooks[row.date] = [];
        }
        orderbooks[row.date].push(orderbook);
    } catch (error) {
        console.error(`Error parsing data for ${row.name} at ${row.date}:`, error);
    }
}

await db.close();

// Display analysis results
console.log('Available dates:', Object.keys(orderbooks));
for (const [date, exchanges] of Object.entries(orderbooks)) {
    console.log(`\n=== ${date} ===`);
    for (const exchange of exchanges) {
        console.log(`${exchange.name}:`);
        if (exchange.ask) {
            console.log(`  Ask: ${exchange.ask.price.toLocaleString()} (${exchange.ask.amount})`);
        }
        if (exchange.bid) {
            console.log(`  Bid: ${exchange.bid.price.toLocaleString()} (${exchange.bid.amount})`);
        }
        
        // Calculate and display spread percentage
        if (exchange.ask && exchange.bid) {
            const spread = ((exchange.ask.price - exchange.bid.price) / exchange.bid.price * 100).toFixed(4);
            console.log(`  Spread: ${spread}%`);
        }
    }
}
