
import axios from 'axios';
import { scheduleJob } from 'node-schedule';
import Plotly from 'plotly';

import apiKey from './apiKey.js';
import UpdatePriceWorker from './Workers/UpdatePriceWorker.js';
import UpdateFRWorker from './Workers/UpdateFRWorker.js';
import UpdateLSWorker from './Workers/UpdateLSWorker.js';
import UpdatePositionWorker from './Workers/UpdatePositionWorker.js';
import { getAllRecords } from './db.js';

let plotly = Plotly(apiKey.acc, apiKey.key)

function getEmptyPlot(name) { return { x: [], y: [], type: 'scatter', name } }

const updateWorkers = [
  UpdatePriceWorker,
  UpdateFRWorker,
  UpdateLSWorker,
  UpdatePositionWorker,
];

async function symbolMain(symbol) {
  const workers = updateWorkers.map(clazz => new clazz(symbol))

  async function redraw() {
    console.log('redraw called');
    const plotNames = ['Price', 'LS', 'FR', 'Position'];
    const tableNames = ['PriceRecord', 'LSRecord', 'FRRecord', 'PositionRecord'];
    let records = await Promise.all(tableNames.map(tableName => getAllRecords(tableName, symbol)))
    records = records.map((record, i) => {
      let result = getEmptyPlot(plotNames[i]);
      if (i > 0) result.yaxis = `y${i + 1}`;
      record.forEach(({ time, value }) => {
        result.x.push(time)
        result.y.push(value);
      });
      return result;
    })
    console.log('new records', records)
    plotly.plot(records, {
      filename: 'position',
      fileopt: 'overwrite',
      layout: {
        // xaxis:  { range: [longShortRateData.x[0], Date.now()] },
        yaxis: { title: 'price', overlaying: 'y', side: 'right', domain: [0.61, 1] },
        yaxis2: { title: 'LS', overlaying: 'y', side: 'right', domain: [0.41, 0.59] },
        yaxis3: { title: 'FR', overlaying: 'y', side: 'right', domain: [0.21, 0.39] },
        yaxis4: { title: 'position', overlaying: 'y', side: 'right', domain: [0, 0.19] },
        grid: { rows: 4, columns: 1, pattern: 'independent' },
      }
    }, (err, msg) => {
      if (err) console.error(err)
      else console.log(msg)
    })
  }

  workers.forEach(worker => worker.registerAfterWorkCb(redraw))
}

symbolMain('ETH');

/*

await Promise.all([
  fetchPriceData(symbol),
  fetchFRData(symbol),
  fetchLSData(symbol),
  fetchPositionData(symbol),
])

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

*/