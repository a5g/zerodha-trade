import { test } from '../fixtures/auto.test'
import config from '../config'

const users = config.users

test.describe('Kite Login', () => {
  for (let i = 0; i < config.users.length; i += 1) {
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

  // test('login => swetha', async ({ kite }) => {
  //   await kite.removeSession('swetha')
  //   await kite.gotoKite()
  //   await kite.login(
  //     'swetha',
  //     config.users.swetha.username,
  //     config.users.swetha.password,
  //   )
  // })

  // test('login => gayithri', async ({ kite }) => {
  //   await kite.removeSession('gayithri')
  //   await kite.gotoKite()
  //   await kite.login(
  //     'gayithri',
  //     config.users.gayithri.username,
  //     config.users.gayithri.password,
  //   )
  // })

  // test('login => savitha', async ({ kite }) => {
  //   await kite.removeSession('savitha')
  //   await kite.gotoKite()
  //   await kite.login(
  //     'savitha',
  //     config.users.savitha.username,
  //     config.users.savitha.password,
  //   )
  // })

  // test('login => veda', async ({ kite }) => {
  //   await kite.removeSession('veda')
  //   await kite.gotoKite()
  //   await kite.login(
  //     'veda',
  //     config.users.veda.username,
  //     config.users.veda.password,
  //   )
  // })
})
