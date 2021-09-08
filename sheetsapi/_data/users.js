const bcrypt = require('bcryptjs')


exports.users = [
  {
    "name": "Admin Account",
    "email": "admin@gmail.com",
    "role": "admin",
    password: bcrypt.hashSync('123456', 10)
  },
  {
    "name": "Publisher Account",
    "email": "publisher@gmail.com",
    "role": "user",
    password: bcrypt.hashSync('123456', 10)
  },
  {
    "name": "User Account",
    "email": "user@gmail.com",
    "role": "user",
    password: bcrypt.hashSync('123456', 10)
  }
]
