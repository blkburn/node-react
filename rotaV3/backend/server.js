import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import colors from 'colors'
import morgan from 'morgan'
// import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'

// import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/usersRoutes.js'
import rotaRoutes from './routes/rotaRoutes.js'
import sheetRoutes from './routes/sheetsRoutes.js'
import requestsRoutes from './routes/requestsRoutes.js'

// import orderRoutes from './routes/orderRoutes.js'
// import uploadRoutes from './routes/uploadRoutes.js'

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

connectDB()

const app = express()

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// accept JSON data in the body
app.use(express.json())

// app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/rota', rotaRoutes)
app.use('/api/sheets', sheetRoutes)
app.use('/api/requests', requestsRoutes)
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
  app.use(express.static(path.join(__dirname, '../frontend/build')))

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
    )
  )
} else {
  app.get('/', (req, res) => {
    res.send('API is running....')
  })
}

// app.use(notFound)
// app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
)
