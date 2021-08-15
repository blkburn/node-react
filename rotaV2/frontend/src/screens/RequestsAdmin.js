import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { format } from 'date-fns'
import BootstrapTable from 'react-bootstrap-table-next'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button } from 'react-bootstrap'
import { deleteRequests, getServerRequest } from '../actions/requestsActions'
import { REQUESTS_ADD_ERROR_CLEAR } from '../constants/userConstants'

const RequestsAdmin = () => {
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)
  const requests = useSelector((state) => state.requests)
  const { serverRequests, success: successDeleteRequest } = requests

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const deleteHandler = (id) => {
    console.log(id)
    if (window.confirm('Are you sure')) {
      dispatch(deleteRequests(id))
    }
  }

  useEffect(() => {
    dispatch(getServerRequest())
    // dispatch({ type: REQUESTS_ADD_ERROR_CLEAR })
  }, [dispatch, successDeleteRequest])

  const columns = [
    {
      dataField: 'startDate',
      text: 'Start Date',
      formatter: (rowContent, row) => {
        const style = (
          <>
            <span>{format(new Date(rowContent), 'eeee do MMMM yyyy')}</span>
          </>
        )
        return style
      },
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '30%',
        }
      },
    },
    {
      dataField: 'endDate',
      text: 'End Date',
      formatter: (rowContent, row) => {
        const style = (
          <>
            <span>{format(new Date(rowContent), 'eeee do MMMM yyyy')}</span>
          </>
        )
        return style
      },
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '30%',
        }
      },
    },
    {
      dataField: 'type',
      text: 'Rquest Type',
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '30%',
        }
      },
    },
    {
      dataField: 'shift',
      text: 'Shift',
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '30%',
        }
      },
    },
    {
      dataField: 'status',
      text: 'Status',
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '10%',
        }
      },
    },
    {
      dataField: 'Edit',
      text: 'Edit',
      formatter: (rowContent, row) => {
        const style = (
          <>
            <LinkContainer to={`/admin/sheets/${row._id}/edit`}>
              <Button variant='light' className='btn-sm'>
                <i className='fas fa-edit'></i>
              </Button>
            </LinkContainer>
            <Button
              variant='danger'
              className='btn-sm'
              onClick={() => deleteHandler(row._id)}
            >
              <i className='fas fa-trash'></i>
            </Button>
          </>
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

  return (
    <>
      <div hidden={serverRequests.length === 0} className='requests-local'>
        <h3>Current Requests</h3>
        <BootstrapTable
          keyField='_id'
          data={serverRequests}
          columns={columns}
          striped={true}
          hover={true}
          rowEvents={null}
        />
      </div>
      <div hidden={serverRequests.length !== 0} className='requests-local'>
        <h3>No Requests</h3>
      </div>
    </>
  )
}

export default RequestsAdmin
