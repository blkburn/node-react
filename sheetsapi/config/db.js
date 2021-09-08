const mongoose = require('mongoose');

const connectDB = async () => {

  const MONGO_URI =
    'mongodb://' +
    (process.env.IP || 'localhost') +
    ':' +
    (process.env.MONGO_PORT || '27017') +
    '/' +
    process.env.MONGO_DB

  const conn = await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDB;
