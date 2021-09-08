const express = require('express');
const {
  getApi
} = require('../controllers/api');


const router = express.Router({ mergeParams: true });

const { protect, quota, apiLogs } = require('../middleware/auth');

router.use(protect, quota, apiLogs);
// router.use(authorize('admin'));

router
.route('/:api')
.get(getApi)
// .put(updateSheet)
// .delete(deleteSheet);


module.exports = router;
