// import fs from 'fs'
import { test } from '../fixtures/auto.test'

test('convert excel data to json', async ({ kite }) => {
  const data = await kite.readDataFromXLSX('./data/order.xlsx')

  const parsedData = data.map((item) => ({
    stock: item.stock,
    qty: item.qty === undefined ? 0 : parseInt(item.qty, 10),
    buyPrice: item.buyPrice === undefined ? 0 : parseFloat(item.buyPrice),
    sellPrice: item.sellPrice === undefined ? 0 : parseFloat(item.sellPrice),
    extraParam: 0,
  }))

  await kite.writeJSON(parsedData, './data/order.ts')
  console.log(`========== Order Details ==========`)
  console.log(parsedData)
})
