import { test } from '../fixtures/auto.test'
import orders from '../data/trade-data-api'
import { utils } from '../utils/utils'
import config from '../config'

const fs = require('fs')

const filePath = 'summary.txt'
let counter = -1

const placedOrder = []

// ANSI escape codes for text color
const red = '\x1b[38;2;255;0;0m'
const green = '\x1b[38;2;0;255;0m'
const blue = '\x1b[34m'
const reset = '\x1b[0m' // Resets text color to default

function headerInfo() {
  const arr = []
  arr[0] = `\n\nEquity Holdings [${utils.kiteuser().name}] [id: ${utils.kiteuser().kcid}] [capital: ${utils.kiteuser().capital.toLocaleString('en-IN')}]`
  arr[1] =
    '-----------------------------------------------------------------------------------------------------------------'
  arr[2] =
    utils.pad('No.', 6) +
    utils.pad('Instrument', 15) +
    utils.pad('Qty.', 6, true) +
    utils.pad('Avg.', 12, true) +
    utils.pad('LTP', 12, true) +
    utils.pad('Invested', 12, true) +
    utils.pad('Cur. Val', 12, true) +
    utils.pad('P&L', 12, true) +
    utils.pad('Chg.', 12, true)

  arr[3] =
    '-----------------------------------------------------------------------------------------------------------------'

  return arr
}

function printRow(row: any, index) {
  let rowInfo = utils.pad(index + 1, 6)
  rowInfo += row.netChange > 0 ? green : red
  rowInfo += utils.pad(row.tradingSymbol, 15)
  rowInfo +=
    utils.pad(utils.formatIndianNumber(row.qty), 6, true) +
    utils.pad(utils.formatIndianNumber(row.avgPrice), 12, true) +
    utils.pad(utils.formatIndianNumber(row.ltp), 12, true) +
    utils.pad(utils.formatIndianNumber(row.invested, false), 12, true) +
    utils.pad(utils.formatIndianNumber(row.currValue, false), 12, true)

  rowInfo += row.profit > 0 ? green : red
  rowInfo += utils.pad(utils.formatIndianNumber(row.profit, false), 12, true)

  rowInfo += row.netChange > 0 ? green : red
  rowInfo +=
    utils.pad(`${utils.formatIndianNumber(row.netChange)}%`, 12, true) + reset

  rowInfo += row.dayChange > 0 ? green : red
  rowInfo +=
    utils.pad(`${utils.formatIndianNumber(row.dayChange)}%`, 12, true) + reset

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

test(`@positions [${utils.kiteuser().name}]`, async ({ kiteAPI }) => {
  let data = []

  const positions = await (await kiteAPI.getPositions()).data.data
  console.log(positions)

  positions.forEach((row) => {
    const d = {
      tradingSymbol: row.tradingsymbol,
      qty: row.quantity,
      avgPrice: row.average_price,
      ltp: row.last_price,
      invested: row.quantity * row.average_price,
      currValue: row.quantity * row.last_price,
      profit: row.pnl,
      netChange: 0,
      dayChange: row.day_change_percentage,
      color: 'green',
    }
    d.profit = d.currValue - d.invested
    d.netChange = (d.currValue / d.invested - 1) * 100

    if (d.netChange < 0) d.color = 'red'

    data.push(d)
    // console.log(`${green}${row.tradingsymbol}${reset}`)
  })

  data = data.sort((a, b) => b.netChange - a.netChange)

  if (config.holdingsOrder === 'day')
    data = data.sort((a, b) => b.dayChange - a.dayChange)

  // print the final summary
  // Table Headerconsole.log(headerInfo().join('\n'))
  console.log(headerInfo().join('\n'))

  // Table Rows
  data.forEach((row, index) => {
    console.log(printRow(row, index))
  })

  console.log(
    '-----------------------------------------------------------------------------------------------------------------',
  )
})
