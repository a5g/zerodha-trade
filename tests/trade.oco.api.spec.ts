import { test } from '../fixtures/auto.test'
import orders from '../data/trade-data-api'
import { utils } from '../utils/utils'

const fs = require('fs')

const filePath = 'summary.txt'
let counter = -1

const placedOrder = []

function headerInfo() {
  const arr = []
  arr[0] = `\n\nBelow OCO orders have been executed for [${utils.kiteuser().name}] [capital: ${utils.kiteuser().capital.toLocaleString('en-IN')}]`
  arr[1] =
    '------------------------------------------------------------------------------------------------'
  arr[2] =
    utils.pad('No.', 5) +
    utils.pad('Stock', 15) +
    utils.pad('Type', 10) +
    utils.pad('Qty', 12, true) +
    utils.pad('Buy Price', 14, true) +
    utils.pad('Loss Price', 14, true) +
    utils.pad('Profit Price', 15, true)

  arr[3] =
    '------------------------------------------------------------------------------------------------'

  return arr
}

function printRow(row: any, index) {
  const rowInfo =
    utils.pad(index + 1, 5) +
    utils.pad(row.tradingSymbol, 15) +
    utils.pad('Sell (OCO)', 10) +
    utils.pad(row.qty, 12, true) +
    utils.pad(row.buyPrice, 14, true) +
    utils.pad(row.stoplossPrice, 14, true) +
    utils.pad(row.targetPrice, 14, true)

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

test.use({ storageState: `.auth/${utils.kiteuser().id}.json` })

test.describe(`OCO`, () => {
  test.beforeAll(() => {
    fs.writeFile(filePath, headerInfo().join(`\n`), 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err)
      }
      // console.log('File written successfully!')
    })
  })

  test.afterAll(() => {
    // print the final summary
    // Table Header
    console.log(headerInfo().join('\n'))

    // Table Rows
    placedOrder.forEach((row, index) => {
      console.log(printRow(row, index))
    })

    console.log(
      '------------------------------------------------------------------------------------------------',
    )
    fs.appendFileSync(
      filePath,
      `\n------------------------------------------------------------------------------------------------`,
      'utf8',
    )
  })

  orders.forEach((order, index) => {
    test(`@oco_order ${order.tradingSymbol} [${index + 1}]`, async ({
      kiteAPI,
      kite,
    }) => {
      const LTP = await kite.getLTP(order.exchange, order.tradingSymbol)

      // buy
      const data = {
        user: utils.kiteuser().name,
        userid: utils.kiteuser().id,
        exchange: order.exchange,
        tradingSymbol: order.tradingSymbol,
        lastPrice: LTP,
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

test.describe(`OCO Cancel`, () => {
  orders.forEach((order, index) => {
    test(`@oco_cancel [${order.tradingSymbol}] [${index}]`, async ({
      kiteAPI,
    }) => {
      const activeGTT = await kiteAPI.getOCOActiveOrders(order.tradingSymbol)

      for (const order of activeGTT) {
        await kiteAPI.cancelGTTOrder(order.id)
      }
    })
  })
})
