import {
  REQUESTS_ADD_REQUEST,
  REQUESTS_ADD_SUCCESS,
  REQUESTS_DELETE_FAIL,
  REQUESTS_DELETE_REQUEST,
  REQUESTS_DELETE_SUCCESS,
  REQUESTS_DETAILS_REQUEST,
  REQUESTS_DETAILS_SUCCESS,
  REQUESTS_FAIL,
  REQUESTS_LOCAL_ADD,
  REQUESTS_LOCAL_REMOVE,
} from '../constants/userConstants'
import axios from 'axios'

const requestsFail = (dispatch, error) => {
  console.log(error)
  return dispatch({
    type: REQUESTS_FAIL,
    payload:
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
  })
}

export const getServerRequest = () => async (dispatch, getState) => {
  try {
    console.log('enter getserverreq')
    dispatch({
      type: REQUESTS_DETAILS_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()
    const id = userInfo._id
    console.log('req:' + id)

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.get(`/api/requests/${id}`, config)

    dispatch({
      type: REQUESTS_DETAILS_SUCCESS,
      payload: data,
    })
    // dispatch({
    //   type: ROTA_CLEAR_SCHEDULE,
    // })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    if (message === 'Not authorized, token failed') {
      // dispatch(logout())
    }
    requestsFail(dispatch, message)
  }
}

export const postServerRequest = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: REQUESTS_ADD_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()

    const id = userInfo._id
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { response } = await axios.post(`/api/requests/${id}`, data, config)

    dispatch({
      type: REQUESTS_ADD_SUCCESS,
      payload: data,
    })
    // dispatch({
    //   type: ROTA_CLEAR_SCHEDULE,
    // })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    if (message === 'Not authorized, token failed') {
      // dispatch(logout())
    }
    requestsFail(dispatch, message)
  }
}

// export const addLocalRequest = (req) => async (dispatch, getState) => {
//   try {
//     console.log('req:' + req)
//     const {
//       requests: { localRequests },
//     } = getState()

//     dispatch({
//       type: REQUESTS_LOCAL_ADD,
//       payload: [...localRequests, req],
//     })
//   } catch (error) {
//     requestsFail(dispatch, error)
//   }
// }
// export const removeLocalRequest = (req) => (dispatch, getState) => {
//   try {
//     const {
//       requests: { localRequests },
//     } = getState()

//     const newRequests = localRequests.filter((item) => {
//       return item != req
//     })
//     dispatch({
//       type: REQUESTS_LOCAL_REMOVE,
//       payload: newRequests,
//     })
//   } catch (error) {
//     requestsFail(dispatch, error)
//   }
// }

export const deleteRequests = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: REQUESTS_DELETE_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    await axios.delete(`/api/requests/${id}`, config)

    dispatch({ type: REQUESTS_DELETE_SUCCESS })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    if (message === 'Not authorized, token failed') {
      // dispatch(logout())
    } else {
    }
    dispatch({
      type: REQUESTS_DELETE_FAIL,
      payload: message,
    })
  }
}
