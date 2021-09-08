const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const base64 = require('base-64');
const httpLog = require('./models/httpLogs.js')
// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();


const logReqRes = async (req, res, next) => {
  const oldWrite = res.write
  const oldEnd = res.end
  const now = new Date()
  const chunks = []
  let body = []
  res.write = (...restArgs) => {
    chunks.push(Buffer.from(restArgs[0]))
    oldWrite.apply(res, restArgs)
  }

  res.end = async (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]))
    }
    body = Buffer.concat(chunks).toString('utf8')

    const { rawHeaders, httpVersion, method, socket, url } = req;
    const { remoteAddress, remoteFamily } = socket;

    const { statusCode, statusMessage } = res;
    const headers = res.getHeaders();
    body = JSON.parse(body)

    const log = {
      time: new Date().toUTCString(),
      elapsed: new Date()-now,
      fromIP: req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress,
      method: req.method,
      originalUri: req.originalUrl,
      params: req.params,
      uri: req.url,
      requestData: (req.url==='/login' || req.url==='/register') ? {} : req.body,
      responseData: {success: body.success, count: body.count, error: body.error},
      headers: req.headers,
      referer: req.headers.referer || '',
      ua: req.headers['user-agent'],
      response: {
        statusCode,
        statusMessage,
        headers
      }
    }
    const logData = new httpLog(log)
    const logged = await logData.save()
    // console.log(logged)

    // console.log(body);
    oldEnd.apply(res, restArgs)
  }

  next()
}

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const sheets = require('./routes/sheets')
const api = require('./routes/api')

const app = express();

// Body parser
app.use(express.json());
app.use(logReqRes)
// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
  header: true
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/sheets', sheets);

// this route os for returning sheet data
app.use('/v1', api);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
