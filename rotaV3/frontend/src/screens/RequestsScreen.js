import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormContainer from '../components/FormContainer'
import SheetList from '../components/SheetsList'
import RotaAdmin from '../components/rotaAdmin'
import Schedule from '../components/Schedule'
import ScheduleOld from '../components/Schedule_old'
import Requests from '../components/Requests'

import {
  checkRotaStatus,
  getRequests,
  getSchedule,
} from '../actions/rotaActions'
import Loader from '../components/Loader'
import Message from '../components/Message'
import SheetListAdmin from '../components/SheetsListAdmin'
import {
  ROTA_CLEAR_SCHEDULE,
  ROTA_CLEAR_UPDATE_SCHEDULE,
  SHEET_DETAILS_RESET,
  SHEET_LIST_RESET,
} from '../constants/userConstants'

const RequestsScreen = (props) => {
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin
  const sheetDetails = useSelector((state) => state.sheetDetails)
  const { loading, error, sheet } = sheetDetails
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)

  useEffect(() => {
    return () => {
      console.log('clear sheet details requests')
      dispatch({ type: SHEET_DETAILS_RESET })
      dispatch({ type: ROTA_CLEAR_SCHEDULE })
      dispatch({ type: SHEET_LIST_RESET })
    }
  }, [dispatch])

  useEffect(() => {
    if (sheet.sheet && rota.update) {
      console.log('get requests')
      // get the current schedule
      dispatch(getRequests())
      dispatch({ type: ROTA_CLEAR_UPDATE_SCHEDULE })
    }
  }, [sheet.sheet, rota.update, dispatch])

  return (
    <FormContainer>
      {rota.running && (
        <Message variant='info'>Running : {rota.count}s</Message>
      )}
      <SheetListAdmin type='requests' />
      <Requests />
      <Schedule />
    </FormContainer>
  )
}

export default RequestsScreen
