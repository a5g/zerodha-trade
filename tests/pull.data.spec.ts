import Papa from 'papaparse'

import { test } from '../fixtures/auto.test'
import config from '../config'

// const Papa = require('papaparse') // to parse CSV

test(`Pull order data from Google sheet`, async ({ utils }) => {
  // From Google sheet
  // const response = await fetch(config.datasheetURL) // your published link
  // const csv = await response.text()

  // Parse CSV into JSON
  // const tdata = Papa.parse(csv, { header: false }).data
  //  console.log(tdata)

  // from local file
  const tdata = utils
    .readDataFromXLSX('./data/trade.xlsx', 'trade')
    .filter((row) => row.trading_symbol !== undefined)
  // tdata = tdata.filter((row) => row.trading_symbol !== undefined)
  // console.log(tdata)

  const parsedData = tdata
    .map((item) => ({
      exchange: item.exchange,
      tradingSymbol: utils.isEmpty(item.trading_symbol)
        ? ''
        : item.trading_symbol,
      ltp: item.ltp === '' ? 0 : parseFloat(item.ltp),
      qty: utils.isEmpty(item.qty) ? 0 : parseInt(item.qty, 10),
      buyPrice: utils.isEmpty(item.buy_price) ? 0 : parseFloat(item.buy_price),
      sellPrice: utils.isEmpty(item.sell_price)
        ? 0
        : parseFloat(item.sell_price),
      profitPercent: utils.isEmpty(item.profit_percent)
        ? 0
        : utils.formatFloat(item.profit_percent * 100),
      tradeRisk: utils.isEmpty(item.trade_risk)
        ? 0
        : parseFloat(item.trade_risk),
      positionSize: utils.isEmpty(item.position_size)
        ? 0
        : utils.formatFloat(item.position_size * 100),
    }))
    .filter((row) => row.tradingSymbol.trim() !== '')

  // parsedData = parsedData.filter((row) => row.tradingSymbol.trim() !== '')

  await utils.writeJSON(parsedData, './data/order.api.ts')

  // console.log(parsedData)
  // console.log(`checksum: ${parsedData[0].checksum}`)
})
