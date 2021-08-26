import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import getPublicKey from "../utils/getPublicKey.js";

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const getToken = asyncHandler(async (req, res) => {
  const { id } = req.body
  console.log('recevied token request')
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

const reqPubKey =asyncHandler(async (req, res) => {
  const { id } = req.body
  console.log('recevied pubkey request')
  if (getPublicKey()) {
    res.json({
      pubkey: getPublicKey(),
    })
  } else {
    res.json({
      message: 'Public Key not loaded',
    })
  }
})

export {
getToken, reqPubKey
}
