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
import Button from '@material-ui/core/Button'
import { Button as BsButton } from 'react-bootstrap'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import { makeStyles } from '@material-ui/core/styles'
import { format } from 'date-fns'
import {
  REQUESTS_LOCAL_ADD,
  REQUESTS_LOCAL_CLEAR,
  REQUESTS_LOCAL_REMOVE,
  ROTA_UPDATE_CHECKED_VIEW,
} from '../constants/userConstants'
import BootstrapTable from 'react-bootstrap-table-next'
import { v4 as uuidv4 } from 'uuid'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import NativeSelect from '@material-ui/core/NativeSelect'
import ServerRequests from './ServerRequests'
import { getServerRequest, postServerRequest } from '../actions/requestsActions'

const Requests = () => {
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)
  const requests = useSelector((state) => state.requests)
  const { localRequests } = requests

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

  const onSubmit = (event) => {
    event.preventDefault(event)
    console.log('onsubmit')
    const req = {
      userID: userInfo._id,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      type: selectedType,
      shift: selectedShift,
      _id: uuidv4(),
    }
    dispatch({ type: REQUESTS_LOCAL_ADD, payload: req })
    console.log(req)
  }

  const [selectedStartDate, setSelectedStartDate] = useState(new Date())
  const [selectedEndDate, setSelectedEndDate] = useState(new Date())
  const [selectedShift, setSelectedShift] = useState('Select Shift')
  const [selectedType, setSelectedType] = useState('Request Shift')

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

  const handleShiftClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    if (event.target.id) {
      console.log(event.target.id)
      setSelectedShift(event.target.id)
    }
    setOpen(false)
  }

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const removeRequest = (index) => {
    dispatch({ type: REQUESTS_LOCAL_REMOVE, payload: index })
  }
  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open)
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus()
    }

    prevOpen.current = open
  }, [open])

  const columns = [
    {
      dataField: 'startDate',
      text: 'Start Date',
      formatter: (rowContent, row) => {
        const style = (
          <>
            <span>{format(rowContent, 'eeee do MMMM yyyy')}</span>
          </>
        )
        return style
      },
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '50%',
        }
      },
    },
    {
      dataField: 'endDate',
      text: 'End Date',
      formatter: (rowContent, row) => {
        const style = (
          <>
            <span>{format(rowContent, 'eeee do MMMM yyyy')}</span>
          </>
        )
        return style
      },
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '50%',
        }
      },
    },
    {
      dataField: 'type',
      text: 'Rquest Type',
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '50%',
        }
      },
    },
    {
      dataField: 'shift',
      text: 'Shift',
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '50%',
        }
      },
    },
    {
      dataField: 'Edit',
      text: 'Edit',
      formatter: (rowContent, row) => {
        const style = (
          <BsButton
            variant='danger'
            className='btn-sm '
            onClick={() => removeRequest(row)}
          >
            <i className='fas fa-trash'></i>
          </BsButton>
        )
        return style
      },
      style: {
        textAlign: 'center',
      },
      headerStyle: (colum, colIndex) => {
        return {
          width: '10%',
          textAlign: 'center',
        }
      },
    },
  ]

  const handleChange = (event) => {
    console.log(event.target.value)
    setSelectedType(event.target.value)
  }

  const [viewRequests, setViewRequests] = useState(false)
  return (
    <div hidden={!rota.startDate}>
      <ThemeProvider theme={theme}>
        <BsButton
          className='show-requests'
          onClick={() => {
            setViewRequests(!viewRequests)
            const updateStaff = rota.staff.map((item) => {
              return item.id === 'FD'
                ? { ...item, isChecked: true }
                : { ...item, isChecked: false }
            })
            dispatch({ type: ROTA_UPDATE_CHECKED_VIEW, payload: updateStaff })
            dispatch(getServerRequest())
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
          <FormControl className='requests-type-control'>
            <InputLabel shrink htmlFor='request-type-placeholder'>
              Request Type
            </InputLabel>
            <NativeSelect
              value={selectedType}
              onChange={handleChange}
              inputProps={{
                name: 'Request Type',
                id: 'request-type',
              }}
            >
              <option value={'Request Shift'}>Request Shift</option>
              <option value={'Reject Shift'}>Reject Shift</option>
            </NativeSelect>
          </FormControl>
          <div className='shift-select'>
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
                    <ClickAwayListener onClickAway={handleShiftClose}>
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
                              onClick={handleShiftClose}
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
      <div hidden={localRequests.length === 0} className='requests-local'>
        <BootstrapTable
          keyField='_id'
          data={localRequests}
          columns={columns}
          striped={true}
          hover={true}
          rowEvents={null}
        />
        <BsButton
          // variant='danger'
          className='btn-lg submit-button'
          onClick={() => {
            dispatch(postServerRequest(localRequests))
            dispatch({ type: REQUESTS_LOCAL_CLEAR })
            dispatch(getServerRequest())
          }}
        >
          {' '}
          Submit Requests
        </BsButton>
      </div>
      <ServerRequests />
    </div>
  )
}

export default Requests
