import { APIRequestContext, expect } from '@playwright/test'
import axios from 'axios'

import config from '../config'
// const axios = require('axios')

// const Ajv = require('ajv')

export class API {
  request: APIRequestContext

  constructor(request: APIRequestContext) {
    this.request = request
  }

  getcURL(options: any) {
    let curl = ''

    curl += `curl -X ${options.method} `
    curl += `'${options.url}'`

    // add common headers
    if (config.extraHTTPHeaders) {
      Object.keys(config.extraHTTPHeaders).forEach((header) => {
        curl += `\n -H '${header}: ${config.extraHTTPHeaders[header]}'`
      })
    }

    // add request specific headers
    if (options.headers) {
      Object.keys(options.headers).forEach((header) => {
        curl += `\n -H '${header}: ${options.headers[header]}'`
      })
    }

    if (options.data) {
      curl += `\n -d '${JSON.stringify(options.data)}'`
    }

    return curl
  }

  printcURL(options: any) {
    console.log(
      `Request:\n----------------------------------\n${this.getcURL(options)}`,
    )
  }

  printResponse(response: any) {
    console.log(`\n\nResponse:\n----------------------------------`)
    console.log(`Response Time: ${response.time}`)
    console.log(`Status Code: ${response.status}`)
    console.log(`Status Text: ${response.statusText}`)
    console.log(`Body: ${JSON.stringify(response.data, null, 2)}`)
    console.log(`\n--------------- END OF DATA ---------------\n\n`)
  }

  // public verifySchema(schema: any, data: any) {
  //   const ajv = new Ajv({ allErrors: true })
  //   const validate = ajv.compile(schema)
  //   const valid = validate(data)

  //   if (!valid) {
  //     console.log(
  //       `\n\nSchema Validation Error\n----------------------------------`,
  //     )
  //     console.log(validate.errors)
  //     expect(valid).toBeTruthy()
  //   }
  // }

  public millisecondsToSeconds(time: number) {
    return time > 1000 ? `${(time / 1000).toFixed(2)}s` : `${time}ms`
  }

  public async axiosRequest(request: any) {
    let response
    try {
      response = await axios.request(request)
      // console.log(response.data)
      return response
      // Do something with the response
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error({
          ...error.response.data,
          status_code: error.status,
          url: request.url,
        })
        // Do something with this error...
      } else {
        console.error(error)
      }
      throw error
    }
  }

  public async get(options: any) {
    // this.printcURL(options)

    // const start = new Date().getTime()
    // const response = await this.request.get(options.url, {
    //   headers: options.headers,
    //   data: options.data,
    // })

    // return this.validation(start, response)

    return this.axiosRequest(options)
  }

  public async getAxios(options: any) {
    // this.printcURL(options)

    // const start = new Date().getTime()
    // const response = await axios.get(options.url, {
    //   headers: options.headers,
    // })

    let response
    try {
      response = await axios.request(options)
      // console.log(response.data)
      return response.data
      // Do something with the response
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error({
          ...error.response.data,
          status_code: error.status,
          url: options.url,
        })
        // Do something with this error...
      } else {
        console.error(error)
      }
      throw error
    }

    // const cnfg = {
    //   method: 'GET',
    //   maxBodyLength: Infinity,
    //   url: 'https://kite.zerodha.com/oms/gtt/triggers',
    //   headers: {
    //     authorization:
    //       'enctoken K9dL0ijDkF6qIaKiTr0LxGGlJt16adneoK6N00wwyxP62011LiKFJegHWJcYKSAU+yRghTfvAkKqnzyGuPqTsR1lGNWoqyB2vUp8+pS+rGym3LXrFOn+SQ==',
    //   },
    // }

    // axios.get
    // return axios
    //   .request(cnfg)
    //   .then((res) => {
    //     console.log(JSON.stringify(res.data))
    //     expect(res).toBeTruthy()
    //     return res.data
    //   })
    //   .catch((error) => {
    //     console.log(error.response.data)
    //   })

    // return axios
    //   .request(cnfg)
    //   .then((response) => {
    //     return response
    //   })
    //   .catch((error) => {
    //     console.log(error.response.data)
    //   })
    // return response
    // return this.validation(start, response)
  }

  public async post(request: any) {
    // const start = new Date().getTime()
    // const response = await this.request.post(request.url, {
    //   headers: request.headers,
    //   data: request.data,
    // })

    // return this.validation(start, response)

    return this.axiosRequest(request)
  }

  public async put(options: any) {
    // this.printcURL(options)

    // const start = new Date().getTime()
    // const response = await this.request.put(options.url, {
    //   headers: options.headers,
    //   data: options.data,
    // })

    // return this.validation(start, response)

    return this.axiosRequest(options)
  }

  public async delete(options: any) {
    // this.printcURL(options)

    // const start = new Date().getTime()
    // const response = await this.request.delete(options.url, {
    //   headers: options.headers,
    //   data: options.data,
    // })

    // return this.validation(start, response)

    return this.axiosRequest(options)
  }

  public async validation(start: number, response: any) {
    const timeTaken = new Date().getTime() - start

    let data

    console.log(response)

    try {
      data = await response.json()
      data.statusCode = response.status()
    } catch (e) {
      data = ''
    }

    try {
      expect(response.ok()).toBeTruthy()
    } catch (error) {
      console.log(data)

      throw error // rethrow so test still fails
    }

    return { response, data }
  }
}
