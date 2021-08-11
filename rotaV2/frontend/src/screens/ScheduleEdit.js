import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainer from '../components/FormContainer'
import { SHEET_UPDATE_RESET } from '../constants/userConstants'
import { getSheetDetails, updateSheet } from '../actions/sheetActions'

const ScheduleEdit = ({ match, history }) => {
  const sheetId = match.params.id

  const sheetDetails = useSelector((state) => state.sheetDetails)
  const { loading, error, sheet } = sheetDetails

  const sheetUpdate = useSelector((state) => state.sheetUpdate)

  const [name, setName] = useState('')
  const [url, setURL] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isRequests, setIsRequests] = useState(false)

  const dispatch = useDispatch()

  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = sheetUpdate

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: SHEET_UPDATE_RESET })
      history.push('/schedule')
    } else {
      if (!sheet.name || sheet._id !== sheetId) {
        dispatch(getSheetDetails(sheetId))
      } else {
        setName(sheet.name)
        setURL(sheet.sheet)
        setIsPublished(sheet.isPublished)
        setIsRequests(sheet.isRequests)
      }
    }
  }, [dispatch, history, sheet, sheetId, successUpdate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(
      updateSheet({ _id: sheetId, name, sheet: url, isPublished, isRequests })
    )
  }

  return (
    <>
      <Link to='/schedule' className='btn btn-light my-3'>
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit Schedule Details</h1>
        {loadingUpdate && <Loader />}
        {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
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
                disabled={true}
                value={url}
                onChange={(e) => setURL(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group className='my-2' controlId='ispublished'>
              <Form.Check
                type='checkbox'
                label='Is Published'
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              ></Form.Check>
            </Form.Group>

            <Form.Group className='my-2' controlId='isrequests'>
              <Form.Check
                type='checkbox'
                label='Requests Preview'
                checked={isRequests}
                onChange={(e) => setIsRequests(e.target.checked)}
              ></Form.Check>
            </Form.Group>

            <Button className='my-2' type='submit' variant='primary'>
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  )
}

export default ScheduleEdit
