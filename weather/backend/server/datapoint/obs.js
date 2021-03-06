// var api = require("./api");
// var settings = require("./settings");
import settings from './settings.js'
import Api from './api.js'

function observation(api) {
  this.params = null
  this.frequency = null
  this.api = api
}

observation.prototype.get_obs_for_site = function (api_key, site_id) {
  let data = this.api.call_api(api_key, 'obs', site_id, {'res': 'hourly'})
  this.params = data.SiteRep.Wx.Param
  var obs = {}
  obs.data_date = new Date(data.SiteRep.DV.dataDate) // Needs converting to date object
  obs.continent = data.SiteRep.DV.Location.continent
  obs.country = data.SiteRep.DV.Location.country
  obs.name = data.SiteRep.DV.Location.name
  obs.longitude = data.SiteRep.DV.Location.lon
  obs.latitude = data.SiteRep.DV.Location.lat
  obs.id = data.SiteRep.DV.Location.i
  obs.elevation = data.SiteRep.DV.Location.elevation
  obs.days = this.clean_days(data.SiteRep.DV.Location.Period)

  return obs

}

observation.prototype.clean_days = function (raw_data) {
  let days = []

  for (let i = 0; i < raw_data.length; i++) {
    let day = {}
    day.date = new Date(raw_data[i].value)
    day.timesteps = this.clean_timesteps(raw_data[i].Rep, day.date)
    days.push(day)
  }
  return days
}

observation.prototype.clean_timesteps = function (raw_data, date) {
  let timesteps = []
  for (let i = 0; i < raw_data.length; i++) {
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

observation.prototype.parse_timestep_key = function (key) {
  // Return human readable key
  if (key in settings.human_keys) {
    return settings.human_keys[key]
  } else {
    console.log('Unknown key ' + key)
    return undefined
  }
}

observation.prototype.remap_timestep_key = function (key, timestep) {
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

observation.prototype.get_units_for_key = function (key) {
  var units = undefined
  for (var i = 0; i < this.params.length; i++) {
    if (key == this.params[i].name) {
      units = this.params[i].units
    }
  }
  return units
}

observation.prototype.weather_to_text = function (code) {
  if (code in settings.weather_codes) {
    return settings.weather_codes[code]
  } else {
    return undefined
  }
}

export default observation