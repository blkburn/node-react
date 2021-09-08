const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Sheet = require('../models/Sheet');

// @desc      Get all sheets
// @route     GET /api/v1/sheets
// @access    Private
exports.getSheets = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single sheet
// @route     GET /api/v1/sheets/:id
// @access    Private
exports.getSheet = asyncHandler(async (req, res, next) => {
  console.log("user id" + req.params.id)
  const sheet = await Sheet.find({'_id':req.params.id, 'userId':req.user._id});

  if (!sheet || !sheet.length) {
    return next(
      new ErrorResponse(`No sheet found with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: sheet
  });
});

// @desc      Create sheet
// @route     POST /api/v1/sheets
// @access    Private
exports.createSheet = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user._id
  const sheet = await Sheet.create(req.body);

  res.status(201).json({
    success: true,
    data: sheet
  });
});

// @desc      Update sheet
// @route     PUT /api/v1/sheets/:id
// @access    Private
exports.updateSheet = asyncHandler(async (req, res, next) => {
  const sheet = await Sheet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: sheet
  });
});

// @desc      Delete sheet
// @route     DELETE /api/v1/sheets/:id
// @access    Private/Admin
exports.deleteSheet = asyncHandler(async (req, res, next) => {
  await Sheet.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});
