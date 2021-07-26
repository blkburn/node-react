import express from 'express'

const router = express.Router()

import {
  getRotaStatus,
  verifyRotaSheet,
  runRotaSheet,
} from '../controllers/rotaController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/status').get(protect, getRotaStatus)
router.route('/verify').post(protect, verifyRotaSheet)
router.route('/run').post(protect, runRotaSheet)

export default router
