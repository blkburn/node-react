import React, { useEffect, useState } from 'react'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import { withStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { ViewState } from '@devexpress/dx-react-scheduler'
import { indigo, blue, teal } from '@material-ui/core/colors'
// import { Resource } from 'devextreme-react/scheduler'
import {
  Scheduler,
  WeekView,
  Toolbar,
  DateNavigator,
  Appointments,
  DayView,
  ViewSwitcher,
  TodayButton,
  AppointmentForm,
  AppointmentTooltip,
  Resources,
} from '@devexpress/dx-react-scheduler-material-ui'
import { appointmentsData } from '../appointments'

const Schedule = (props) => {
  const rota = useSelector((state) => state.rota)

  const PUBLIC_KEY = 'AIzaSyBnNAISIUKe6xdhq1_rjor2rxoI3UlMY7k'
  const CALENDAR_ID = 'f7jnetm22dsjc3npc2lu3buvu4@group.calendar.google.com'

  const getData = (setData, setLoading, schedule) => {
    setLoading(false)
    if (schedule && schedule !== '') {
      setData(schedule)
    }
    // const dataUrl = [
    //   'https://www.googleapis.com/calendar/v3/calendars/',
    //   CALENDAR_ID,
    //   '/events?key=',
    //   PUBLIC_KEY,
    // ].join('')
    // setLoading(true)

    // return fetch(dataUrl)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setTimeout(() => {
    //       setData(data.items)
    //       setLoading(false)
    //     }, 600)
    //   })
  }

  const styles = {
    toolbarRoot: {
      position: 'relative',
    },
    progress: {
      position: 'absolute',
      width: '100%',
      bottom: 0,
      left: 0,
    },
  }

  const ToolbarWithLoading = withStyles(styles, { name: 'Toolbar' })(
    ({ children, classes, ...restProps }) => (
      <div className={classes.toolbarRoot}>
        <Toolbar.Root {...restProps}>{children}</Toolbar.Root>
        <LinearProgress className={classes.progress} />
      </div>
    )
  )

  const usaTime = (date) =>
    new Date(date).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })

  const mapAppointmentData = (appointment) => ({
    staff: appointment.staff,
    startDate: usaTime(appointment.start.dateTime),
    endDate: usaTime(appointment.end.dateTime),
    shift: appointment.shift,
  })

  const initialState = {
    data: [],
    staff: [],
    shift: [],
    loading: false,
    currentDate: '2021-10-23',
    currentViewName: 'Week',
  }

  const reducer = (state, action) => {
    switch (action.type) {
      case 'setLoading':
        return { ...state, loading: action.payload }
      case 'setData':
        return {
          ...state,
          data: action.payload['schedule'],
          staff: action.payload['staff'],
          shift: action.payload['shift'],
        }
      // return { ...state, data: action.payload.map(mapAppointmentData) }
      case 'setCurrentViewName':
        return { ...state, currentViewName: action.payload }
      case 'setCurrentDate':
        return { ...state, currentDate: action.payload }
      default:
        return state
    }
  }

  const [state, dispatch] = React.useReducer(reducer, initialState)
  const { data, shift, staff, loading, currentViewName, currentDate } = state

  const resources = [
    {
      fieldName: 'staff',
      title: 'Staff',
      instances: staff,
    },
    {
      fieldName: 'shift',
      title: 'Shift',
      instances: shift,
    },
  ]
  const setCurrentViewName = React.useCallback(
    (nextViewName) =>
      dispatch({
        type: 'setCurrentViewName',
        payload: nextViewName,
      }),
    [dispatch]
  )
  const setData = React.useCallback(
    (nextData) =>
      dispatch({
        type: 'setData',
        payload: nextData,
      }),
    [dispatch]
  )
  const setCurrentDate = React.useCallback(
    (nextDate) =>
      dispatch({
        type: 'setCurrentDate',
        payload: nextDate,
      }),
    [dispatch]
  )
  const setLoading = React.useCallback(
    (nextLoading) =>
      dispatch({
        type: 'setLoading',
        payload: nextLoading,
      }),
    [dispatch]
  )

  React.useEffect(() => {
    if (rota.schedule && rota.schedule !== '') {
      getData(setData, setLoading, rota)
    }
  }, [setData, setLoading, currentViewName, currentDate, rota])

  return (
    <Paper>
      <Scheduler data={data} height={660}>
        <ViewState
          currentDate={currentDate}
          currentViewName={currentViewName}
          onCurrentViewNameChange={setCurrentViewName}
          onCurrentDateChange={setCurrentDate}
        />
        <DayView startDayHour={0} endDayHour={24} />
        <WeekView startDayHour={0} endDayHour={24} />
        <Appointments />
        {/* <Resources data={resources} /> */}
        <Resources data={resources} />
        <Toolbar
          {...(loading ? { rootComponent: ToolbarWithLoading } : null)}
        />
        <DateNavigator />
        <TodayButton />
        <ViewSwitcher />
        <AppointmentTooltip showOpenButton showCloseButton />
        <AppointmentForm readOnly />
      </Scheduler>
    </Paper>
  )
}

export default Schedule
