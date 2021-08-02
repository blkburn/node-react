import {
  ROTA_APPEND_MESSAGE,
  ROTA_CLEAR_COUNT,
  ROTA_CLEAR_MESSAGE,
  ROTA_INC_COUNT,
  ROTA_SET_LOCKED,
  ROTA_SET_RUNNING,
  ROTA_SET_SCHEDULE,
  ROTA_SET_SHEET,
  ROTA_SET_SHEET_NAME,
  ROTA_SHEET_VALID,
  ROTA_STOP_RUNNING,
} from '../constants/userConstants'

export const rotaSheetReducer = (state = { message: [] }, action) => {
  switch (action.type) {
    case ROTA_SET_SHEET:
      return { ...state, sheet: action.payload, locked: true, count: 0 }
    case ROTA_SET_SHEET_NAME:
      return { ...state, name: action.payload }
    case ROTA_SHEET_VALID:
      return { ...state, valid: action.payload }
    case ROTA_SET_LOCKED:
      return { ...state, locked: action.payload }
    case ROTA_SET_RUNNING:
      return { ...state, running: true }
    case ROTA_STOP_RUNNING:
      return { ...state, running: false }
    case ROTA_CLEAR_COUNT:
      return { ...state, count: 0 }
    case ROTA_SET_SCHEDULE:
      return {
        ...state,
        schedule: JSON.parse(action.payload)['schedule'],
        staff: JSON.parse(action.payload)['staff'],
        shift: JSON.parse(action.payload)['shift'],
      }
    case ROTA_INC_COUNT:
      return { ...state, count: state.count + 1 }
    case ROTA_APPEND_MESSAGE:
      return { ...state, message: [...state.message, action.payload] }
    case ROTA_CLEAR_MESSAGE:
      return { ...state, message: [] }
    default:
      return state
  }
}
