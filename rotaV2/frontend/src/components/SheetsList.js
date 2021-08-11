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
import { SHEET_DETAILS_RESET } from '../constants/userConstants'

const SheetList = ({ type, history }) => {
  const dispatch = useDispatch()

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const sheetList = useSelector((state) => state.sheetList)
  const { loading, error, sheets } = sheetList

  const sheetDelete = useSelector((state) => state.sheetDelete)
  const { success: successDelete } = sheetDelete

  useEffect(() => {
    if (userInfo) {
      dispatch(listSheets(type))
    } else {
      history.push('/login')
    }
  }, [dispatch, history, successDelete, userInfo])

  const deleteHandler = (id) => {
    console.log(id)
    if (window.confirm('Are you sure')) {
      dispatch(deleteSheet(id))
      dispatch({ type: SHEET_DETAILS_RESET })
    }
  }
  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      console.log(`clicked on row with index: ${rowIndex}`)
      console.log(sheets[rowIndex])
      if (e.target.cellIndex < 2) {
        dispatch(getSheetDetails(sheets[rowIndex]._id))
      }
    },
    // onMouseEnter: (e, row, rowIndex) => {
    //   console.log(`enter on row with index: ${rowIndex}`)
    // },
  }
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
  ]

  return (
    <>
      <h2>List of Rotas</h2>
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
          hover={true}
          rowEvents={rowEvents}
        />
      )}
    </>
  )
}

export default SheetList
