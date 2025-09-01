import Papa from 'papaparse'

import { test } from '../fixtures/auto.test'
import config from '../config'

test(`Pull order data from Google sheet`, async ({ utils }) => {
  // From Google sheet
  const response = await fetch(config.datasheetURL) // your published link
  const csv = await response.text()

  // Parse CSV into JSON
  const tdata = Papa.parse(csv, { header: true }).data.filter(
    (d) => d.trading_symbol !== '',
  )

  const parsedData = tdata
    .map((item) => ({
      exchange: utils.isEmpty(item.exchange) ? 'NSE' : item.exchange,
      tradingSymbol: utils.isEmpty(item.trading_symbol)
        ? ''
        : item.trading_symbol,
      ltp: utils.isEmpty(item.ltp) ? 0 : parseFloat(item.ltp.replace(/,/g, '')),
      qty: utils.isEmpty(item.qty) ? 0 : parseInt(item.qty, 10),
      buyPrice: utils.isEmpty(item.buy_price)
        ? 0
        : parseFloat(item.buy_price.replace(/,/g, '')),
      sellPrice: utils.isEmpty(item.sell_price)
        ? 0
        : parseFloat(item.sell_price.replace(/,/g, '')),
      profitPercent: utils.isEmpty(item.profit_percent)
        ? 0
        : parseFloat(
            item.profit_percent.substring(0, item.profit_percent.length - 1),
          ),
      tradeRisk: utils.isEmpty(item.trade_risk)
        ? 0
        : parseFloat(item.trade_risk),
      positionSize: utils.isEmpty(item.position_size)
        ? 0
        : parseFloat(
            item.position_size.substring(0, item.position_size.length - 1),
          ),
      checksum: utils.isEmpty(item.checksum) ? 0 : parseInt(item.checksum, 10),
    }))
    .filter((row) => row.tradingSymbol.trim() !== '')

  await utils.writeJSON(parsedData, './data/order.api.ts')
})
