import asyncHandler from 'express-async-handler'
// import generateToken from '../utils/generateToken.js'
// import User from '../models/userModel.js'

import moment from 'moment'
import mongoose from 'mongoose'
import amqp from 'amqplib/callback_api.js'
import deq from 'double-ended-queue'
import { spawn } from 'child_process'
// import { json } from 'express'
import {
  CacheSheetDetails,
  CacheSheetStaff,
  CacheSheetShifts,
  CacheSheetSchedule,
  CacheSheetRequests,
} from '../models/scheduleModel.js'
import Sheet from '../models/sheetModel.js'

let deque = new deq()

let running = false
let updatePublished = false
let reloadPublished = false
let updateRequests = false
let reloadRequests = false
// let spreadsheetId = ''

class fVerifyData {
  constructor(params) {
    this.params = params
  }
  check(field) {
    if (!field) {
      throw new Error('Missing Verify Data')
    }
  }
  set(data) {
    // console.log(data)
    this.startDate = data.startDate
    this.endDate = data.endDate
    this.isLocked = data.isLocked
    this.message = data.message || ''
  }
  get() {
    return {
      command: this.params.command,
      startDate: this.startDate,
      endDate: this.endDate,
      isLocked: this.isLocked,
      message: this.message,
    }
  }
}

class fRunData {
  constructor(params) {
    this.params = params
  }
  check(field) {
    if (!field) {
      throw new Error('Missing Run/Generate Data')
    }
  }
  set(data) {
    this.startDate = data.startDate
    this.endDate = data.endDate
    this.isLocked = data.isLocked
    this.message = data.message || ''
  }
  get() {
    return { command: this.params.command, message: this.message }
  }
}

class fScheduleData {
  constructor(params) {
    this.params = params
  }
  check(field) {
    if (!field) {
      throw new Error('Missing Schedule/Request Data')
    }
  }
  set(data) {
    this.startDate = data.startDate
    this.endDate = data.endDate
    this.isLocked = data.isLocked
    this.message = data.message || ''
    this.staff = data.staff
    this.shift = data.shift
    this.schedule = data.schedule
    this.requests = data.requests
  }
  get() {
    return {
      command: this.params.command,
      startDate: this.startDate,
      endDate: this.endDate,
      isLocked: this.isLocked,
      message: this.message,
      scheduleData: {
        staff: this.staff,
        shift: this.shift,
        schedule: this.schedule,
        requests: this.requests,
      },
    }
  }
}

let fRabbitData = null

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
      res.status(202).json({ running: running, message: '' })
    }
  } else {
    console.log('status response - not running')
    // console.log(deque.toString().split(',').join('\n'))
    fRabbitData.message = deque.toString().split(',').join('\n')

    updatePublished = fRabbitData.params.updatePublished
    reloadPublished = fRabbitData.params.reloadPublished
    if (updatePublished && reloadPublished) {
      const data = fRabbitData.get()
      const scheduleData = data.scheduleData
      const sheet_id = fRabbitData.params.sheet_id
      console.log('updating schedule data in database')
      console.log(sheet_id)
      const { staff, shift, schedule, requests } = scheduleData

      let sheet = await Sheet.findById(sheet_id)
      // console.log(req)
      if (sheet) {
        sheet.startDate = data.startDate
        sheet.endDate = data.endDate
        sheet = await sheet.save()
        console.log(sheet)
      }

      let results = await CacheSheetStaff.deleteMany({
        sheet_id: sheet_id,
      })
      results = await Promise.all(
        staff.map(async (req) => {
          // console.log(req)
          let r = await CacheSheetStaff.create({
            ...req,
            sheet_id: sheet_id,
          })
          // console.log(requests)
        })
      )
      results = await CacheSheetShifts.deleteMany({
        sheet_id: sheet_id,
      })
      results = await Promise.all(
        shift.map(async (req) => {
          // console.log(req)
          let r = await CacheSheetShifts.create({
            ...req,
            sheet_id: sheet_id,
          })
          // console.log(requests)
        })
      )
      results = await CacheSheetSchedule.deleteMany({
        sheet_id: sheet_id,
      })
      // console.log(schedule)
      results = await Promise.all(
        schedule.map(async (req) => {
          // console.log(req)
          let r = await CacheSheetSchedule.create({
            ...req,
            sheet_id: sheet_id,
          })
          // console.log(requests)
        })
      )
      results = await CacheSheetDetails.deleteMany({
        sheet_id: sheet_id,
      })
      // console.log(schedule)
      results = await CacheSheetDetails.create({
        sheet: 'sheet name',
        isLocked: data.isLocked === 'TRUE',
        startDate: data.startDate, //moment.utc(startDate, 'DD/MM/YY').toDate(),
        endDate: data.endDate, //moment.utc(endDate, 'DD/MM/YY').toDate(),
        sheet_id: sheet_id,
      })
    }

    res.status(200).json(fRabbitData.get())

    // res.status(200).json({
    //   running: running,
    //   locked: locked,
    //   startDate: startDate,
    //   endDate: endDate,
    //   message: deque.toString().split(',').join('\n'),
    //   scheduleData: scheduleData,
    //   requestsData: requests,
    // })
    // updatePublished = false
    // reloadPublished = false
    // updateRequests = false
    // reloadRequests = false
    // spreadsheetId = ''
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
  fRabbitData = new fVerifyData(req.body)

  startAmqp(req, res)
  res.status(202).json({ running: true, message: 'verfiy sheet started...' })
}

