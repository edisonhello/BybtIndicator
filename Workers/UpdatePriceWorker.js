
import axios from 'axios';

import UpdateWorker from './UpdateWorker.js';
import { insertRecord } from '../db.js';

class UpdatePriceWorker extends UpdateWorker {
  constructor(symbol) {
    super(symbol);

    this.timeInterval = 4 * 60 * 60 * 1000;
  }

  get url() {
    // return `https://fapi.bybt.com/api/fundingRate/history/chart?symbol=${this.symbol}`;
    return `https://fapi.bybt.com/api/futures/longShortChart?symbol=${this.symbol}&timeType=1`;
  }

  async fetchData() {
    const result = await axios.get(this.url);
    let data = result.data.data;
    return data;
  }

  async work() {
    let data = await this.fetchData();
    const insertDataPromises = data.dateList.map((date, i) => {
      if (date % this.timeInterval === 0) {
        return insertRecord(`PriceRecord`, { symbol: this.symbol, time: date, value: data.priceList[i] });
      }
    })
    return Promise.all(insertDataPromises);
  }
}

export default UpdatePriceWorker;