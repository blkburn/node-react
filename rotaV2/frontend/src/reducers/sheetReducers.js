import {
  SHEET_ADD_ERROR_CLEAR,
  SHEET_ADD_FAIL,
  SHEET_ADD_REQUEST,
  SHEET_ADD_SUCCESS,
  SHEET_DELETE_FAIL,
  SHEET_DELETE_REQUEST,
  SHEET_DELETE_SUCCESS,
  SHEET_DETAILS_FAIL,
  SHEET_DETAILS_REQUEST,
  SHEET_DETAILS_RESET,
  SHEET_DETAILS_SUCCESS,
  SHEET_LIST_FAIL,
  SHEET_LIST_REQUEST,
  SHEET_LIST_RESET,
  SHEET_LIST_SUCCESS,
  SHEET_UPDATE_FAIL,
  SHEET_UPDATE_REQUEST,
  SHEET_UPDATE_RESET,
  SHEET_UPDATE_SUCCESS,
} from '../constants/userConstants'

export const sheetAddReducer = (state = {}, action) => {
  switch (action.type) {
    case SHEET_ADD_REQUEST:
      return { loading: true }
    case SHEET_ADD_SUCCESS:
      return { loading: false, sheetInfo: action.payload }
    case SHEET_ADD_FAIL:
      return { loading: false, error: action.payload }
    case SHEET_ADD_ERROR_CLEAR:
      return { loading: false }
    default:
      return state
  }
}

export const sheetDetailsReducer = (state = { sheet: {} }, action) => {
  switch (action.type) {
    case SHEET_DETAILS_REQUEST:
      return { ...state, loading: true }
    case SHEET_DETAILS_SUCCESS:
      return { loading: false, sheet: action.payload }
    case SHEET_DETAILS_FAIL:
      return { loading: false, error: action.payload }
    case SHEET_DETAILS_RESET:
      return { sheet: {} }
    default:
      return state
  }
}

export const sheetUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case SHEET_UPDATE_REQUEST:
      return { loading: true }
    case SHEET_UPDATE_SUCCESS:
      return { loading: false, success: true, sheetInfo: action.payload }
    case SHEET_UPDATE_FAIL:
      return { loading: false, error: action.payload }
    case SHEET_UPDATE_RESET:
      return {}
    default:
      return state
  }
}

export const sheetListReducer = (state = { sheets: [] }, action) => {
  switch (action.type) {
    case SHEET_LIST_REQUEST:
      return { loading: true }
    case SHEET_LIST_SUCCESS:
      return { loading: false, sheets: action.payload }
    case SHEET_LIST_FAIL:
      return { loading: false, error: action.payload }
    case SHEET_LIST_RESET:
      return { sheets: [] }
    default:
      return state
  }
}

export const sheetDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case SHEET_DELETE_REQUEST:
      return { loading: true }
    case SHEET_DELETE_SUCCESS:
      return { loading: false, success: true }
    case SHEET_DELETE_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}
