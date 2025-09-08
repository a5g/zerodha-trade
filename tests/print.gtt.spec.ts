import { test } from '../fixtures/auto.test'
import { utils } from '../utils/utils'
import config from '../config'

const fs = require('fs')

const filePath = 'summary.txt'

// ANSI escape codes for text color
const red = '\x1b[38;2;255;0;0m'
const green = '\x1b[38;2;0;255;0m'
const blue = '\x1b[38;2;0;0;255m'
const cyan = '\x1b[38;2;0;255;255m'
const reset = '\x1b[0m' // Resets text color to default

const DIVIDER =
  '------------------------------------------------------------------------------------------------------------------'

function headerInfo() {
  const arr = []

  arr[0] = DIVIDER
  arr[1] =
    utils.pad('No.', 6) +
    utils.pad('Created on', 15) +
    utils.pad('Instrument', 15) +
    utils.pad('Type', 10) +
    utils.pad('', 5) +
    utils.pad('Trigger', 10, true) +
    utils.pad('', 10, true) +
    utils.pad('LTP', 12, true) +
    utils.pad('Qty.', 10, true) +
    utils.pad('', 1) +
    utils.pad('Amount', 10, true) +
    utils.pad('', 3) +
    utils.pad('Status', 10)

  arr[2] = DIVIDER

  return arr
}

function printRow(row: any, index) {
  let rowInfo = utils.pad(index + 1, 6)
  // if (index % 2 === 0) rowInfo += green
  rowInfo += row.status === 'triggered' ? green : reset
  rowInfo += utils.pad(row.createdAt, 15)
  rowInfo += utils.pad(row.instrument, 15)
  rowInfo += utils.pad(row.type.toUpperCase(), 10)
  rowInfo += row.transactionType === 'BUY' ? blue : red
  rowInfo += utils.pad(row.transactionType, 5)
  rowInfo += row.status === 'triggered' ? green : reset
  rowInfo += utils.pad(utils.formatIndianNumber(row.trigger, true), 10, true)
  rowInfo += utils.pad(
    `${utils.formatIndianNumber((row.trigger / row.ltp - 1) * 100, true)}%`,
    10,
    true,
  )
  rowInfo += utils.pad(utils.formatIndianNumber(row.ltp, true), 12, true)
  rowInfo += row.transactionType === 'BUY' ? blue : red
  rowInfo += utils.pad(utils.formatIndianNumber(row.qty), 10, true)
  rowInfo += utils.pad('', 1)
  rowInfo += utils.pad(
    utils.formatIndianNumber(row.qty * row.trigger),
    10,
    true,
  )
  rowInfo += utils.pad('', 3)
  rowInfo += row.status === 'triggered' ? green : reset
  rowInfo += utils.pad(row.status.toUpperCase(), 10)
  rowInfo += reset

  return rowInfo
}

config.users.forEach((user) => {
  test(`@gtt_orders [${user.name}] [@kcid${user.kcid}]`, async ({
    kiteAPI,
  }) => {
    let data = []

    let gtt = await (await kiteAPI.getGTTOrders(user.kcid)).data.data
    gtt = gtt.filter((item) => item.type === 'single')

    gtt.forEach((row) => {
      const d = {
        createdAt: row.created_at.split(' ')[0],
        instrument: row.condition.tradingsymbol,
        type: row.type,
        trigger: row.condition.trigger_values[0],
        qty: row.orders[0].quantity,
        ltp: row.condition.last_price,
        status: row.status,
        transactionType: row.orders[0].transaction_type,
      }

      d.qty = d.transactionType.toLowerCase() === 'sell' ? d.qty * -1 : d.qty

      data.push(d)
    })

    data = data.sort((a, b) => b.status - a.status)

    console.log(
      `\n${cyan}GTT orders [${user.name.toUpperCase()}] [kcid: ${user.kcid}]${reset}`,
    )

    // print the final summary
    // Table Headerconsole.log(headerInfo().join('\n'))
    console.log(headerInfo().join('\n'))

    // Table Rows
    data.forEach((row, index) => {
      console.log(printRow(row, index))
    })

    console.log(DIVIDER)
  })
})
