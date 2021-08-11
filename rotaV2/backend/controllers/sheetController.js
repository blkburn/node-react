import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'
import Sheet from '../models/sheetModel.js'

// @desc    Get all sheets
// @route   GET /api/sheets
// @access  Private/Admin
const getSheets = asyncHandler(async (req, res) => {
  const sheets = await Sheet.find({})
  if (req.user.isAdmin) {
    res.json(sheets)
  } else {
    const resp = sheets.filter((item) => {
      return item.isPublished == true
    })
    res.json(resp)
  }
})

// @desc    Get all sheets that have a isRequests flag
// @route   GET /api/sheets
// @access  Private/Admin
const getSheetsRequests = asyncHandler(async (req, res) => {
  const sheets = await Sheet.find({})
  if (req.user.isAdmin) {
    res.json(sheets)
  } else {
    const resp = sheets.filter((item) => {
      return item.isRequests == true
    })
    res.json(resp)
  }
})

// @desc    Delete sheet
// @route   DELETE /api/sheets/:id
// @access  Private/Admin
const deleteSheet = asyncHandler(async (req, res) => {
  const sheet = await Sheet.findById(req.params.id)

  if (sheet) {
    await sheet.remove()
    res.json({ message: 'Sheet removed' })
  } else {
    res.status(404)
    throw new Error('Sheet not found')
  }
})

// @desc    Get sheet by ID
// @route   GET /api/sheets/:id
// @access  Private/Admin
const getSheetById = asyncHandler(async (req, res) => {
  console.log(req.params.id)
  const sheet = await Sheet.findById(req.params.id)
  if (sheet) {
    res.json(sheet)
  } else {
    res.status(404)
    throw new Error('Sheet not found')
  }
})

// @desc    Update sheet
// @route   PUT /api/sheets/:id
// @access  Private/Admin
const updateSheet = asyncHandler(async (req, res) => {
  console.log(req.params.id)
  const sheet = await Sheet.findById(req.params.id)

  if (sheet) {
    sheet.name = req.body.name || sheet.name
    sheet.sheet = req.body.sheet || sheet.sheet
    sheet.isPublished = req.body.isPublished
    sheet.isRequests = req.body.isRequests

    const updatedSheet = await sheet.save()

    res.json({
      _id: updatedSheet._id,
      name: updatedSheet.name,
      sheet: updatedSheet.sheet,
      isPublished: updatedSheet.isPublished,
      isRequests: updatedSheet.isRequests,
    })
  } else {
    res.status(404)
    throw new Error('Sheet not found')
  }
})

// @desc    Register a new sheet
// @route   POST /api/sheets/add
// @access  Public
const addSheet = asyncHandler(async (req, res) => {
  const { name, sheet, isPublished, isRequests } = req.body

  const sheetExists = await Sheet.findOne({ name })

  if (sheetExists) {
    res.status(400)
    throw new Error('Sheet already exists')
  }

  const newSheet = await Sheet.create({
    name,
    sheet,
    isPublished,
    isRequests,
  })

  if (newSheet) {
    res.status(201).json({
      _id: sheet._id,
      name: sheet.name,
      sheet: sheet.sheet,
      isPublished: sheet.isPublished,
      isRequests: sheet.isRequests,
    })
  } else {
    res.status(400)
    throw new Error('Invalid sheet data')
  }
})

export {
  getSheets,
  getSheetsRequests,
  deleteSheet,
  getSheetById,
  updateSheet,
  addSheet,
}
