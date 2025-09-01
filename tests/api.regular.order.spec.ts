import { test } from '../fixtures/auto.test'
import orders from '../data/trade-data-api'
import { utils } from '../utils/utils'

const fs = require('fs')

const filePath = 'summary.txt'
let counter = -1

const placedOrder = []

function headerInfo() {
  const arr = []
  arr[0] = `\n\nBelow orders have been executed for [${utils.kiteuser().name}] [capital: ${utils.kiteuser().capital.toLocaleString('en-IN')}]`
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
  // console.log(
  //   utils.pad(index + 1, 5) +
  //     utils.pad(row.tradingSymbol, 12) +
  //     utils.pad(row.qty, 12, true) +
  //     utils.pad(row.buyPrice === 0 ? '-' : row.buyPrice, 14, true) +
  //     utils.pad(row.sellPrice === 0 ? '-' : row.sellPrice, 14, true) +
  //     utils.pad(
  //       row.buyPrice === 0
  //         ? '-'
  //         : (row.qty * row.buyPrice).toLocaleString('en-IN'),
  //       15,
  //       true,
  //     ) +
  //     utils.pad(`${pos}`, 14, true),
  // )

  const rowInfo =
    utils.pad(index + 1, 5) +
    utils.pad(row.tradingsymbol, 15) +
    utils.pad(row.buyPrice > 0 ? 'Buy' : 'Sell', 4) +
    utils.pad(row.qty, 12, true) +
    utils.pad(row.buyPrice === 0 ? '-' : row.buyPrice, 14, true) +
    utils.pad(row.sellPrice === 0 ? '-' : row.sellPrice, 14, true) +
    utils.pad(
      row.buyPrice === 0
        ? '-'
        : (row.qty * row.buyPrice).toLocaleString('en-IN'),
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
        return
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
    test(`${order.tradingSymbol} [${index + 1}]`, async ({ kiteAPI }) => {
      // buy
      const data = {
        exchange: order.exchange,
        tradingsymbol: order.tradingSymbol,
        transaction_type: 'BUY',
        quantity: order.qty,
        price: 0,
        buyPrice: order.buyPrice,
        sellPrice: order.sellPrice,
        positionSize: order.positionSize,
      }

      if (data.quantity > 0) {
        if (data.buyPrice > 0) {
          // GTT buy
          data.price = order.buyPrice
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

        if (data.sellPrice > 0) {
          data.price = order.sellPrice
          data.sellPrice = order.sellPrice
          data.transaction_type = 'SELL'

          // GTT sell
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
      } else {
        if (data.buyPrice > 0 && order.positionSize !== null) {
          const toInvest: number = Math.floor(
            utils.kiteuser().capital * (order.positionSize / 100),
          )
          const qty = Math.floor(toInvest / order.buyPrice)
          data.quantity = qty

          if (data.quantity > 0) {
            // GTT buy
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
        }

        if (data.sellPrice > 0) {
          // data.triggerValue = order.sellPrice
          data.sellPrice = order.sellPrice
          data.transaction_type = 'SELL'

          // GTT sell
          data.price = data.sellPrice

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
