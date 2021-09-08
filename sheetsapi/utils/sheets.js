const {GoogleSpreadsheet} = require('google-spreadsheet')
const creds = require('../client_secret.json')
const ErrorResponse = require('../utils/errorResponse');
const async = require('async')
const NodeCache = require('node-cache')

const myCache = new NodeCache({stdTTL: 60 })

const fromA1Notation = (cell) => {
  const check = cell.toUpperCase().match(/([A-Z]+)([0-9]+)/)
  let columnName, row
  if (check) {
    [, columnName, row] = cell.toUpperCase().match(/([A-Z]+)([0-9]+)/);
  } else {
    [, columnName] = cell.toUpperCase().match(/([A-Z]+)/);
    row = 0
  }
  const characters = "Z".charCodeAt() - "A".charCodeAt() + 1;

  let column = 0;
  columnName.split("").forEach((char) => {
    column *= characters;
    column += char.charCodeAt() - "A".charCodeAt() + 1;
  });
  const r = parseInt(row)

  return {row:r, column };
};

// let promises = []

// const cb = () => {
//   console.log('callback' + data)
// }
//
// let queue = async.queue(async function(task, cb){
//   console.log('started')
//   const data = await _getSheetData(task)
//   console.log('finished')
//   console.log(data)
//   // cb();
// }, 1 /* 20 at a time*/);


exports.getSheetData = async function(url, query, body, key) {

  const doc = new GoogleSpreadsheet(url);

  // Authentication
  await doc.useServiceAccountAuth(creds);

  await doc.loadInfo(); // loads document properties and worksheets
  console.log("test: "+doc.title);

  let sheet
  if (query.searchParams.get('sheet')) {
    sheet = doc.sheetsByTitle[query.searchParams.get('sheet')]
    key = key + '?' + query.searchParams.get('sheet')
  } else {
    sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  }
  if (!sheet) {
    throw "Unable to find sheet " + query.searchParams.get('sheet');
  }
  console.log(sheet.title);


  let rows = myCache.get(key)
  if (rows == undefined) {
    rows = await sheet.getRows(); // can pass in { limit, offset }

    const success = myCache.set(key, rows)
    if (success) {
      console.log('new key added to cache ' + key)
    }
  } else {
    console.log('using cached data')
  }

  data =  await  _getSheetData({rows, url, query, body})

  return(data)
}
// url : the google sheet id
// query : params sent in the url : so for sheet )
// body : body filter parameters {colName : value [can be an array]}
_getSheetData = async function(task) {

  try {
    const {rows, body} = task
    let qFilter = body.query
    let range = body.range
    console.log(qFilter)

    let rangeFrom = {row:0, column:0}
    let rangeTo = {row:0, column:0}

    // if (query.searchParams.get('range')) {
    //   const range = query.searchParams.get('range').split(':')
    if (range) {
      const rangeSplit = range.split(':')
      if (rangeSplit[0]) {
        rangeFrom = fromA1Notation(rangeSplit[0])
      }
      if (rangeSplit[1]) {
        rangeTo = fromA1Notation(rangeSplit[1])
      }
    } else {
      // sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    }
    // await sheet.loadCells('B2:D5'); // A1 range

    let data = []
    let filterKeys = []
    if (typeof qFilter === 'object' && qFilter !== null) {
      filterKeys = Object.keys(qFilter)
    }
    //loop over the rows returned from sheet query
    rows.map((row, idx) => {
      let result = {}
      // check if the current row is in RANGE
      if ((rangeFrom.row===0 || idx>=(rangeFrom.row-1)) && (rangeTo.row===0 || idx<(rangeTo.row))) {
        if (rangeTo.column===0) {
          values = row._rawData
          keys = row._sheet.headerValues
        } else {
          values = row._rawData.slice(rangeFrom.column-1, rangeTo.column)
          keys = row._sheet.headerValues.slice(rangeFrom.column-1, rangeTo.column)
        }
        let check=[]
        // generate an Object from the sheet row data (columns names must be unique
        keys.forEach((key, i) => {
          // If there is a filter - check
          if (Array.isArray(filterKeys) && filterKeys.length) {
            check.push(filterKeys.some(k => {
              const qf = qFilter[k] //qf can be an array to filter against
              if (Array.isArray(qf)) {
                return (k===key && qf.some(q => {
                  // qf could contain some regex expression
                  // return q === values[i]
                  const reg = new RegExp(q)
                  return (reg.test(values[i]))
                }))
              } else {
                const reg = new RegExp(qf)
                return (k===key && reg.test(values[i]))
              }
            }))
          } else {
            // no filter in the url body - just return all the data
            check.push(true)
          }
          result[key] = values[i]

        });
        // if any true's in the check list - it has matched a criteria and should be returned
        if (check.some(c => c===true)) {
          data.push(result)
        }
      }
    })
    return(data)
  } catch (e) {
    // console.log(e)
    throw new ErrorResponse(e);
  }
}


