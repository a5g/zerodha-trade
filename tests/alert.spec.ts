import { test } from '../fixtures/auto.test'
import orders from '../data/trade-data-api'
import { utils } from '../utils/utils'

const placedAlert = []
const DIVIDER = '---------------------------------------------------'

function headerInfo() {
  const arr = []
  arr[0] = `\n\nBelow alerts have been created for [${utils.kiteuser().name}] [kcid: ${utils.kiteuser().kcid}]`
  arr[1] = DIVIDER
  arr[2] =
    utils.pad('No.', 5) +
    utils.pad('Instrument', 15) +
    // utils.pad('Status', 10) +
    // utils.pad('Type', 10) +
    utils.pad('LTP', 10, true) +
    utils.pad('', 10, true) +
    utils.pad('Condition', 10, true)

  arr[3] = DIVIDER

  return arr
}

function printRow(row: any, index) {
  const rowInfo =
    utils.pad(index + 1, 5) +
    utils.pad(row.tradingSymbol, 15) +
    // utils.pad(row.status, 10) +
    // utils.pad(row.type, 10) +
    utils.pad(utils.formatIndianNumber(row.ltp, true), 10, true) +
    utils.pad(`${row.operator}`, 10, true) +
    utils.pad(utils.formatIndianNumber(row.alertPrice, true), 10, true)

  return rowInfo
}

test.describe(`ALERT`, () => {
  test.afterAll(() => {
    // print the final summary
    // Table Header
    console.log(headerInfo().join('\n'))

    // Table Rows
    placedAlert.forEach((row, index) => {
      console.log(printRow(row, index))
    })
    console.log(DIVIDER)
  })

  orders.forEach((order, index) => {
    // test.use({ storageState: `.auth/${utils.kiteuser().kcid}.json` })
    test(`@alert_order ${order.tradingSymbol} [${index + 1}]`, async ({
      kiteAPI,
      kite,
    }) => {
      // let sellFlag = true
      let ltp = order.ltp
      if (ltp === 0)
        ltp = parseFloat(
          await kite.getLTPFromTV(order.exchange, order.tradingSymbol),
        )

      // alert
      const data = {
        user: utils.kiteuser().name,
        userid: utils.kiteuser().kcid,
        exchange: order.exchange,
        tradingSymbol: order.tradingSymbol,
        alertPrice: order.alertPrice,
        ltp,
        status: 'ENABLED',
        type: 'SIMPLE',
        operator: order.condition === 'EQ' ? '==' : order.condition,
      }

      if (data.alertPrice > 0) {
        await kiteAPI.placeAlert(data)
        placedAlert.push(data)
      }
    })
  })
})

test.describe(`ALERT`, () => {
  const symbols = []

  test.afterAll(() => {
    const arr = []
    arr[0] = `\n\nAlerts for below instruments have been deleted for [${utils.kiteuser().name}] [kcid: ${utils.kiteuser().kcid}]`
    arr[1] = '----------------------'
    arr[2] = utils.pad('No.', 5) + utils.pad('Instrument', 15)
    arr[3] = arr[1]

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
      test(`@alert_cancel [${order.tradingSymbol}] [${index + 1}]`, async ({
        kiteAPI,
      }) => {
        const activeAlerts = await kiteAPI.getActiveAlerts(order.tradingSymbol)
        symbols.push(order.tradingSymbol)

        for (const alert of activeAlerts) {
          await kiteAPI.cancelAlert(alert.uuid)
        }
      })
    })
})
