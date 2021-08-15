import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { format } from 'date-fns'
import BootstrapTable from 'react-bootstrap-table-next'

const ServerRequests = () => {
  const dispatch = useDispatch()
  const rota = useSelector((state) => state.rota)
  const requests = useSelector((state) => state.requests)
  const { serverRequests } = requests

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

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
            <span>{format(new Date(rowContent), 'eeee do MMMM yyyy')}</span>
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
      dataField: 'status',
      text: 'Status',
      style: { whiteSpace: 'wrap', textOverlow: 'clip' },
      headerStyle: (colum, colIndex) => {
        return {
          width: '50%',
        }
      },
    },
  ]

  return (
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
  )
}

export default ServerRequests
