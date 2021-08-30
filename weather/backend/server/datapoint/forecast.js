// var api = require('./api')
// var settings = require('./settings')

import settings from './settings.js'

function forecast(api) {
  this.params = null
  this.frequency = null
  this.api = api
}

forecast.prototype.get_forecast_for_site = function (api_key, site_id, frequency) {
  if (frequency === undefined) {
    this.frequency = 'daily'
  } else {
    this.frequency = frequency
  }
  var data = this.api.call_api(api_key, 'fcs', site_id, {'res': this.frequency})
  this.params = data.SiteRep.Wx.Param
  var forecast = {}
  forecast.data_date = new Date(data.SiteRep.DV.dataDate) // Needs converting to date object
  forecast.continent = data.SiteRep.DV.Location.continent
  forecast.country = data.SiteRep.DV.Location.country
  forecast.name = data.SiteRep.DV.Location.name
  forecast.longitude = data.SiteRep.DV.Location.lon
  forecast.latitude = data.SiteRep.DV.Location.lat
  forecast.id = data.SiteRep.DV.Location.i
  forecast.elevation = data.SiteRep.DV.Location.elevation
  forecast.days = this.clean_days(data.SiteRep.DV.Location.Period)

  return forecast

}

forecast.prototype.get_regional_forecast_for_site = function (api_key, site_id) {
  var data = this.api.call_api(api_key, 'rfcs', site_id)
  data = data.RegionalFcst
  var forecast = {}
  forecast.issued_at = new Date(data.issuedAt)
  forecast.created_on = new Date(data.createdOn)
  forecast.region_id = data.regionId
  forecast.region_name = this.parse_region_id(data.regionId)
  forecast.days = data.FcstPeriods.Period

  return forecast

}

forecast.prototype.parse_region_id = function (key) {
  // Return friendly region name
  if (key in settings.region_ids) {
    return settings.region_ids[key]
  } else {
    console.log('Unknown key ' + key)
    return undefined
  }
}

forecast.prototype.clean_days = function (raw_data) {
  var days = []

  for (var i = 0; i < raw_data.length; i++) {
    let day = {}
    day.date = new Date(raw_data[i].value)
    day.timesteps = this.clean_timesteps(raw_data[i].Rep, day.date)
    days.push(day)
  }
  return days
}

forecast.prototype.clean_timesteps = function (raw_data, date) {
  var timesteps = []
  for (var i = 0; i < raw_data.length; i++) {
    let timestep = {}
    for (var key in raw_data[i]) {
      let new_key = this.parse_timestep_key(
        this.remap_timestep_key(key, raw_data[i].$))
      timestep[new_key] = {}
      timestep[new_key].id = key
      timestep[new_key].value = raw_data[i][key]
      timestep[new_key].units = this.get_units_for_key(key)
      if (key == 'W') {
        timestep[new_key].text = this.weather_to_text(raw_data[i][key])
      }
    }
    timestep.date = new Date(date.valueOf())
    if (this.frequency == 'daily') {
      if (timestep.name == 'Day') {
        timestep.date = timestep.date.setHours(timestep.date.getHours + 12)
      }
    } else {
      let minutes = timestep.date.getMinutes() + parseInt(timestep.name.value)
      timestep.date.setMinutes(minutes)
    }
    timesteps.push(timestep)
  }
  return timesteps
}

forecast.prototype.parse_timestep_key = function (key) {
  // Return human readable key
  if (key in settings.human_keys) {
    return settings.human_keys[key]
  } else {
    console.log('Unknown key ' + key)
    return undefined
  }
}

forecast.prototype.remap_timestep_key = function (key, timestep) {
  // Remap odd keys to common key
  // e.g Humidity Noon (Hn) and Humidity Midnight (Hm) to Humidity (H)
  if (key in settings.remap_keys.day ||
    key in settings.remap_keys.night ||
    key in settings.remap_keys.default) {
    if (timestep == 'Day') {
      return settings.remap_keys.day[key]
    } else if (timestep == 'Night') {
      return settings.remap_keys.night[key]
    } else {
      return settings.remap_keys.default[key]
    }
  } else {
    console.log('Unknown key ' + key)
    return undefined
  }
}
forecast.prototype.get_units_for_key = function (key) {
  var units = undefined
  for (var i = 0; i < this.params.length; i++) {
    if (key == this.params[i].name) {
      units = this.params[i].units
    }
  }
  return units
}

forecast.prototype.weather_to_text = function (code) {
  if (code in settings.weather_codes) {
    return settings.weather_codes[code]
  } else {
    return undefined
  }
}

export default forecast