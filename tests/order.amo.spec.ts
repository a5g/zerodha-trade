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
  arr[0] = `\n\nBelow AMO orders have been created for [${utils.kiteuser().name}] [kcid: ${utils.kiteuser().kcid}] [capital: ${utils.kiteuser().capital.toLocaleString('en-IN')}]`
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
  const pos = row.positionSize === null ? '-' : `${row.positionSize} %`

  const rowInfo =
    utils.pad(index + 1, 5) +
    utils.pad(row.tradingsymbol, 15) +
    utils.pad(utils.formatIndianNumber(row.ltp, true), 10, true) +
    utils.pad(row.buyPrice > 0 ? 'Buy' : 'Sell', 10, true) +
    utils.pad(utils.formatIndianNumber(row.quantity), 10, true) +
    utils.pad(
      row.buyPrice === 0 ? '-' : utils.formatIndianNumber(row.buyPrice),
      15,
      true,
    ) +
    utils.pad(
      row.sellPrice === 0 ? '-' : utils.formatIndianNumber(row.sellPrice),
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

test.describe(`AMO`, () => {
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
    test(`@amo_order ${order.tradingSymbol} [${index + 1}]`, async ({
      kiteAPI,
      kite,
    }) => {
      let ltp = order.ltp
      if (ltp === 0)
        ltp = await kite.getLTP(order.exchange, order.tradingSymbol)

      // buy
      const data = {
        user: utils.kiteuser().name,
        userid: utils.kiteuser().kcid,
        exchange: order.exchange,
        tradingsymbol: order.tradingSymbol,
        ltp,
        quantity: order.qty,
        price: 0,
        buyPrice: order.buyPrice,
        sellPrice: order.sellPrice,
        transaction_type: 'BUY',
        order_type: 'LIMIT',
        positionSize: order.positionSize,
        capital: utils.kiteuser().capital,
      }

      if (data.quantity <= 0) {
        data.quantity = utils.computeQty(data)
      }

      if (data.quantity > 0) {
        // AMO buy
        if (data.buyPrice > 0) {
          data.price = data.buyPrice
          await kiteAPI.placeAMO(data)
          const d = { ...data }
          d.sellPrice = 0
          placedOrder.push(d)
          fs.appendFileSync(
            filePath,
            `\n${printRow(d, (counter += 1))}`,
            'utf8',
          )
        }

        // AMO sell
        if (data.sellPrice > 0 && data.buyPrice === 0) {
          data.price = data.sellPrice
          data.sellPrice = order.sellPrice
          data.transaction_type = 'SELL'

          await kiteAPI.placeAMO(data)
          const d = { ...data }
          d.buyPrice = 0
          placedOrder.push(d)
          fs.appendFileSync(
            filePath,
            `\n${printRow(d, (counter += 1))}`,
            'utf8',
          )
        }
      }
    })
  })
})

test.describe(`AMO`, () => {
  const symbols = []

  test.afterAll(() => {
    const arr = []
    arr[0] = `\n\nAMO Orders for below instruments have been deleted for [${utils.kiteuser().name}] [kcid: ${utils.kiteuser().kcid}]`
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
      test(`@amo_cancel [${order.tradingSymbol}] [${index + 1}]`, async ({
        kiteAPI,
      }) => {
        const openOrders = await kiteAPI.getAMOOpenOrders(order.tradingSymbol)
        symbols.push(order.tradingSymbol)

        for (const order of openOrders) {
          await kiteAPI.cancelAMOOrder(order.order_id)
        }
      })
    })
})
