import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormContainer from '../components/FormContainer'
import SheetList from '../components/SheetsList'
import RotaAdmin from '../components/rotaAdmin'
import Schedule from '../components/Schedule'
import ScheduleOld from '../components/Schedule_old'

import { checkRotaStatus, getSchedule } from '../actions/rotaActions'
import Loader from '../components/Loader'
import Message from '../components/Message'
// import { appointments } from '../appointments'

const ScheduleScreen = (props) => {
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin
  const sheetDetails = useSelector((state) => state.sheetDetails)
  const { loading, error, sheet } = sheetDetails
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)

  useEffect(() => {
    if (sheet.sheet) {
      console.log('get schedule')
      // get the current schedule
      dispatch(getSchedule())
    }
  }, [sheet.sheet, dispatch])

  return (
    <FormContainer>
      <SheetList />
      {userInfo.isAdmin ? <Schedule /> : <Schedule />}
    </FormContainer>
  )
}

export default ScheduleScreen
