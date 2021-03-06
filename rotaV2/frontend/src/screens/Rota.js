import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import FormContainer from '../components/FormContainer'
import SheetList from '../components/SheetsList'
import RotaAdmin from '../components/rotaAdmin'
import Schedule from '../components/Schedule'
import ScheduleOld from '../components/Schedule_old'

import { checkRotaStatus, getSchedule } from '../actions/rotaActions'
import Loader from '../components/Loader'
import Message from '../components/Message'
import SheetListAdmin from '../components/SheetsListAdmin'
import {
  ROTA_CLEAR_SCHEDULE,
  SHEET_DETAILS_RESET,
  SHEET_LIST_RESET,
} from '../constants/userConstants'
// import { appointments } from '../appointments'

const Rota = (props) => {
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin
  const sheetDetails = useSelector((state) => state.sheetDetails)
  const { loading, error, sheet } = sheetDetails
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)
  const sheetList = useSelector((state) => state.sheetList)
  const { sheets } = sheetList
  let history = useHistory()

  useEffect(() => {
    return () => {
      console.log('clear sheet details schedule')
      dispatch({ type: SHEET_DETAILS_RESET })
      dispatch({ type: ROTA_CLEAR_SCHEDULE })
      dispatch({ type: SHEET_LIST_RESET })
    }
  }, [dispatch])

  return (
    <FormContainer>
      {rota.running && (
        <Message variant='info'>Running : {rota.count}s</Message>
      )}
      {userInfo.isAdmin ? (
        <>
          <SheetListAdmin />
          <RotaAdmin />
        </>
      ) : (
        history.push('/schedule')
        // <>
        //   <SheetList />
        //   <Schedule />
        // </>
      )}
    </FormContainer>
  )
}

export default Rota
