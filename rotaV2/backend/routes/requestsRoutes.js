import express from 'express'
import {
  addRequests,
  deleteRequests,
  getRequests,
} from '../controllers/requestsController.js'

const router = express.Router()

import { protect, admin } from '../middleware/authMiddleware.js'

router
  .route('/:id')
  .get(protect, getRequests)
  .post(protect, addRequests)
  .delete(protect, admin, deleteRequests)
// router.post('/login', authUser)
// router
//   .route('/profile')
//   .get(protect, getUserProfile)
//   .put(protect, updateUserProfile)
// router
//   .route('/:id')
//   .delete(protect, admin, deleteUser)
//   .get(protect, admin, getUserById)
//   .put(protect, admin, updateUser)

export default router
