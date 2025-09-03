import { test } from '../fixtures/auto.test'
import config from '../config'

const users = config.users

test.describe('Kite Login', () => {
  for (let i = 0; i < 5; i += 1) {
    test(`[${users[i].name}] [id: ${users[i].id}]`, async ({ kite }) => {
      await kite.removeSession(users[i].id.toString())
      await kite.gotoKite()
      await kite.login(
        users[i].id.toString(),
        config.users[i].kiteid,
        config.users[i].password,
      )
    })
  }
})
