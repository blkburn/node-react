import mongoose from 'mongoose'
import dotenv from 'dotenv'
import colors from 'colors'
import emails from './data/emails.js'
import Email from './models/emailModel.js'
import connectDB from './config/db.js'

dotenv.config()

connectDB()

const importData = async () => {
  try {
    await Email.deleteMany()

    const createdEmails = await Email.insertMany(emails)

    // const adminUser = createdUsers[0]._id

    console.log('Data Imported!'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await Email.deleteMany()

    console.log('Data Destroyed!'.red.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
