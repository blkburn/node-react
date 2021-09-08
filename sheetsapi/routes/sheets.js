const express = require('express');
const {
  getSheets,
  getSheet,
  createSheet,
  updateSheet,
  deleteSheet
} = require('../controllers/sheets');

const Sheet = require('../models/Sheet');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
// router.use(authorize('admin'));

router
.route('/')
.get(advancedResults(Sheet), getSheets)
.post(createSheet);

router
.route('/:id')
.get(getSheet)
.put(updateSheet)
.delete(deleteSheet);

module.exports = router;
