import config from '../config'

const { readFileSync } = require('fs')
const csv = require('csvtojson')
const fs = require('fs')
const XLSX = require('xlsx')

export class Utils {
  public kiteuser() {
    return config.users.filter((u) => u.name === config.kcuser)[0]
  }

  public getUserObjectById(id: number = config.kcid) {
    return config.users.filter((x) => x.id === id)[0]
  }

  public getUserObjectByName(name: string = config.kcname) {
    return config.users.filter((u) => u.name === name)[0]
  }

  public indNumber(value: number) {
    return value.toLocaleString('en-IN')
  }

  public readDataFromXLSX(filePath: string, sheetName: string) {
    const workbook = XLSX.readFile(filePath)

    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    // const sheetNameList = workbook.SheetNames
    // const xldata: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
    // return xlData.filter((data) => data.trading_symbol !== undefined)
  }

  public isEmpty(value) {
    return value === undefined || value === null || value === ''
  }

  // public pad(str, length) {
  //   str = String(str)
  //   return str.length >= length
  //     ? str.slice(0, length)
  //     : str + ' '.repeat(length - str.length)
  // }

  public pad(str, length, alignRight = false) {
    str = String(str)
    if (str.length >= length) return str.slice(0, length)

    if (alignRight) {
      return ' '.repeat(length - str.length) + str // right aligned
    }

    return str + ' '.repeat(length - str.length) // left aligned
  }

  // input format dd-mm-yyyy
  convertToDate(dateString) {
    let d = dateString.split('-')
    let dat = new Date(d[1] + '/' + d[0] + '/' + d[2])
    return dat
  }

  getCustomDay(date = new Date(), { days = -1 } = {}) {
    const previous = new Date(date.getTime())
    previous.setDate(date.getDate() + days)

    return previous
  }

  // output format dd-mm-yyyy
  formatDateDDMMYYYY(inputDate) {
    if (inputDate === undefined || inputDate === '-') {
      return '-'
    }

    let date, month, year

    date = new Date(inputDate).getDate()
    month = new Date(inputDate).getMonth() + 1
    year = new Date(inputDate).getFullYear()

    date = date.toString().padStart(2, '0')

    month = month.toString().padStart(2, '0')

    return `${date}-${month}-${year}`
  }

