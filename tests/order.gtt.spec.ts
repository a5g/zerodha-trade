import { test } from '../fixtures/auto.test'
import orders from '../data/trade-data-api'
import { utils } from '../utils/utils'

const fs = require('fs')

const filePath = 'summary.txt'
let counter = -1

const placedOrder = []
const DIVIDER =
  '---------------------------------------------------------------------------------------------------------------'

function headerInfo() {
  const arr = []
  arr[0] = `\n\nGTT Orders for below instruments have been deleted for [${utils.kiteuser().name}] [kcid: ${utils.kiteuser().kcid}] [capital: ${utils.kiteuser().capital.toLocaleString('en-IN')}]`
  arr[1] = DIVIDER
  arr[2] =
    utils.pad('No.', 5) +
    utils.pad('Instrument', 15) +
    utils.pad('LTP', 10, true) +
    utils.pad('Type', 10, true) +
    utils.pad('Qty', 10, true) +
    utils.pad('Buy Price', 15, true) +
    utils.pad('Sell Price', 15, true) +
    utils.pad('Invested', 15, true) +
    utils.pad('Position', 15, true)

  arr[3] = DIVIDER

  return arr
}

function printRow(row: any, index) {
  const pos = row.positionSize === null ? '-' : `${row.positionSize}%`

  const rowInfo =
    utils.pad(index + 1, 5) +
    utils.pad(row.tradingSymbol, 15) +
    utils.pad(utils.formatIndianNumber(row.ltp, true), 10, true) +
    utils.pad(row.buyPrice > 0 ? 'Buy' : 'Sell', 10, true) +
    utils.pad(utils.formatIndianNumber(row.qty), 10, true) +
    utils.pad(
      row.buyPrice === 0 ? '-' : utils.formatIndianNumber(row.buyPrice, true),
      15,
      true,
    ) +
    utils.pad(
      row.sellPrice === 0 ? '-' : utils.formatIndianNumber(row.sellPrice, true),
      15,
      true,
    ) +
    utils.pad(
      row.buyPrice === 0
        ? '-'
        : utils.formatIndianNumber(row.qty * row.buyPrice),
      15,
      true,
    ) +
    utils.pad(`${pos}`, 15, true)

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

test.describe(`GTT`, () => {
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
    // test.use({ storageState: `.auth/${utils.kiteuser().kcid}.json` })
    test(`@gtt_order ${order.tradingSymbol} [${index + 1}]`, async ({
      kiteAPI,
      kite,
    }) => {
      let sellFlag = true
      let ltp = order.ltp
      if (ltp === 0)
        ltp = parseFloat(
          await kite.getLTPFromTV(order.exchange, order.tradingSymbol),
        )

      // buy
      const data = {
        user: utils.kiteuser().name,
        userid: utils.kiteuser().kcid,
        exchange: order.exchange,
        tradingSymbol: order.tradingSymbol,
        ltp,
        qty: order.qty,
        buyPrice: order.buyPrice,
        sellPrice: order.sellPrice,
        transactionType: 'BUY',
        positionSize: order.positionSize,
        capital: utils.kiteuser().capital,
      }

      if (data.qty <= 0) {
        data.qty = utils.computeQty(data)
      }

      if (data.qty > 0) {
        // GTT buy
        if (data.buyPrice > 0) {
          sellFlag = false // set this flag to true, if you want to place both buy and sell GTT orders at the same time
          await kiteAPI.placeGTT(data)
          const d = { ...data }
          d.sellPrice = 0
          placedOrder.push(d)
          fs.appendFileSync(
            filePath,
            `\n${printRow(d, (counter += 1))}`,
            'utf8',
          )
        }

        // GTT sell
        if (data.sellPrice > 0 && sellFlag) {
          data.sellPrice = order.sellPrice
          data.transactionType = 'SELL'

          await kiteAPI.placeGTT(data)
          const d = { ...data }
          d.buyPrice = 0
          placedOrder.push(d)
          // fs.appendFileSync(
          //   filePath,
          //   `\n${printRow(d, (counter += 1))}`,
          //   'utf8',
          // )
        }
      }
    })
  })
})

test.describe(`GTT`, () => {
  const symbols = []

  test.afterAll(() => {
    const arr = []
    arr[0] = `\n\nBelow GTT orders have been cancelled for [${utils.kiteuser().name}] [kcid: ${utils.kiteuser().kcid}]`
    arr[1] = '----------------------'
    arr[2] = utils.pad('No.', 5) + utils.pad('Instrument', 15)
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

  orders
    .filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.tradingSymbol === item.tradingSymbol),
    )
    .forEach((order, index) => {
      test(`@gtt_cancel [${order.tradingSymbol}] [${index + 1}]`, async ({
        kiteAPI,
      }) => {
        const activeGTT = await kiteAPI.getGTTActiveOrders(order.tradingSymbol)
        symbols.push(order.tradingSymbol)

        for (const order of activeGTT) {
          await kiteAPI.cancelGTTOrder(order.id)
        }
      })
    })
})
