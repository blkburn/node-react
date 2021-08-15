import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'
import Sheet from '../models/sheetModel.js'
import Requests from '../models/requestsModel.js'

// @desc    Get all requests for a userID
// @route   GET /api/requests/:id
// @access  Private
const getRequests = asyncHandler(async (req, res) => {
  console.log(req.params.id)
  const requests = await Requests.find({ userID: req.params.id })
  console.log(requests)

  if (requests.length > 0) {
    res.json(requests)
  } else {
    res.status(404)
    throw new Error('No requests found')
  }
})

// @desc    Get all requests for a userID
// @route   POST /api/requests/:id
// @access  Private
const addRequests = asyncHandler(async (req, res) => {
  console.log(req.params.id)

  const requests = req.body
  const results = await Promise.all(
    requests.map(async (req) => {
      console.log(req)
      let requests = await Requests.create({
        userID: req.userID,
        startDate: req.startDate,
        endDate: req.endDate,
        type: req.type,
        shift: req.shift,
      })
      console.log(requests)
    })
  )

  // const user = await User.create({
  //   name,
  //   email,
  //   password,
  // })

  // if (user) {
  //   res.status(201).json({
  //     _id: user._id,
  //     name: user.name,
  //     email: user.email,
  //     isAdmin: user.isAdmin,
  //     token: generateToken(user._id),
  //   })
  // } else {
  //   res.status(400)
  //   throw new Error('Invalid user data')
  // }
  res.status(201).json({ message: 'worked' })
})

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private/Admin
const deleteRequests = asyncHandler(async (req, res) => {
  const request = await Requests.findById(req.params.id)

  if (request) {
    await request.remove()
    res.json({ message: 'Request removed' })
  } else {
    res.status(404)
    throw new Error('Request not found')
  }
})

export { getRequests, addRequests, deleteRequests }
