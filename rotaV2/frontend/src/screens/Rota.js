// import { Redirect, Link } from 'react-router-dom'
// import auth from './../auth/auth-helper'
// import { read, sendMsg, checkStatus, sendVerify } from './api-user.js'

import React, { useEffect } from 'react'
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
} from '../actions/rotaActions'

const Rota = (props) => {
  const dispatch = useDispatch()
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const rota = useSelector((state) => state.rota)

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

  const handleChange = (name) => (event) => {
    // localStorage.setItem([name], event.target.value)
    dispatch(validRotaSheet(false))
    dispatch(clearRotaMessage())
    dispatch(setRotaSheet(event.target.value))

    // setValues({ ...values, [name]: event.target.value })
  }
  // if (redirectToSignin) {
  //   return <Redirect to='/signin' />
  // }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(verifyRotaSheet())
  }
  const runHandler = (e) => {
    e.preventDefault()
    dispatch(runRotaSheet())
  }
  return (
    <FormContainer>
      <h1>Create Rota</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId='name'>
          <Form.Label className='my-2'>Sheet Name</Form.Label>
          <Form.Control
            type='name'
            placeholder='Enter sheet URL'
            value={rota.sheet}
            onChange={handleChange('sheet')}
          ></Form.Control>
        </Form.Group>
        <Button
          className='my-3'
          type='submit'
          disabled={rota.running || rota.valid}
          variant='primary'
        >
          {rota.valid ? (
            rota.locked ? (
              <i className='fas fa-lock'></i>
            ) : (
              <i className='fas fa-unlock'></i>
            )
          ) : (
            'Verify Sheet'
          )}
        </Button>
      </Form>
      <Form onSubmit={runHandler}>
        <Form.Group controlId='name'>
          <Form.Label className='my-2'>Rota Name</Form.Label>
          <Form.Control
            type='name'
            placeholder='Enter rota name'
            value={rota.name}
            onChange={(e) => dispatch(setRotaName(e.target.value))}
          ></Form.Control>
        </Form.Group>
        <Button
          className='my-3'
          disabled={rota.running || !rota.valid}
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
    </FormContainer>
  )
}

export default Rota
