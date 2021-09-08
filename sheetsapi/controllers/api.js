const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Sheet = require('../models/Sheet');
const bcrypt = require('bcryptjs')
const {getSheetData} = require('../utils/sheets')
const url = require('url');

// @desc      Get all sheets
// @route     GET /api/v1/sheets
// @access    Private
exports.getApi = asyncHandler(async (req, res, next) => {

  try {
    const userId = req.user._id
    const api = req.params.api
    // const filter = req.body.query
    const allSheets = await Sheet.find({userId: userId})
    if (allSheets && allSheets.length) {
      const salt = await bcrypt.genSalt(10);
      const matched = allSheets.filter(s => {
        return (s.hash === api)
      })

      if (matched && matched.length) {
        const q = new URL(req.url, 'http://localhost:6000/v1')
        const data = await getSheetData(matched[0].url, q, req.body, matched[0].url)
        res.status(200).json({
          success: true,
          count: data.length,
          data: data
        });
      } else {
        return next(
          new ErrorResponse(`No sheet found with the hash of ${api}`, 404)
        )
      }
    }
  } catch (e) {
    return next(new ErrorResponse(e, 401));
  }
});
