import axios from 'axios'
import {
  ROTA_CLEAR_SCHEDULE,
  SHEET_ADD_FAIL,
  SHEET_ADD_REQUEST,
  SHEET_ADD_SUCCESS,
  SHEET_DELETE_FAIL,
  SHEET_DELETE_REQUEST,
  SHEET_DELETE_SUCCESS,
  SHEET_DETAILS_FAIL,
  SHEET_DETAILS_REQUEST,
  SHEET_DETAILS_SUCCESS,
  SHEET_LIST_FAIL,
  SHEET_LIST_REQUEST,
  SHEET_LIST_SUCCESS,
  SHEET_UPDATE_FAIL,
  SHEET_UPDATE_REQUEST,
  SHEET_UPDATE_SUCCESS,
} from '../constants/userConstants'

export const addSheet =
  (name, sheet, isPublished) => async (dispatch, getState) => {
    try {
      dispatch({
        type: SHEET_ADD_REQUEST,
      })

      const {
        userLogin: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.post(
        '/api/sheets/add',
        { name, sheet, isPublished },
        config
      )

      dispatch({
        type: SHEET_ADD_SUCCESS,
        payload: data,
      })

      localStorage.setItem('sheetInfo', JSON.stringify(data))
    } catch (error) {
      console.log(error)
      dispatch({
        type: SHEET_ADD_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      })
    }
  }

export const getSheetDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: SHEET_DETAILS_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.get(`/api/sheets/${id}`, config)

    dispatch({
      type: SHEET_DETAILS_SUCCESS,
      payload: data,
    })
    dispatch({
      type: ROTA_CLEAR_SCHEDULE,
    })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    if (message === 'Not authorized, token failed') {
      // dispatch(logout())
    }
    dispatch({
      type: SHEET_DETAILS_FAIL,
      payload: message,
    })
  }
}

export const listSheets = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: SHEET_LIST_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.get(`/api/sheets`, config)

    dispatch({
      type: SHEET_LIST_SUCCESS,
      payload: data,
    })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    if (message === 'Not authorized, token failed') {
      // dispatch(logout())
    }
    dispatch({
      type: SHEET_LIST_FAIL,
      payload: message,
    })
  }
}

export const deleteSheet = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: SHEET_DELETE_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    await axios.delete(`/api/sheets/${id}`, config)

    dispatch({ type: SHEET_DELETE_SUCCESS })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    if (message === 'Not authorized, token failed') {
      // dispatch(logout())
    }
    dispatch({
      type: SHEET_DELETE_FAIL,
      payload: message,
    })
  }
}

export const updateSheet = (sheet) => async (dispatch, getState) => {
  try {
    dispatch({
      type: SHEET_UPDATE_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.put(`/api/sheets/${sheet._id}`, sheet, config)

    dispatch({ type: SHEET_UPDATE_SUCCESS })

    dispatch({ type: SHEET_DETAILS_SUCCESS, payload: data })

    // dispatch({ type: USER_DETAILS_RESET })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    if (message === 'Not authorized, token failed') {
      // dispatch(logout())
    }
    dispatch({
      type: SHEET_UPDATE_FAIL,
      payload: message,
    })
  }
}
