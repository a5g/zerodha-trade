import { test } from '../fixtures/auto.test'
// import orders from '../data/order'
import config from '../config'

const ACTIVE_USER = 1
const orders = []
const KITE_USER = config.users.filter((user) => user.kcid === ACTIVE_USER)[0]

test.use({ storageState: `.auth/${KITE_USER.name}.json` })
test.describe(`${KITE_USER.name} => `, () => {
  test(`navigate => holdings @navigate`, async ({ kite }) => {
    await kite.gotoHoldingsPage()
    await kite.pause()
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
