import { test } from '../fixtures/auto.test'

test(`Pull order data from local excel file`, async ({ utils }) => {
  // from local file
  const tdata = utils
    .readDataFromXLSX('./data/trade-data-api.xlsx', 'GTT')
    .filter((row) => row.trading_symbol !== undefined)

  const parsedData = tdata
    .map((item) => ({
      exchange: item.exchange,
      tradingSymbol: utils.isEmpty(item.trading_symbol)
        ? ''
        : item.trading_symbol,
      ltp:
        item.ltp === '' || item.ltp === null || item.ltp === undefined
          ? 0
          : parseFloat(item.ltp),
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

  await utils.writeJSON(parsedData, './data/trade-data-api.ts')
})
