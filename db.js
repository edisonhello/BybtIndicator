
import sqlite3 from 'sqlite3';

const sql = sqlite3.verbose();
const db = new sql.Database('./db.db');

db.serialize();

db.run(`create table if not exists LSRecord (
  symbol varchar(20),
  time bigint,
  value double,
  unique(symbol, time)
)`)

db.run(`create table if not exists FRRecord (
  symbol varchar(20),
  time bigint,
  value double,
  unique(symbol, time)
)`)

db.run(`create table if not exists PriceRecord (
  symbol varchar(20),
  time bigint,
  value double,
  unique(symbol, time)
)`)

db.run(`create table if not exists PositionRecord (
  symbol varchar(20),
  time bigint,
  value double,
  unique(symbol, time)
)`)

export async function insertRecord(tableName, data) {
  return insertRecords(tableName, [data]);
}

export async function insertRecords(tableName, datas) {
  return new Promise((resolve, reject) => {
    let cmd = `insert or ignore into ${tableName} values `;
    let extraCommands = []
    let params = []
    for (const data of datas) {
      params.push(data.symbol)
      params.push(data.time)
      params.push(data.value)
      extraCommands.push(`(?, ?, ?)`)
    }
    cmd += extraCommands.join(',')

    db.run(cmd, params, err => {
      if (err) return reject(err);
      resolve();
    })
  })
}

export async function getAllRecords(tableName, symbol) {
  return new Promise((resolve, reject) => {
    db.all(`select * from ${tableName} where symbol = ?`, [symbol], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  })
}