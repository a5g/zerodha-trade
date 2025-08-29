import { test } from '../fixtures/auto.test'
import orders from '../data/trade-data-api'
import { utils } from '../utils/utils'

const fs = require('fs')

const filePath = 'summary.txt'
let counter = -1

const placedOrder = []

test.describe(`Regular Order`, () => {
  test.skip(`Regular order test`, async ({ kiteAPI }) => {
    // buy
    const payload = {
      exchange: 'NSE',
      tradingsymbol: 'TCS',
      transaction_type: 'BUY',
      order_type: 'LIMIT',
      quantity: 30,
      price: 2800,
    }

    await kiteAPI.placeAMOOrder(payload)
  })

  test('Cancel all open orders', async ({ kiteAPI }) => {
    const openOrders = await kiteAPI.getOpenOrders()

    for (const order of openOrders) {
      await kiteAPI.cancelOrder(order.order_id)
    }

    // console.log(openOrders.length)
  })

  // test.skip(`gtt buy => through api`, async ({ kiteAPI }) => {
  //   const data = {
  //     user: 'anand',
  //     exchange: 'NSE',
  //     tradingSymbol: 'SBIN',
  //     lastPrice: 815,
  //     qty: 100,
  //     triggerValue: 750,
  //     price: 750,
  //     transactionType: 'BUY',
  //   }

  //   await kiteAPI.placeGTT(data)
  //   // await kiteAPI.getLTP({ exchange: 'NSE', tradingsymbol: 'SBIN' })
  // })
})

// {
//   exchange: 'NSE',
//   tradingSymbol: 'FEDFINA',
//   currentPrice: 141.96,
//   buyPrice: 138,
//   stopLossPrice: 132,
//   stopLossPercent: 4.35,
//   tradeRisk: 0.5,
//   positionSize: 11.5
// }

// import orders from '../data/order'
// import config from '../config'

// const ACTIVE_USER = 1
// const USERS = ['', 'anand', 'swetha', 'gayithri', 'savitha', 'veda']

// const KITE_USER = config.users.filter((user) => user.id === ACTIVE_USER)[0]

//   1: 'anand',
//   2: 'swetha',
//   3: 'gayithri',
//   4: 'savitha',
//   5: 'veda',
//   6: 'divesh',
