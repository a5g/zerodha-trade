import { test } from '../fixtures/auto.test'
import config from '../config'

const users = config.users

test.describe('Kite Login', () => {
  for (let i = 0; i < users.length; i += 1) {
    test(`[${users[i].name}] [kcid: ${users[i].kcid}]`, async ({ kite }) => {
      await kite.removeSession(users[i].kcid.toString())
      await kite.gotoKite()
      await kite.login(
        users[i].kcid.toString(),
        config.users[i].kiteid,
        config.users[i].password,
      )
    })
  }
})
