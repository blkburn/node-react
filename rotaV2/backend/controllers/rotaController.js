import asyncHandler from 'express-async-handler'
// import generateToken from '../utils/generateToken.js'
// import User from '../models/userModel.js'

import amqp from 'amqplib/callback_api.js'
import deq from 'double-ended-queue'
import { spawn } from 'child_process'
// import { json } from 'express'

let deque = new deq()

let cnt = 0
let running = false
let verifying = false
let locked = ''
let schedule = ''
let requests = ''
let startDate = ''
let endDate = ''
let message = ''

function IsJsonString(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

const child = spawn('tail', ['-f', './python/log.txt'])

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
  deque.push(data)
})

// @desc    Get rota running status
// @route   GET /api/admin/status
// @access  Private
const getRotaStatus = asyncHandler(async (req, res) => {
  if (running) {
    console.log('status response - running')
    if (!deque.isEmpty()) {
      res.status(202).json({
        running: running,
        message: deque.toString().split(',').join('\n'),
      })
      deque.clear()
    } else {
      res.status(202).json({ running: running, message: message })
    }
    message = ''
  } else {
    console.log('status response - not running')
    console.log(deque.toString().split(',').join('\n'))
    res.status(200).json({
      running: running,
      locked: locked,
      startDate: startDate,
      endDate: endDate,
      message: deque.toString().split(',').join('\n'),
      scheduleData: schedule,
      requestsData: requests,
    })
    // locked = ''
  }

  // const user = await User.findById(req.user._id)

  // if (user) {
  //   res.json({
  //     _id: user._id,
  //     name: user.name,
  //     email: user.email,
  //     isAdmin: user.isAdmin,
  //   })
  // } else {
  //   res.status(404)
  //   throw new Error('User not found')
  // }
})

function generateUuid() {
  return (
    Math.random().toString() +
    Math.random().toString() +
    Math.random().toString()
  )
}

// @desc    Get rota verify sheet
// @route   GET /api/admin/verify
// @access  Private
const verifyRotaSheet = (req, res) => {
  // deque.clear()
  cnt = 0
  schedule = ''
  requests = ''
  message = ''
  console.log('started verify ' + req.body.sheet)
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }
      channel.assertQueue(
        '',
        {
          exclusive: true,
        },
        function (error2, q) {
          if (error2) {
            throw error2
          }
          var correlationId = generateUuid()

          console.log(' [x] ', 'VERIFY_SHEET')
          // console.log(req.params)
          // console.log(req.body)
          const params = req.body
          params.command = 'VERIFY_SHEET'
          console.log(params)

          channel.consume(
            q.queue,
            function (msg) {
              if (msg.properties.correlationId == correlationId) {
                if (msg.content.toString() == 'Complete') {
                  connection.close()
                  console.log('Process Complete...')
                  running = false
                  // deque.clear()
                } else if (msg.content.toString().startsWith('Error')) {
                  console.log('sheet returned error: ' + msg.content.toString())
                  running = false
                  message = msg.content.toString()
                  connection.close()
                  // res.status(404).send(msg.content.toString())
                } else {
                  if (IsJsonString(msg.content)) {
                    const resp = JSON.parse(msg.content)
                    locked = resp['isLocked']
                    startDate = resp['startDate']
                    endDate = resp['endDate']
                    console.log(' [.] Locked = %s', locked)
                    console.log(' [.] Start Date = %s', startDate)
                    console.log(' [.] End Date = %s', endDate)
                  } else {
                    deque.push(msg.content.toString())
                  }
                }
              }
            },
            {
              noAck: true,
            }
          )

          deque.clear()
          // channel.sendToQueue('rpc_queue', Buffer.from('VERIFY_SHEET'), {
          //   correlationId: correlationId,
          //   replyTo: q.queue,
          // })
          channel.sendToQueue(
            'rpc_queue',
            Buffer.from(JSON.stringify(params)),
            {
              correlationId: correlationId,
              replyTo: q.queue,
            }
          )

          running = true
        }
      )
    })
  })
  res.status(202).json({
    running: true,
    message: 'verifying sheet...',
  })
}

// @desc    Get rota run optimiser
// @route   GET /api/admin/run
// @access  Private
const runRotaSheet = (req, res) => {
  cnt = 0
  schedule = ''
  requests = ''
  console.log('started')
  amqp.connect('amqp://localhost', function (error0, connection) {
    console.log('access queue')
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }
      channel.assertQueue(
        '',
        {
          exclusive: true,
        },
        function (error2, q) {
          if (error2) {
            throw error2
          }
          var correlationId = generateUuid()
          console.log(req.body)
          console.log(' [x] ', 'RUN_SHEET')
          channel.consume(
            q.queue,
            function (msg) {
              if (msg.properties.correlationId == correlationId) {
                console.log(' [.] Got %s', msg.content.toString())
                if (msg.content.toString() == 'Complete') {
                  connection.close()
                  console.log('Process Complete...')
                  running = false
                } else if (msg.content.toString().startsWith('Error')) {
                  console.log('sheet returned error: ' + msg.content.toString())
                  running = false
                  message = msg.content.toString()
                  connection.close()
                  // res.status(404).send(msg.content.toString())
                } else {
                  // if (IsJsonString(msg.content)) {
                  //   const resp = JSON.parse(msg.content)
                  //   locked = resp['isLocked']
                  //   startDate = resp['startDate']
                  //   endDate = resp['endDate']
                  //   console.log(' [.] Locked = %s', locked)
                  //   console.log(' [.] Start Date = %s', startDate)
                  //   console.log(' [.] End Date = %s', endDate)
                  // } else {
                  deque.push(msg.content.toString())
                  // }
                }
              }
            },
            {
              noAck: true,
            }
          )
          const params = req.body
          params.command = 'RUN_MODEL'
          console.log(params)
          deque.clear()
          channel.sendToQueue(
            'rpc_queue',
            Buffer.from(JSON.stringify(params)),
            {
              correlationId: correlationId,
              replyTo: q.queue,
            }
          )
          running = true
        }
      )
    })
  })
  res.status(202).json({ running: true, message: 'rota started...' })
}

