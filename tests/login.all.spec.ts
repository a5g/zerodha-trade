import { test } from '../fixtures/auto.test'
import config from '../config'

const users = config.users

test.describe('Kite Login => ', () => {
  for (let i = 0; i < users.length; i += 1) {
    test(`login => ${users[i].name}`, async ({ kite }) => {
      await kite.removeSession(users[i].name)
      await kite.gotoKite()
      await kite.login(
        users[i].name,
        config.users[i].username,
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
