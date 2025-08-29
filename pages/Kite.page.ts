// import fs from 'fs'
import { Page } from '@playwright/test'
import config from '../config'

const XLSX = require('xlsx')
const fs = require('fs')

const fileName = '../.auth/cookies.json'
const file = require(fileName)
// const csv = require('csv-parser')

export default class KitePage {
  private page: Page
  private DELAY: number = 50
  constructor(page: Page) {
    this.page = page
  }

  // prettier-ignore
  public get loginUserText() { return this.page.getByLabel('Phone number or User ID') }
  // prettier-ignore
  public get loginPasswordText() { return this.page.getByLabel('Password') }
  // prettier-ignore
  public get loginBtn() { return this.page.getByRole('button', { name: 'Login' }) }
  // prettier-ignore
  public get totpText() { return this.page.getByPlaceholder('••••••') }
  // prettier-ignore
  public get userIcon() { return this.page.locator('span[class="user-id"]') }
  // prettier-ignore
  public get riskDialogIUnderstandButton() { return this.page.getByRole('button', { name: 'I understand' }) }
  // prettier-ignore
  public get userProfile() { return this.page.getByLabel('User profile') }
  // prettier-ignore
  public get logoutBtn() { return this.page.locator('a[href="/logout"]') }

  // new fields
  // prettier-ignore
  public get searchText() {
    return this.page.locator('//input[contains(@placeholder, "Search eg:")]')
  }

  public get gttSearchText() {
    return this.page
      .locator('//input[contains(@placeholder, "Search eg:")]')
      .nth(1)
  }

  // prettier-ignore
  public get searchResultsFirstItem() {
    return this.page.locator('.omnisearch-results li:nth-child(1)')
  }

  // prettier-ignore
  public get buyBtn() {
    return this.page.getByRole('button', { name: 'Buy' })
  }

  // prettier-ignore
  public get sellBtn() {
      return this.page.getByRole('button', { name: 'Sell' })
    }

  // prettier-ignore
  public get regularTab() {
    return this.page.locator(`//div//label[.='Regular']`)
  }

  // prettier-ignore
  public get nseRadioBtn() {
    return this.page.getByText('NSE ₹')
  }

  // prettier-ignore
  public get cncRadioBtn() {
    return this.page.locator(`//div//span[.='CNC']`)
  }

  // prettier-ignore
  public get limitRadioBtn() {
    return this.page.locator(`//label[.="Limit"]`)
  }

  // prettier-ignore
  public get qtyText() {
    return this.page.locator(`//input[@label="Qty."]`)
  }

  // prettier-ignore
  public get priceText() {
    return this.page.locator(`//input[@label="Price"]`)
  }

  // prettier-ignore
  public get triggerPriceText() {
    return this.page.locator(`//input[@label="Trigger price"]`)
  }

  // prettier-ignore
  public get placeOrderBtn() {
    return this.page
        .getByRole('button', { name: 'Place order' })
  }

  public readDataFromXLSX(filePath: string) {
    const workbook = XLSX.readFile(filePath)
    const sheetNameList = workbook.SheetNames
    console.log(sheetNameList)
    const xlData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets.test)
    console.log(xlData)
    return xlData.filter((data) => data.trading_symbol !== undefined)
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

  public async removeSession(name: string) {
    fs.writeFile(
      `.auth/${name}.json`,
      JSON.stringify({ session: null }, null, 2),
      (err) => {
        if (err) return err

        return 0
        // console.log('Hello World > helloworld.txt')
      },
    )
  }

  public async storeSession(name: string) {
    await this.page.context().storageState({ path: `.auth/${name}.json` })
    const cookies = await this.page.context().cookies()
    const enctoken = cookies.filter((d) => d.name === 'enctoken')[0].value

    file[name] = enctoken

    fs.writeFile(
      '.auth/cookies.json',
      JSON.stringify(file),
      function writeJSON(err) {
        if (err) return console.log(err)
        console.log(JSON.stringify(file))
        console.log(`writing to .auth/cookies.json`)
      },
    )
    // console.log(cookies)
  }

