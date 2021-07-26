import React from 'react'
import { useSelector } from 'react-redux'
import Rota from './Rota'

const Home = () => {
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  return (
    <div className='homepage'>
      {userInfo ? (
        <Rota />
      ) : (
        <img
          src='https://source.unsplash.com/1600x900/?nature,water'
          alt='homepage pic'
        ></img>
      )}
    </div>
  )
}

export default Home
