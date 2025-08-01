/**
 * Real-time Orderbook Data Collector
 * This module continuously fetches orderbook data from multiple Iranian cryptocurrency exchanges
 * and stores them in a SQLite database for arbitrage analysis
 * 
 * @repository https://github.com/NabiKAZ/arbitrage
 * @author NabiKAZ <https://x.com/NabiKAZ>
 * @channel https://t.me/BotSorati
 * @license GPL-3.0
 * @created 2025
 * 
 */

import fetch from 'node-fetch';
import moment from 'moment-timezone';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { databaseConfig } from './trading_config.mjs';

// Configuration for supported exchanges and their API endpoints
const urls = [
    { name: 'nobitex', url: 'https://api.nobitex.ir/v3/orderbook/BTCIRT' },
    { name: 'ompfinex', url: 'https://api.ompfinex.com/v1/orderbook' },
    { name: 'raastin', url: 'https://api.raastin.com/api/v1/market/depth/BTCIRT/' },
    { name: 'ramzinex', url: 'https://publicapi.ramzinex.com/exchange/api/v1.0/exchange/orderbooks/2/buys_sells' },
    { name: 'exir', url: 'https://api.exir.io/v2/orderbook?symbol=btc-irt' },
    { name: 'wallex', url: 'https://api.wallex.ir/v1/depth?symbol=BTCTMN' },
]

// Initialize database connection
const db = await open({
    filename: databaseConfig.filename,
    driver: sqlite3.Database
});

/**
 * Sleep utility function for adding delays between API calls
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main data collection loop
while (true) {
    const date = moment().tz("Asia/Tehran").format("YYYY-MM-DD HH:mm:ss");

    for (const url of urls) {
        console.log(url.name.toUpperCase());

        try {
            // Fetch orderbook data from exchange API
            let res = await fetch(url.url);
            res = await res.json();

            // Handle exchange-specific response formats
            if (url.name === 'ompfinex') {
                res = res.data['BTCIRR'];
            }

            if (url.name === 'exir') {
                res = res['btc-irt'];
            }

            console.log(res);
            res = JSON.stringify(res);

            // Store data in database
            const { lastID } = await db.run('INSERT INTO orderbooks (date, name, data) VALUES (?, ?, ?)', [date, url.name, res]);
            console.log(`Saved #${lastID}`);
            
        } catch (error) {
            console.error(`Error fetching data from ${url.name}:`, error.message);
        }
        
        console.log('----------------------------------------');
    }
    
    console.log('========================================');
    // Wait 5 seconds before next data collection cycle
    await sleep(5 * 1000);
}

await db.close();
