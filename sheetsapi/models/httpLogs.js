const mongoose = require('mongoose');

const httpLogSchema = new mongoose.Schema({ any: {}},  {strict: false} );

module.exports = mongoose.model('httpLogs', httpLogSchema);
