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
} from '../constants/userConstants'

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

    console.log(data)
    if (!data.running) {
      // dispatch(stopRotaRunning())
      // dispatch(setRotaLocked(data.locked === 'TRUE'))
      // dispatch(appendRotaMessage(data.message))
      // dispatch(validRotaSheet(true))
      dispatch(updateStatus(data))
    } else {
      dispatch(incRotaCount())
      // dispatch(validRotaSheet(false))
    }
    if (data.message !== '') {
      dispatch(appendRotaMessage(data.message))
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
    console.log(data)
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
    console.log(data)
    if (data.running) {
      dispatch(incRotaCount())
      // dispatch(validRotaSheet(false))
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