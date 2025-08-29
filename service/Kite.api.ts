import { APIRequestContext } from '@playwright/test'
import qs from 'qs'

import { API } from './index'
import config from '../config'
// import { utils } from '../utils/utils'
// const qs = require('qs')

const cookies = require('../.auth/cookies.json')

export class KiteAPI extends API {
  request: APIRequestContext

  /**
   * Constructs a new KiteAPI instance with the provided APIRequestContext.
   *
   * @param request - The APIRequestContext to use for making API requests.
   */
  constructor(request: APIRequestContext) {
    super(request)
    this.request = request
  }

  public getFutureDate() {
    const today = new Date()

    // Add 1 year
    const futureDate = new Date(today)
    futureDate.setFullYear(today.getFullYear() + 1)

    // Format as YYYY-MM-DD HH:MM:SS
    const yyyy = futureDate.getFullYear()
    const mm = String(futureDate.getMonth() + 1).padStart(2, '0') // months are 0-based
    const dd = String(futureDate.getDate() - 1).padStart(2, '0')
    const HH = '00'
    const MM = '00'
    const SS = '00'

    return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`
  }

  public getGTTOrderData(order: any) {
    const triggerPrice =
      order.transactionType === 'BUY' ? order.buyPrice : order.sellPrice
    const price =
      order.transactionType === 'BUY' ? order.buyPrice : order.sellPrice

    const data = qs.stringify({
      condition: `{"exchange":"${order.exchange}","tradingsymbol":"${order.tradingSymbol}","trigger_values":[${triggerPrice}],"last_price":${order.lastPrice}}`,
      orders: `[{"exchange":"${order.exchange}","tradingsymbol":"${order.tradingSymbol}","transaction_type":"${order.transactionType}","quantity":${order.qty},"price":${price},"order_type":"LIMIT","product":"CNC"}]`,
      type: 'single',
      expires_at: this.getFutureDate(),
    })

    return data
  }

  public async getLTP({ exchange, tradingsymbol }) {
    const request: any = {
      url: `${config.apiHost}/quote/ltp?i=${exchange}:${tradingsymbol}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `enctoken ${cookies.anand}`,
      },
    }

    return super.get(request)
  }

  public async placeGTT(order: any) {
    const data = this.getGTTOrderData(order)
    const request: any = {
      url: `${config.apiHost}/oms/gtt/triggers`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `enctoken ${cookies[order.user]}`,
      },
      data,
    }

    return super.post(request)
  }

  public async placeRegularOrder(order: any) {
    const data = this.getGTTOrderData(order)
    const request: any = {
      url: `${config.apiHost}/oms/orders/regular`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `enctoken ${cookies[order.user]}`,
      },
      data,
    }

    return super.post(request)
  }
}

// Google sheet link
// https://docs.google.com/spreadsheets/d/1ZOxBZE8JgM0tgAhxrtuwGbja1kN5Yx-_JejVzOqIrcs/edit?usp=sharing
