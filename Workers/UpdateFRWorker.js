
import axios from 'axios';

import UpdateWorker from './UpdateWorker.js';
import { insertRecord } from '../db.js';

class UpdateFRWorker extends UpdateWorker {
  constructor(symbol) {
    super(symbol);

    this.timeInterval = 8 * 60 * 60 * 1000;
  }

  get url() {
    return `https://fapi.bybt.com/api/fundingRate/history/chart?symbol=${this.symbol}`;
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
        let fr = 0;
        for (const exchange of Object.keys(data.dataMap)) {
          fr += data.dataMap[exchange][i];
        }
        return insertRecord(`FRRecord`, { symbol: this.symbol, time: date, value: fr });
      }
    })
    return Promise.all(insertDataPromises);
  }
}

export default UpdateFRWorker;