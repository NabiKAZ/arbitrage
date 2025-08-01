# Cryptocurrency Arbitrage Data Collection & Analysis

A comprehensive toolkit for collecting, analyzing, and visualizing real-time cryptocurrency orderbook data from multiple Iranian exchanges for arbitrage opportunity detection.

## 🎯 Project Overview

This project focuses on gathering real-world arbitrage data from multiple cryptocurrency exchanges. The primary goal is to collect comprehensive market data that can be used for arbitrage analysis, with additional sample tools for visualization and basic trading simulation.

## 🚀 Features

### Data Collection
- **Real-time Orderbook Collection**: Continuously fetches orderbook data from 6 major Iranian exchanges
- **Multi-Exchange Support**: Nobitex, Ompfinex, Raastin, Ramzinex, Exir, and Wallex
- **Data Normalization**: Handles different API formats and currency conversions (Toman/Rial)
- **SQLite Storage**: Efficient local storage for historical analysis

### Analysis Tools
- **Price Mapping**: Normalizes and validates orderbook data across exchanges
- **Spread Analysis**: Calculates bid-ask spreads and identifies arbitrage opportunities
- **Data Validation**: Ensures data integrity and filters invalid entries

### Visualization & Simulation
- **Price Charts**: Generate charts using QuickChart API and Chart.js
- **Arbitrage Simulation**: Basic two-exchange arbitrage trading simulation
- **Performance Metrics**: Track profits, trade counts, and success rates

## 📁 Project Structure

```
├── store_orderbooks.mjs     # Real-time data collection from exchanges
├── price_mapper.mjs         # Data normalization and analysis
├── trading_config.mjs       # Configuration settings
├── arbitrage_trader.mjs     # Sample arbitrage simulation
├── price_simulator.mjs      # Price data generator for testing
├── price_chart.mjs          # Chart generation utilities
└── data/                    # Historical data storage (zipped)
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NabiKAZ/arbitrage
   cd arbitrage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   ```bash
   # The database will be created automatically when running store_orderbooks.mjs
   ```

## 📊 Usage

### Data Collection

Start collecting real-time orderbook data:

```bash
node store_orderbooks.mjs
```

This will:
- Fetch orderbook data every 5 seconds from all supported exchanges
- Store normalized data in SQLite database
- Handle API errors gracefully
- Display real-time collection status

### Data Analysis

Analyze collected data:

```bash
node price_mapper.mjs
```

Features:
- Normalize data formats across different exchanges
- Validate orderbook consistency
- Calculate spreads and identify arbitrage opportunities
- Display historical price analysis

### Visualization

Generate price charts:

```bash
node price_chart.mjs        # Web-based charts via QuickChart
node arbitrage_trader.mjs   # Local PNG charts with trading simulation
```

## 🏦 Supported Exchanges

| Exchange | API Endpoint | Currency | Notes |
|----------|-------------|----------|-------|
| **Nobitex** | `api.nobitex.ir` | IRR | Standard format |
| **Ompfinex** | `api.ompfinex.com` | IRR | Swapped ask/bid format |
| **Raastin** | `api.raastin.com` | TMN→IRR | Toman to Rial conversion |
| **Ramzinex** | `publicapi.ramzinex.com` | IRR | Nested data structure |
| **Exir** | `api.exir.io` | TMN→IRR | Toman to Rial conversion |
| **Wallex** | `api.wallex.ir` | TMN→IRR | Toman to Rial conversion |

## 📈 Data Format

### Normalized Orderbook Structure
```javascript
{
  name: "exchange_name",
  date: "YYYY-MM-DD HH:mm:ss",
  ask: {
    price: 61000000000,  // Ask price in Rial
    amount: 0.005        // Available amount
  },
  bid: {
    price: 60900000000,  // Bid price in Rial  
    amount: 0.01         // Available amount
  }
}
```

### Database Schema
```sql
CREATE TABLE orderbooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  data TEXT NOT NULL
);
```

## 🔧 Configuration

Edit `trading_config.mjs` to customize:

```javascript
export const databaseConfig = {
    filename: './arbitrage.db'  // Database file location
};
```

## 📊 Sample Output

### Real-time Collection
```
NOBITEX
{"asks": [["61000000000", "0.005"]], "bids": [["60900000000", "0.01"]]}
Saved #1234
----------------------------------------
RAMZINEX
{"data": {"sells": [["62000000000", "0.003"]], "buys": [["61800000000", "0.008"]]}}
Saved #1235
----------------------------------------
```

### Analysis Results
```
=== 2024-11-15 10:15:20 ===
nobitex:
  Ask: 61,000,000,000 (0.005)
  Bid: 60,900,000,000 (0.01)
  Spread: 0.1639%
ramzinex:
  Ask: 62,000,000,000 (0.003)
  Bid: 61,800,000,000 (0.008)
  Spread: 0.3226%
```

## 🎯 Use Cases

1. **Arbitrage Research**: Analyze historical price differences across exchanges
2. **Market Analysis**: Study spread patterns and liquidity across different platforms  
3. **Algorithm Development**: Use real data to develop and backtest trading strategies
4. **Academic Research**: Comprehensive dataset for cryptocurrency market studies

## ⚠️ Important Notes

- **Data Usage**: This project is for educational and research purposes
- **API Limits**: Respect exchange API rate limits and terms of service
- **Currency Conversion**: Automatic conversion between Toman and Rial where needed
- **Data Validation**: Built-in validation prevents invalid orderbook entries

## 🛡️ Error Handling

- **Network Errors**: Graceful handling of API timeouts and failures
- **Data Validation**: Invalid orderbook data is filtered out
- **Exchange-Specific**: Custom handling for each exchange's unique format
- **Continuous Operation**: System continues despite individual exchange failures

## 📦 Data Archive

Historical orderbook data is available in the `data/` directory as a compressed SQLite database (`arbitrage_data.zip`).

This dataset contains over 800,000 orderbook records (ask and bid prices) collected every 5 seconds from six major Iranian cryptocurrency exchanges: Wallex, Nobitex, Ompfinex, Raastin, Ramzinex, and Exir. Data was gathered by a custom script running on a server for two weeks.

The uncompressed SQLite database is approximately 3 GB in size (81 MB zipped). It includes normalized and validated orderbook snapshots suitable for:
- Arbitrage opportunity analysis
- Market trend and liquidity studies
- Backtesting trading strategies on real historical data

To use the data, extract `data/arbitrage_data.zip` and open the SQLite database with your preferred client or analysis tool.

## 🔮 Future Enhancements

- Real-time arbitrage execution capabilities
- Advanced statistical analysis tools
- Web dashboard for monitoring
- Integration with additional exchanges
- Machine learning price prediction models

## 📝 License

This project is licensed under the GNU General Public License v3.0 (GPLv3).
Please ensure compliance with exchange APIs' terms of service.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Additional exchange integrations
- Enhanced data analysis features
- Bug fixes and improvements
- Documentation updates

## ⭐ Support & Donate

If you found this project useful, please consider giving it a ⭐ star on GitHub!

You can also support future development by donating to the following TON wallet:

**TON Wallet:** `nabikaz.ton`

Your support is greatly appreciated!

## 👤 Author

- Twitter: [https://x.com/NabiKAZ](https://x.com/NabiKAZ)
- Telegram: [https://t.me/BotSorati](https://t.me/BotSorati)

---

**Disclaimer**: This tool is for educational purposes only. Cryptocurrency trading involves significant risk. Always do your own research and consider consulting with financial advisors.
