const users = require('./users.json')

export const ACTIVE_USER = 1

export default {
  baseURL: 'https://kite.zerodha.com',
  apiHost: 'https://kite.zerodha.com',
  kcid: parseInt(process.env.kcid, 10) || 1,
  holdingsOrder: process.env.holdingsOrder || 'net',
  users,
}