  formatDateYYYYMMDD(inputDate) {
    let date = inputDate
    if (typeof date === 'string' && date.indexOf('-') > -1) {
      const strdate = date.split('-')
      date = new Date(`${strdate[2]}-${strdate[1]}-${strdate[0]}`)
    }

    return `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }

  dateDifference(date1, date2) {
    // Parse the input dates
    const d1 = new Date(date1)
    const d2 = new Date(date2)

    // Calculate the time difference in milliseconds
    const timeDifference = Math.abs(d2.getTime() - d1.getTime())

    // Calculate the number of days
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24))

    return daysDifference
  }

  // gives the difference between 2 dates
  getDiffInDays(startDate, endDate) {
    const UPDATED_START_DATE =
      typeof startDate === 'string'
        ? startDate
        : this.formatDateDDMMYYYY(startDate)
    const UPDATED_END_DATE =
      typeof endDate === 'string' ? endDate : this.formatDateDDMMYYYY(startDate)

    const [d1day, d1month, d1year] = UPDATED_START_DATE.split('-')
    const [d2day, d2month, d2year] = UPDATED_END_DATE.split('-')

    const stDate = new Date(+d1year, d1month - 1, +d1day)
    const enDate = new Date(+d2year, d2month - 1, +d2day)

    const difference_In_Time = enDate.getTime() - stDate.getTime()
    const difference_In_Days = difference_In_Time / (1000 * 3600 * 24)

    return difference_In_Days
  }

  // get the difference between 2 dates
  getDaysDifference(date1, date2) {
    // Convert both dates to milliseconds
    const time1 = new Date(date1).getTime()
    const time2 = new Date(date2).getTime()

    // Calculate the difference in milliseconds
    const differenceInMs = time2 - time1

    // Convert milliseconds to days
    return Math.ceil(differenceInMs / (1000 * 60 * 60 * 24))
  }

  getMonthName(date) {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    return monthNames[date.getMonth()] // getMonth() returns 0-11
  }

  sortByBuyDate(a, b) {
    // const c = this.convertToDate(a.buyDate)
    // const d = this.convertToDate(b.buyDate)

    let m = a.buyDate.split('-')
    const c = new Date(m[1] + '/' + m[0] + '/' + m[2])

    m = b.buyDate.split('-')
    const d = new Date(m[1] + '/' + m[0] + '/' + m[2])

    return c - d
  }

  sortBySellDate(a, b) {
    let m = a.sellDate.split('-')
    const c = new Date(m[1] + '/' + m[0] + '/' + m[2])

    m = b.sellDate.split('-')
    const d = new Date(m[1] + '/' + m[0] + '/' + m[2])

    return c - d
  }

  sortObjects(arr, key, order: string = 'asc') {
    if (order === 'asc') {
      return arr.sort((a, b) => (a[key] > b[key] ? 1 : -1))
    }

    return arr.sort((a, b) => (a[key] < b[key] ? 1 : -1))
  }

  round(value, step) {
    step || (step = 1.0)
    const inv = 1.0 / step

    return Math.round(value * inv) / inv
  }

  syncReadFile(filename) {
    const contents = readFileSync(filename, 'utf-8')

    const arr = contents.split(/\r?\n/)

    let data = []

    arr.forEach((item) => {
      data.push(item.split(/\r?\t/))
    })

    return data
  }

  findS3BuyPrice(prevHigh, prevLow, prevClose) {
    const pivot_range = prevHigh - prevLow
    const pivotX_Median = (prevHigh + prevLow + prevClose) / 3

    return this.round(pivotX_Median - 1 * pivot_range, 0.05)
  }

  findPivotSellPrice(prevHigh, prevLow, prevClose) {
    return this.round((prevHigh + prevLow + prevClose) / 3, 0.05)
  }

  findProfitPercentage(buyPrice, sellPrice) {
    return parseFloat(((sellPrice / buyPrice - 1) * 100).toFixed(2))
  }

  percentChange(value, changePercent) {
    return this.formatFloat(value + value * (changePercent / 100))
  }

  arrayToStringWithTabs(arr) {
    return `${arr.join('\t')}\n`
  }

  formatFloat(value, decimalPlace: number = 2) {
    return parseFloat(parseFloat(value).toFixed(decimalPlace))
  }

  getStockCount(positions: any[], stock) {
    const arr = positions.filter((item) => item.stock === stock)

    return arr.length
  }

  calculateCAGR(initialValue, finalValue, numberOfPeriods) {
    // Calculate the CAGR formula
    const cagr = (finalValue / initialValue) ** (1 / numberOfPeriods) - 1

    // Convert CAGR to percentage and round to two decimal places
    const cagrPercentage = (cagr * 100).toFixed(2)

    return parseFloat(cagrPercentage)
  }

  calculateCAGRDays(initialValue, finalValue, numberOfPeriods) {
    // Calculate the CAGR formula
    const cagr =
      (finalValue / initialValue) ** (1 / (numberOfPeriods / 365)) - 1

    // Convert CAGR to percentage and round to two decimal places
    const cagrPercentage = (cagr * 100).toFixed(2)

    return parseFloat(cagrPercentage)
  }

  formatIndianNumber(number) {
    // Convert the number to a string
    const numberString = number.toString()

    // Split the number into integer and decimal parts
    const [integerPart, decimalPart] = numberString.split('.')

    // Format the integer part with commas for lakh and crore separators
    const formattedIntegerPart = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ',',
    )

    // Combine the formatted integer part and the decimal part
    const formattedNumber = decimalPart
      ? `${formattedIntegerPart}.${decimalPart}`
      : formattedIntegerPart

    return formattedNumber
  }

  async readCSVData(myCSVFilePath: string): Promise<any> {
    return csv()
      .fromFile(myCSVFilePath)
      .then((jsonArray) => jsonArray)
  }

  public writeJSON(xlData: any, filePath: string) {
    return new Promise((resolve) => {
      fs.writeFile(
        filePath,
        `export default ${JSON.stringify(xlData, null, 2)}`,
        (err) => {
          if (err) return err
          resolve(true)
          return 0
        },
      )
    })
  }
}

const utils = new Utils()

export { utils }
