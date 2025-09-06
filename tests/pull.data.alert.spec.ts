import { test } from '../fixtures/auto.test'

test(`Pull order data from local excel file`, async ({ utils }) => {
  // from local file
  const tdata = utils
    .readDataFromXLSX('./data/trade-data-api.xlsx', 'ALERT')
    .filter((row) => row.trading_symbol !== undefined)

  const parsedData = tdata
    .map((item) => ({
      exchange: item.exchange,
      tradingSymbol: utils.isEmpty(item.trading_symbol)
        ? ''
        : item.trading_symbol,
      alertPrice: utils.isEmpty(item.alert_price)
        ? 0
        : utils.formatFloat(item.alert_price),
      condition: utils.isEmpty(item.condition) ? '' : item.condition,
    }))
    .filter((row) => row.tradingSymbol.trim() !== '')

  await utils.writeJSON(parsedData, './data/trade-data-api.ts')
})
