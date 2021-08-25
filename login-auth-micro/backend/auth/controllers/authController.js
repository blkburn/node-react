import asyncHandler from 'express-async-handler'
import generateToken from '../../auth/utils/generateToken.js'
// import User from '../../utils/models/userModel.js'
import axios from 'axios'

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const getToken = asyncHandler(async (req, res) => {
  const { id } = req.body
  console.log('###################')
  console.log('recevied token request')

  // const user = await User.findById(id)
  // console.log(user)
  if (id) {
    console.log(id)
    res.json({
      token: generateToken(id),
    })
  } else {
    res.json({
      message: 'Invalid ID',
    })
  }
})

export {
getToken
}
