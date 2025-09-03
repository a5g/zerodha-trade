import { test } from '../fixtures/auto.test'
import { utils } from '../utils/utils'

test(`login [${utils.kiteuser().name}] [id: ${utils.kiteuser().id}]`, async ({
  kite,
}) => {
  await kite.removeSession(utils.kiteuser().id.toString())
  await kite.gotoKite()
  await kite.login(
    utils.kiteuser().id.toString(),
    utils.kiteuser().kiteid,
    utils.kiteuser().password,
  )
})
