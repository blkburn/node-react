import React, {useEffect, useState} from 'react'
import FormContainer from '../components/FormContainer'
import Message from '../components/Message'
import Loader from '../components/Loader'
import {Button, Col, Form, Card} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {locationLookup} from '../actions/weatherActions'
import {
  CURRENT_WEATHER_LIST_CLEAR_SUCCESS,
  LOCATION_SUCCESS
} from '../constants/userConstants'
import {sendWeatherList, getWeatherList, locationLookupBatch} from '../actions/weatherActions.js'

const Home = () => {
  const [location, setLocation] = useState('')
  const dispatch = useDispatch()

  const userLogin = useSelector((state) => state.userLogin)
  const {loading, error, userInfo} = userLogin

  const weather = useSelector((state) => state.weather)
  const {weatherList, successGet} = useSelector((state) => state.currentWeatherList)

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(locationLookup(location))
  }

  useEffect(() => {
    console.log('weather list updated')
    console.log(`length : ${weather.weather.length}`)
  }, [weather.weather])

  useEffect(() => {
    console.log('get weather list on load')
    dispatch(getWeatherList())
  }, [dispatch])


  useEffect(() => {
    if (successGet) {
      console.log('restore weatherlist from server')
      dispatch({type: CURRENT_WEATHER_LIST_CLEAR_SUCCESS})
      if (weatherList && weatherList.length) {
        dispatch(locationLookupBatch(weatherList))
      }
    }
  }, [dispatch, weatherList, successGet])

  const cardClick = (city) => {
    console.log('deleting ' + city)
    let updated
    if (weather.weather) {
      updated = weather.weather.filter(w => {
        return w.city_name != city
      })
      dispatch({
        type: LOCATION_SUCCESS,
        payload: updated,
      })
      updated = updated.map(w => {
        return ({city_name: w.city_name, lat: w.lat, lon: w.lon})
      })
      console.log(updated)
      dispatch(sendWeatherList(updated))
    }
  }
  return (
    <FormContainer>
      <h1>Weather App</h1>
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader/>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="location">
          <Form.Label className="my-2">Enter a Location</Form.Label>
          <Form.Control
            type="address"
            placeholder="Enter location"
            value={location}
            disabled={weather.loading}
            onChange={(e) => setLocation(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button className="my-3" type="submit" variant="primary" disabled={weather.loading}
        >
          Get the weather
        </Button>
      </Form>
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around'}}>
        {(weather.weather && weather.weather.length) ? (
          weather.weather.map(weather => {
            return (
              <a onClick={() => cardClick(weather.city_name)} key={weather.city_name}>
                < Card style={{cursor: 'pointer'}}
                       style={{width: '12rem', margin: '0.5rem'}}>
                  <Card.Body>
                    <Card.Title>{weather.city_name}<br/> <span
                      style={{fontSize: '0.8rem'}}>({weather.timezone})</span></Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{weather.ob_time}</Card.Subtitle>
                    <Card.Text>
                      <h1>{weather.temp}℃</h1>
                      <p>Feels like {weather.app_temp}℃</p>
                      <img src={`./icons/${weather.weather.icon}.png`} alt=""/>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </a>
            )
          })
        ) : <> </>}
      < /div>
    </FormContainer>
  )
}

export default Home
