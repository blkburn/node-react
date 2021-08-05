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
  ROTA_FILTER_SCHEDULE,
  ROTA_FILTER_SCHEDULE_ID,
  ROTA_SCHEDULE_DATE,
  ROTA_SCHEDULE_VIEW_NAME,
} from '../constants/userConstants'
import { checkRotaStatus } from '../actions/rotaActions'

const Schedule = (props) => {
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)

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

  const getData = (setData, setLoading, rota) => {
    setLoading(false)
    if (rota && rota !== '') {
      setData(rota)
    }
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

  const initialState = {
    data: [],
    staff: [],
    shift: [],
    loading: false,
    currentDate: '2021-10-23',
    currentViewName: 'Week',
  }

  // const reducer = (state, action) => {
  //   switch (action.type) {
  //     case 'setLoading':
  //       return { ...state, loading: action.payload }
  //     case 'setData':
  //       return {
  //         ...state,
  //         data: action.payload['schedule'],
  //         staff: action.payload['staff'],
  //         shift: action.payload['shift'],
  //       }
  //     // return { ...state, data: action.payload.map(mapAppointmentData) }
  //     case 'setCurrentViewName':
  //       return { ...state, currentViewName: action.payload }
  //     case 'setCurrentDate':
  //       return { ...state, currentDate: action.payload }
  //     default:
  //       return state
  //   }
  // }

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
    setCurrentDate('2021-10-23')
    setCurrentViewName('Week')
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

  // const getButtonClass = (staff, classes, staffId) =>
  //   staff.indexOf(staffId) > -1 && classes.selectedButton

  // const handleButtonClick = (staffId, staff) => {
  //   const sId = staff.map((item) => {
  //     return item.id
  //   })
  //   if (sId.indexOf(staffId) > -1) {
  //     console.log(sId.filter((s) => s === staffId))
  //     return sId.filter((s) => s === staffId)
  //   }
  //   const nextstaff = [...staff]
  //   nextstaff.push(staffId)
  //   return nextstaff
  // }

  // const FlexibleSpace = withStyles(styles, { name: 'FlexibleSpace' })(
  //   ({ classes, ...restProps }) => (
  //     <Toolbar.FlexibleSpace {...restProps} className={classes.flexibleSpace}>
  //       <ReduxLocationSelector />
  //     </Toolbar.FlexibleSpace>
  //   )
  // )
  // const LocationSelector = withStyles(styles, { name: 'LocationSelector' })(
  //   ({ onStaffIdChange, staff, classes }) => {
  //     if (staff) {
  //       return (
  //         <ButtonGroup className={classes.locationSelector}>
  //           {staff.map((staffId, index) => (
  //             <Button
  //               className={classNames(
  //                 classes.button,
  //                 getButtonClass(staff, classes, staffId.id)
  //               )}
  //               onClick={() =>
  //                 onStaffIdChange(handleButtonClick(staffId.id, staff))
  //               }
  //               key={staffId.id}
  //             >
  //               <React.Fragment>
  //                 <span className={classes.shortButtonText}>
  //                   {staff[index].name}
  //                 </span>
  //                 <span className={classes.longButtonText}>
  //                   {staff[index].id}
  //                 </span>
  //               </React.Fragment>
  //             </Button>
  //           ))}
  //         </ButtonGroup>
  //       )
  //     } else {
  //       return null
  //     }
  //   }
  // )
  // const mapStateToProps = (state) => {
  //   if (state.rota.schedule) {
  //     let staff = state.rota.staff
  //     // let data = state.rota.staff.filter(
  //     //   (dataItem) => state.rota.staff.indexOf(dataItem.id) > -1
  //     // )
  //     // const lowerCaseFilter = state.currentFilter.toLowerCase()
  //     // data = data.filter(
  //     //   (dataItem) =>
  //     //     dataItem.title.toLowerCase().includes(lowerCaseFilter) ||
  //     //     dataItem.staffId.toLowerCase().includes(lowerCaseFilter)
  //     // )
  //     return { ...state, staff }
  //   } else return { ...state }
  // }

  // const mapDispatchToProps = (dispatch) => ({
  //   // onStaffIdChange: (locations) =>
  //   //   dispatch(createSchedulerAction('locations', locations)),
  //   onStaffIdChange: (id) => {
  //     if (rota.filteredId === id[0]) {
  //       dispatch({
  //         type: ROTA_CLEAR_FILTER_SCHEDULE,
  //       })
  //       dispatch({
  //         type: ROTA_CLEAR_FILTER_SCHEDULE_ID,
  //       })
  //     } else {
  //       const filtered = rota.schedule.filter((item) => {
  //         // console.log(typeof item.staff)
  //         return item.staff === id[0]
  //       })
  //       console.log(filtered)
  //       dispatch({
  //         type: ROTA_FILTER_SCHEDULE,
  //         payload: filtered,
  //       })
  //       dispatch({
  //         type: ROTA_FILTER_SCHEDULE_ID,
  //         payload: id[0],
  //       })
  //     }
  //   },
  // })

  // const SCHEDULER_STATE_CHANGE_ACTION = 'SCHEDULER_STATE_CHANGE'

  // const schedulerReducer = (state = schedulerInitialState, action) => {
  //   if (action.type === SCHEDULER_STATE_CHANGE_ACTION) {
  //     return {
  //       ...state,
  //       [action.payload.partialStateName]: action.payload.partialStateValue,
  //     }
  //   }
  //   return state
  // }
  // const store = createStore(
  //   schedulerReducer,
  //   // Enabling Redux DevTools Extension (https://github.com/zalmoxisus/redux-devtools-extension)
  //   // eslint-disable-next-line no-underscore-dangle
  //   typeof window !== 'undefined'
  //     ? window.__REDUX_DEVTOOLS_EXTENSION__ &&
  //         window.__REDUX_DEVTOOLS_EXTENSION__()
  //     : undefined
  //   // eslint-enable
  // )
  // const createSchedulerAction = (partialStateName, partialStateValue) => ({
  //   type: SCHEDULER_STATE_CHANGE_ACTION,
  //   payload: {
  //     partialStateName,
  //     partialStateValue,
  //   },
  // })

  // const ReduxLocationSelector = connect(
  //   mapStateToProps,
  //   mapDispatchToProps
  // )(LocationSelector)

  const [filterIDs, setFitlerIDs] = useState([])
  const getValue = (e) => {
    const clicked = e.target
    console.log(clicked.value)
    console.log(clicked.checked)
    if (clicked.checked) {
      setFitlerIDs((prevState) => [...prevState, clicked.value])
    } else {
      setFitlerIDs((prevState) => [
        ...prevState.filter((value) => value !== clicked.value),
      ])
    }
  }
  useEffect(() => {
    console.log(filterIDs)
    if (rota.schedule) {
      const filtered = rota.schedule.filter((item) => {
        // console.log(typeof item.staff)
        return filterIDs.includes(item.staff)
      })
      console.log(filtered)
      dispatch({
        type: ROTA_FILTER_SCHEDULE,
        payload: filtered,
      })
    }
  }, [filterIDs, dispatch, rota.schedule])
  return (
    <div className='schedule-container'>
      <div className='pill-container'>
        {rota.staff &&
          rota.staff.map((name, index) => (
            <div className='option'>
              <input
                type='checkbox'
                id={name['id']}
                name='selector'
                value={name['id']}
                key={name['id']}
                onChange={getValue}
              ></input>
              <label class='selector option' htmlFor={name['id']}>
                {name['text']}
              </label>
            </div>
          ))}
      </div>
      <Paper>
        <Scheduler data={rota.filtered} height={660}>
          <ViewState
            currentDate={rota.scheduleDate}
            currentViewName={rota.scheduleViewName}
            onCurrentViewNameChange={setCurrentViewName}
            onCurrentDateChange={setCurrentDate}
          />
          <DayView startDayHour={0} endDayHour={24} />
          <WeekView startDayHour={0} endDayHour={24} />
          <MonthView />
          <Appointments />
          {/* <Resources data={resources} /> */}
          <Resources data={resources} />

          <Toolbar
            // flexibleSpaceComponent={FlexibleSpace}
            {...(rota.running ? { rootComponent: ToolbarWithLoading } : null)}
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
// export default () => (
//   <Provider store={store}>
//     <Schedule />
//   </Provider>
// )
