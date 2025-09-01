import { test } from '../../fixtures/auto.test'
import { utils } from '../../utils/utils'

test.use({ storageState: `.auth/${utils.kiteuser(1).id}.json` })
test(`@navigate [${utils.kiteuser(1).name}]`, async ({ kite }) => {
  await kite.gotoHoldingsPage()
  await kite.pause()
})
