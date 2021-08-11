import axios from 'axios'
import {
  ROTA_APPEND_MESSAGE,
  ROTA_CLEAR_COUNT,
  ROTA_CLEAR_MESSAGE,
  ROTA_FAIL,
  ROTA_INC_COUNT,
  ROTA_SET_LOCKED,
  ROTA_SET_RUNNING,
  ROTA_SET_SHEET,
  ROTA_SET_SHEET_NAME,
  ROTA_SHEET_VALID,
  ROTA_STOP_RUNNING,
  ROTA_SET_SCHEDULE,
  ROTA_SET_START_DATE,
  ROTA_SET_END_DATE,
  ROTA_SET_REQUESTS,
} from '../constants/userConstants'
import moment from 'moment'

const rotaFail = (dispatch, error) => {
  console.log(error)
  return dispatch({
    type: ROTA_FAIL,
    payload:
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
  })
}
// clear messages from the rota optimsier
export const clearRotaMessage = () => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_CLEAR_MESSAGE,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}
// append messages to display in the app textbox
export const appendRotaMessage = (msg) => async (dispatch) => {
  try {
    console.log(`msg : ${msg}`)
    if (msg) {
      dispatch({
        type: ROTA_APPEND_MESSAGE,
        payload: msg,
      })
    }
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

export const setSchedule = (schedule) => async (dispatch) => {
  try {
    // console.log(JSON.parse(JSON.stringify(schedule)))
    if (schedule) {
      dispatch({
        type: ROTA_SET_SCHEDULE,
        payload: JSON.parse(JSON.stringify(schedule)),
      })
      setSartDate(schedule.startDate)
      setEndDate(schedule.endDate)
    }
  } catch (error) {
    rotaFail(dispatch, error)
  }
}
export const setRequests = (requests) => async (dispatch) => {
  try {
    if (requests) {
      dispatch({
        type: ROTA_SET_REQUESTS,
        payload: JSON.parse(JSON.stringify(requests)),
      })
      setSartDate(requests.startDate)
      setEndDate(requests.endDate)
    }
  } catch (error) {
    rotaFail(dispatch, error)
  }
}
export const setRotaRunning = () => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_SET_RUNNING,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

export const stopRotaRunning = () => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_STOP_RUNNING,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

// update the google sheet
export const setRotaSheet = (sheet) => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_SET_SHEET,
      payload: sheet,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

// update the google sheet
export const setRotaName = (name) => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_SET_SHEET_NAME,
      payload: name,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

export const validRotaSheet = (isValid) => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_SHEET_VALID,
      payload: isValid,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

export const clearRotaCount = () => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_CLEAR_COUNT,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

export const incRotaCount = () => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_INC_COUNT,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

export const setRotaLocked = (isLocked) => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_SET_LOCKED,
      payload: isLocked,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

export const setSartDate = (date) => async (dispatch) => {
  try {
    let dateObject = moment.utc(date, 'DD/MM/YY').toDate()
    dispatch({
      type: ROTA_SET_START_DATE,
      payload: dateObject,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

export const setEndDate = (date) => async (dispatch) => {
  let dateObject = moment.utc(date, 'DD/MM/YY').toDate()
  try {
    dispatch({
      type: ROTA_SET_END_DATE,
      payload: dateObject,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

const updateStatus = (data) => (dispatch) => {
  dispatch(clearRotaCount())
  dispatch(stopRotaRunning())
  dispatch(setRotaLocked(data.locked === 'TRUE'))
  if (data.locked === 'TRUE') {
    console.log('sheet locked')
    dispatch(appendRotaMessage('Sheet is LOCKED'))
  } else {
    console.log('sheet unlocked')
    dispatch(appendRotaMessage('Sheet is UNLOCKED'))
  }
  dispatch(setSartDate(data.startDate))
  dispatch(setEndDate(data.endDate))
  dispatch(appendRotaMessage(`Rota start date : ${data.startDate}`))
  dispatch(appendRotaMessage(`Rota end date : ${data.endDate}`))
  // dispatch(appendRotaMessage(data.message))
  dispatch(validRotaSheet(true))
}

export const checkRotaStatus = () => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState()
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    const { data } = await axios.get(`/api/rota/status`, config)

    // console.log(data)
    if (!data.running) {
      dispatch(updateStatus(data))
    } else {
      dispatch(incRotaCount())
    }
    if (data.message !== '') {
      dispatch(appendRotaMessage(data.message))
    }
    if (data.scheduleData && data.scheduleData !== '') {
      dispatch(setSchedule(data.scheduleData))
    }
    if (data.requestsData && data.requestsData !== '') {
      dispatch(setRequests(data.requestsData))
    }
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    dispatch({
      type: ROTA_APPEND_MESSAGE,
      payload: message,
    })
  }
}

export const verifyRotaSheet = (sheet) => async (dispatch, getState) => {
  try {
    console.log('verfy sheet')
    dispatch(clearRotaCount())
    dispatch(clearRotaMessage())
    dispatch(setRotaRunning())
    dispatch(validRotaSheet(false))

    const {
      userLogin: { userInfo },
      rota,
    } = getState()
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    let spreadsheetId = new RegExp('/spreadsheets/d/([a-zA-Z0-9-_]+)').exec(
      rota.sheet
    )[1]
    console.log(spreadsheetId)

    const { data } = await axios.post(
      `/api/rota/verify`,
      { sheet: spreadsheetId },
      config
    )
    // console.log(data)
    if (data.running) {
      dispatch(incRotaCount())
      dispatch(validRotaSheet(false))
      if (data.message !== '') {
        dispatch(appendRotaMessage(data.message))
      }
    } else {
      dispatch(updateStatus(data))
    }
  } catch (error) {
    console.log(error)
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    dispatch({
      type: ROTA_APPEND_MESSAGE,
      payload: message,
    })
  }
}

export const runRotaSheet = (sheet) => async (dispatch, getState) => {
  try {
    console.log('run sheet')
    dispatch(clearRotaCount())
    // dispatch(clearRotaMessage())
    dispatch(setRotaRunning())
    // dispatch(validRotaSheet(false))

    const {
      userLogin: { userInfo },
      rota,
    } = getState()
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    let spreadsheetId = new RegExp('/spreadsheets/d/([a-zA-Z0-9-_]+)').exec(
      rota.sheet
    )[1]
    console.log(spreadsheetId)

    const { data } = await axios.post(
      `/api/rota/run`,
      { sheet: spreadsheetId, locked: rota.locked ? 'true' : 'false' },
      config
    )
    // console.log(data)
    if (data.running) {
      dispatch(incRotaCount())
      if (data.message !== '') {
        dispatch(appendRotaMessage(data.message))
      }
    } else {
      dispatch(updateStatus(data))
    }
  } catch (error) {
    console.log(error)
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    dispatch({
      type: ROTA_APPEND_MESSAGE,
      payload: message,
    })
  }
}

export const getSchedule = () => async (dispatch, getState) => {
  try {
    console.log('get rota schedule')
    dispatch(clearRotaCount())
    dispatch(clearRotaMessage())
    dispatch(setRotaRunning())
    // dispatch(validRotaSheet(false))
    const {
      userLogin: { userInfo },
      sheetDetails: { sheet },
    } = getState()
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    console.log(sheet)
    let spreadsheetId = new RegExp('/spreadsheets/d/([a-zA-Z0-9-_]+)').exec(
      sheet.sheet
    )[1]
    console.log(spreadsheetId)

    const { data } = await axios.post(
      `/api/rota/schedule`,
      { sheet: spreadsheetId },
      config
    )
    // console.log(data)
    if (data.running) {
      dispatch(incRotaCount())
      if (data.message !== '') {
        dispatch(appendRotaMessage(data.message))
      }
    } else {
      dispatch(updateStatus(data))
    }
  } catch (error) {
    console.log(error)
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    dispatch({
      type: ROTA_APPEND_MESSAGE,
      payload: message,
    })
  }
}

export const getRequests = () => async (dispatch, getState) => {
  try {
    console.log('get rota requests')
    dispatch(clearRotaCount())
    dispatch(clearRotaMessage())
    dispatch(setRotaRunning())
    // dispatch(validRotaSheet(false))
    const {
      userLogin: { userInfo },
      sheetDetails: { sheet },
    } = getState()
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    console.log(!sheet)
    if (!!sheet) {
      return
    }
    console.log(sheet)
    let spreadsheetId = new RegExp('/spreadsheets/d/([a-zA-Z0-9-_]+)').exec(
      sheet.sheet
    )[1]
    console.log(spreadsheetId)

    const { data } = await axios.post(
      `/api/rota/requests`,
      { sheet: spreadsheetId },
      config
    )
    // console.log(data)
    if (data.running) {
      dispatch(incRotaCount())
      if (data.message !== '') {
        dispatch(appendRotaMessage(data.message))
      }
    } else {
      dispatch(updateStatus(data))
    }
  } catch (error) {
    console.log(error)
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    dispatch({
      type: ROTA_APPEND_MESSAGE,
      payload: message,
    })
  }
}
