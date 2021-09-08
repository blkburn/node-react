const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const base64 = require('base-64')

const SheetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // unique: true
  },
  url: {
    type: String,
    required: [true, 'Please add the sheet URL'],
    // unique: true
  },
  projectName: {
    type: String,
    required: [true, 'Please add a Project Name'],
  },
  hash: {
    type: String,
    required: false,
  },
  read: {
    type: Boolean,
    required: true,
    default: true,
  },
  create: {
    type: Boolean,
    required: true,
    default: false,
  },
  update: {
    type: Boolean,
    required: true,
    default: false,
  },
  delete: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SheetSchema.index({ "userId": 1, "url": 1 }, { unique: true })

const getHash = (str) => {
  let hash=base64.encode(str)
  hash = hash.replace('+', '.')
  hash = hash.replace('/', '_')
  hash = hash.replace('=', '-')
  return hash
}

// Encrypt password using bcrypt
SheetSchema.pre('save', async function (next) {
  this.url = new RegExp('/spreadsheets/d/([a-zA-Z0-9-_]+)').exec(this.url)[1]

  // const salt = await bcrypt.genSalt(10);
  // const key = (this.userId.toString() + this.url)
  // this.hash = await bcrypt.hash(key, salt)
  // this.hash = this.hash.slice(-16).replace('/', '.')

  this.hash = getHash(new Date().getTime().toString() + this.url.slice(-4))
  // console.log('new key : ' + key)
  console.log('new hash : ' + this.hash)

});


module.exports = mongoose.model('Sheet', SheetSchema);
