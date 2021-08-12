import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DateFnsUtils from '@date-io/date-fns'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'
import { createTheme } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import { ThemeProvider } from '@material-ui/styles'
import { purple } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'
import { Button as BsButton } from 'react-bootstrap'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import { makeStyles } from '@material-ui/core/styles'
import { Card } from '@material-ui/core'
import { format } from 'date-fns'
import { ROTA_UPDATE_CHECKED_VIEW } from '../constants/userConstants'

const RequestItem = ({ request, index, removeRequest }) => {
  return (
    <div className='request-item'>
      <span style={{ textDecoration: request.isAccept ? 'line-through' : '' }}>
        {format(request.startDate, 'eeee do MMMM yyyy')}
      </span>
      <span style={{ textDecoration: request.isAccept ? 'line-through' : '' }}>
        {format(request.endDate, 'eeee do MMMM yyyy')}
      </span>
      <span style={{ textDecoration: request.isAccept ? 'line-through' : '' }}>
        {request.shift}
      </span>
      <div className='del-button'>
        {/* <Button variant='outline-success' onClick={() => markTodo(index)}>
          ✓
        </Button>{' '} */}
        <BsButton
          variant='danger'
          className='btn-sm btn-danger'
          onClick={() => removeRequest(index)}
        >
          <i className='fas fa-trash'></i>
        </BsButton>
      </div>
    </div>
  )
}

const Requests = () => {
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const sheetList = useSelector((state) => state.sheetList)
  const { loading, error, sheets } = sheetList

  const sheetDelete = useSelector((state) => state.sheetDelete)
  const { success: successDelete } = sheetDelete

  const theme = createTheme({
    palette: {
      primary: blue,
      type: 'dark',
    },
  })
  const [requests, setRequests] = useState([])

  const onSubmit = (event) => {
    event.preventDefault(event)
    setRequests((prevState) => [
      ...prevState,
      {
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        shift: selectedShift,
      },
    ])
  }

  useEffect(() => {
    console.log(requests)
  }, [requests])

  const [selectedStartDate, setSelectedStartDate] = useState(new Date())
  const [selectedEndDate, setSelectedEndDate] = useState(new Date())
  const [selectedShift, setSelectedShift] = useState('Select Shift')

  const handleStartDateChange = (date) => {
    setSelectedStartDate(date)
    if (date > selectedEndDate) {
      setSelectedEndDate(date)
    }
  }
  const handleEndDateChange = (date) => {
    setSelectedEndDate(date)
  }

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    paper: {
      marginRight: theme.spacing(2),
    },
  }))

  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef(null)

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    console.log(event.target.id)
    setSelectedShift(event.target.id)
    setOpen(false)
  }

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const removeRequest = (index) => {
    const newRequests = [...requests]
    newRequests.splice(index, 1)
    setRequests(newRequests)
  }
  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open)
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus()
    }

    prevOpen.current = open
  }, [open])

  const [viewRequests, setViewRequests] = useState(false)
  return (
    <div hidden={!rota.startDate}>
      <ThemeProvider theme={theme}>
        <BsButton
          onClick={() => {
            setViewRequests(!viewRequests)
            // let updateStaff = rota.staff.map((item) => {
            //   return { ...item, isChecked: false }
            // })
            const updateStaff = rota.staff.map((item) => {
              return item.id === 'FD'
                ? { ...item, isChecked: true }
                : { ...item, isChecked: false }
            })
            dispatch({ type: ROTA_UPDATE_CHECKED_VIEW, payload: updateStaff })
          }}
          color='primary'
        >
          Enter Requests
        </BsButton>
        <form
          className='request-form'
          hidden={!viewRequests}
          onSubmit={onSubmit}
        >
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              color='primary'
              disableToolbar
              variant='inline'
              format='dd/MM/yyyy'
              margin='normal'
              id='date-picker-inline'
              label='Request Start Date'
              value={selectedStartDate}
              onChange={handleStartDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </MuiPickersUtilsProvider>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              color='primary'
              disableToolbar
              variant='inline'
              format='dd/MM/yyyy'
              margin='normal'
              id='date-picker-inline'
              label='Request End Date'
              value={selectedEndDate}
              onChange={handleEndDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </MuiPickersUtilsProvider>
          <div>
            <Button
              ref={anchorRef}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-haspopup='true'
              onClick={handleToggle}
            >
              {selectedShift}
            </Button>
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === 'bottom' ? 'center top' : 'center bottom',
                  }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList
                        autoFocusItem={open}
                        id='menu-list-grow'
                        onKeyDown={handleListKeyDown}
                      >
                        {rota.shift &&
                          rota.shift.map((name, index) => (
                            <MenuItem
                              key={name['id']}
                              id={name['id']}
                              onClick={handleClose}
                            >
                              {name['text']}
                            </MenuItem>
                          ))}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </div>
          <div className='form-group'>
            <button className='form-control btn btn-primary' type='submit'>
              Add
            </button>
          </div>
        </form>
      </ThemeProvider>
      <div className='requests'>
        {requests &&
          requests.map((request, index) => (
            <RequestItem
              key={index}
              index={index}
              request={request}
              removeRequest={removeRequest}
            />
          ))}
      </div>
    </div>
  )
}

export default Requests
