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

const Rota = (props) => {
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin
  const sheetDetails = useSelector((state) => state.sheetDetails)
  const { loading, error, sheet } = sheetDetails
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)

  useEffect(() => {
    if (!userInfo.isAdmin) {
      if (sheet.sheet) {
        console.log('get schedule')
        // get the current schedule
        dispatch(getSchedule())
      }
    }
  }, [userInfo.isAdmin, sheet.sheet, dispatch])

  return (
    <FormContainer>
      {rota.running && (
        <Message variant='info'>Running : {rota.count}s</Message>
      )}
      <SheetList />
      {userInfo.isAdmin ? <RotaAdmin /> : <Schedule />}
    </FormContainer>
  )
}

export default Rota
