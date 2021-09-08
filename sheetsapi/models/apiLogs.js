const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema({ any: {}},  {strict: false} );

module.exports = mongoose.model('apiLogs', apiLogSchema);
