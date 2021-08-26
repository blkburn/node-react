import express from 'express'
import dotenv from 'dotenv'
// import path from 'path'
import colors from 'colors'
import morgan from 'morgan'
// import { notFound, errorHandler } from './middleware/errorMiddleware.js'
// import connectDB from '../utils/config/db.js'

import authRoutes from './routes/authRoutes.js'

// dotenv.config()

// connectDB()

const app = express()

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// accept JSON data in the body
app.use(express.json())

// app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
// app.use('/api/orders', orderRoutes)
// app.use('/api/upload', uploadRoutes)

// app.get('/api/config/paypal', (req, res) =>
//   res.send(process.env.PAYPAL_CLIENT_ID)
// )

// const __dirname = path.resolve()
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  console.error(err.stack)
  res.json({
    message: err.message,
    error: err,
  })
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')))

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  )
} else {
  app.get('/', (req, res) => {
    res.send('API is running....')
  })
}

// app.use(notFound)
// app.use(errorHandler)

const PORT = process.env.AUTH_PORT || 5001

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
)
