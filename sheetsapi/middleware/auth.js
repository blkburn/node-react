const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const {getPublicKey} = require('../utils/getPublicKey.js')
const {updateUser} = require('../controllers/users.js')
const async = require('async')
const apiLogs = require('../models/apiLogs.js')


// Initializing the queue
const queue = async.queue(async.asyncify(async function(user, callback)  {
  // console.log("Currently Busy Processing Task " + user.rem);
  let userUpdate = await User.findById(user._id);
  console.log(userUpdate.remaining)
  if (userUpdate.remaining <= 90) {
    return('error')

  } else {
    const remaining = userUpdate.remaining - 1
    userUpdate = await User.findByIdAndUpdate(user._id, {remaining: remaining}, {
      new: true,
      runValidators: true
    });
    const data = queue.length();
    console.log("Finsihed Processing Task " + userUpdate.remaining);
    return(userUpdate.remaining)

    // callback(null)//{userUpdate, tasksRemaining});

  }

}, 1))



// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('auth' , req.headers.authorization)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    // Set token from cookie
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decoded = jwt.verify(token, getPublicKey(), { algorithm: "RS256"})

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Update user Quotas
exports.quota = asyncHandler(async (req, res, next) => {

  const message = await queue.push(req.user)
  console.log(message)
  if (message == 'error') {
    return next(
      new ErrorResponse(
        message,
        403
      )
    );
  } else {
    req.quota = message
  }
  next()
})

exports.apiLogs = asyncHandler(async (req, res, next) => {

  // log the user request
  const log = {
    time: new Date().toUTCString(),
    userId: req.user._id,
    method: req.method,
    uri: req.originalUrl,
    remaining: req.quota
  }
  const logData = new apiLogs(log)
  const logged = await logData.save()
  next()
})