import express from 'express'

const router = express.Router()

import {
  getToken,
} from '../controllers/authController.js'
// import { protect, admin } from '../middleware/authMiddleware.js'

// router.route('/register').post(registerUser)
// router.route('/').get(protect, admin, getUsers)
router.post('/token', getToken)

export default router
