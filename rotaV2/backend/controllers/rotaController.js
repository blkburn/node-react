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
let startDate = ''
let endDate = ''

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
        message: deque.toString(),
      })
      deque.clear()
    } else {
      res.status(202).json({ running: running, message: '' })
    }
  } else {
    console.log('status response - not running')
    console.log(deque.toString())
    res.status(200).json({
      running: running,
      locked: locked,
      startDate: startDate,
      endDate: endDate,
      message: deque.toString(),
      scheduleData: schedule,
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
                } else {
                  const resp = JSON.parse(msg.content)
                  locked = resp['isLocked']
                  startDate = resp['startDate']
                  endDate = resp['endDate']
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

          channel.sendToQueue('rpc_queue', Buffer.from('VERIFY_SHEET'), {
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
                }
              }
            },
            {
              noAck: true,
            }
          )
          const params = req.body
          console.log(params)
          channel.sendToQueue('rpc_queue', Buffer.from('RUN_MODEL'), {
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
  res.status(202).json({ running: true, message: 'rota started...' })
}

// @desc    Get rota schedule
// @route   GET /api/schedule
// @access  Private
const runGetSchedule = (req, res) => {
  cnt = 0
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
          console.log(' [x] ', 'GET_SCHEDULE')
          channel.consume(
            q.queue,
            function (msg) {
              if (msg.properties.correlationId == correlationId) {
                console.log(' [.] Got %s', msg.content.toString())
                if (msg.content.toString() == 'Complete') {
                  connection.close()
                  console.log('Process Complete...')
                  running = false
                } else {
                  // schedule = msg.content.toString()
                  const resp = JSON.parse(msg.content)
                  locked = resp['isLocked']
                  startDate = resp['startDate']
                  endDate = resp['endDate']
                  schedule = msg.content.toString()
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
          channel.sendToQueue('rpc_queue', Buffer.from('GET_SCHEDULE'), {
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
  res.status(202).json({ running: true, message: 'get schedule started...' })
}

export { getRotaStatus, verifyRotaSheet, runRotaSheet, runGetSchedule }