// @desc    Get rota schedule
// @route   GET /api/schedule
// @access  Private
const runGetSchedule = (req, res) => {
  cnt = 0
  schedule = ''
  requests = ''
  console.log('started')
  amqp.connect('amqp://localhost', function (error0, connection) {
    console.log('access queue')
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }
      channel.assertQueue(
        '',
        {
          exclusive: true,
        },
        function (error2, q) {
          if (error2) {
            throw error2
          }
          var correlationId = generateUuid()
          // console.log(req.body)
          // console.log(' [x] ', 'GET_SCHEDULE')
          const params = req.body
          params.command = 'GET_SCHEDULE'
          console.log(params)

          channel.consume(
            q.queue,
            function (msg) {
              if (msg.properties.correlationId == correlationId) {
                console.log(' [.] Got %s', msg.content.toString())
                if (msg.content.toString() == 'Complete') {
                  connection.close()
                  console.log('Process Complete...')
                  running = false
                } else if (msg.content.toString().startsWith('Error')) {
                  console.log('sheet returned error: ' + msg.content.toString())
                  running = false
                  message = msg.content.toString()
                  connection.close()
                  // res.status(404).send(msg.content.toString())
                } else {
                  if (IsJsonString(msg.content)) {
                    const resp = JSON.parse(msg.content)
                    locked = resp['isLocked']
                    startDate = resp['startDate']
                    endDate = resp['endDate']
                    schedule = msg.content.toString()
                    console.log(' [.] Locked = %s', locked)
                    console.log(' [.] Start Date = %s', startDate)
                    console.log(' [.] End Date = %s', endDate)
                  } else {
                    deque.push(msg.content.toString())
                  }
                  // // schedule = msg.content.toString()
                  // const resp = JSON.parse(msg.content)
                  // locked = resp['isLocked']
                  // startDate = resp['startDate']
                  // endDate = resp['endDate']
                  // console.log(' [.] Locked = %s', locked)
                  // console.log(' [.] Start Date = %s', startDate)
                  // console.log(' [.] End Date = %s', endDate)
                }
              }
            },
            {
              noAck: true,
            }
          )
          // const params = req.body
          // console.log(params)
          // channel.sendToQueue('rpc_queue', Buffer.from('GET_SCHEDULE'), {
          //   correlationId: correlationId,
          //   replyTo: q.queue,
          // })
          // deque.clear()
          channel.sendToQueue(
            'rpc_queue',
            Buffer.from(JSON.stringify(params)),
            {
              correlationId: correlationId,
              replyTo: q.queue,
            }
          )
          running = true
        }
      )
    })
  })
  res.status(202).json({ running: true, message: 'get schedule started...' })
}

// @desc    Get rota requests
// @route   GET /api/requests
// @access  Private
const runGetRequests = (req, res) => {
  cnt = 0
  requests = ''
  schedule = ''
  console.log('started')
  amqp.connect('amqp://localhost', function (error0, connection) {
    console.log('access queue')
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }
      channel.assertQueue(
        '',
        {
          exclusive: true,
        },
        function (error2, q) {
          if (error2) {
            throw error2
          }
          var correlationId = generateUuid()
          console.log(req.body)
          console.log(' [x] ', 'GET_REQUESTS')
          channel.consume(
            q.queue,
            function (msg) {
              if (msg.properties.correlationId == correlationId) {
                console.log(' [.] Got %s', msg.content.toString())
                if (msg.content.toString() == 'Complete') {
                  connection.close()
                  console.log('Process Complete...')
                  running = false
                } else if (msg.content.toString().startsWith('Error')) {
                  console.log('sheet returned error: ' + msg.content.toString())
                  running = false
                  message = msg.content.toString()
                  connection.close()
                  // res.status(404).send(msg.content.toString())
                } else {
                  const resp = JSON.parse(msg.content)
                  locked = resp['isLocked']
                  startDate = resp['startDate']
                  endDate = resp['endDate']
                  requests = msg.content.toString()
                  console.log(' [.] Locked = %s', locked)
                  console.log(' [.] Start Date = %s', startDate)
                  console.log(' [.] End Date = %s', endDate)
                }
              }
            },
            {
              noAck: true,
            }
          )
          const params = req.body
          console.log(params)
          channel.sendToQueue('rpc_queue', Buffer.from('GET_REQUESTS'), {
            correlationId: correlationId,
            replyTo: q.queue,
          })
          deque.clear()
          channel.sendToQueue(
            'rpc_queue',
            Buffer.from(JSON.stringify(params)),
            {
              correlationId: correlationId,
              replyTo: q.queue,
            }
          )
          running = true
        }
      )
    })
  })
  res.status(202).json({ running: true, message: 'get requests started...' })
}

export {
  getRotaStatus,
  verifyRotaSheet,
  runRotaSheet,
  runGetSchedule,
  runGetRequests,
}
