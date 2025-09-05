import { test } from '../fixtures/auto.test'
import orders from '../data/trade-data-api'
import { utils } from '../utils/utils'

const fs = require('fs')

const filePath = 'summary.txt'
let counter = -1

const placedOrder = []

function headerInfo() {
  const arr = []
  arr[0] = `\n\nBelow REGULAR orders have been executed for [${utils.kiteuser().name}] [capital: ${utils.kiteuser().capital.toLocaleString('en-IN')}]`
  arr[1] =
    '------------------------------------------------------------------------------------------------'
  arr[2] =
    utils.pad('No.', 5) +
    utils.pad('Stock', 15) +
    utils.pad('Type', 4) +
    utils.pad('Qty', 12, true) +
    utils.pad('Buy Price', 14, true) +
    utils.pad('Sell Price', 14, true) +
    utils.pad('Invested', 15, true) +
    utils.pad('Position', 14, true)

  arr[3] =
    '------------------------------------------------------------------------------------------------'

  return arr
}

function printRow(row: any, index) {
  const pos = row.positionSize === null ? '-' : `${row.positionSize} %`

  const rowInfo =
    utils.pad(index + 1, 5) +
    utils.pad(row.tradingsymbol, 15) +
    utils.pad(row.buyPrice > 0 ? 'Buy' : 'Sell', 4) +
    utils.pad(row.quantity, 12, true) +
    utils.pad(row.buyPrice === 0 ? '-' : row.buyPrice, 14, true) +
    utils.pad(row.sellPrice === 0 ? '-' : row.sellPrice, 14, true) +
    utils.pad(
      row.buyPrice === 0
        ? '-'
        : (row.quantity * row.buyPrice).toLocaleString('en-IN'),
      15,
      true,
    ) +
    utils.pad(`${pos}`, 14, true)

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

test.describe(`Reg Cancel`, () => {
  orders.forEach((order, index) => {
    test(`@reg_cancel [${order.tradingSymbol}] [${index}]`, async ({
      kiteAPI,
    }) => {
      const openOrders = await kiteAPI.getRegularOpenOrders(order.tradingSymbol)

      for (const order of openOrders) {
        await kiteAPI.cancelRegularOrder(order.order_id)
      }
    })
  })
})
