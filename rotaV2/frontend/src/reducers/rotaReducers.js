import {
  ROTA_APPEND_MESSAGE,
  ROTA_CLEAR_COUNT,
  ROTA_CLEAR_FILTER_SCHEDULE,
  ROTA_CLEAR_FILTER_SCHEDULE_ID,
  ROTA_CLEAR_MESSAGE,
  ROTA_CLEAR_SCHEDULE,
  ROTA_CLEAR_UPDATE_SCHEDULE,
  ROTA_FILTER_SCHEDULE,
  ROTA_FILTER_SCHEDULE_ID,
  ROTA_INC_COUNT,
  ROTA_RUN_VERIFY,
  ROTA_SCHEDULE_DATE,
  ROTA_SCHEDULE_VIEW_NAME,
  ROTA_SET_DATES,
  ROTA_SET_END_DATE,
  ROTA_SET_LOCKED,
  ROTA_SET_NAME,
  ROTA_SET_REQUESTS,
  ROTA_SET_RUNNING,
  ROTA_SET_SCHEDULE,
  ROTA_SET_SHEET,
  ROTA_SET_SHEET_NAME,
  ROTA_SET_START_DATE,
  ROTA_SHEET_VALID,
  ROTA_STOP_RUNNING,
  ROTA_SUCCESS_CLEAR,
  ROTA_SUCCESS_SCHEDULE_CLEAR,
  ROTA_SUCCESS_SCHEDULE_SET,
  ROTA_SUCCESS_SET,
  ROTA_SUCCESS_VERIFY_CLEAR,
  ROTA_SUCCESS_VERIFY_SET,
  ROTA_UPDATE_CHECKED_VIEW,
  ROTA_UPDATE_SCHEDULE,
} from '../constants/userConstants'

export const rotaSheetReducer = (state = { message: [] }, action) => {
  switch (action.type) {
    case ROTA_SET_SHEET:
      return { ...state, sheet: action.payload, locked: true, count: 0 }
    case ROTA_SET_SHEET_NAME:
      return { ...state, name: action.payload }
    // case ROTA_SHEET_VALID:
    //   return { ...state, valid: action.payload }
    case ROTA_SET_LOCKED:
      return { ...state, locked: action.payload }
    // case ROTA_SET_START_DATE:
    //   return { ...state, startDate: action.payload }
    case ROTA_SET_NAME:
      return { ...state, sheetName: action.payload }
    // case ROTA_SET_END_DATE:
    //   return { ...state, endDate: action.payload }
    case ROTA_SET_DATES:
      const { startDate, endDate, scheduleDateUpdate } = action.payload
      // console.log(scheduleDateUpdate)
      return {
        ...state,
        startDate: startDate,
        endDate: endDate,
        scheduleDate: scheduleDateUpdate,
      }
    case ROTA_RUN_VERIFY:
      return {
        ...state,
        count: 0,
        message: [],
        running: true,
        success: false,
        successSchedule: false,
        successVerify: false,
      }

    // case ROTA_SET_RUNNING:
    //   return { ...state, running: true }
    case ROTA_STOP_RUNNING:
      return { ...state, running: false }
    // case ROTA_CLEAR_COUNT:
    //   return { ...state, count: 0 }
    case ROTA_UPDATE_SCHEDULE:
      return { ...state, update: true }
    case ROTA_CLEAR_UPDATE_SCHEDULE:
      return { ...state, update: false }
    case ROTA_SET_SCHEDULE:
      // console.log(action.payload)
      return {
        ...state,
        schedule: action.payload['schedule'],
        filtered: action.payload['schedule'],
        staff: action.payload['staff'],
        shift: action.payload['shift'],
      }
    case ROTA_SET_REQUESTS:
      return {
        ...state,
        schedule: JSON.parse(action.payload)['requests'],
        filtered: JSON.parse(action.payload)['requests'],
        staff: JSON.parse(action.payload)['staff'],
        shift: JSON.parse(action.payload)['shift'],
      }
    case ROTA_CLEAR_SCHEDULE:
      return {
        ...state,
        schedule: [],
        filtered: [],
        staff: [],
        shift: [],
      }
    case ROTA_FILTER_SCHEDULE:
      return { ...state, filtered: action.payload }
    case ROTA_CLEAR_FILTER_SCHEDULE:
      return { ...state, filtered: state.schedule }
    case ROTA_FILTER_SCHEDULE_ID:
      return { ...state, filteredId: action.payload }
    case ROTA_CLEAR_FILTER_SCHEDULE_ID:
      return { ...state, filteredId: '' }
    case ROTA_SCHEDULE_DATE:
      return { ...state, scheduleDate: action.payload }
    case ROTA_SCHEDULE_VIEW_NAME:
      return { ...state, scheduleViewName: action.payload }
    case ROTA_INC_COUNT:
      return { ...state, count: state.count + 1 }
    case ROTA_APPEND_MESSAGE:
      return { ...state, message: [...state.message, action.payload] }
    // case ROTA_CLEAR_MESSAGE:
    //   return { ...state, message: [] }
    case ROTA_UPDATE_CHECKED_VIEW:
      return { ...state, staff: action.payload }
    case ROTA_SUCCESS_SET:
      return { ...state, success: true }
    case ROTA_SUCCESS_CLEAR:
      return { ...state, success: false }
    case ROTA_SUCCESS_SCHEDULE_SET:
      return { ...state, successSchedule: true }
    case ROTA_SUCCESS_SCHEDULE_CLEAR:
      return { ...state, successSchedule: false }
    case ROTA_SUCCESS_VERIFY_SET:
      return { ...state, successVerify: true }
    case ROTA_SUCCESS_VERIFY_CLEAR:
      return { ...state, successVerify: false }
    default:
      return state
  }
}
