import { test } from '../fixtures/auto.test'

test(`Pull order data from local excel file`, async ({ utils }) => {
  // from local file
  const tdata = utils
    .readDataFromXLSX('./data/trade-data-api.xlsx', 'OCO')
    .filter((row) => row.trading_symbol !== undefined)

  const parsedData = tdata
    .map((item) => ({
      exchange: item.exchange,
      tradingSymbol: utils.isEmpty(item.trading_symbol)
        ? ''
        : item.trading_symbol,
      ltp: item.ltp === '' ? 0 : utils.formatFloat(item.ltp),
      qty: utils.isEmpty(item.qty) ? 0 : parseInt(item.qty, 10),
      buyPrice: utils.isEmpty(item.buy_price)
        ? 0
        : utils.formatFloat(item.buy_price),
      stoplossPrice: utils.isEmpty(item.stoploss_price)
        ? 0
        : utils.formatFloat(item.stoploss_price),
      targetPrice: utils.isEmpty(item.target_price)
        ? 0
        : utils.formatFloat(item.target_price),
    }))
    .filter((row) => row.tradingSymbol.trim() !== '')

  await utils.writeJSON(parsedData, './data/trade-data-api.ts')
})
