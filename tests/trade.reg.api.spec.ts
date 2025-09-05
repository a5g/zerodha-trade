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
  arr[0] = `\n\nBelow REGULAR orders have been executed for [${utils.kiteuser().name}] [capital: ${utils.kiteuser().capital.toLocaleString('en-IN')}]`
  arr[1] = DIVIDER
  arr[2] =
    utils.pad('No.', 5) +
    utils.pad('Stock', 15) +
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
    utils.pad(utils.formatIndianNumber(row.ltp), 10, true) +
    utils.pad(row.buyPrice > 0 ? 'Buy' : 'Sell', 10) +
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

test.describe(`Regular Order`, () => {
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
    test(`@reg_order ${order.tradingSymbol} [${index + 1}]`, async ({
      kiteAPI,
    }) => {
      // buy
      const data = {
        user: utils.kiteuser().name,
        userid: utils.kiteuser().kcid,
        exchange: order.exchange,
        tradingsymbol: order.tradingSymbol,
        lastPrice: order.ltp,
        qty: order.qty,
        price: 0,
        buyPrice: order.buyPrice,
        sellPrice: order.sellPrice,
        transaction_type: 'BUY',
        order_type: 'LIMIT',
        positionSize: order.positionSize,
        capital: utils.kiteuser().capital,
      }

      if (data.qty <= 0) {
        data.qty = utils.computeQty(data)
      }

      if (data.qty > 0) {
        // Regular buy
        if (data.buyPrice > 0) {
          data.price = data.buyPrice
          await kiteAPI.placeRegularOrder(data)
          const d = { ...data }
          d.sellPrice = 0
          placedOrder.push(d)
          fs.appendFileSync(
            filePath,
            `\n${printRow(d, (counter += 1))}`,
            'utf8',
          )
        }

        // Regular sell
        if (data.sellPrice > 0 && data.buyPrice === 0) {
          data.price = data.sellPrice
          data.sellPrice = order.sellPrice
          data.transaction_type = 'SELL'

          await kiteAPI.placeRegularOrder(data)
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

test.describe(`Regular Order Cancel`, () => {
  orders.forEach((order, index) => {
    test(`@reg_cancel [${order.tradingSymbol}] [${index + 1}]`, async ({
      kiteAPI,
    }) => {
      const openOrders = await kiteAPI.getRegularOpenOrders(order.tradingSymbol)

      for (const order of openOrders) {
        await kiteAPI.cancelRegularOrder(order.order_id)
      }
    })
  })
})
