import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import {
  clearRotaMessage,
  appendRotaMessage,
  setRotaRunning,
  stopRotaRunning,
  setRotaSheet,
  validRotaSheet,
  clearRotaCount,
  incRotaCount,
  setRotaLocked,
  checkRotaStatus,
  verifyRotaSheet,
  runRotaSheet,
  setRotaName,
  getSchedule,
} from '../actions/rotaActions'
import { ROTA_CLEAR_UPDATE_SCHEDULE } from '../constants/userConstants'

const RotaAdmin = (props) => {
  const dispatch = useDispatch()
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const rota = useSelector((state) => state.rota)
  const sheetDetails = useSelector((state) => state.sheetDetails)
  const { loading, error, sheet } = sheetDetails

  const [condFormatting, setCondFormatting] = useState(false)

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

  useEffect(() => {
    console.log('screen refresh')
    dispatch(validRotaSheet(false))
  }, [dispatch])

  useEffect(() => {
    dispatch({ type: ROTA_CLEAR_UPDATE_SCHEDULE })
  }, [sheet.sheet, dispatch])

  useEffect(() => {
    if (rota.success) {
      console.log('update getSchedule()')
      dispatch(getSchedule(true))
    }
  }, [rota.success, dispatch])

  const handleChange = (name) => (event) => {
    // localStorage.setItem([name], event.target.value)
    // dispatch(setRotaSheet(name))
    dispatch(validRotaSheet(false))
    dispatch(clearRotaMessage())
    dispatch(setRotaSheet(event.target.value))
    dispatch({ type: ROTA_CLEAR_UPDATE_SCHEDULE })

    // setValues({ ...values, [name]: event.target.value })
  }
  // if (redirectToSignin) {
  //   return <Redirect to='/signin' />
  // }

  const handleSubmit = (e) => {
    e.preventDefault()

    // dispatch(validRotaSheet(false))
    // dispatch(clearRotaMessage())
    dispatch(setRotaSheet(sheet.sheet))
    // dispatch(setRotaName(sheet.name))
    dispatch(verifyRotaSheet())
  }
  const runHandler = (e) => {
    e.preventDefault()
    dispatch(runRotaSheet(condFormatting))
  }

  return (
    <>
      <h2>Update Rota</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId='name'>
          <Form.Label className='my-2'>Rota Name</Form.Label>
          <Form.Control
            type='name'
            placeholder='Enter rota name'
            value={sheet.name || ''}
            readOnly={true}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId='sheet'>
          <Form.Label className='my-2'>Sheet URL</Form.Label>
          <Form.Control
            type='sheet'
            placeholder='Sheet URL'
            value={sheet.sheet || ''}
            readOnly={true}
          ></Form.Control>
        </Form.Group>
        <Button
          className='my-3 me-3'
          // type='submitLoad'
          disabled={rota.running || !sheet.sheet}
          variant='primary'
          onClick={() => window.open(sheet.sheet, '_blank')}
        >
          Open Sheet
        </Button>
        <Button
          className='my-3'
          type='submit'
          disabled={rota.running || !sheet.sheet}
          variant='primary'
        >
          {rota.valid ? (
            rota.locked ? (
              <i className='fas fa-lock'> Reverify Sheet</i>
            ) : (
              <i className='fas fa-unlock'> Reverify Sheet</i>
            )
          ) : (
            'Verify Sheet'
          )}
        </Button>
      </Form>
      <Form onSubmit={runHandler}>
        <Form.Group className='my-2' controlId='runConditionalFormating'>
          <Form.Check
            type='checkbox'
            onChange={(e) => setCondFormatting(e.target.checked)}
            label='Run sheet conditional formatting (very slow)'
          />
        </Form.Group>
        <Button
          className='my-2'
          disabled={rota.running || !rota.successVerify}
          type='submit'
          variant='primary'
        >
          {rota.locked ? 'Generate Metrics' : 'Run'}
        </Button>
        <Form.Control
          as='textarea'
          placeholder='Leave a comment here'
          style={{ height: '300px' }}
          value={rota.message.join('\n')}
          onChange={(e) => null}
        />
      </Form>
    </>
  )
}

export default RotaAdmin
