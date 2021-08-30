import express from 'express'

const router = express.Router()

import {
  getWeather,
  sendCurrentWeatherList,
  getCurrentWeatherList,
  getWeatherBatch
} from '../controllers/weatherController.js'
import {protect} from '../middleware/authMiddleware.js'

router.route('/req/:location').get(protect, getWeather)
router.route('/cwList/:id').post(protect, sendCurrentWeatherList).get(protect, getCurrentWeatherList)
router.route('/reqbatch/').post(protect, getWeatherBatch)

export default router
