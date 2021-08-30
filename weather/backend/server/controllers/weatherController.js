import asyncHandler from 'express-async-handler'
import axios from 'axios'
import CWList from '../models/cwListModel.js'
import mongoose from 'mongoose'
import NodeCache from 'node-cache'
// import datapoint from '../datapoint/datapoint.js'

// metoffice key d9a4455e-9005-4abc-8566-5c6b81a4fc03

const maxRps = 10 // max requests per second for throttling
const throttleInterval = 1000 / maxRps

// let dp = new datapoint()
// dp.set_key('d9a4455e-9005-4abc-8566-5c6b81a4fc03')

const myCache = new NodeCache({stdTTL: 60 * 60 * 1})

// axios.interceptors.request.use(function (config) {
//   // Do something before request is sent
//   console.log(config)
//   return config
// }, function (error) {
//   // Do something with request error
//   return Promise.reject(error)
// })


// // Set out current location
// var lat = 55.9533
// var lon = -3.1868
//
// // Before we get any data we need to find out our nearest observation and forecast sites
// var obs_site = dp.get_nearest_obs_site(lon, lat)
// var forecast_site = dp.get_nearest_forecast_site(lon, lat)
// console.log(obs_site)
// var obs = dp.get_obs_for_site(obs_site.id)
// var obs_for_today = obs.days[obs.days.length - 1]
// var current_obs = obs_for_today.timesteps[obs_for_today.timesteps.length - 1]
//
// // console.log(obs_for_today.timesteps)
// console.log('It is currently ' + current_obs.weather.text.toLowerCase() + ' with a temperature of ' + current_obs.temperature.value + '°' + current_obs.temperature.units + ' in ' + obs_site.name)
//
// var forecast = dp.get_forecast_for_site(forecast_site.id, '3hourly')
// var forecast_for_today = forecast.days[0]
// var next_forecast = forecast_for_today.timesteps[2]
// // console.log(forecast_for_today)
// forecast_for_today.timesteps.map(next_forecast => {
//   console.log('At ' + next_forecast.date + ' it will be ' + next_forecast.weather.text + ' with a temperature of ' + next_forecast.temperature.value + '°' + next_forecast.temperature.units + ' in ' + obs_site.name)
//
// })

var optionsLocation = {
  method: 'GET',
  url: 'https://forward-reverse-geocoding.p.rapidapi.com/v1/search',
  // params: {q: 'paris', 'accept-language': 'en', polygon_threshold: '0.0'},
  headers: {
    'x-rapidapi-host': 'forward-reverse-geocoding.p.rapidapi.com',
    'x-rapidapi-key': '823545e81bmsha28b117c47560e2p114595jsn4583ef23be29'
  }
}

const weatherBitAPI = 'bedacc7ed64a4b72a49dda082d642a0c'

let optionsWeather = {
  method: 'GET',
  // params: { lon: '151.2164539', lat: '-33.8548157' },
  url: 'https://api.weatherbit.io/v2.0/current',
}

// let optionsWeather = {
//   method: 'GET',
//   // params: { lon: '151.2164539', lat: '-33.8548157' },
//   url: 'https://weatherbit-v1-mashape.p.rapidapi.com/current',
//   headers: {
//     'x-rapidapi-host': 'weatherbit-v1-mashape.p.rapidapi.com',
//     'x-rapidapi-key': '823545e81bmsha28b117c47560e2p114595jsn4583ef23be29',
//   },
// }

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// a small wrapper around axios for this particular API
// this might best live in a separate module
const apiRequest = async (opts) => {
  // opts.baseUrl = apiBase
  try {
    const t = await wait(throttleInterval)
    const resp = await axios(opts)
    return resp.data
  } catch (err) {
    throw new Error(err)
  }
}

const getLocationApi = async (location) => {
  optionsLocation.params = {q: location, 'accept-language': 'en', polygon_threshold: '0.0'}
  return await apiRequest(optionsLocation)
}

// const getWeatherApi = async (lat, lon) => {
//   let opts = JSON.parse(JSON.stringify(optionsWeather))
//   opts.params = {lon, lat}
//   return await apiRequest(opts)
// }

