import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const MONGO_URI =
      'mongodb://' +
      (process.env.IP || 'localhost') +
      ':' +
      (process.env.MONGO_PORT || '27017') +
      '/' +
      process.env.MONGO_DB

    const conn = await mongoose.connect(MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold)
    process.exit(1)
  }
}

export default connectDB