// @desc    Get rota run optimiser
// @route   GET /api/admin/run
// @access  Private
const runRotaSheet = (req, res) => {
  fRabbitData = new fRunData(req.body)

  startAmqp(req, res)
  res.status(202).json({ running: true, message: 'rota started...' })
}

const startAmqp = (req, res) => {
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
          const params = req.body
          console.log(params)

          channel.consume(
            q.queue,
            function (msg) {
              if (msg.properties.correlationId == correlationId) {
                // console.log(' [.] Got %s', msg.content.toString())
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
                    // const resp = JSON.parse(msg.content)
                    // console.log(JSON.parse(msg.content))
                    fRabbitData.set(JSON.parse(msg.content))
                    // locked = resp['isLocked']
                    // startDate = resp['startDate']
                    // endDate = resp['endDate']
                    // scheduleData = msg.content.toString()
                    // console.log(' [.] Locked = %s', locked)
                    // console.log(' [.] Start Date = %s', startDate)
                    // console.log(' [.] End Date = %s', endDate)
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
}
// @desc    Get rota schedule
// @route   GET /api/schedule
// @access  Private
const runGetSchedule = async (req, res) => {
  const params = req.body
  console.log('params: ', params)
  fRabbitData = new fScheduleData(req.body)
  fRabbitData.set(params)

  let updatePublished = params.updatePublished
  let reloadPublished = params.reloadPublished
  let updateRequests = params.updateRequests
  let reloadRequests = params.reloadRequests
  // spreadsheetId = params.sheet
  let sheet_id = params.sheet_id

  if (updatePublished && reloadPublished) {
    startAmqp(req, res)
    res.status(202).json({ running: true, message: 'get schedule started...' })
  } else {
    const staff = await CacheSheetStaff.find({
      sheet_id: mongoose.Types.ObjectId(sheet_id),
    })
    const shift = await CacheSheetShifts.find({
      sheet_id: mongoose.Types.ObjectId(sheet_id),
    })
    const schedule = await CacheSheetSchedule.find({
      sheet_id: mongoose.Types.ObjectId(sheet_id),
    })
    // console.log(staff)
    const scheduleData = { staff, shift, schedule }

    const sheet = await CacheSheetDetails.find({
      sheet_id: mongoose.Types.ObjectId(sheet_id),
    })
    console.log(sheet[0])
    fRabbitData.set({
      islocaked: sheet[0].isLocked,
      startDate: sheet[0].startDate,
      endDate: sheet[0].endDate,
      message: 'using cached schedule data',
      staff,
      shift,
      schedule,
    })

    res.status(200).json(fRabbitData.get())
    // updatePublished = false
    // reloadPublished = false
    // updateRequests = false
    // reloadRequests = false
  }
}

// @desc    Get rota requests
// @route   GET /api/requests
// @access  Private
const runGetRequests = (req, res) => {
  requests = ''
  scheduleData = ''
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
                // console.log(' [.] Got %s', msg.content.toString())
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
