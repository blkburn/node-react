import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainer from '../components/FormContainer'
import { addSheet } from '../actions/sheetActions'
import { SHEET_ADD_ERROR_CLEAR } from '../constants/userConstants'

const SheetNew = ({ location, history }) => {
  const [sheet, setSheet] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState(null)

  const dispatch = useDispatch()

  const sheetAdd = useSelector((state) => state.sheetAdd)
  const { loading, error, sheetInfo } = sheetAdd

  const redirect = location.search ? location.search.split('=')[1] : '/'

  useEffect(() => {
    if (sheetInfo) {
      history.push(redirect)
    }
  }, [history, sheetInfo, redirect])

  useEffect(() => {
    dispatch({ type: SHEET_ADD_ERROR_CLEAR })
  }, [dispatch])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(addSheet(name, sheet, false))
  }

  return (
    <>
      <h2>Add New Sheet</h2>
      {message && <Message variant='danger'>{message}</Message>}
      {error && <Message variant='danger'>{error}</Message>}
      {loading && <Loader />}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='name'>
          <Form.Label className='my-2'>Rota Name</Form.Label>
          <Form.Control
            type='name'
            placeholder='Enter rota name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId='sheet'>
          <Form.Label className='my-2'>Sheet URL</Form.Label>
          <Form.Control
            type='sheet'
            placeholder='Sheet URL'
            value={sheet}
            onChange={(e) => setSheet(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button className='my-3' type='submit' variant='primary'>
          Add
        </Button>
      </Form>
    </>
  )
}

export default SheetNew
