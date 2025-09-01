# Zerodha Trade

A test automation framework for

- Automating order management for zerodha kite [kite](https://kite.zerodha.com/)
- Manage GTT order, Regular order

## Prerequisites

- Nodejs 12.x and above [Install Nodejs 12.x or later version using [nvm](https://github.com/creationix/nvm) or [Node.js](https://nodejs.org/en/)]

## Local Setup

$ git clone git@github.com:a5g/zerodha-trade.git
\$ cd zerdoha-trade 
\$ npm install  
\$ npx playwright install

## Run Tests
[Fetch data from excel - converts json]
$ npm run pull-data 

[Place GTT order]
$ npm run gtt

## Test Reports

To view the HTML Test reports

$ npm run report [or]  
\$ npx playwright show-report

## Preferred Editor

[VSCode](https://code.visualstudio.com/download) with extensions

- Prettier - Code Formatter
- ESLint
- Playwright Test

## Support

For any support or corporate trainings, feel free to reach out to me at gani.anand@gmail.com
