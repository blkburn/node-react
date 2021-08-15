import {
  REQUESTS_ADD_ERROR_CLEAR,
  REQUESTS_ADD_FAIL,
  REQUESTS_ADD_REQUEST,
  REQUESTS_ADD_SUCCESS,
  REQUESTS_DELETE_FAIL,
  REQUESTS_DELETE_REQUEST,
  REQUESTS_DELETE_SUCCESS,
  REQUESTS_DETAILS_ERROR_CLEAR,
  REQUESTS_DETAILS_FAIL,
  REQUESTS_DETAILS_REQUEST,
  REQUESTS_DETAILS_SUCCESS,
  REQUESTS_LOCAL_ADD,
  REQUESTS_LOCAL_CLEAR,
  REQUESTS_LOCAL_REMOVE,
} from '../constants/userConstants'

export const requestsReducer = (
  state = { loading: false, localRequests: [], serverRequests: [] },
  action
) => {
  switch (action.type) {
    case REQUESTS_LOCAL_ADD:
      return {
        ...state,
        localRequests: [...state.localRequests, ...[action.payload]],
      }
    case REQUESTS_LOCAL_REMOVE:
      const newRequests = state.localRequests.filter((item) => {
        // console.log(item._id + ':' + action.payload._id)
        return item._id !== action.payload._id
      })
      return { ...state, localRequests: newRequests }
    case REQUESTS_LOCAL_CLEAR:
      return { ...state, localRequests: [] }
    case REQUESTS_DETAILS_REQUEST:
      return { ...state, load: true }
    case REQUESTS_DETAILS_SUCCESS:
      return { ...state, load: false, serverRequests: action.payload }
    case REQUESTS_DETAILS_ERROR_CLEAR:
      return { ...state, load: false }
    case REQUESTS_DETAILS_FAIL:
      return { ...state, load: false }
    case REQUESTS_ADD_REQUEST:
      return { ...state, load: true }
    case REQUESTS_ADD_SUCCESS:
      return { ...state, load: false }
    case REQUESTS_ADD_ERROR_CLEAR:
      return { ...state, load: false }
    case REQUESTS_ADD_FAIL:
      return { ...state, load: false }
    case REQUESTS_DELETE_REQUEST:
      return { ...state, load: true }
    case REQUESTS_DELETE_SUCCESS:
      return { ...state, load: false }
    case REQUESTS_DELETE_FAIL:
      return { ...state, load: false }

    default:
      return state
  }
}
