import bcrypt from 'bcryptjs'

const users = [
  {
    name: 'Craig Blackburn',
    email: 'craigb211@gmail.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
]

export default users
