import { test } from '../fixtures/auto.test'

test(`Get LTP from google finance`, async ({ page }) => {
  const url = `https://www.google.com/finance/quote/APOLLO:NSE`
  await page.goto(url)
  await page.waitForTimeout(5000)
  const ll = await page.$$('//main')
  console.log(ll.length)
  const html = await ll[0].textContent()
  console.log(html)
})
