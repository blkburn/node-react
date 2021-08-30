import express from 'express'
import dotenv from 'dotenv'
// import path from 'path'
import colors from 'colors'
import morgan from 'morgan'
// import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'

import userRoutes from './routes/usersRoutes.js'
import weatherRoutes from './routes/weatherRoutes.js'

dotenv.config()

connectDB()


function logReqRes(req, res, next) {
  const oldWrite = res.write
  const oldEnd = res.end

  const chunks = []

  res.write = (...restArgs) => {
    chunks.push(Buffer.from(restArgs[0]))
    oldWrite.apply(res, restArgs)
  }

  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]))
    }
    const body = Buffer.concat(chunks).toString('utf8')

    console.log({
      time: new Date().toUTCString(),
      fromIP: req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress,
      method: req.method,
      originalUri: req.originalUrl,
      uri: req.url,
      requestData: req.body,
      responseData: body,
      referer: req.headers.referer || '',
      ua: req.headers['user-agent']
    })

    // console.log(body);
    oldEnd.apply(res, restArgs)
  }

  next()
}

const app = express()

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// accept JSON data in the body
app.use(express.json())
// app.use(logReqRes)

// app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/location', weatherRoutes)
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

const PORT = process.env.PORT || 5000

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
)
