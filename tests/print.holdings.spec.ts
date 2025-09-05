import { test } from '../fixtures/auto.test'

import { utils } from '../utils/utils'
import config from '../config'

const fs = require('fs')

const filePath = 'summary.txt'

// ANSI escape codes for text color
const red = '\x1b[38;2;255;0;0m'
const green = '\x1b[38;2;0;255;0m'
const blue = '\x1b[38;2;0;125;255m'
const yellow = '\x1b[38;2;255;255;0m'
const reset = '\x1b[0m' // Resets text color to default

const DIVIDER =
  '--------------------------------------------------------------------------------------------------------------------'
function headerInfo() {
  const arr = []
  arr[0] = DIVIDER
  arr[1] =
    utils.pad('No.', 6) +
    utils.pad('Instrument', 15) +
    utils.pad('Qty.', 10, true) +
    utils.pad('Avg. cost', 12, true) +
    utils.pad('LTP', 12, true) +
    utils.pad('Invested', 12, true) +
    utils.pad('Cur. Val', 12, true) +
    utils.pad('P&L', 12, true) +
    utils.pad('Net chg.', 12, true) +
    utils.pad('Day chg.', 12, true)

  arr[2] = DIVIDER

  return arr
}

function printRow(row: any, index) {
  let rowInfo = utils.pad(index + 1, 6)

  if (row.netChange === 0) rowInfo += blue
  else rowInfo += row.netChange > 0 ? green : red

  rowInfo += utils.pad(row.tradingSymbol, 15)
  rowInfo +=
    utils.pad(utils.formatIndianNumber(row.qty), 10, true) +
    utils.pad(utils.formatIndianNumber(row.avgPrice, true), 12, true) +
    utils.pad(utils.formatIndianNumber(row.ltp, true), 12, true) +
    utils.pad(utils.formatIndianNumber(row.invested), 12, true) +
    utils.pad(utils.formatIndianNumber(row.currValue), 12, true)

  rowInfo += row.profit > 0 ? green : red
  rowInfo += utils.pad(utils.formatIndianNumber(row.profit), 12, true)

  rowInfo += row.netChange > 0 ? green : red
  rowInfo +=
    utils.pad(`${utils.formatIndianNumber(row.netChange, true)}%`, 12, true) +
    reset

  rowInfo += row.dayChange > 0 ? green : red
  rowInfo +=
    utils.pad(`${utils.formatIndianNumber(row.dayChange, true)}%`, 12, true) +
    reset

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

config.users.forEach((user) => {
  test(`@holdings [${user.name}] [@kcid${user.kcid}]`, async ({ kiteAPI }) => {
    let data = []

    const holdings = await (await kiteAPI.getHoldings(user.kcid)).data.data

    holdings.forEach((row) => {
      const d = {
        tradingSymbol: row.tradingsymbol,
        qty: row.quantity + row.t1_quantity,
        avgPrice: row.average_price,
        ltp: row.last_price,
        invested: (row.quantity + row.t1_quantity) * row.average_price,
        currValue: (row.quantity + row.t1_quantity) * row.last_price,
        profit: 0,
        netChange: 0,
        dayChange: row.day_change_percentage,
        color: 'green',
      }
      d.profit = d.currValue - d.invested

      if (d.invested > 0 && d.currValue > 0)
        d.netChange = (d.currValue / d.invested - 1) * 100

      if (d.netChange < 0) d.color = 'red'
      if (d.netChange === 0) d.color = 'blue'

      data.push(d)
      // console.log(`${green}${row.tradingsymbol}${reset}`)
    })

    // data = data.filter((d) => d.profit > 0)
    data = data.sort((a, b) => b.netChange - a.netChange)

    if (config.holdingsOrder === 'day')
      data = data.sort((a, b) => b.dayChange - a.dayChange)

    // print the final summary
    // Table Headerconsole.log(headerInfo().join('\n'))

    console.log(
      `\nEquity Holdings [${user.name.toUpperCase()}] [kcid: ${user.kcid}] [capital: ${utils.formatIndianNumber(user.capital)}]`,
    )

    console.log(headerInfo().join('\n'))

    let profitSum = 0
    // Table Rows
    data.forEach((row, index) => {
      console.log(printRow(row, index))

      if (row.profit > 0) profitSum += row.profit
    })

    console.log(DIVIDER)
    console.log(`Sum of Profits: ${utils.formatIndianNumber(profitSum)}\n\n`)
  })
})
