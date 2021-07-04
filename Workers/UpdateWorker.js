
import { scheduleJob } from 'node-schedule';

class UpdateWorker {
  constructor(symbol) {
    this.symbol = symbol

    this.registerWork()
    this._work()
  }

  registerWork() {
    this.job = scheduleJob('5 */5 * * * *', (() => {
      this.workingPromise = this._work();
    }).bind(this));
  }

  get url() {
    throw new Error('No url!');
  }

  async _work() {
    await this._beforeWork();
    await this.work();
    await this._afterWork();
  }

  async work() {
    throw new Error('No work!');
  }

  async _beforeWork() {
    await this.beforeWorkCb?.();
    await this.beforeWork();
  }

  async beforeWork() { }

  async _afterWork() {
    await this.afterWorkCb?.();
    await this.afterWork();
  }

  async afterWork() { }

  registerAfterWorkCb(cb) {
    this.afterWorkCb = cb;
  }
}

export default UpdateWorker;