import { test } from '../fixtures/auto.test'
import { utils } from '../utils/utils'
import config from '../config'

const fs = require('fs')

const filePath = 'summary.txt'

// ANSI escape codes for text color
const red = '\x1b[38;2;255;0;0m'
const green = '\x1b[38;2;0;255;0m'
const blue = '\x1b[34m'
const reset = '\x1b[0m' // Resets text color to default

const DIVIDER =
  '-----------------------------------------------------------------------------------'

function headerInfo() {
  const arr = []

  arr[0] = DIVIDER
  arr[1] =
    utils.pad('No.', 6) +
    utils.pad('Instrument', 15) +
    utils.pad('Qty.', 10, true) +
    utils.pad('Avg.', 12, true) +
    utils.pad('LTP', 12, true) +
    utils.pad('P&L', 15, true) +
    utils.pad('Chg.', 12, true)

  arr[2] = DIVIDER

  return arr
}

function printRow(row: any, index) {
  let rowInfo = utils.pad(index + 1, 6)
  rowInfo += row.profit > 0 ? green : red
  rowInfo += utils.pad(row.tradingSymbol, 15)
  rowInfo +=
    utils.pad(utils.formatIndianNumber(row.qty), 10, true) +
    utils.pad(utils.formatIndianNumber(row.avgPrice, true), 12, true) +
    utils.pad(utils.formatIndianNumber(row.ltp, true), 12, true)

  rowInfo += row.profit > 0 ? green : red
  rowInfo += utils.pad(utils.formatIndianNumber(row.profit, true), 15, true)

  rowInfo += row.netChange > 0 ? green : red
  rowInfo +=
    utils.pad(`${utils.formatIndianNumber(row.netChange, true)}%`, 12, true) +
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
  test(`@positons [${user.name}] [@kcid${user.kcid}]`, async ({ kiteAPI }) => {
    let data = []

    const positions = await (await kiteAPI.getPositions(user.kcid)).data.data

    positions.net.forEach((row) => {
      const d = {
        tradingSymbol: row.tradingsymbol,
        qty: row.quantity,
        avgPrice: row.average_price,
        ltp: row.last_price,
        profit: row.pnl,
        netChange: 0,
        color: 'green',
      }
      d.netChange = (d.ltp / d.avgPrice - 1) * 100

      if (d.netChange < 0) d.color = 'red'

      data.push(d)
      // console.log(`${green}${row.tradingsymbol}${reset}`)
    })

    data = data.sort((a, b) => b.profit - a.profit)

    console.log(
      `\nEquity Positions [${user.name.toUpperCase()}] [kcid: ${user.kcid}] [capital: ${utils.formatIndianNumber(user.capital)}]`,
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
