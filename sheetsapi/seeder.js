const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const User = require('./models/User');
const {users} = require('./_data/users.js')

const connectDB = require('./config/db.js')

connectDB()

const importData = async () => {
  try {
    await User.deleteMany()

    const createdUsers = await User.insertMany(users)

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
    await User.deleteMany()

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


//
// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
//   useUnifiedTopology: true
// });
//
// // Read JSON files
// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/_data/users.js`, 'utf-8')
// );
// // Import into DB
// const importData = async () => {
//   try {
//     await User.create(users);
//     console.log('Data Imported...'.green.inverse);
//     process.exit();
//   } catch (err) {
//     console.error(err);
//   }
// };
//
// // Delete data
// const deleteData = async () => {
//   try {
//     await User.deleteMany();
//     console.log('Data Destroyed...'.red.inverse);
//     process.exit();
//   } catch (err) {
//     console.error(err);
//   }
// };
//
// if (process.argv[2] === '-i') {
//   importData();
// } else if (process.argv[2] === '-d') {
//   deleteData();
// }
