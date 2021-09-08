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
  ROTA_SET_NAME,
  ROTA_SUCCESS_SET,
  ROTA_SET_DATES,
  ROTA_SUCCESS_CLEAR,
  ROTA_RUN_VERIFY,
  ROTA_SUCCESS_SCHEDULE_SET,
  ROTA_SUCCESS_VERIFY_SET,
} from '../constants/userConstants'
import moment, { now } from 'moment'

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

export const setSchedule = (data) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState()
    const schedule = data.scheduleData

    // console.log(schedule.staff)
    if (schedule) {
      const staff = schedule.staff.filter((s) => {
        if (userInfo.name === s.text) {
          s.isChecked = true
        }
        return s
      })
      // console.log(staff)
      schedule.staff = staff
      // console.log(schedule)
      dispatch({
        type: ROTA_SET_SCHEDULE,
        payload: schedule,
      })
      // setSartDate(schedule.startDate)
      // setEndDate(schedule.endDate)
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
      // setSartDate(requests.startDate)
      // setEndDate(requests.endDate)
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

export const setDates = (data) => async (dispatch, getState) => {
  try {
    const {
      rota: { scheduleDate },
    } = getState()

    let scheduleDateUpdate = moment().toDate()
    let { startDate, endDate } = data
    startDate = moment.utc(startDate, 'DD/MM/YY').toDate()
    endDate = moment.utc(endDate, 'DD/MM/YY').toDate()
    if (scheduleDateUpdate < startDate) {
      scheduleDateUpdate = startDate
    } else if (scheduleDateUpdate > endDate) {
      scheduleDateUpdate = endDate
    }
    console.log(scheduleDateUpdate)

    dispatch({
      type: ROTA_SET_DATES,
      payload: { startDate, endDate, scheduleDateUpdate },
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

export const setSheetName = (name) => async (dispatch) => {
  try {
    dispatch({
      type: ROTA_SET_NAME,
      payload: name,
    })
  } catch (error) {
    rotaFail(dispatch, error)
  }
}

const updateStatus = (data) => (dispatch, getState) => {
  try {
    const {
      sheetDetails: { sheet },
    } = getState()

    console.log('update status')
    console.log(sheet.name)
    // console.log(data)
    // dispatch(clearRotaCount())
    dispatch(stopRotaRunning())
    if (data.isLocked) {
      dispatch(setRotaLocked(data.isLocked === 'TRUE'))
    }
    dispatch(setDates(data))
    dispatch(setSheetName(sheet.name))

    if (data.scheduleData && data.scheduleData !== '') {
      console.log('set schedule data')
      dispatch(setSchedule(data))
    }
    if (data.command === 'RUN_MODEL') {
      dispatch({ type: ROTA_SUCCESS_SET })
    } else if (data.command === 'VERIFY_SHEET') {
      dispatch({ type: ROTA_SUCCESS_VERIFY_SET })
    } else {
      // assume get schedule/requests/etc
      dispatch({ type: ROTA_SUCCESS_SCHEDULE_SET })
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
      dispatch(setSchedule(data))
    }
    if (data.requestsData && data.requestsData !== '') {
      dispatch(setRequests(data.requestsData))
    }
    // console.log('finsihed')
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
    dispatch({
      type: ROTA_RUN_VERIFY,
    })
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
      { sheet: spreadsheetId, command: 'VERIFY_SHEET' },
      config
    )
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

export const runRotaSheet = (condFormatting) => async (dispatch, getState) => {
  try {
    console.log('run sheet')
    dispatch({
      type: ROTA_RUN_VERIFY,
    })

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
      {
        sheet: spreadsheetId,
        command: 'RUN_MODEL',
        locked: rota.locked ? 'true' : 'false',
        doConditioanlFormatting: condFormatting,
      },
      config
    )
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

export const getSchedule = (forceUpdate) => async (dispatch, getState) => {
  try {
    console.log('get rota schedule')
    dispatch({ type: ROTA_RUN_VERIFY })
    // dispatch(clearRotaMessage())
    // dispatch(setRotaRunning())
    // // dispatch(validRotaSheet(false))
    // dispatch({ type: ROTA_SUCCESS_CLEAR })

    const {
      userLogin: { userInfo },
      sheetDetails: { sheet },
    } = getState()
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    // console.log(sheet)
    let spreadsheetId = new RegExp('/spreadsheets/d/([a-zA-Z0-9-_]+)').exec(
      sheet.sheet
    )[1]
    console.log(spreadsheetId)

    const { data } = await axios.post(
      `/api/rota/schedule`,
      {
        sheet: spreadsheetId,
        sheet_id: sheet._id,
        command: 'GET_SCHEDULE',
        updatePublished: forceUpdate ? true : sheet.isPubUpdate,
        reloadPublished: forceUpdate ? true : sheet.isPubReload,
        updateRequests: forceUpdate ? true : sheet.isReqUpdate,
        reloadRequests: forceUpdate ? true : sheet.isReqReload,
      },
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
    dispatch({ type: ROTA_SUCCESS_CLEAR })

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
    // console.log(sheet)
    let spreadsheetId = new RegExp('/spreadsheets/d/([a-zA-Z0-9-_]+)').exec(
      sheet.sheet
    )[1]
    console.log(spreadsheetId)

    const { data } = await axios.post(
      `/api/rota/requests`,
      { sheet: spreadsheetId, command: 'GET_REQUESTS' },
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
