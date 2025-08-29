import { test } from '../fixtures/auto.test'
import orders from '../data/trade-data-ui'
import { utils } from '../utils/utils'

const user = utils.kiteuser() // (recommended) for quick access using commandline
// const KITE_USER = utils.getUserObjectById(1) // to run within vscode using playwright plugin

test.use({ storageState: `.auth/${user.id}.json` })

test.describe(`${user.name} => `, () => {
  test(`navigate => holdings @navigate`, async ({ kite }) => {
    await kite.gotoHoldingsPage()
    // await kite.pause()
  })

  test.describe(`gtt_buy`, () => {
    orders.forEach((order, index) => {
      test(`${order.stock}_[${index + 1}] @gtt_buy`, async ({ kite }) => {
        if (order.qty > 0 && order.buyPrice > 0) {
          await kite.gttOrder(order.stock, 'Buy', order.qty, order.buyPrice)
        }
      })
    })
  })

  test.describe(`gtt_sell`, () => {
    orders.forEach((order, index) => {
      test(`${order.stock}_[${index + 1}] @gtt_sell`, async ({ kite }) => {
        if (order.qty > 0 && order.sellPrice > 0) {
          await kite.gttOrder(order.stock, 'Sell', order.qty, order.sellPrice)
        }
      })
    })
  })

  // test.describe(`gtt_stoploss`, () => {
  //   orders.forEach((order, index) => {
  //     test(`${order.stock}_[${index + 1}]`, async ({ kite }) => {
  //       if (order.qty > 0 && order.stopLoss > 0) {
  //         await kite.gttOrder(order.stock, 'Sell', order.qty, order.stopLoss)
  //       }
  //     })
  //   })
  // })

  test.describe(`regular_buy`, () => {
    orders.forEach((order, index) => {
      test(`${order.stock}_[${index + 1}] @reg_buy`, async ({ kite }) => {
        if (order.qty > 0 && order.buyPrice > 0) {
          await kite.regularOrder(order.stock, 'Buy', order.qty, order.buyPrice)
        }
      })
    })
  })

  test.describe(`regular_sell`, () => {
    orders.forEach((order, index) => {
      test(`${order.stock}_[${index + 1}] @reg_sell`, async ({ kite }) => {
        if (order.qty > 0 && order.sellPrice > 0) {
          await kite.regularOrder(
            order.stock,
            'Sell',
            order.qty,
            order.sellPrice,
          )
        }
      })
    })
  })
})
