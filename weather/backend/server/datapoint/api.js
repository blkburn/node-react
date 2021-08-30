// var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
import XMLHttpRequest from 'xmlhttprequest'

function Api() {

  this.FCS_URL = 'http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/'
  this.OBS_URL = 'http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/'
  this.RFCS_URL = 'http://datapoint.metoffice.gov.uk/public/data/txt/wxfcs/regionalforecast/json/'
}

Api.prototype.formatParams = function (params) {
  return '?' + Object
  .keys(params)
  .map(function (key) {
    return key + '=' + params[key]
  })
  .join('&')
}

Api.prototype.call_api = function (api_key, type, path, params) {
  if (api_key === undefined || api_key == '') {
    console.log('No API key set.')
    return false
  }

  if (params === undefined) {
    params = {}
  }
  let payload = params
  payload.key = api_key

  // if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined') {
  //   var xhttp = new window.XMLHttpRequest()
  // } else {
  var xhttp = new XMLHttpRequest.XMLHttpRequest()
  // }

  if (type == 'fcs') {
    var url = this.FCS_URL
  } else if (type == 'obs') {
    var url = this.OBS_URL
  } else if (type == 'rfcs') {
    var url = this.RFCS_URL
  } else {
    console.log('No request type set.')
    return false
  }

  url += path + this.formatParams(payload)
  // console.log(url);
  xhttp.open('GET', url, false)
  xhttp.send()

  if (xhttp.readyState == 4 && xhttp.status == 200) {
    let call_response = JSON.parse(xhttp.responseText)
    return call_response
  } else if (xhttp.status <= 599 && xhttp.status >= 400) {
    console.log('API request failed - Code ' + xhttp.status)
    console.log(xhttp.responseText)
    return false
  }
}

export default Api