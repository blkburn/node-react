import express from 'express'

const router = express.Router()

import {
  getSheets,
  deleteSheet,
  getSheetById,
  updateSheet,
  addSheet,
} from '../controllers/sheetController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/add').post(protect, admin, addSheet)
router.route('/').get(protect, getSheets)
router
  .route('/:id')
  .delete(protect, admin, deleteSheet)
  .get(protect, admin, getSheetById)
  .put(protect, admin, updateSheet)

export default router
