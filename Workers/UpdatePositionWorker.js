
import axios from 'axios';

import UpdateWorker from './UpdateWorker.js';
import { insertRecord } from '../db.js';

class UpdatePositionWorker extends UpdateWorker {
  constructor(symbol) {
    super(symbol);

    this.timeInterval = 4 * 60 * 60 * 1000;
  }

  get url() {
    return `https://fapi.bybt.com/api/openInterest/v3/chart?symbol=${this.symbol}&timeType=1&exchangeName=&type=0`;
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
        let pos = 0;
        for (const exchange of Object.keys(data.dataMap)) {
          pos += data.dataMap[exchange][i];
        }
        return insertRecord(`PositionRecord`, { symbol: this.symbol, time: date, value: pos });
      }
    })
    return Promise.all(insertDataPromises);
  }
}

export default UpdatePositionWorker;