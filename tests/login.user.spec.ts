import { test } from '../fixtures/auto.test'
import { utils } from '../utils/utils'

test(`login [${utils.kiteuser().name}] [id: ${utils.kiteuser().kcid}]`, async ({
  kite,
}) => {
  await kite.removeSession(utils.kiteuser().kcid.toString())
  await kite.gotoKite()
  await kite.login(
    utils.kiteuser().kcid.toString(),
    utils.kiteuser().kiteid,
    utils.kiteuser().password,
  )
})
