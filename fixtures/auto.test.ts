import { test as baseTest } from '@playwright/test'
import KitePage from '../pages/Kite.page'
import { API, KiteAPI } from '../service'
import { Utils } from '../utils/utils'

const fixture = baseTest.extend<{
  kite: KitePage

  api: API
  kiteAPI: KiteAPI
  utils: Utils
}>({
  kite: async ({ page }, use) => {
    await use(new KitePage(page))
  },

  kiteAPI: async ({ request }, use) => {
    await use(new KiteAPI(request))
  },

  utils: async ({}, use) => {
    await use(new Utils())
  },
})

export const test = fixture
export const expect = fixture.expect
