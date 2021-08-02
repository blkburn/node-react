import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormContainer from '../components/FormContainer'
import SheetList from '../components/SheetsList'
import RotaAdmin from '../components/rotaAdmin'
import Schedule from '../components/Schedule'
import ScheduleOld from '../components/Schedule_old'

import { checkRotaStatus, getSchedule } from '../actions/rotaActions'
// import { appointments } from '../appointments'

const Rota = (props) => {
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin
  const sheetDetails = useSelector((state) => state.sheetDetails)
  const { loading, error, sheet } = sheetDetails
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)

  useEffect(() => {
    console.log(`rota count ${rota.count}`)
    const statusSubmit = () => {
      dispatch(checkRotaStatus())
    }
    if (rota.running && rota.count > 0) {
      function checkRunning() {
        setTimeout(() => statusSubmit(), 1000)
      }
      checkRunning()
    } else {
      console.log('running is false')
    }
  }, [rota.count, rota.running, dispatch])

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
      <SheetList />
      {userInfo.isAdmin ? <RotaAdmin /> : <Schedule />}
    </FormContainer>
  )
}

export default Rota
