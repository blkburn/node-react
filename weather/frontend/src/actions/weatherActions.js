import axios from 'axios'
import {
  LOCATION_REQUEST,
  LOCATION_SUCCESS,
  LOCATION_FAIL,
  CURRENT_WEATHER_LIST_REQUEST,
  CURRENT_WEATHER_LIST_SUCCESS_GET,
  CURRENT_WEATHER_LIST_SUCCESS_POST,
  CURRENT_WEATHER_LIST_FAIL
} from '../constants/userConstants'


export const locationLookupBatch = (locations) => async (dispatch, getState) => {
  try {
    dispatch({
      type: LOCATION_REQUEST,
    })

    const {
      userLogin: {userInfo},
      weather: {weather}
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const {data} = await axios.post(
      `/api/location/reqbatch/`,
      locations,
      config
    )
    dispatch({
      type: LOCATION_SUCCESS,
      payload: data,
    })

  } catch (error) {
    dispatch({
      type: LOCATION_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

export const locationLookup = (location) => async (dispatch, getState) => {
  try {
    dispatch({
      type: LOCATION_REQUEST,
    })

    const {
      userLogin: {userInfo},
      weather: {weather}
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const {data} = await axios.get(
      `/api/location/req/${location}`,
      config
    )

    let updated
    if (weather) {
      updated = weather.filter(w => {
        return w.city_name != data[0].city_name
      })
      updated = [...updated, data[0]]
      console.log(updated)
      const cwList = updated.map(w => {
        return ({city_name: w.city_name, lat: w.lat, lon: w.lon})
      })
      console.log(cwList)
      dispatch(sendWeatherList(cwList))
    } else {
      updated = data
    }


    dispatch({
      type: LOCATION_SUCCESS,
      payload: updated,
    })

  } catch (error) {
    dispatch({
      type: LOCATION_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}


export const sendWeatherList = (weatherList) => async (dispatch, getState) => {
  try {
    dispatch({
      type: CURRENT_WEATHER_LIST_REQUEST,
    })

    const {
      userLogin: {userInfo},
      // currentWeatherList: {weatherList}
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    console.log(weatherList)
    const {data} = await axios.post(
      `/api/location/cwList/${userInfo._id}`,
      weatherList,
      config
    )

    dispatch({
      type: CURRENT_WEATHER_LIST_SUCCESS_POST,
      payload: data,
    })

  } catch (error) {
    dispatch({
      type: CURRENT_WEATHER_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}


export const getWeatherList = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: CURRENT_WEATHER_LIST_REQUEST,
    })

    const {
      userLogin: {userInfo},
      // currentWeatherList: {weatherList}
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const {data} = await axios.get(
      `/api/location/cwList/${userInfo._id}`,
      config
    )

    dispatch({
      type: CURRENT_WEATHER_LIST_SUCCESS_GET,
      payload: data,
    })

  } catch (error) {
    dispatch({
      type: CURRENT_WEATHER_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}