  public async gotoKite(path: string = '/') {
    await this.page.goto(`${config.baseURL}${path}`)
    await this.page.waitForTimeout(1000)
  }

  public async acceptRisk() {
    try {
      await this.riskDialogIUnderstandButton.click({ timeout: 100 })
    } catch (e) {
      console.log('Could not find investor risk dialog')
    }
  }

  public async gotoDashboardPage() {
    await this.gotoKite('/dashboard')
    await this.acceptRisk()
  }

  public async gotoHoldingsPage() {
    await this.gotoKite('/holdings')
    await this.acceptRisk()
    // await this.page.waitForTimeout(1000)
    await this.page.locator('text=Net chg.').click()
    await this.page.locator('text=Net chg.').click()
  }

  public async gotoOrdersPage() {
    await this.gotoKite('/orders')
    await this.acceptRisk()
    await this.page.waitForTimeout(100)
  }

  public async gotoGTTPage() {
    await this.gotoOrdersPage()
    // await this.page.getByRole('link', { name: 'Orders' }).click()
    await this.page.getByRole('link', { name: 'GTT' }).click()
  }

  public async login(name: string, username: string, password: string) {
    await this.loginUserText.fill(username)
    await this.page.waitForTimeout(500)
    await this.loginPasswordText.fill(password)
    await this.page.waitForTimeout(500)
    await this.loginBtn.click()
    await this.userProfile.waitFor()
    await this.storeSession(name)
  }

  public async regularOrder(
    stock: string,
    type: string,
    qty: number,
    price: number,
  ) {
    await this.gotoDashboardPage()
    await this.page.getByRole('tab', { name: '7' }).click()

    await this.searchText.fill(stock)
    await this.searchResultsFirstItem.hover()

    if (type.toLocaleLowerCase() === 'buy') {
      await this.buyBtn.click()
    }

    if (type.toLowerCase() === 'sell') {
      await this.sellBtn.click()
    }

    await this.regularTab.click()

    try {
      await this.nseRadioBtn.click({ timeout: 2000 })
    } catch (e) {
      console.log('Its a BSE stock. NSE option not found!')
    }

    await this.cncRadioBtn.click()
    await this.limitRadioBtn.click()
    await this.qtyText.fill(qty.toString())
    await this.priceText.fill(price.toString())
    await this.page.waitForTimeout(2500)

    if (type.toLocaleLowerCase() === 'buy') {
      await this.buyBtn.click()
    }

    if (type.toLowerCase() === 'sell') {
      await this.sellBtn.click()
    }

    try {
      await this.page
        .getByRole('button', { name: 'Place order' })
        .click({ timeout: 2000 })
    } catch (e) {
      console.log('Could not find order risk dialog')
    }
    await this.page.getByRole('link', { name: 'Orders' }).click()
    await this.page.waitForTimeout(100)
  }

  public async gttOrder(
    stock: string,
    type: string,
    qty: number,
    price: number,
  ) {
    await this.gotoGTTPage()
    await this.page.getByRole('button', { name: 'New GTT' }).click()
    await this.gttSearchText.fill(stock)
    await this.searchResultsFirstItem.click()
    await this.page.getByRole('button', { name: 'Create GTT' }).click()

    if (type.toLowerCase() === 'buy') {
      await this.page.locator(`//label[.='Buy']`).click()
    }

    if (type.toLowerCase() === 'sell') {
      await this.page.locator(`//label[.='Sell']`).click()
    }

    await this.page.locator(`//label[.='Single']`).click()
    await this.triggerPriceText.fill(price.toString())
    await this.qtyText.fill(qty.toString())
    await this.priceText.fill(price.toString())
    await this.page.waitForTimeout(500)
    await this.page.getByRole('button', { name: 'Place' }).click()
    await this.page.waitForTimeout(1000)

    // await this.page.screenshot({
    //   path: `screenshots/gtt-${type.toLowerCase()}-/${stock}.png`,
    // })
  }

  public async pause() {
    await this.page.pause()
  }
}