const getWeatherApi = async (lat, lon) => {
  // let obs_site = dp.get_nearest_obs_site(lon, lat)
  // var obs = dp.get_obs_for_site(obs_site.id)
  // var obs_for_today = obs.days[obs.days.length - 1]
  // var current_obs = obs_for_today.timesteps[obs_for_today.timesteps.length - 1]
  // console.log(obs_site.name)
  // const text = (current_obs.weather) ? current_obs.weather.text.toLowerCase() : 'undefined'
  // console.log('It is currently ' + text + ' with a temperature of ' + current_obs.temperature.value + '°' + current_obs.temperature.units + ' in ' + obs_site.name)

  const key = parseFloat(lat).toFixed(2) + ':' + parseFloat(lon).toFixed(2)
  let data = myCache.get(key)
  if (data == undefined) {
    // handle miss!
    let opts = JSON.parse(JSON.stringify(optionsWeather))
    opts.params = {lon, lat, key: weatherBitAPI}
    console.log(opts)
    data = await apiRequest(opts)

    // update the cache
    const success = myCache.set(key, data)
    if (success) {
      console.log('new key added to cache ' + key)
    }
  } else {
    console.log('got data from cache ' + key)
  }
  return data

}


// @desc    Get weather form a given location/address
// @route   POST /api/location/req
// @access  Public
const getWeather = asyncHandler(async (req, res) => {
  const {location} = req.params

  // console.log(location)
  if (location && location.length) {
    const data = await getLocationApi(location)
    // console.log(data)
    if (data[0].display_name) {
      // console.log(data[0])
      const latitude = data[0].lat
      const longitude = data[0].lon
      console.log(latitude)
      console.log(longitude)
      const {data: weather, count} = await getWeatherApi(latitude, longitude)
      if (count > 0) {
        res.json(weather)
      }
    } else {
      res.status(401)
      throw new Error('Location not found')
    }
  } else {
    res.status(401)
    throw new Error('Location not defned')
  }
})


// @desc    Get weather form a given location/address
// @route   POST /api/location/reqbatch
// @access  Public
const getWeatherBatch = asyncHandler(async (req, res) => {
  const locations = req.body

  let weatherBatch = []
  if (locations && locations.length) {
    const promises = locations.map(async ({lat, lon}) => {
        console.log(lat)
        console.log(lon)
        const {data: weather, count} = await getWeatherApi(lat, lon)
        // console.log(weather)
        if (count > 0) {
          return (weather)
          // weatherBatch = [...weatherBatch, weather]
        }
      }
    )
    weatherBatch = await Promise.all(promises)
    // console.log(weatherBatch.flat())
    res.json(weatherBatch.flat())

  } else {
    res.status(401)
    throw new Error('No locations to load')
  }

})


const sendCurrentWeatherList = asyncHandler(async (req, res) => {
    const weatherList = req.body
    const {id} = req.params
    // console.log('list: ', id, weatherList)

    const updated = weatherList.map(w => {
      return {...w, userId: id}
    })
    let cwList = await CWList.find({userId: mongoose.Types.ObjectId(id)})
    console.log(updated)
    if (cwList && cwList.length) {
      await CWList.deleteMany({userId: mongoose.Types.ObjectId(id)})
      console.log('cwList removed for id ' + id)
    } else {
      console.log('cwList nothing to remove for id ' + id)
    }
    const updatedList = await CWList.create(updated)

    res.json(updatedList)
  }
)

const getCurrentWeatherList = asyncHandler(async (req, res) => {
    const {id} = req.params
    console.log('list: ', id)

    let cwList = await CWList.find({userId: mongoose.Types.ObjectId(id)})
    res.json(cwList)
  }
)


export {getWeather, sendCurrentWeatherList, getCurrentWeatherList, getWeatherBatch}

//   const {data} = await axios.post(`http://localhost:${process.env.AUTH_PORT}/api/auth/token`, {
//     id: user._id,
//   })
//   if (data.token) {
//     console.log('received token:')
//     console.log(data.token)
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       token: data.token
//     })
//   } else {
//     res.status(401)
//     throw new Error(data.message)
//   }
//
// }
// else
// {
//   res.status(401)
//   throw new Error('Invalid email or password')
//
// }
// })
