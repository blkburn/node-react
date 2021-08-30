import jwt from 'jsonwebtoken'
import {readFileSync } from 'fs'

const generateTokenWrap = () => {
  const key = readFileSync('key', {encoding:'utf8', flag:'r'})
  console.log('load key file')
  return function generateToken(id) {
    console.log('generate jwt')
    return jwt.sign({ id }, key, {
      expiresIn: '30d',algorithm: "RS256"
    })
  }
}
const generateToken = generateTokenWrap()

export default generateToken
