import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import {readFileSync } from 'fs'
import axios from "axios";

const keypub = readFileSync('key.pub', {encoding:'utf8', flag:'r'})

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const { data } = await axios.get(`http://localhost:${process.env.AUTH_PORT}/api/auth/pubkey`, {})
      const pubkey = data.pubkey
      const decoded = jwt.verify(token, pubkey, { algorithm: "RS256"})

      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      console.error(error)
      res.status(401)
      throw new Error('Not authorized, token failed')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401)
    throw new Error('Not authorized as an admin')
  }
}

export { protect, admin }
