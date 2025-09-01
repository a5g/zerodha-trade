import { test, expect } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('https://kite.zerodha.com/?next=%2Fdashboard')
  await page.getByRole('textbox', { name: 'Phone number or User ID' }).click()
  await page
    .getByRole('textbox', { name: 'Phone number or User ID' })
    .fill('UT0149')
  await page
    .getByRole('textbox', { name: 'Phone number or User ID' })
    .press('Tab')
  await page.getByRole('textbox', { name: 'Password' }).fill('swetha#1661')
  await page.getByRole('textbox', { name: 'Password' }).press('Enter')
  await page.getByRole('button', { name: 'Login' }).click()
  await page.getByRole('spinbutton', { name: 'External TOTP' }).fill('671916')
  await page.goto('https://kite.zerodha.com/dashboard')
  await page.getByRole('button', { name: 'I understand' }).click()
  await page.getByRole('tab', { name: '7' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()

  await page.getByRole('tab', { name: '7' }).click()
  await page
    .getByRole('textbox', { name: 'Search eg: infy bse, nifty' })
    .click()

  await page.$('//input[contains(@placeholder, "Search eg:")]').fill('JPPOWER')
  await page
    .getByRole('textbox', { name: 'Search eg: infy bse, nifty' })
    .fill('JPPOWER')
  await page.$('.omnisearch-results li:nth-child(1)').hover()
  await page.getByRole('button', { name: 'Buy' }).click()
  // await page.$(`//input[@value='NSE']`).click()
  await page.getByText('NSE ₹').click()
  await page.$(`//div//label[.='Regular']`).click()
  await page.$(`//label[.="Limit"]`).click()
  await page.$(`//div//span[.='CNC']`).click()
  await page.$(`//input[@label="Qty."]`).fill('10')
  await page.$(`//input[@label="Price"]`).fill('22.5')
  await page.getByRole('button', { name: 'Buy' }).click()

  try {
    await page
      .getByRole('button', { name: 'Place order' })
      .click({ timeout: 5000 })
  } catch (e) {
    console.log(e)
  }
  await page.getByRole('link', { name: 'Orders' }).click()
})

// await page
//   .getByRole('list')
//   .locator('div')
//   .filter({ hasText: 'JPPOWER JAIPRAKASH POWER VEN. NSE' })
//   .locator('div')
//   .nth(1)
//   .click()
//input[contains(@label, 'Price')]

await page.getByText('Regular').click()
await page.getByText('Regular').click()
await page.getByText('Regular').click()
await page.getByRole('link', { name: '' }).click()
await page.getByText('NSE ₹').click()
await page.getByText('Regular').click()

await page.getByRole('spinbutton', { name: 'Price' }).click()
await page.getByRole('spinbutton', { name: 'Price' }).click()
await page.getByRole('spinbutton', { name: 'Price' }).dblclick()
await page.getByRole('spinbutton', { name: 'Price' }).fill('22.5')
