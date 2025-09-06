import { test } from '../fixtures/auto.test'
import { utils } from '../utils/utils'

test.use({ storageState: `.auth/${utils.kiteuser().kcid}.json` })
test(`@kite [${utils.kiteuser().name}] [kcid: ${utils.kiteuser().kcid}]`, async ({
  kite,
}) => {
  await kite.gotoHoldingsPage()
  await kite.pause()
})
