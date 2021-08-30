// var site = require("./site");
// var forecast = require("./forecast");
// var obs = require("./obs");
import site from './site.js'
import observation from './obs.js'
import forecast from './forecast.js'
import Api from './api.js'

/**
 * Datapoint module.
 * @module datapoint
 */
function datapoint() {
  this.api_key = ''
  this.api = new Api()
  this.obs = new observation(this.api)
  this.site = new site(this.api)
  this.forecast = new forecast(this.api)
}

/**
 * Set your api key.
 * @param {string} api_key - Your api key.
 */
datapoint.prototype.set_key = function (api_key) {
  this.api_key = api_key
}

/**
 * Get a list of forecast sites.
 * @returns {Array} - List of site objects.
 */
datapoint.prototype.get_forecast_sites = function () {
  return this.site.get_sites(this.api_key, 'fcs')
}

/**
 * Get a list of obs sites.
 * @returns {Array} - List of site objects.
 */
datapoint.prototype.get_obs_sites = function () {
  return this.site.get_sites(this.api_key, 'obs')
}

/**
 * Get a list of regional forecast sites.
 * @returns {Array} - List of site objects.
 */
datapoint.prototype.get_regional_forecast_sites = function () {
  return this.site.get_regional_sites(this.api_key, 'rfcs')
}

/**
 * Get nearest forecast site.
 * @param {string} longitude - Logitude for location.
 * @param {string} latitude - Latitude for location.
 * @returns {Object}  - Site object.
 */
datapoint.prototype.get_nearest_forecast_site = function (longitude, latitude) {
  return this.site.get_nearest_site(this.api_key, 'fcs', longitude, latitude)
}

/**
 * Get nearest obs site.
 * @param {string} longitude - Logitude for location.
 * @param {string} latitude - Latitude for location.
 * @returns {Object}  - Site object.
 */
datapoint.prototype.get_nearest_obs_site = function (longitude, latitude) {
  return this.site.get_nearest_site(this.api_key, 'obs', longitude, latitude)
}

/**
 * Get forecast for site.
 * @param {string} site_id - ID of site to get forecast for.
 * @param {string} frequency - Data frequency (daily or 3hourly).
 * @returns {Object}  - Forecast object.
 */
datapoint.prototype.get_forecast_for_site = function (site_id, frequency) {
  return this.forecast.get_forecast_for_site(this.api_key, site_id, frequency)
}

/**
 * Get observations for site.
 * @param {string} site_id - ID of site to get forecast for.
 * @returns {Object}  - Obserbations object.
 */
datapoint.prototype.get_obs_for_site = function (site_id) {
  return this.obs.get_obs_for_site(this.api_key, site_id)
}

/**
 * Get regional forecast for site.
 * @param {string} site_id - ID of site to get regional forecast for.
 * @returns {Object}  - Forecast object.
 */
datapoint.prototype.get_regional_forecast_for_site = function (site_id) {
  return this.forecast.get_regional_forecast_for_site(this.api_key, site_id)
}

export default datapoint