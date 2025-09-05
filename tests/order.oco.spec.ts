import { test } from '../fixtures/auto.test'
import orders from '../data/trade-data-api'
import { utils } from '../utils/utils'

const fs = require('fs')

const filePath = 'summary.txt'
let counter = -1

const placedOrder = []

const DIVIDER =
  '-------------------------------------------------------------------------------------------------------'
function headerInfo() {
  const arr = []
  arr[0] = `\n\nBelow OCO orders have been executed for [${utils.kiteuser().name}] [kcid: ${utils.kiteuser().kcid}] [capital: ${utils.kiteuser().capital.toLocaleString('en-IN')}]`
  arr[1] = DIVIDER

  arr[2] =
    utils.pad('No.', 5) +
    utils.pad('Stock', 15) +
    utils.pad('LTP', 10, true) +
    utils.pad('Type', 15, true) +
    utils.pad('Qty', 12, true) +
    utils.pad('Buy Price', 15, true) +
    utils.pad('Stoploss', 15, true) +
    utils.pad('Target', 15, true)

  arr[3] = DIVIDER

  return arr
}

function printRow(row: any, index) {
  const rowInfo =
    utils.pad(index + 1, 5) +
    utils.pad(row.tradingSymbol, 15) +
    utils.pad(utils.formatIndianNumber(row.ltp, true), 10, true) +
    utils.pad('Sell (OCO)', 15, true) +
    utils.pad(utils.formatIndianNumber(row.qty), 12, true) +
    utils.pad(utils.formatIndianNumber(row.buyPrice, true), 15, true) +
    utils.pad(utils.formatIndianNumber(row.stoplossPrice, true), 15, true) +
    utils.pad(utils.formatIndianNumber(row.targetPrice, true), 15, true)

  return rowInfo
}

test('Delete summary.txt content', () => {
  fs.writeFile(filePath, headerInfo().join(`\n`), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err)
      // return
    }
    // console.log('File written successfully!')
  })
})

test.describe(`OCO`, () => {
  test.use({ storageState: `.auth/${utils.kiteuser().kcid}.json` })
  test.afterAll(() => {
    // print the final summary
    // Table Header
    console.log(headerInfo().join('\n'))

    // Table Rows
    placedOrder.forEach((row, index) => {
      console.log(printRow(row, index))
    })

    console.log(DIVIDER)
    fs.appendFileSync(filePath, `\n${DIVIDER}`, 'utf8')
  })

  orders.forEach((order, index) => {
    test(`@oco_order ${order.tradingSymbol} [${index + 1}]`, async ({
      kiteAPI,
      kite,
    }) => {
      const ltp = await kite.getLTP(order.exchange, order.tradingSymbol)

      // buy
      const data = {
        user: utils.kiteuser().name,
        userid: utils.kiteuser().kcid,
        exchange: order.exchange,
        tradingSymbol: order.tradingSymbol,
        ltp,
        qty: order.qty,
        buyPrice: order.buyPrice,
        stoplossPrice: order.stoplossPrice,
        targetPrice: order.targetPrice,
        transactionType: 'SELL',
      }

      if (data.qty > 0) {
        // OCO Sell
        if (data.buyPrice > 0) {
          await kiteAPI.placeOCO(data)

          placedOrder.push(data)
          fs.appendFileSync(
            filePath,
            `\n${printRow(data, (counter += 1))}`,
            'utf8',
          )
        }
      }
    })
  })
})

test.describe(`OCO`, () => {
  const symbols = []

  test.afterAll(() => {
    const arr = []
    arr[0] = `\n\nBelow OCO cancel orders have been executed for [${utils.kiteuser().name}] [kcid: ${utils.kiteuser().kcid}]`
    arr[1] = '----------------------'
    arr[2] = utils.pad('No.', 5) + utils.pad('Stock', 15)
    arr[3] = '----------------------'

    // print the final summary
    // Table Header
    console.log(arr.join('\n'))

    // Table Rows
    symbols.forEach((symbol, index) => {
      console.log(utils.pad(index + 1, 5) + utils.pad(symbol, 15))
    })

    console.log(arr[1])
  })

  orders.forEach((order, index) => {
    test(`@oco_cancel [${order.tradingSymbol}] [${index + 1}]`, async ({
      kiteAPI,
    }) => {
      const activeGTT = await kiteAPI.getOCOActiveOrders(order.tradingSymbol)
      symbols.push(order.tradingSymbol)

      for (const order of activeGTT) {
        await kiteAPI.cancelGTTOrder(order.id)
      }
    })
  })
})
