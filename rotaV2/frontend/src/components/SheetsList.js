import React, { useEffect } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import {
  deleteSheet,
  getSheetDetails,
  listSheets,
} from '../actions/sheetActions'
import BootstrapTable from 'react-bootstrap-table-next'
import {
  ROTA_UPDATE_SCHEDULE,
  SHEET_DETAILS_RESET,
} from '../constants/userConstants'
import { setSchedule } from '../actions/rotaActions'

const SheetList = ({ type, history }) => {
  const dispatch = useDispatch()

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const sheetList = useSelector((state) => state.sheetList)
  const { loading, error, sheets, success: successList } = sheetList

  const sheetDelete = useSelector((state) => state.sheetDelete)
  const { success: successDelete } = sheetDelete

  useEffect(() => {
    if (userInfo) {
      dispatch(listSheets(type))
    } else {
      history.push('/login')
    }
  }, [dispatch, history, userInfo, type])

  useEffect(() => {
    if (successList) {
      console.log('load all the published rotas')
      const ids = sheets.map((sheet) => {
        dispatch(getSheetDetails(sheet._id))
        return sheet._id
      })
    } else {
    }
  }, [dispatch, history, successList, userInfo, type])

  const columns = [
    {
      dataField: 'name',
      text: 'Name',
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '50%',
          // textAlign: 'center',
        }
      },
    },
    {
      dataField: 'startDate',
      text: 'Start Date',
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '20%',
          // textAlign: 'center',
        }
      },
    },
    {
      dataField: 'endDate',
      text: 'End Date',
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '20%',
          // textAlign: 'center',
        }
      },
    },
  ]

  return (
    <>
      <h2>Published Rotas</h2>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <BootstrapTable
          keyField='name'
          data={sheets}
          columns={columns}
          striped={true}
          hover={false}
          rowEvents={null}
        />
      )}
    </>
  )
}

export default SheetList
