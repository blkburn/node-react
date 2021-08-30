import {
  CURRENT_WEATHER_LIST_CLEAR_SUCCESS,
  CURRENT_WEATHER_LIST_FAIL,
  CURRENT_WEATHER_LIST_REQUEST, CURRENT_WEATHER_LIST_SUCCESS_POST, CURRENT_WEATHER_LIST_SUCCESS_GET,
  LOCATION_FAIL,
  LOCATION_REQUEST, LOCATION_SUCCESS,
} from '../constants/userConstants'

export const weatherReducer = (state = {weather: []}, action) => {
  switch (action.type) {
    case LOCATION_REQUEST:
      return {...state, loading: true, success: false}
    case LOCATION_SUCCESS:
      return {loading: false, success: true, weather: action.payload}
    case LOCATION_FAIL:
      return {...state, loading: false, success: false, error: action.payload}
    default:
      return state
  }
}

export const currentWeatherListReducer = (state = {weatherList: []}, action) => {
  switch (action.type) {
    case CURRENT_WEATHER_LIST_REQUEST:
      return {...state, loading: true, successPost: false, successGet: false}
    case CURRENT_WEATHER_LIST_SUCCESS_POST:
      return {...state, loading: false, successPost: true, weatherList: action.payload}
    case CURRENT_WEATHER_LIST_SUCCESS_GET:
      return {...state, loading: false, successGet: true, weatherList: action.payload}
    case CURRENT_WEATHER_LIST_FAIL:
      return {...state, loading: false, successPost: false, successGet: false, error: action.payload}
    case CURRENT_WEATHER_LIST_CLEAR_SUCCESS:
      return {...state, loading: false, successPost: false, successGet: false}
    default:
      return state
  }
}
