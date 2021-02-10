
import axios from 'axios';
import Plotly from 'plotly';

import apiKey from './apiKey.js';

let plotly = Plotly(apiKey.acc, apiKey.key)

function getEmptyPlot(name) { return { x: [], y: [], type: 'scatter', name } }

const symbol = "ETH"
const fundingRateUrl = `https://fapi.bybt.com/api/fundingRate/history/chart?symbol=${symbol}`;
const longShortUrl = `https://fapi.bybt.com/api/futures/longShortChart?symbol=${symbol}&timeType=1`;
const positionUrl = `https://fapi.bybt.com/api/openInterest/v3/chart?symbol=${symbol}&timeType=1&exchangeName=&type=0`;

async function main() {

let fundingRate = (await axios.get(fundingRateUrl)).data.data;
let longShort = (await axios.get(longShortUrl)).data.data;
let position = (await axios.get(positionUrl)).data.data;

let fundingRateBinanceData = getEmptyPlot('Binance FR');
let priceData = getEmptyPlot('price')
fundingRate.dateList.forEach((date, i) => {
  fundingRateBinanceData.x.push(date)
  fundingRateBinanceData.y.push(fundingRate.dataMap.Binance[i])

  priceData.x.push(date)
  priceData.y.push(fundingRate.priceList[i])
})

let longShortRateData = getEmptyPlot('LS');
longShort.dateList.forEach((date, i) => {
  longShortRateData.x.push(date)
  longShortRateData.y.push(longShort.longShortRateList[i])
})

let positionBinanceData = getEmptyPlot('Binance Position');
position.dateList.forEach((date, i) => {
  positionBinanceData.x.push(date)
  positionBinanceData.y.push(position.dataMap.Binance[i])
})

fundingRateBinanceData.yaxis = 'y2'
// fundingRateBinanceData.xaxis = 'x2'
longShortRateData.yaxis = 'y3'
// longShortRateData.xaxis = 'x3'
positionBinanceData.yaxis = 'y4'
// positionBinanceData.xaxis = 'x4'

const minimumTime = longShortRateData.x[0]
while (fundingRateBinanceData.x[0] < minimumTime) {
  fundingRateBinanceData.x.splice(0, 1)
  fundingRateBinanceData.y.splice(0, 1)
}
while (priceData.x[0] < minimumTime) {
  priceData.x.splice(0, 1)
  priceData.y.splice(0, 1)
}

plotly.plot([
  priceData, 
  fundingRateBinanceData, 
  longShortRateData,
  positionBinanceData,
], { 
  filename: 'position', 
  fileopt: 'overwrite',
  layout: {
    // xaxis:  { range: [longShortRateData.x[0], Date.now()] },
    yaxis:  { title: 'price', overlaying: 'y', side: 'right', domain: [0, 0.4] },
    yaxis2: { title: 'funding rate', overlaying: 'y', side: 'right', domain: [0.42, 0.58] },
    yaxis3: { title: 'LSUR', overlaying: 'y', side: 'right', domain: [0.62, 0.78] },
    yaxis4: { title: 'position', overlaying: 'y', side: 'right', domain: [0.82, 1] },
    grid: { rows: 4, columns: 1, pattern: 'independent' },
  }
}, (err, msg) => {
  if (err) console.error(err)
  else console.log(msg)
})




}

main()
