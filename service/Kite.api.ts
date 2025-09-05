import { APIRequestContext } from '@playwright/test'
import qs from 'qs'

import { API } from './index'
import config from '../config'
import { utils } from '../utils/utils'
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
      order.transactionType === 'BUY'
        ? utils.zerodaPriceFormat(order.buyPrice * 1.005)
        : utils.zerodaPriceFormat(order.sellPrice * 0.995)

    const LAST_PRICE = utils.zerodaPriceFormat(triggerPrice * 0.99)

    const data = qs.stringify({
      condition: `{"exchange":"${order.exchange}","tradingsymbol":"${order.tradingSymbol}","trigger_values":[${triggerPrice}],"last_price":${order.lastPrice}}`,
      orders: `[{"exchange":"${order.exchange}","tradingsymbol":"${order.tradingSymbol}","transaction_type":"${order.transactionType}","quantity":${order.qty},"price":${price},"order_type":"LIMIT","product":"CNC"}]`,
      type: 'single',
      expires_at: this.getFutureDate(),
    })

    return data
  }

  public getOCOOrderData(order: any) {
    const stoplossTriggerPrice = utils.zerodaPriceFormat(order.stoplossPrice)
    const stoplossPrice = utils.zerodaPriceFormat(order.stoplossPrice * 0.995)
    const targetTriggerPrice = utils.zerodaPriceFormat(order.targetPrice)
    const targetPrice = utils.zerodaPriceFormat(order.targetPrice * 0.995)

    const data = qs.stringify({
      condition: `{"exchange":"${order.exchange}","tradingsymbol":"${order.tradingSymbol}","trigger_values":[${stoplossTriggerPrice}, ${targetTriggerPrice}],"last_price":${order.lastPrice}}`,
      orders: `[{"exchange":"${order.exchange}","tradingsymbol":"${order.tradingSymbol}","transaction_type":"${order.transactionType}","quantity":${order.qty},"price":${stoplossPrice},"order_type":"LIMIT","product":"CNC"},{"exchange":"${order.exchange}","tradingsymbol":"${order.tradingSymbol}","transaction_type":"${order.transactionType}","quantity":${order.qty},"price":${targetPrice},"order_type":"LIMIT","product":"CNC"}]`,
      type: 'two-leg',
      expires_at: this.getFutureDate(),
    })

    return data

    // {"exchange":"NSE","tradingsymbol":"IXIGO","trigger_values":[249.9,319.35],"last_price":277.7}
    // [{"exchange":"NSE","tradingsymbol":"IXIGO","transaction_type":"SELL","quantity":1,"price":263.8,"order_type":"LIMIT","product":"CNC"},{"exchange":"NSE","tradingsymbol":"IXIGO","transaction_type":"SELL","quantity":1,"price":291.55,"order_type":"LIMIT","product":"CNC"}]
    // two-leg
  }

  public async getLTP({ exchange, tradingsymbol }) {
    const request: any = {
      url: `${config.apiHost}/quote/ltp?i=${exchange}:${tradingsymbol}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
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
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
      data,
    }

    return super.post(request)
  }

  public async placeOCO(order: any) {
    const data = this.getOCOOrderData(order)
    const request: any = {
      url: `${config.apiHost}/oms/gtt/triggers`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
      data,
    }

    return super.post(request)
  }

  public async placeRegularOrder(payload: any) {
    const data = qs.stringify({
      variety: 'regular',
      exchange: payload.exchange,
      tradingsymbol: payload.tradingsymbol,
      transaction_type: payload.transaction_type,
      order_type: payload.order_type,
      quantity: payload.quantity,
      price: utils.zerodaPriceFormat(payload.price),
      product: 'CNC',
      validity: 'DAY',
      disclosed_quantity: 0,
      trigger_price: 0,
      squareoff: 0,
      stoploss: 0,
      trailing_stoploss: 0,
      user_id: utils.kiteuser().kiteid,
    })

    const request: any = {
      url: `${config.apiHost}/oms/orders/regular`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
      data,
    }

    return super.post(request)
  }

  public async placeAMO(payload: any) {
    const data = qs.stringify({
      variety: 'regular',
      exchange: payload.exchange,
      tradingsymbol: payload.tradingsymbol,
      transaction_type: payload.transaction_type,
      order_type: payload.order_type,
      quantity: payload.quantity,
      price: utils.zerodaPriceFormat(payload.price),
      product: 'CNC',
      validity: 'DAY',
      disclosed_quantity: 0,
      trigger_price: 0,
      squareoff: 0,
      stoploss: 0,
      trailing_stoploss: 0,
      user_id: utils.kiteuser().kiteid,
      tag: 'switch_to_amo',
    })

    const request: any = {
      url: `${config.apiHost}/oms/orders/amo`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
      data,
    }

    return super.post(request)
  }

  public async getRegularOpenOrders(tradingSymbol: string = '') {
    const request: any = {
      url: `${config.apiHost}/oms/orders`,
      method: 'GET',
      headers: {
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
    }

    const orders: any = await super.get(request)

    if (tradingSymbol !== '') {
      return orders.data.data.filter(
        (order) =>
          order.status === 'OPEN' && order.tradingsymbol === tradingSymbol,
      )
    }

    return []

    // return orders.data.data.filter((order) => order.status === 'OPEN')
  }

  public async getAMOOpenOrders(tradingSymbol: string = '') {
    const request: any = {
      url: `${config.apiHost}/oms/orders`,
      method: 'GET',
      headers: {
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
    }

    const orders: any = await super.get(request)

    if (tradingSymbol !== '') {
      return orders.data.data.filter(
        (order) =>
          order.status === 'AMO REQ RECEIVED' &&
          order.tradingsymbol === tradingSymbol,
      )
    }

    return []
    // return orders.data.data.filter(
    //   (order) => order.status === 'AMO REQ RECEIVED',
    // )
  }

  public async getGTTActiveOrders(tradingSymbol: string = '') {
    const request: any = {
      url: `${config.apiHost}/oms/gtt/triggers`,
      method: 'GET',
      headers: {
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
    }

    const orders: any = await super.get(request)

    if (tradingSymbol !== '') {
      return orders.data.data.filter(
        (order) =>
          order.status === 'active' &&
          order.condition.tradingsymbol === tradingSymbol &&
          order.type === 'single',
      )
    }

    return []

    // return orders.data.data.filter((order) => order.status === 'active')
  }

  public async getOCOActiveOrders(tradingSymbol: string = '') {
    const request: any = {
      url: `${config.apiHost}/oms/gtt/triggers`,
      method: 'GET',
      headers: {
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
    }

    const orders: any = await super.get(request)

    if (tradingSymbol !== '') {
      return orders.data.data.filter(
        (order) =>
          order.status === 'active' &&
          order.condition.tradingsymbol === tradingSymbol &&
          order.type === 'two-leg',
      )
    }

    return []

    // return orders.data.data.filter((order) => order.status === 'active')
  }

  public async cancelGTTOrder(id: number) {
    const request: any = {
      url: `${config.apiHost}/oms/gtt/triggers/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
    }

    return super.delete(request)
  }

  public async cancelRegularOrder(id: number) {
    const request: any = {
      url: `${config.apiHost}/oms/orders/regular/${id}?order_id=${id}&parent_order_id=&variety=regular`,
      method: 'DELETE',
      headers: {
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
    }

    return super.delete(request)
  }

  public async cancelAMOOrder(id: number) {
    const request: any = {
      url: `${config.apiHost}/oms/orders/amo/${id}?order_id=${id}&parent_order_id=&variety=regular`,
      method: 'DELETE',
      headers: {
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
    }

    return super.delete(request)
  }

  public async getHoldings(id: number = 1) {
    const request: any = {
      url: `${config.apiHost}/oms/portfolio/holdings`,
      method: 'GET',
      headers: {
        Authorization: `enctoken ${cookies[id]}`,
      },
    }

    return super.get(request)
  }

  public async getPositions() {
    const request: any = {
      url: `${config.apiHost}/oms/portfolio/positions`,
      method: 'GET',
      headers: {
        Authorization: `enctoken ${cookies[utils.kiteuser().id]}`,
      },
    }

    return super.get(request)
  }
}
