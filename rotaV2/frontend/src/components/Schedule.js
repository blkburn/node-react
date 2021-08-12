import React, { useEffect, useState } from 'react'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import { withStyles } from '@material-ui/core/styles'
import { connect, Provider, useDispatch, useSelector } from 'react-redux'
import { ViewState } from '@devexpress/dx-react-scheduler'
import { indigo, blue, teal } from '@material-ui/core/colors'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import classNames from 'clsx'
// import ics from 'ics'
// import '../components/ics.deps.min.js'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import { fade } from '@material-ui/core/styles/colorManipulator'
// import { Resource } from 'devextreme-react/scheduler'
import {
  Scheduler,
  WeekView,
  MonthView,
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
import {
  ROTA_CLEAR_FILTER_SCHEDULE,
  ROTA_CLEAR_FILTER_SCHEDULE_ID,
  ROTA_CLEAR_UPDATE_SCHEDULE,
  ROTA_FILTER_SCHEDULE,
  ROTA_FILTER_SCHEDULE_ID,
  ROTA_SCHEDULE_DATE,
  ROTA_SCHEDULE_VIEW_NAME,
  ROTA_UPDATE_CHECKED_VIEW,
} from '../constants/userConstants'
import { checkRotaStatus, getRequests } from '../actions/rotaActions'

const Schedule = (props) => {
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)
  const sheetDetails = useSelector((state) => state.sheetDetails)
  const { loading, error, sheet } = sheetDetails

  const styles = ({ spacing, palette }) => ({
    flexibleSpace: {
      margin: '10px auto',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      minHeight: '100px',
    },
    textField: {
      width: '75px',
      marginLeft: spacing(1),
      marginTop: 0,
      marginBottom: 0,
      height: spacing(4.875),
    },
    locationSelector: {
      marginLeft: spacing(1),
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      height: spacing(4.875),
      // height: '200px',
      width: '500px',
    },
    button: {
      paddingLeft: spacing(1),
      paddingRight: spacing(1),
      width: spacing(10),
      '@media (max-width: 800px)': {
        width: spacing(2),
        fontSize: '0.75rem',
      },
    },
    selectedButton: {
      background: palette.primary[400],
      color: palette.primary[50],
      '&:hover': {
        backgroundColor: palette.primary[500],
      },
      border: `1px solid ${palette.primary[400]}!important`,
      borderLeft: `1px solid ${palette.primary[50]}!important`,
      '&:first-child': {
        borderLeft: `1px solid ${palette.primary[50]}!important`,
      },
    },
    longButtonText: {
      '@media (max-width: 800px)': {
        display: 'none',
      },
    },
    shortButtonText: {
      '@media (min-width: 800px)': {
        display: 'none',
      },
    },
    title: {
      fontWeight: 'bold',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    textContainer: {
      lineHeight: 1,
      whiteSpace: 'pre-wrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%',
    },
    time: {
      display: 'inline-block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    text: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    container: {
      width: '100%',
    },
    weekendCell: {
      backgroundColor: fade(palette.action.disabledBackground, 0.04),
      '&:hover': {
        backgroundColor: fade(palette.action.disabledBackground, 0.04),
      },
      '&:focus': {
        backgroundColor: fade(palette.action.disabledBackground, 0.04),
      },
    },
    weekEnd: {
      backgroundColor: fade(palette.action.disabledBackground, 0.06),
    },
  })

  // const ToolbarWithLoading = withStyles(styles, { name: 'Toolbar' })(
  //   ({ children, classes, ...restProps }) => (
  //     <div className={classes.toolbarRoot}>
  //       <Toolbar.Root {...restProps}>{children}</Toolbar.Root>
  //       <LinearProgress className={classes.progress} />
  //     </div>
  //   )
  // )

  const resources = [
    {
      fieldName: 'staff',
      title: 'Staff',
      instances: rota.staff || [],
    },
    {
      fieldName: 'shift',
      title: 'Shift',
      instances: rota.shift || [],
    },
  ]

  const ResourceSwitcher = withStyles(styles, { name: 'ResourceSwitcher' })(
    ({ classes }) => (
      <div className='resource-switcher'>
        <div className='resource-main'>Select Highlighting by </div>
        <Select
          className='resource-select'
          value={resourceName}
          onChange={(e) => setResourceName(e.target.value)}
        >
          {resources.map((resource) => (
            <MenuItem key={resource.fieldName} value={resource.fieldName}>
              {resource.title}
            </MenuItem>
          ))}
        </Select>
      </div>
    )
  )

  const setCurrentViewName = React.useCallback(
    (nextViewName) =>
      dispatch({
        type: ROTA_SCHEDULE_VIEW_NAME,
        payload: nextViewName,
      }),
    [dispatch]
  )

  const setCurrentDate = React.useCallback(
    (nextDate) =>
      dispatch({
        type: ROTA_SCHEDULE_DATE,
        payload: nextDate,
      }),
    [dispatch]
  )
  useEffect(() => {
    setCurrentDate(new Date())
    setCurrentViewName('Month')
  }, [setCurrentDate, setCurrentViewName])

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

  const [resourceName, setResourceName] = useState('shift')
  const [allChecked, setAllChecked] = useState(false)

  const getValue = (e) => {
    let value = e.target.value
    let checked = e.target.checked
    let updateStaff = []
    if (value === 'selectAll') {
      updateStaff = rota.staff.map((item) => {
        return { ...item, isChecked: checked }
      })
      setAllChecked(checked)
    } else {
      updateStaff = rota.staff.map((item) => {
        return item.id === value ? { ...item, isChecked: checked } : item
      })
      setAllChecked(updateStaff.every((item) => item.isChecked))
    }
    dispatch({ type: ROTA_UPDATE_CHECKED_VIEW, payload: updateStaff })
  }
  useEffect(() => {
    if (rota.schedule) {
      const filtered = rota.schedule.filter((item) => {
        let fStaff = rota.staff.find(({ id }) => id === item.staff)
        return fStaff['isChecked'] === true
      })
      dispatch({
        type: ROTA_FILTER_SCHEDULE,
        payload: filtered,
      })
    }
  }, [rota.staff, rota.schedule, dispatch])

  const createICS = () => {
    if (rota.filtered) {
      let cal = window.ics()
      rota.filtered.map((item) => {
        cal.addEvent(
          item.title,
          'Exported Schedule',
          'NHS',
          item.startDate,
          item.endDate
        )
      })
      return cal.download()
    }
  }

  return (
    <div className='schedule-container'>
      <div className='sheet-title'>
        <h2 hidden={rota.running || !rota.startDate}>{sheet.name}</h2>
      </div>
      <div className='ics'>
        <div className='option' hidden={rota.running || !rota.startDate}>
          <input
            type='checkbox'
            id='selectAll'
            name='selector'
            value='selectAll'
            key='selectAll'
            onChange={getValue}
            checked={allChecked}
          ></input>
          <label class='selector option' htmlFor='selectAll'>
            Select All Staff
          </label>
        </div>
        <Button
          className='my-3 me-3'
          // type='submitLoad'
          disabled={rota.running || !rota.filtered || !rota.filtered.length}
          // variant='primary'
          onClick={() => createICS()}
        >
          Download Calendar
        </Button>
        <p hidden={rota.running || !rota.startDate}>
          {rota.startDate && rota.startDate.toDateString()} to{' '}
          {rota.endDate && rota.endDate.toDateString()}
        </p>
      </div>
      <div className='pill-container'>
        {rota.staff &&
          rota.staff.map((name, index) => (
            <div className='option' key={name['id']}>
              <input
                type='checkbox'
                id={name['id']}
                name='selector'
                value={name['id']}
                key={name['id']}
                onChange={getValue}
                checked={name['isChecked']}
              ></input>
              <label class='selector option' htmlFor={name['id']}>
                {name['text']}
              </label>
            </div>
          ))}
      </div>
      <ResourceSwitcher />
      <Paper>
        <Scheduler data={rota.filtered} height={700}>
          <ViewState
            currentDate={rota.scheduleDate}
            currentViewName={rota.scheduleViewName}
            onCurrentViewNameChange={setCurrentViewName}
            onCurrentDateChange={setCurrentDate}
          />
          <DayView startDayHour={8} endDayHour={20} />
          <WeekView startDayHour={8} endDayHour={20} />
          <MonthView />
          <Appointments />
          {/* <Resources data={resources} /> */}
          <Resources data={resources} mainResourceName={resourceName} />

          <Toolbar
          // flexibleSpaceComponent={FlexibleSpace}
          // {...(rota.running ? { rootComponent: ToolbarWithLoading } : null)}
          />
          <DateNavigator />
          <TodayButton />
          <ViewSwitcher />
          <AppointmentTooltip showOpenButton showCloseButton />
          <AppointmentForm readOnly />
        </Scheduler>
      </Paper>
    </div>
  )
}

export default Schedule
